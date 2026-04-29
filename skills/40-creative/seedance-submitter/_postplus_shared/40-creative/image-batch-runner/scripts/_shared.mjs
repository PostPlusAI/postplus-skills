#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  downloadHostedMediaFile,
  requestHostedMediaGenerationJson,
  uploadHostedMediaFile,
} from '../../../00-core/shared-runtime/scripts/lib/hosted_media_generation_bridge.mjs';

export const DEFAULT_PROVIDER = 'hosted-media';
export const DEFAULT_MODEL = 'image-nano-banana-2-text';
export const DEFAULT_OUTPUT_FORMAT = 'png';
export const DEFAULT_RESOLUTION = '4k';
export const DEFAULT_ASPECT_RATIO = '9:16';
export const DEFAULT_SEEDREAM_SIZE = '1440*2560';

export const HOSTED_IMAGE_MODELS = {
  'image-nano-banana-2-text': {
    modelGroup: 'nano-banana',
    operation: 'text-to-image',
    endpointKey: 'image-nano-banana-2-text',
  },
  'image-nano-banana-2-edit': {
    modelGroup: 'nano-banana',
    operation: 'edit',
    endpointKey: 'image-nano-banana-2-edit',
  },
  'image-seedream-v5-lite-text': {
    modelGroup: 'seedream',
    operation: 'text-to-image',
    endpointKey: 'image-seedream-v5-lite-text',
  },
  'image-seedream-v5-lite-sequential': {
    modelGroup: 'seedream',
    operation: 'text-to-image',
    endpointKey: 'image-seedream-v5-lite-sequential',
  },
  'image-seedream-v5-lite-edit': {
    modelGroup: 'seedream',
    operation: 'edit',
    endpointKey: 'image-seedream-v5-lite-edit',
  },
  'image-seedream-v5-lite-edit-sequential': {
    modelGroup: 'seedream',
    operation: 'edit',
    endpointKey: 'image-seedream-v5-lite-edit-sequential',
  },
};

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

export function readJsonIfExists(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

export function nowIso() {
  return new Date().toISOString();
}

export function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export async function fetchJson(url, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const requestBody =
    typeof options.body === 'string' && options.body.trim().length > 0
      ? JSON.parse(options.body)
      : (options.body ?? {});
  const billableImageModels = new Set([
    'image-nano-banana-2-text',
    'image-nano-banana-2-edit',
    'image-seedream-v5-lite-text',
    'image-seedream-v5-lite-sequential',
    'image-seedream-v5-lite-edit',
    'image-seedream-v5-lite-edit-sequential',
  ]);
  const requestDimensions =
    method !== 'POST' || !billableImageModels.has(url)
      ? undefined
      : {
          billableUnitCount: 1,
          imageSize: requestBody.resolution ?? '2k',
          operationKey: url,
          requestBytes: Buffer.byteLength(JSON.stringify(requestBody)),
        };

  return requestHostedMediaGenerationJson(url, {
    method,
    body: requestBody,
    requestDimensions,
  });
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

export async function downloadFile(url, outputPath) {
  await downloadHostedMediaFile(url, outputPath);
}

export async function uploadLocalMedia(localFilePath) {
  return await uploadHostedMediaFile(localFilePath);
}

export function buildAssetPaths(localAssetDir, runId, mediaType = 'image') {
  const absoluteAssetDir = path.resolve(localAssetDir);
  const runDir = path.join(absoluteAssetDir, 'runs', mediaType, runId);
  const requestPath = path.join(runDir, 'request.json');
  const responsePath = path.join(runDir, 'response.json');
  const manifestPath = path.join(runDir, 'manifest.json');
  const imagesDir = path.join(absoluteAssetDir, 'images');
  const sourceDir = path.join(imagesDir, 'source');
  const candidatesDir = path.join(imagesDir, 'candidates');
  const approvedDir = path.join(imagesDir, 'approved');
  const rejectedDir = path.join(imagesDir, 'rejected');
  const assetJsonPath = path.join(absoluteAssetDir, 'asset.json');
  const indexJsonPath = path.join(absoluteAssetDir, 'index.json');
  return {
    absoluteAssetDir,
    runDir,
    requestPath,
    responsePath,
    manifestPath,
    assetJsonPath,
    indexJsonPath,
    imagesDir,
    sourceDir,
    candidatesDir,
    approvedDir,
    rejectedDir,
  };
}

export function normalizeGenerationInput(input, mode) {
  const assetId = input?.assetId || input?.jobId || null;
  const runId = input?.runId || input?.jobId || null;
  const localAssetDir = input?.localAssetDir || input?.localOutputDir || null;
  if (!assetId) {
    throw new Error(
      'request.assetId is required. Legacy fallback: request.jobId.',
    );
  }
  if (!runId) {
    throw new Error(
      'request.runId is required. Legacy fallback: request.jobId.',
    );
  }
  if (!localAssetDir) {
    throw new Error(
      'request.localAssetDir is required. Legacy fallback: request.localOutputDir.',
    );
  }
  if (!input?.prompt) {
    throw new Error('request.prompt is required.');
  }
  return {
    provider: input.provider || DEFAULT_PROVIDER,
    model: input.model || DEFAULT_MODEL,
    mode,
    assetId,
    runId,
    jobId: input.jobId || runId,
    campaignId: input.campaignId || null,
    personaId: input.personaId || null,
    conceptId: input.conceptId || null,
    assetPurpose: input.assetPurpose || null,
    prompt: input.prompt,
    negativePrompt: input.negativePrompt || null,
    aspectRatio: input.aspectRatio || DEFAULT_ASPECT_RATIO,
    resolution: input.resolution || DEFAULT_RESOLUTION,
    size: input.size || null,
    maxImages: Number.isInteger(input.maxImages) ? input.maxImages : null,
    outputFormat: input.outputFormat || DEFAULT_OUTPUT_FORMAT,
    enableSyncMode: input.enableSyncMode !== false,
    enableBase64Output: input.enableBase64Output === true,
    enableWebSearch: input.enableWebSearch === true,
    localAssetDir,
    localOutputDir: input.localOutputDir || localAssetDir,
    sourceBasis: Array.isArray(input.sourceBasis) ? input.sourceBasis : [],
    mustKeep: Array.isArray(input.mustKeep) ? input.mustKeep : [],
    canVary: Array.isArray(input.canVary) ? input.canVary : [],
    feedback: Array.isArray(input.feedback) ? input.feedback : [],
  };
}

export function getHostedImageModelConfig(model, operation) {
  const config = HOSTED_IMAGE_MODELS[model];
  if (!config) {
    throw new Error(`Unsupported image model: ${model}`);
  }
  if (config.operation !== operation) {
    throw new Error(`Model ${model} does not support ${operation}.`);
  }
  return {
    model,
    modelGroup: config.modelGroup,
    operation,
    endpointKey: config.endpointKey,
  };
}

function parseExplicitSize(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const match = value.trim().match(/^(\d{3,5})\s*[x*]\s*(\d{3,5})$/i);
  if (!match) {
    return null;
  }
  return `${match[1]}*${match[2]}`;
}

export function inferSeedreamSize(request) {
  const explicitSize = parseExplicitSize(request.size);
  if (explicitSize) {
    return explicitSize;
  }

  const resolutionSize = parseExplicitSize(request.resolution);
  if (resolutionSize) {
    return resolutionSize;
  }

  switch (request.aspectRatio) {
    case '9:16':
      return '1440*2560';
    case '16:9':
      return '2560*1440';
    case '1:1':
      return '2048*2048';
    case '3:4':
      return '1536*2048';
    case '4:3':
      return '2048*1536';
    default:
      return DEFAULT_SEEDREAM_SIZE;
  }
}

export function toAssetRelative(absoluteAssetDir, targetPath) {
  return path
    .relative(absoluteAssetDir, path.resolve(targetPath))
    .split(path.sep)
    .join('/');
}

export function createImageManifestBase(normalized, paths) {
  return {
    assetId: normalized.assetId,
    runId: normalized.runId,
    jobId: normalized.jobId,
    campaignId: normalized.campaignId,
    personaId: normalized.personaId,
    conceptId: normalized.conceptId,
    assetPurpose: normalized.assetPurpose,
    provider: normalized.provider,
    model: normalized.model,
    mode: normalized.mode,
    localAssetDir: paths.absoluteAssetDir,
    requestPath: paths.requestPath,
    responsePath: paths.responsePath,
    createdAt: nowIso(),
    assets: [],
  };
}

export function upsertAssetRecord(normalized, paths, updates = {}) {
  const current = readJsonIfExists(paths.assetJsonPath) || {};
  const heroImagePath =
    updates.heroImagePath === undefined || updates.heroImagePath === null
      ? current.heroImagePath || null
      : updates.heroImagePath;
  const next = {
    assetId: normalized.assetId,
    campaignId: normalized.campaignId,
    personaId: normalized.personaId,
    conceptId: normalized.conceptId,
    assetPurpose: normalized.assetPurpose,
    status: current.status || 'review_pending',
    sourceBasis: normalized.sourceBasis,
    localAssetDir: paths.absoluteAssetDir,
    heroImagePath,
    createdAt: current.createdAt || nowIso(),
    updatedAt: nowIso(),
    ...updates,
  };
  next.heroImagePath = heroImagePath;
  writeJson(paths.assetJsonPath, next);
  return next;
}

export function updateAssetIndex(paths, mediaType, entries) {
  const current = readJsonIfExists(paths.indexJsonPath) || {
    assetId: path.basename(paths.absoluteAssetDir),
    images: [],
    videos: [],
    audio: [],
    uploads: [],
  };
  const next = { ...current };
  const key =
    mediaType === 'image'
      ? 'images'
      : mediaType === 'upload'
        ? 'uploads'
        : `${mediaType}s`;
  const existingEntries = Array.isArray(next[key]) ? next[key] : [];
  const merged = [...existingEntries];
  for (const entry of entries) {
    if (!merged.some((candidate) => candidate.path === entry.path)) {
      merged.push(entry);
    }
  }
  next[key] = merged;
  writeJson(paths.indexJsonPath, next);
  return next;
}

export function finalizeImageRun(request, paths, manifest, options = {}) {
  writeJson(paths.manifestPath, manifest);
  const indexEntries = manifest.assets.map((asset) => ({
    path: asset.assetRelativePath,
    kind: options.kind || 'candidate',
    originRunId: request.runId,
  }));
  upsertAssetRecord(request, paths, {
    heroImagePath:
      options.updateHero === false
        ? undefined
        : manifest.assets[0]?.assetRelativePath || null,
  });
  updateAssetIndex(paths, 'image', indexEntries);
  return manifest;
}

export function finalizeUploadRun(request, paths, manifest, options = {}) {
  writeJson(paths.manifestPath, manifest);
  upsertAssetRecord(request, paths);
  if (options.includeInIndex) {
    updateAssetIndex(paths, 'upload', [
      {
        path: manifest.sourceAssetRelativePath,
        kind: 'uploaded_source',
        originRunId: request.runId,
        uploadedUrl: manifest.uploadedUrl,
      },
    ]);
  }
  return manifest;
}
