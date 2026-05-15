#!/usr/bin/env node
import { randomUUID } from 'node:crypto';
import http from 'node:http';

import {
  applyProcessHostedExecutionFields,
  createQuoteConfirmationRequiredError,
} from './hosted_execution_protocol.mjs';
import { normalizeHostedBillingSummary } from './hosted_billing_summary.mjs';
import { requestJson } from './network_runtime.mjs';
import {
  buildPostPlusClientCompatibilityHeaders,
  refreshPostPlusHostedSessionAuth,
  resolvePostPlusClientMetadata,
  resolvePostPlusHostedSessionAuth,
} from './postplus_cli_config.mjs';

export const HOSTED_CAPABILITY_JSON_PAYLOAD_BYTE_LIMIT = 4 * 1024 * 1024;

function createHardError(code, message, cause, extra = {}) {
  const error = new Error(message);
  error.code = code;
  if (cause !== undefined) {
    error.cause = cause;
  }
  Object.assign(error, extra);
  return error;
}

function resolveHostedCapabilityBridgeConfig() {
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
    'skill_server_capability_bridge_unavailable',
    'PostPlus Cloud client is required for PostPlus-provided capability execution.',
  );
}

export function hasHostedCapabilityBridge() {
  try {
    return Boolean(resolveHostedCapabilityBridgeConfig());
  } catch {
    return false;
  }
}

export async function runHostedCapabilityRequest(request) {
  const envelope = await runHostedCapabilityEnvelopeRequest(request);

  return envelope.output;
}

export async function runHostedCapabilityEnvelopeRequest(request) {
  const config = resolveHostedCapabilityBridgeConfig();
  const normalizedRequest = withHostedOperationId(
    applyProcessHostedExecutionFields(request),
  );

  let response;

  try {
    response =
      config.transport === 'socket'
        ? await requestHostedCapabilityBridgeJson(config.socketPath, {
            accountId: config.accountId,
            conversationId: config.conversationId,
            client: resolvePostPlusClientMetadata({
              skillName: normalizedRequest.skillName,
            }),
            sessionId: config.sessionId,
            request: normalizedRequest,
          })
        : await requestHostedCapabilityApiJsonWithRefresh(
            config,
            normalizedRequest,
          );
  } catch (error) {
    if (!normalizedRequest.quoteConfirmationToken) {
      const confirmationError = createQuoteConfirmationRequiredError(error);

      if (confirmationError) {
        throw confirmationError;
      }
    }

    throw error;
  }

  const output = response?.data?.output;

  if (output === undefined) {
    throw createHardError(
      'skill_server_capability_invalid_response',
      'PostPlus Cloud client returned an invalid payload.',
    );
  }

  const charged = response?.data?.charged === true;
  const billing = normalizeHostedBillingSummary(response?.data?.billing);

  return {
    billing,
    charged,
    operationId:
      typeof response?.data?.operationId === 'string'
        ? response.data.operationId
        : null,
    output,
  };
}

function withHostedOperationId(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    throw createHardError(
      'skill_server_capability_invalid_request',
      'PostPlus Cloud request must be an object.',
    );
  }

  if (typeof request.operationId === 'string' && request.operationId.trim()) {
    return {
      ...request,
      operationId: request.operationId.trim(),
    };
  }

  const capability =
    typeof request.capability === 'string' && request.capability.trim()
      ? request.capability.trim()
      : 'unknown';
  const operation =
    typeof request.operation === 'string' && request.operation.trim()
      ? request.operation.trim()
      : 'unknown';

  return {
    ...request,
    operationId: `postplus-cli:hosted-capability:${capability}:${operation}:${randomUUID()}`,
  };
}

async function requestHostedCapabilityApiJson(config, request) {
  const body = JSON.stringify(request);
  assertHostedCapabilityPayloadSize({
    body,
    request,
    transport: 'https',
  });

  return await requestJson(
    `${config.apiBaseUrl}/api/postplus-cli/hosted/capability`,
    {
      allowHttp: true,
      body,
      codePrefix: 'skill_server_capability',
      headers: {
        authorization: `Bearer ${config.cliSessionToken}`,
        ...buildPostPlusClientCompatibilityHeaders({
          skillName: request.skillName,
        }),
        'content-type': 'application/json',
      },
      method: 'POST',
      providerName: 'PostPlus Cloud client',
    },
  );
}

async function requestHostedCapabilityApiJsonWithRefresh(config, request) {
  try {
    return await requestHostedCapabilityApiJson(config, request);
  } catch (error) {
    if (!request.quoteConfirmationToken) {
      const confirmationError = createQuoteConfirmationRequiredError(error);

      if (confirmationError) {
        throw confirmationError;
      }
    }

    if (
      !error ||
      typeof error !== 'object' ||
      error.code !== 'skill_server_capability_unauthorized'
    ) {
      throw error;
    }

    const refreshed = await refreshPostPlusHostedSessionAuth();

    if (!refreshed) {
      throw error;
    }

    return await requestHostedCapabilityApiJson(
      {
        ...config,
        cliSessionToken: refreshed.cliSessionToken,
      },
      request,
    );
  }
}

async function requestHostedCapabilityBridgeJson(socketPath, payload) {
  const body = JSON.stringify(payload);
  assertHostedCapabilityPayloadSize({
    body,
    request: payload?.request,
    transport: 'socket',
  });

  return await new Promise((resolve, reject) => {
    const request = http.request(
      {
        socketPath,
        path: '/capability',
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
            const productError = parseProductErrorPayload(bodyText);
            if (productError?.code) {
              reject(
                createHardError(
                  productError.code,
                  readProductErrorMessage(productError) ||
                    `PostPlus Cloud client request failed with ${statusCode}.`,
                  undefined,
                  {
                    ...pickProductErrorFields(productError),
                    status: statusCode,
                    upstreamBodyText: bodyText,
                  },
                ),
              );
              return;
            }

            reject(
              createHardError(
                'skill_server_capability_request_failed',
                `PostPlus Cloud client request failed with ${statusCode}.${bodyText ? ` ${bodyText}` : ''}`,
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
                'skill_server_capability_invalid_json',
                'PostPlus Cloud client returned non-JSON text.',
                error,
                { bodyText },
              ),
            );
          }
        });
        incoming.on('error', (error) => {
          reject(
            createHardError(
              'skill_server_capability_network_request_failed',
              'PostPlus Cloud client response stream failed.',
              error,
            ),
          );
        });
      },
    );

    request.on('error', (error) => {
      reject(
        createHardError(
          'skill_server_capability_network_request_failed',
          'PostPlus Cloud client request failed.',
          error,
        ),
      );
    });

    request.write(body);
    request.end();
  });
}

function assertHostedCapabilityPayloadSize({ body, request, transport }) {
  const requestBytes = Buffer.byteLength(body);

  if (requestBytes <= HOSTED_CAPABILITY_JSON_PAYLOAD_BYTE_LIMIT) {
    return;
  }

  const capability = normalizeHostedRequestField(request?.capability);
  const operation = normalizeHostedRequestField(request?.operation);

  throw createHardError(
    'postplus_cli_hosted_payload_too_large',
    `PostPlus Cloud ${transport} request payload is too large: ${requestBytes} bytes exceeds the ${HOSTED_CAPABILITY_JSON_PAYLOAD_BYTE_LIMIT} byte limit for ${capability}/${operation}. Use a file reference contract instead of inline media bytes.`,
    undefined,
    {
      capability,
      limitBytes: HOSTED_CAPABILITY_JSON_PAYLOAD_BYTE_LIMIT,
      operation,
      requestBytes,
      transport,
    },
  );
}

function normalizeHostedRequestField(value) {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : 'unknown';
}

function parseProductErrorPayload(bodyText) {
  if (!bodyText) {
    return null;
  }

  try {
    const parsed = JSON.parse(bodyText);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function readProductErrorMessage(payload) {
  return typeof payload.message === 'string' && payload.message.trim()
    ? payload.message.trim()
    : typeof payload.error === 'string' && payload.error.trim()
      ? payload.error.trim()
      : null;
}

function pickProductErrorFields(payload) {
  const fields = {
    productErrorCode: payload.code,
  };

  for (const key of [
    'capabilityDisplayName',
    'layer',
    'operationId',
    'providerDisplayName',
    'quoteConfirmation',
    'userMessageRule',
  ]) {
    if (payload[key] !== undefined) {
      fields[key] = payload[key];
    }
  }

  return fields;
}
