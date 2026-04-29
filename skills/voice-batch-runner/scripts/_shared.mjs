#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import {
  downloadHostedMediaFile,
  requestHostedMediaGenerationJson,
  uploadHostedMediaFile,
} from '../_postplus_shared/shared-runtime/scripts/lib/hosted_media_generation_bridge.mjs';

export const DEFAULT_PROVIDER = 'hosted-media';
export const DEFAULT_LANGUAGE = 'auto';

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith('--')) {
      continue;
    }
    const key = current.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

export function ensureDir(targetPath) {
  fs.mkdirSync(path.resolve(targetPath), { recursive: true });
}

export function writeJson(filePath, payload) {
  ensureDir(path.dirname(path.resolve(filePath)));
  fs.writeFileSync(
    path.resolve(filePath),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
}

export function nowIso() {
  return new Date().toISOString();
}

function countBillableTextBlocks(body) {
  const text = typeof body?.text === 'string' ? body.text : '';
  return Math.max(1, Math.ceil([...text].length / 100));
}

export async function fetchJson(url, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const requestBody =
    typeof options.body === 'string' && options.body.trim().length > 0
      ? JSON.parse(options.body)
      : (options.body ?? {});
  const isBillableVoiceModel =
    url === 'voice-qwen3-design' || url === 'voice-qwen3-clone';

  return requestHostedMediaGenerationJson(url, {
    method,
    body: requestBody,
    requestDimensions:
      method !== 'POST' || !isBillableVoiceModel
        ? undefined
        : {
            billableUnitCount: countBillableTextBlocks(requestBody),
            characterCount:
              typeof requestBody.text === 'string'
                ? [...requestBody.text].length
                : 0,
            operationKey: url,
            requestBytes: Buffer.byteLength(JSON.stringify(requestBody)),
          },
  });
}

export function buildRequestPaths(localOutputDir) {
  const absoluteOutputDir = path.resolve(localOutputDir);
  return {
    absoluteOutputDir,
    requestPath: path.join(absoluteOutputDir, 'request.json'),
    responsePath: path.join(absoluteOutputDir, 'response.json'),
    manifestPath: path.join(absoluteOutputDir, 'manifest.json'),
    reviewPath: path.join(absoluteOutputDir, 'review.json'),
    audioDir: path.join(absoluteOutputDir, 'audio'),
  };
}

export function unwrapProviderResult(payload) {
  if (
    payload &&
    typeof payload === 'object' &&
    payload.data &&
    typeof payload.data === 'object'
  ) {
    return payload.data;
  }
  return payload;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pollPredictionResult(
  getUrl,
  { maxAttempts = 60, intervalMs = 2000 } = {},
) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { data } = await fetchJson(getUrl);
    const result = unwrapProviderResult(data);
    if (result?.status === 'completed') {
      return data;
    }
    if (result?.status === 'failed') {
      throw new Error(`Prediction failed: ${JSON.stringify(data)}`);
    }
    await sleep(intervalMs);
  }
  throw new Error(`Timed out waiting for prediction result: ${getUrl}`);
}

export async function downloadFile(url, outputPath) {
  await downloadHostedMediaFile(url, outputPath);
}

export function inferAudioExtension(url, fallback = 'wav') {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).replace('.', '').toLowerCase();
    return ext || fallback;
  } catch {
    return fallback;
  }
}

export async function uploadLocalMedia(localFilePath) {
  const data = await uploadHostedMediaFile(localFilePath);

  const uploadedUrl = data?.data?.download_url || data?.download_url || null;
  if (!uploadedUrl) {
    throw new Error(
      `Upload succeeded but no download_url was returned: ${JSON.stringify(data)}`,
    );
  }
  return { raw: data, uploadedUrl };
}

export function createReviewStub() {
  return {
    status: 'pending_review',
    issues: [],
  };
}
