#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import {
  runHostedCapabilityEnvelopeRequest,
  runHostedCapabilityRequest,
} from './hosted_capability_bridge.mjs';
import { requestBytes } from './network_runtime.mjs';

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

export async function requestHostedMediaGenerationStatus(handle) {
  const normalizedHandle = normalizeStatusHandle(handle);

  if (!normalizedHandle) {
    throw new Error('handle is required for hosted media status.');
  }

  const result = await runHostedCapabilityEnvelopeRequest({
    capability: 'media-generation',
    operation: 'status',
    handle: normalizedHandle,
  });

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

export async function uploadHostedMediaFile(
  localFilePath,
  mimeType = 'application/octet-stream',
) {
  const absolutePath = path.resolve(localFilePath);
  const fileBuffer = fs.readFileSync(absolutePath);

  return await runHostedCapabilityRequest({
    capability: 'media-file',
    operation: 'upload',
    file: {
      contentBase64: fileBuffer.toString('base64'),
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
    throw new Error(`Hosted media upload source is not a file: ${absolutePath}`);
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

export async function downloadHostedMediaFile(url, outputPath) {
  const result = await runHostedCapabilityRequest({
    capability: 'media-file',
    operation: 'download',
    url,
  });
  const absoluteOutputPath = path.resolve(outputPath);

  fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });
  fs.writeFileSync(
    absoluteOutputPath,
    Buffer.from(String(result.contentBase64 || ''), 'base64'),
  );
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
