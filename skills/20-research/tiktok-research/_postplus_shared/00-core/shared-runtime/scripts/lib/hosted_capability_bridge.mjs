#!/usr/bin/env node
import http from 'node:http';

import { normalizeHostedBillingSummary } from './hosted_billing_summary.mjs';
import { requestJson } from './network_runtime.mjs';
import {
  refreshPostPlusHostedSessionAuth,
  resolvePostPlusHostedSessionAuth,
} from './postplus_cli_config.mjs';

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
    'Hosted capability bridge is required for repo-owned capability execution.',
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

  const response =
    config.transport === 'socket'
      ? await requestHostedCapabilityBridgeJson(config.socketPath, {
          accountId: config.accountId,
          conversationId: config.conversationId,
          sessionId: config.sessionId,
          request,
        })
      : await requestHostedCapabilityApiJsonWithRefresh(config, request);

  const output = response?.data?.output;

  if (output === undefined) {
    throw createHardError(
      'skill_server_capability_invalid_response',
      'Hosted capability bridge returned an invalid payload.',
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

async function requestHostedCapabilityApiJson(config, request) {
  return await requestJson(
    `${config.apiBaseUrl}/api/postplus-cli/hosted/capability`,
    {
      allowHttp: true,
      body: JSON.stringify(request),
      codePrefix: 'skill_server_capability',
      headers: {
        authorization: `Bearer ${config.cliSessionToken}`,
        'content-type': 'application/json',
      },
      method: 'POST',
      providerName: 'Hosted capability bridge',
    },
  );
}

async function requestHostedCapabilityApiJsonWithRefresh(config, request) {
  try {
    return await requestHostedCapabilityApiJson(config, request);
  } catch (error) {
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
            reject(
              createHardError(
                'skill_server_capability_request_failed',
                `Hosted capability bridge request failed with ${statusCode}.${bodyText ? ` ${bodyText}` : ''}`,
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
                'Hosted capability bridge returned non-JSON text.',
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
              'Hosted capability bridge response stream failed.',
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
          'Hosted capability bridge request failed.',
          error,
        ),
      );
    });

    request.write(body);
    request.end();
  });
}
