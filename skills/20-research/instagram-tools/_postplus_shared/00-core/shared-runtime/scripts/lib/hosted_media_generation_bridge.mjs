#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { requestBytes } from './network_runtime.mjs';
import {
  runHostedCapabilityEnvelopeRequest,
  runHostedCapabilityRequest,
} from './postplus_cloud_client.mjs';

const TERMINAL_HOSTED_MEDIA_STATUSES = new Set(['completed', 'failed']);

export async function requestHostedMediaGenerationJson(
  endpointKey,
  { method = 'GET', body, requestDimensions } = {},
) {
  const parsedBody =
    typeof body === 'string' && body.trim().length > 0
      ? JSON.parse(body)
      : (body ?? undefined);
  const normalizedMethod = String(method || 'GET').toUpperCase();

  if (normalizedMethod === 'GET') {
    return requestHostedMediaGenerationStatus(String(endpointKey));
  }

  if (!endpointKey || typeof endpointKey !== 'string') {
    throw new Error('endpointKey is required for hosted media generation.');
  }

  if (!requestDimensions || typeof requestDimensions !== 'object') {
    throw new Error(
      'requestDimensions is required for hosted media generation.',
    );
  }

  const result = await runHostedCapabilityEnvelopeRequest({
    capability: 'media-generation',
    operation: 'request',
    endpointKey,
    input: parsedBody ?? {},
    requestDimensions,
  });
  const finalResult = await resolveHostedMediaGenerationResult(result);

  return {
    billing: finalResult.billing,
    charged: finalResult.charged,
    data: appendBillingMetadata(finalResult.output, finalResult.billing),
    operationId: finalResult.operationId,
    response: {
      headers: {},
      status: 200,
    },
  };
}

export function isHostedMediaGenerationPendingResult(value) {
  const payload = unwrapProviderPayload(value);
  const status =
    typeof payload?.status === 'string' ? payload.status.toLowerCase() : null;

  return Boolean(
    status &&
      !TERMINAL_HOSTED_MEDIA_STATUSES.has(status) &&
      readPendingRunHandle(value),
  );
}

export async function requestHostedMediaGenerationStatus(handle) {
  const normalizedHandle = normalizeStatusHandle(handle);

  if (!normalizedHandle) {
    throw new Error('handle is required for hosted media status.');
  }

  const result = await runHostedCapabilityEnvelopeRequest(
    {
      capability: 'media-generation',
      operation: 'status',
      handle: normalizedHandle,
    },
    {
      applyProcessHostedExecutionFields: false,
    },
  );

  return {
    billing: result.billing,
    charged: result.charged,
    data: appendBillingMetadata(result.output, result.billing),
    operationId: result.operationId,
    response: {
      headers: {},
      status: 200,
    },
  };
}

async function resolveHostedMediaGenerationResult(initialResult) {
  let current = initialResult;
  let handle = readPendingRunHandle(current.output);
  const timeoutMs = readNonNegativeIntegerEnv(
    'POSTPLUS_HOSTED_MEDIA_POLL_TIMEOUT_MS',
    0,
  );
  const intervalMs = readNonNegativeIntegerEnv(
    'POSTPLUS_HOSTED_MEDIA_POLL_INTERVAL_MS',
    2_000,
  );
  const maxAttempts = readNonNegativeIntegerEnv(
    'POSTPLUS_HOSTED_MEDIA_POLL_ATTEMPTS',
    timeoutMs > 0 && intervalMs > 0
      ? Math.max(1, Math.ceil(timeoutMs / intervalMs))
      : 0,
  );
  const maxTransientStatusFailures = readNonNegativeIntegerEnv(
    'POSTPLUS_HOSTED_MEDIA_STATUS_TRANSIENT_RETRIES',
    2,
  );
  const deadline = timeoutMs > 0 ? Date.now() + timeoutMs : Date.now();
  let attempts = 0;
  let transientStatusFailures = 0;

  while (handle && attempts < maxAttempts && Date.now() <= deadline) {
    attempts += 1;
    if (intervalMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    try {
      current = await runHostedCapabilityEnvelopeRequest(
        {
          capability: 'media-generation',
          operation: 'status',
          handle,
        },
        {
          applyProcessHostedExecutionFields: false,
        },
      );
      transientStatusFailures = 0;
    } catch (error) {
      if (
        isRetryableHostedMediaStatusError(error) &&
        transientStatusFailures < maxTransientStatusFailures &&
        attempts < maxAttempts &&
        Date.now() <= deadline
      ) {
        transientStatusFailures += 1;
        continue;
      }

      throw error;
    }
    handle = readPendingRunHandle(current.output);
  }

  return current;
}

function appendBillingMetadata(data, billing) {
  if (!billing) {
    return data;
  }

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const nestedData =
      data.data && typeof data.data === 'object' && !Array.isArray(data.data)
        ? {
            ...data.data,
            billing,
          }
        : data.data;

    return {
      ...data,
      billing,
      ...(nestedData === undefined ? {} : { data: nestedData }),
    };
  }

  return data;
}

function readPendingRunHandle(output) {
  const payload = unwrapProviderPayload(output);
  const status =
    typeof payload?.status === 'string' ? payload.status.toLowerCase() : null;

  if (status !== 'processing' && status !== 'queued' && status !== 'settling') {
    return null;
  }

  if (typeof payload?.id === 'string' && payload.id.trim()) {
    return payload.id.trim();
  }

  if (typeof payload?.urls?.get === 'string' && payload.urls.get.trim()) {
    return normalizeStatusHandle(payload.urls.get);
  }

  return null;
}

function isRetryableHostedMediaStatusError(error) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  if (
    typeof error.status === 'number' &&
    error.status >= 500 &&
    error.status < 600
  ) {
    return true;
  }

  return (
    typeof error.code === 'string' &&
    (error.code === 'skill_server_capability_network_request_failed' ||
      error.code === 'skill_server_capability_proxy_request_failed')
  );
}

function unwrapProviderPayload(output) {
  if (
    output &&
    typeof output === 'object' &&
    output.data &&
    typeof output.data === 'object' &&
    !Array.isArray(output.data)
  ) {
    return output.data;
  }

  return output;
}

function normalizeStatusHandle(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  try {
    const pathname = new URL(value).pathname;
    const match = pathname.match(/\/predictions\/([^/]+)\/result$/);
    return match?.[1] ? decodeURIComponent(match[1]) : value;
  } catch {
    return value;
  }
}

function readNonNegativeIntegerEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || raw === '') {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }

  return value;
}

export async function uploadHostedMediaFile(
  localFilePath,
  mimeType = 'application/octet-stream',
) {
  const absolutePath = path.resolve(localFilePath);
  const { storageReference } = await uploadHostedMediaFileReference(
    absolutePath,
    mimeType,
  );

  return await runHostedCapabilityRequest({
    capability: 'media-file',
    operation: 'upload',
    file: {
      storageReference,
      name: path.basename(absolutePath),
      mimeType,
    },
  });
}

export async function uploadHostedMediaFileReference(
  localFilePath,
  mimeType = 'application/octet-stream',
) {
  const absolutePath = path.resolve(localFilePath);
  const stat = fs.statSync(absolutePath);

  if (!stat.isFile()) {
    throw new Error(
      `Hosted media upload source is not a file: ${absolutePath}`,
    );
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  const uploadRequest = await runHostedCapabilityRequest({
    capability: 'media-file',
    operation: 'create-upload-url',
    file: {
      mimeType,
      name: path.basename(absolutePath),
      sizeBytes: fileBuffer.length,
    },
  });
  const signedUpload = readSignedUpload(uploadRequest);
  const storageReference = readStorageReference(uploadRequest);

  await requestBytes(signedUpload.url, {
    body: fileBuffer,
    codePrefix: 'hosted_media_upload',
    headers: signedUpload.requiredHeaders,
    method: signedUpload.method,
    providerName: 'Hosted media signed upload',
  });

  return {
    signedUpload,
    storageReference,
  };
}

export async function downloadHostedMediaFile(
  url,
  outputPath,
  mimeType = 'application/octet-stream',
) {
  const absoluteOutputPath = path.resolve(outputPath);
  const result = await runHostedCapabilityRequest({
    capability: 'media-file',
    operation: 'download-to-storage',
    file: {
      mimeType,
      name: path.basename(absoluteOutputPath),
    },
    url,
  });
  const signedUrl = readString(result, 'signedUrl');
  const downloaded = await requestBytes(signedUrl, {
    codePrefix: 'hosted_media_download',
    method: 'GET',
    providerName: 'Hosted media signed download',
  });

  fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });
  fs.writeFileSync(absoluteOutputPath, downloaded.bodyBuffer);
}

function readSignedUpload(value) {
  const signedUpload = readRecord(value, 'signedUpload');
  const method = readString(signedUpload, 'method');

  if (method !== 'PUT') {
    throw new Error(`Unsupported hosted media signed upload method: ${method}`);
  }

  return {
    expiresInSeconds: readNumber(signedUpload, 'expiresInSeconds'),
    method,
    requiredHeaders: readStringRecord(signedUpload, 'requiredHeaders'),
    token: readString(signedUpload, 'token'),
    url: readString(signedUpload, 'url'),
  };
}

function readStorageReference(value) {
  const storageReference = readRecord(value, 'storageReference');

  return {
    bucket: readString(storageReference, 'bucket'),
    mimeType: readString(storageReference, 'mimeType'),
    name: readString(storageReference, 'name'),
    sizeBytes: readOptionalNumber(storageReference, 'sizeBytes'),
    storagePath: readString(storageReference, 'storagePath'),
  };
}

function readRecord(value, key) {
  const record = key ? value?.[key] : value;

  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    throw new Error(
      key
        ? `Hosted media upload response is missing ${key}.`
        : 'Hosted media upload response must be a record.',
    );
  }

  return record;
}

function readString(value, key) {
  const raw = value?.[key];

  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error(`Hosted media upload response ${key} must be a string.`);
  }

  return raw.trim();
}

function readNumber(value, key) {
  const raw = value?.[key];

  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    throw new Error(`Hosted media upload response ${key} must be a number.`);
  }

  return raw;
}

function readOptionalNumber(value, key) {
  const raw = value?.[key];

  if (raw === undefined || raw === null) {
    return null;
  }

  if (typeof raw !== 'number' || !Number.isFinite(raw)) {
    throw new Error(`Hosted media upload response ${key} must be a number.`);
  }

  return raw;
}

function readStringRecord(value, key) {
  const record = readRecord(value, key);

  return Object.fromEntries(
    Object.entries(record).map(([entryKey, entryValue]) => {
      if (typeof entryValue !== 'string') {
        throw new Error(
          `Hosted media upload response ${key}.${entryKey} must be a string.`,
        );
      }

      return [entryKey, entryValue];
    }),
  );
}
