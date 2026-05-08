#!/usr/bin/env node
import { randomUUID } from 'node:crypto';
import http from 'node:http';

import { normalizeHostedBillingSummary } from '../../../shared-runtime/scripts/lib/hosted_billing_summary.mjs';
import { requestJson } from '../../../shared-runtime/scripts/lib/network_runtime.mjs';
import {
  buildPostPlusClientCompatibilityHeaders,
  resolvePostPlusClientMetadata,
  refreshPostPlusHostedSessionAuth,
  refreshPostPlusHostedSessionAuthIfNeeded,
  resolvePostPlusHostedSessionAuth,
} from '../../../shared-runtime/scripts/lib/postplus_cli_config.mjs';

const DEFAULT_HOSTED_COLLECTION_POLL_INTERVAL_MS = 2_000;
const DEFAULT_HOSTED_COLLECTION_POLL_TIMEOUT_MS = 180_000;
const TERMINAL_HOSTED_COLLECTION_STATUSES = new Set([
  'completed',
  'failed',
  'canceled',
]);

function createHardError(code, message, cause, extra = {}) {
  const error = new Error(message);
  error.code = code;
  if (cause !== undefined) {
    error.cause = cause;
  }
  Object.assign(error, extra);
  return error;
}

function readPositiveIntegerEnv(name, fallback) {
  const raw = process.env[name];

  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveHostedCollectionPollConfig() {
  return {
    pollIntervalMs: readPositiveIntegerEnv(
      'POSTPLUS_HOSTED_COLLECTION_POLL_INTERVAL_MS',
      DEFAULT_HOSTED_COLLECTION_POLL_INTERVAL_MS,
    ),
    pollTimeoutMs: readPositiveIntegerEnv(
      'POSTPLUS_HOSTED_COLLECTION_POLL_TIMEOUT_MS',
      DEFAULT_HOSTED_COLLECTION_POLL_TIMEOUT_MS,
    ),
  };
}

function resolveHostedCollectionBridgeConfig() {
  const socketPath = process.env.POSTPLUS_CHAT_RUNTIME_SKILL_BRIDGE_SOCKET_PATH;
  const accountId = process.env.POSTPLUS_CHAT_ACCOUNT_ID;
  const conversationId = process.env.POSTPLUS_CHAT_CONVERSATION_ID;
  const sessionId = process.env.POSTPLUS_CHAT_RUNTIME_SESSION_ID;

  if (
    typeof socketPath === 'string' &&
    socketPath.trim().length > 0 &&
    typeof accountId === 'string' &&
    accountId.trim().length > 0 &&
    typeof conversationId === 'string' &&
    conversationId.trim().length > 0 &&
    typeof sessionId === 'string' &&
    sessionId.trim().length > 0
  ) {
    return {
      transport: 'socket',
      socketPath: socketPath.trim(),
      accountId: accountId.trim(),
      conversationId: conversationId.trim(),
      sessionId: sessionId.trim(),
    };
  }

  const hostedApiAuth = resolvePostPlusHostedSessionAuth();

  if (hostedApiAuth) {
    return {
      transport: 'https',
      apiBaseUrl: hostedApiAuth.apiBaseUrl,
      cliSessionToken: hostedApiAuth.cliSessionToken,
    };
  }

  throw createHardError(
    'skill_server_collection_bridge_unavailable',
    'Hosted collection bridge is required for PostPlus-provided collection runs.',
  );
}

export function hasHostedCollectionBridge() {
  try {
    return Boolean(resolveHostedCollectionBridgeConfig());
  } catch {
    return false;
  }
}

export function isHostedCollectionPendingResult(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value.status === 'pending' &&
    value.pending === true &&
    typeof value.runHandle === 'string' &&
    value.runHandle.trim().length > 0
  );
}

export async function runHostedCollection(input) {
  const config = resolveHostedCollectionBridgeConfig();
  const pollConfig = resolveHostedCollectionPollConfig();
  const runHandle =
    typeof input.runHandle === 'string' && input.runHandle.trim().length > 0
      ? input.runHandle.trim()
      : null;

  const operationId =
    typeof input.operationId === 'string' && input.operationId.trim().length > 0
      ? input.operationId.trim()
      : `skill-collection:${randomUUID()}`;

  if (process.env.POSTPLUS_DEBUG_SKILL_BILLING === '1') {
    console.error(
      '[Hosted skill collection request]',
      JSON.stringify({
        transport: config.transport,
        ...(config.transport === 'socket'
          ? { socketPath: config.socketPath }
          : { apiBaseUrl: config.apiBaseUrl }),
        operationId,
        runHandle,
        skillName: input.skillName,
        collectionKey: input.collectionKey,
      }),
    );
  }

  const response =
    runHandle !== null
      ? await requestHostedCollectionStatus(config, {
          runHandle,
          skillName: input.skillName,
        })
      : config.transport === 'socket'
        ? await requestHostedBridgeJson(config.socketPath, '/collection', {
            accountId: config.accountId,
            conversationId: config.conversationId,
            client: resolvePostPlusClientMetadata({
              skillName: input.skillName,
            }),
            sessionId: config.sessionId,
            operationId,
            skillName: input.skillName,
            collectionKey: input.collectionKey,
            input: input.input,
          })
        : await requestHostedCollectionApiJsonWithRefresh(config, {
            operationId,
            skillName: input.skillName,
            collectionKey: input.collectionKey,
            input: input.input,
          });

  const run = readHostedCollectionRunResult(response?.data);
  let latestBilling = run.billing;

  if (run.payload) {
    return attachHostedCollectionBilling(run.payload, latestBilling);
  }

  if (run.status === 'failed' || run.status === 'canceled') {
    throw buildHostedCollectionRunFailure(run);
  }

  if (run.status === 'completed') {
    throw createHardError(
      'skill_server_collection_invalid_response',
      'Hosted collection bridge returned a completed run without a payload.',
      undefined,
      {
        runHandle: run.runHandle,
        runStatus: run.status,
      },
    );
  }

  if (!run.runHandle) {
    throw createHardError(
      'skill_server_collection_invalid_response',
      'Hosted collection bridge returned an invalid run handle.',
    );
  }

  const waitUntil = Date.now() + pollConfig.pollTimeoutMs;
  let latestRun = run;

  while (!TERMINAL_HOSTED_COLLECTION_STATUSES.has(latestRun.status)) {
    if (Date.now() > waitUntil) {
      return buildHostedCollectionPendingResult({
        billing: latestBilling,
        pollTimeoutMs: pollConfig.pollTimeoutMs,
        resumeCommand: input.resumeCommand,
        run: latestRun,
      });
    }

    if (!latestRun.runHandle) {
      throw createHardError(
        'skill_server_collection_invalid_response',
        'Hosted collection bridge returned an invalid run handle.',
      );
    }

    await new Promise((resolve) =>
      setTimeout(resolve, pollConfig.pollIntervalMs),
    );

    const statusResponse = await requestHostedCollectionStatus(config, {
      runHandle: latestRun.runHandle,
      skillName: input.skillName,
    });

    latestRun = readHostedCollectionRunResult(statusResponse?.data);
    latestBilling = latestRun.billing ?? latestBilling;
  }

  if (latestRun.status !== 'completed' || !latestRun.payload) {
    throw buildHostedCollectionRunFailure(latestRun);
  }

  return attachHostedCollectionBilling(latestRun.payload, latestBilling);
}

async function requestHostedCollectionStatus(config, input) {
  return config.transport === 'socket'
    ? await requestHostedBridgeJson(config.socketPath, '/collection', {
        runHandle: input.runHandle,
      })
    : await requestHostedCollectionApiJsonWithRefresh(
        config,
        { runHandle: input.runHandle },
        { skillName: input.skillName },
      );
}

async function requestHostedCollectionApiJson(config, payload, metadata = {}) {
  return await requestJson(
    `${config.apiBaseUrl}/api/postplus-cli/hosted/collection`,
    {
      allowHttp: true,
      body: JSON.stringify(payload),
      codePrefix: 'skill_server_collection',
      headers: {
        authorization: `Bearer ${config.cliSessionToken}`,
        ...buildPostPlusClientCompatibilityHeaders({
          skillName: payload.skillName ?? metadata.skillName,
        }),
        'content-type': 'application/json',
      },
      method: 'POST',
      providerName: 'Hosted collection',
    },
  );
}

async function requestHostedCollectionApiJsonWithRefresh(
  config,
  payload,
  metadata = {},
) {
  const refreshedConfig = await refreshPostPlusHostedSessionAuthIfNeeded();
  const resolvedAuth = resolvePostPlusHostedSessionAuth();
  const initialConfig = refreshedConfig ?? {
    ...config,
    cliSessionToken: resolvedAuth?.cliSessionToken ?? config.cliSessionToken,
    apiBaseUrl: resolvedAuth?.apiBaseUrl ?? config.apiBaseUrl,
  };

  try {
    return await requestHostedCollectionApiJson(initialConfig, payload, metadata);
  } catch (error) {
    if (
      !error ||
      typeof error !== 'object' ||
      error.code !== 'skill_server_collection_unauthorized'
    ) {
      throw error;
    }

    const refreshed = await refreshPostPlusHostedSessionAuth();

    if (!refreshed) {
      throw error;
    }

    return await requestHostedCollectionApiJson(
      {
        ...initialConfig,
        cliSessionToken: refreshed.cliSessionToken,
      },
      payload,
      metadata,
    );
  }
}

async function requestHostedBridgeJson(socketPath, routePath, payload) {
  const body = JSON.stringify(payload);

  return await new Promise((resolve, reject) => {
    const request = http.request(
      {
        socketPath,
        path: routePath,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': String(Buffer.byteLength(body)),
        },
      },
      (incoming) => {
        const chunks = [];
        incoming.setEncoding('utf8');
        incoming.on('data', (chunk) => {
          chunks.push(chunk);
        });
        incoming.on('end', () => {
          const bodyText = chunks.join('');
          const statusCode = incoming.statusCode ?? 0;

          if (statusCode < 200 || statusCode >= 300) {
            reject(
              createHardError(
                'skill_server_collection_request_failed',
                `Hosted skill collection bridge request failed with ${statusCode}.${bodyText ? ` ${bodyText}` : ''}`,
                undefined,
                {
                  bodyText,
                  status: statusCode,
                },
              ),
            );
            return;
          }

          try {
            resolve({
              data: bodyText ? JSON.parse(bodyText) : null,
              statusCode,
            });
          } catch (error) {
            reject(
              createHardError(
                'skill_server_collection_invalid_json',
                'Hosted skill collection bridge returned non-JSON text.',
                error,
                { bodyText },
              ),
            );
          }
        });
        incoming.on('error', (error) => {
          reject(
            createHardError(
              'skill_server_collection_network_request_failed',
              'Hosted skill collection bridge response stream failed.',
              error,
            ),
          );
        });
      },
    );

    request.on('error', (error) => {
      reject(
        createHardError(
          'skill_server_collection_network_request_failed',
          'Hosted skill collection bridge request failed.',
          error,
        ),
      );
    });

    request.write(body);
    request.end();
  });
}

function readHostedCollectionRunResult(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw createHardError(
      'skill_server_collection_invalid_response',
      'Hosted skill collection bridge returned an invalid response body.',
    );
  }

  const runHandle = typeof data.runHandle === 'string' ? data.runHandle : null;
  const status = typeof data.status === 'string' ? data.status : null;
  const payload =
    data.payload &&
    typeof data.payload === 'object' &&
    !Array.isArray(data.payload)
      ? data.payload
      : null;
  const error =
    data.error && typeof data.error === 'object' && !Array.isArray(data.error)
      ? data.error
      : null;

  if (!status) {
    throw createHardError(
      'skill_server_collection_invalid_response',
      'Hosted skill collection bridge returned a response without a task status.',
    );
  }

  return {
    billing: normalizeHostedBillingSummary(data.billing),
    error: {
      code: typeof error?.code === 'string' ? error.code : null,
      message: typeof error?.message === 'string' ? error.message : null,
    },
    payload,
    runHandle,
    status,
  };
}

function attachHostedCollectionBilling(payload, billing) {
  if (
    !billing ||
    !payload ||
    typeof payload !== 'object' ||
    Array.isArray(payload)
  ) {
    return payload;
  }

  return {
    ...payload,
    billing: payload.billing ?? billing,
  };
}

function buildHostedCollectionPendingResult({
  billing,
  pollTimeoutMs,
  resumeCommand,
  run,
}) {
  const pending = {
    status: 'pending',
    pending: true,
    message:
      'Hosted skill collection task is still running after the local poll timeout.',
    runHandle: run.runHandle,
    runStatus: run.status,
    pollTimeoutMs,
  };

  if (typeof resumeCommand === 'string' && resumeCommand.trim().length > 0) {
    pending.resumeCommand = resumeCommand.trim();
  }

  return attachHostedCollectionBilling(pending, billing);
}

function buildHostedCollectionRunFailure(run) {
  const code =
    run.error?.code && typeof run.error.code === 'string'
      ? run.error.code
      : 'skill_server_collection_run_failed';
  const message =
    run.error?.message && typeof run.error.message === 'string'
      ? run.error.message
      : `Hosted skill collection run ended with status ${run.status}.`;

  return createHardError(code, message, undefined, {
    runHandle: run.runHandle,
    runStatus: run.status,
  });
}
