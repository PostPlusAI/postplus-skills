#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  createHostedMediaGenerationFailedError,
  downloadHostedMediaFile,
  isHostedMediaGenerationFailedResult,
  requestHostedMediaGenerationJson,
  readHostedMediaGenerationFailure,
  uploadHostedMediaFile,
} from '../../../00-core/shared-runtime/scripts/lib/hosted_media_generation_bridge.mjs';
import {
  readDomainSkillExecutionInput,
  readHostedSkillExecutionInput,
} from '../../../00-core/shared-runtime/scripts/lib/hosted_execution_protocol.mjs';
import {
  resolveCreativeFormat,
} from '../../../00-core/shared-runtime/scripts/lib/creative_format.mjs';

export const DEFAULT_PROVIDER = 'hosted-media';
export const DEFAULT_TEXT_MODEL = 'image-gpt-image-2-text';
export const DEFAULT_EDIT_MODEL = 'image-gpt-image-2-edit';
export const DEFAULT_OUTPUT_FORMAT = 'png';
export const DEFAULT_RESOLUTION = '1k';
export const DEFAULT_ASPECT_RATIO = '9:16';
export const DEFAULT_SEEDREAM_SIZE = '1440*2560';
export const DEFAULT_ENABLE_SYNC_MODE = false;
export const IMAGE_MATERIALIZATION_FAILURE_CODE =
  'provider_completed_asset_materialization_failed';
export const IMAGE_MATERIALIZATION_FAILURE_LAYER = 'hosted_storage_network';

export {
  createHostedMediaGenerationFailedError,
  isHostedMediaGenerationFailedResult,
  readHostedMediaGenerationFailure,
};

export const HOSTED_IMAGE_MODELS = {
  'image-gpt-image-2-text': {
    modelGroup: 'gpt-image-2',
    operation: 'text-to-image',
    endpointKey: 'image-gpt-image-2-text',
  },
  'image-gpt-image-2-edit': {
    modelGroup: 'gpt-image-2',
    operation: 'edit',
    endpointKey: 'image-gpt-image-2-edit',
  },
  'image-nano-banana-2-text': {
    modelGroup: 'nano-banana',
    operation: 'text-to-image',
    endpointKey: 'image-nano-banana-2-text',
    supportsWebSearch: true,
  },
  'image-nano-banana-2-edit': {
    modelGroup: 'nano-banana',
    operation: 'edit',
    endpointKey: 'image-nano-banana-2-edit',
    supportsWebSearch: true,
  },
  'image-nano-banana-pro-text-1k': {
    modelGroup: 'nano-banana-pro',
    operation: 'text-to-image',
    endpointKey: 'image-nano-banana-pro-text-1k',
    fixedResolution: '1k',
  },
  'image-nano-banana-pro-text-2k': {
    modelGroup: 'nano-banana-pro',
    operation: 'text-to-image',
    endpointKey: 'image-nano-banana-pro-text-2k',
    fixedResolution: '2k',
  },
  'image-nano-banana-pro-text-4k': {
    modelGroup: 'nano-banana-pro',
    operation: 'text-to-image',
    endpointKey: 'image-nano-banana-pro-text-4k',
    fixedResolution: '4k',
  },
  'image-nano-banana-pro-edit-1k': {
    modelGroup: 'nano-banana-pro',
    operation: 'edit',
    endpointKey: 'image-nano-banana-pro-edit-1k',
    fixedResolution: '1k',
  },
  'image-nano-banana-pro-edit-2k': {
    modelGroup: 'nano-banana-pro',
    operation: 'edit',
    endpointKey: 'image-nano-banana-pro-edit-2k',
    fixedResolution: '2k',
  },
  'image-nano-banana-pro-edit-4k': {
    modelGroup: 'nano-banana-pro',
    operation: 'edit',
    endpointKey: 'image-nano-banana-pro-edit-4k',
    fixedResolution: '4k',
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
  return readDomainSkillExecutionInput(
    JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8')),
  );
}

export function readHostedJson(filePath) {
  return readHostedSkillExecutionInput(
    JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8')),
  );
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
    'image-gpt-image-2-text',
    'image-gpt-image-2-edit',
    'image-nano-banana-2-text',
    'image-nano-banana-2-edit',
    'image-nano-banana-pro-text-1k',
    'image-nano-banana-pro-text-2k',
    'image-nano-banana-pro-text-4k',
    'image-nano-banana-pro-edit-1k',
    'image-nano-banana-pro-edit-2k',
    'image-nano-banana-pro-edit-4k',
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
          quality: requestBody.quality ?? undefined,
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
  const attemptsDir = path.join(runDir, 'attempts');
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
    attemptsDir,
    attemptIndexPath: path.join(attemptsDir, 'index.json'),
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

const FORBIDDEN_NORMALIZED_FIELD_ALIASES = {
  aspect_ratio: 'aspectRatio',
  enable_base64_output: 'enableBase64Output',
  enable_sync_mode: 'enableSyncMode',
  enable_web_search: 'enableWebSearch',
  output_format: 'outputFormat',
};

function assertNoProviderFieldAliases(input) {
  const aliases = Object.keys(FORBIDDEN_NORMALIZED_FIELD_ALIASES).filter(
    (key) => Object.hasOwn(input ?? {}, key),
  );
  if (aliases.length === 0) {
    return;
  }
  const replacements = aliases
    .map((key) => `${key} -> ${FORBIDDEN_NORMALIZED_FIELD_ALIASES[key]}`)
    .join(', ');
  throw new Error(
    `Image normalized request uses provider-style field names. Use local camelCase fields: ${replacements}.`,
  );
}

export function getDefaultImageModel(mode) {
  if (mode === 'text-to-image') {
    return DEFAULT_TEXT_MODEL;
  }
  if (mode === 'edit') {
    return DEFAULT_EDIT_MODEL;
  }
  throw new Error(`Unsupported image generation mode: ${mode}`);
}

function normalizeOptionalString(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string') {
    throw new Error(`request.${fieldName} must be a string.`);
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeImageResolution(value) {
  const resolution = normalizeOptionalString(value, 'resolution');
  if (!resolution) {
    return DEFAULT_RESOLUTION;
  }

  const tier = resolution.match(/^(\d+(?:\.\d+)?)\s*k$/iu);
  return tier ? `${tier[1]}k` : resolution;
}

export function normalizeImageQuality(value) {
  const quality = normalizeOptionalString(value, 'quality');
  return quality ? quality.toLowerCase() : null;
}

export function normalizeImageOutputFormat(value) {
  const outputFormat = normalizeOptionalString(value, 'outputFormat');
  return outputFormat ? outputFormat.toLowerCase() : DEFAULT_OUTPUT_FORMAT;
}

export function normalizeGenerationInput(input, mode) {
  assertNoProviderFieldAliases(input);
  const creativeFormat = resolveCreativeFormat(input);
  const assetId = input?.assetId || null;
  const runId = input?.runId || null;
  const localAssetDir = input?.localAssetDir || null;
  if (!assetId) {
    throw new Error('request.assetId is required.');
  }
  if (!runId) {
    throw new Error('request.runId is required.');
  }
  if (!localAssetDir) {
    throw new Error('request.localAssetDir is required.');
  }
  if (!input?.prompt) {
    throw new Error('request.prompt is required.');
  }
  return {
    provider: input.provider || DEFAULT_PROVIDER,
    model: input.model || getDefaultImageModel(mode),
    mode,
    creativeFormat: creativeFormat.id,
    creativeFormatLabel: creativeFormat.label,
    assetId,
    runId,
    jobId: input.jobId || runId,
    campaignId: input.campaignId || null,
    personaId: input.personaId || null,
    conceptId: input.conceptId || null,
    assetPurpose: input.assetPurpose || null,
    prompt: input.prompt,
    negativePrompt: input.negativePrompt || null,
    aspectRatio: creativeFormat.aspectRatio || DEFAULT_ASPECT_RATIO,
    targetAspectRatio: creativeFormat.aspectRatio || DEFAULT_ASPECT_RATIO,
    resolution: normalizeImageResolution(input.resolution),
    quality: normalizeImageQuality(input.quality),
    size: input.size || null,
    maxImages: Number.isInteger(input.maxImages) ? input.maxImages : null,
    outputFormat: normalizeImageOutputFormat(input.outputFormat),
    enableSyncMode:
      typeof input.enableSyncMode === 'boolean'
        ? input.enableSyncMode
        : DEFAULT_ENABLE_SYNC_MODE,
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
    fixedResolution: config.fixedResolution || null,
    supportsWebSearch: config.supportsWebSearch === true,
  };
}

export function resolveHostedImageOutputFormat(request, operation) {
  const modelConfig = getHostedImageModelConfig(request.model, operation);

  if (modelConfig.modelGroup === 'gpt-image-2') {
    return 'png';
  }

  return request.outputFormat === 'jpeg' ? 'jpeg' : 'png';
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
    creativeFormat: normalized.creativeFormat,
    creativeFormatLabel: normalized.creativeFormatLabel,
    targetAspectRatio: normalized.targetAspectRatio,
    localAssetDir: paths.absoluteAssetDir,
    requestPath: paths.requestPath,
    responsePath: paths.responsePath,
    createdAt: nowIso(),
    assets: [],
  };
}

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//.test(value);
}

function providerOutputType(value) {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  if (typeof value === 'string' && !isHttpUrl(value)) {
    return 'base64';
  }
  return typeof value;
}

function normalizeBase64Output(value) {
  const normalized = value.replace(/\s+/g, '');
  if (
    normalized.length === 0 ||
    normalized.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(normalized)
  ) {
    return null;
  }

  const bytes = Buffer.from(normalized, 'base64');
  if (bytes.length === 0 || bytes.toString('base64') !== normalized) {
    return null;
  }

  return { bytes };
}

function unsupportedProviderOutputError(index, output, request) {
  const outputType = providerOutputType(output);
  const error = new Error(
    [
      `Unsupported image provider output at outputs[${index}]: ${outputType}.`,
      'Expected an http(s) URL output',
      request.enableBase64Output
        ? 'or a base64 image string.'
        : 'or enableBase64Output=true for base64 image strings.',
    ].join(' '),
  );
  error.outputIndex = index;
  error.outputType = outputType;
  return error;
}

function copyJsonRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return JSON.parse(JSON.stringify(value));
}

export function recordCompletedProviderOutputs(manifest, result) {
  const outputs = Array.isArray(result?.outputs) ? result.outputs : [];
  const providerOutputs = outputs.map((output, index) => {
    if (isHttpUrl(output)) {
      return {
        index,
        type: 'url',
        url: output,
      };
    }

    if (typeof output === 'string') {
      return {
        index,
        type: 'base64',
      };
    }

    return {
      index,
      type: typeof output,
    };
  });

  manifest.providerOutputs = providerOutputs;
  manifest.providerOutputUrls = providerOutputs
    .map((output) => output.url)
    .filter((url) => typeof url === 'string' && url.length > 0);
  manifest.providerBilling = copyJsonRecord(result?.billing);
  return manifest;
}

function buildImageAssetEntry(request, paths, assetId, localPath, remoteUrl) {
  const fileExt = path.extname(localPath).replace(/^\./, '') || 'png';

  return {
    assetId,
    localPath,
    assetRelativePath: toAssetRelative(paths.absoluteAssetDir, localPath),
    remoteUrl,
    mimeType: `image/${fileExt}`,
    promptHash: `sha256:${sha256(request.prompt)}`,
    sourceBasis: request.sourceBasis,
  };
}

export async function materializeImageOutputs(
  request,
  result,
  manifest,
  paths,
  operation,
  options = {},
) {
  const outputs = Array.isArray(result?.outputs) ? result.outputs : [];
  const fileExt = resolveHostedImageOutputFormat(request, operation);
  const download = options.download || downloadFile;

  ensureDir(paths.candidatesDir);
  for (let index = 0; index < outputs.length; index += 1) {
    const output = outputs[index];
    const assetId = `img-${String(index + 1).padStart(3, '0')}`;
    const localPath = path.join(paths.candidatesDir, `${assetId}.${fileExt}`);

    if (isHttpUrl(output)) {
      await download(output, localPath);
      manifest.assets.push(
        buildImageAssetEntry(request, paths, assetId, localPath, output),
      );
      continue;
    }

    if (typeof output === 'string' && request.enableBase64Output) {
      const normalized = normalizeBase64Output(output);
      if (!normalized) {
        throw unsupportedProviderOutputError(index, output, request);
      }

      ensureDir(path.dirname(localPath));
      fs.writeFileSync(localPath, normalized.bytes);
      manifest.assets.push(
        buildImageAssetEntry(request, paths, assetId, localPath, null),
      );
      continue;
    }

    throw unsupportedProviderOutputError(index, output, request);
  }
}

function buildRecoverableFailurePointer(request, paths, manifest, failure) {
  return {
    code: failure.code,
    failedAt: failure.failedAt,
    layer: failure.layer,
    manifestPath: toAssetRelative(paths.absoluteAssetDir, paths.manifestPath),
    message: failure.message,
    providerOutputUrls: failure.providerOutputUrls,
    providerStatus: manifest.providerStatus,
    recoverable: true,
    responsePath: toAssetRelative(paths.absoluteAssetDir, paths.responsePath),
    runId: request.runId,
  };
}

export function markImageMaterializationFailure(
  request,
  paths,
  manifest,
  error,
) {
  const providerOutputUrls = Array.isArray(manifest.providerOutputUrls)
    ? manifest.providerOutputUrls
    : [];
  const failure = {
    code: IMAGE_MATERIALIZATION_FAILURE_CODE,
    failedAt: nowIso(),
    layer: IMAGE_MATERIALIZATION_FAILURE_LAYER,
    message: error instanceof Error ? error.message : String(error),
    providerOutputUrls,
    recoverable: true,
  };

  manifest.materializationStatus = IMAGE_MATERIALIZATION_FAILURE_CODE;
  manifest.recoverableFailure = buildRecoverableFailurePointer(
    request,
    paths,
    manifest,
    failure,
  );
  return manifest.recoverableFailure;
}

export function createImageMaterializationError(paths, failure, cause) {
  const error = new Error(
    [
      `${IMAGE_MATERIALIZATION_FAILURE_CODE}: provider generation completed, but asset materialization failed at ${failure.layer}.`,
      `Provider output URLs are saved in ${paths.manifestPath} as providerOutputUrls and in ${paths.responsePath}.`,
      `Retry materialization with poll_prediction.mjs using the saved response.json; a live hosted generation run handle is not required.`,
    ].join(' '),
  );
  error.code = IMAGE_MATERIALIZATION_FAILURE_CODE;
  error.productErrorCode = IMAGE_MATERIALIZATION_FAILURE_CODE;
  error.layer = failure.layer;
  error.manifestPath = paths.manifestPath;
  error.responsePath = paths.responsePath;
  error.providerOutputUrls = failure.providerOutputUrls;
  error.cause = cause;
  return error;
}

export async function materializeCompletedImageOutputs(
  request,
  result,
  manifest,
  paths,
  operation,
  options = {},
) {
  recordCompletedProviderOutputs(manifest, result);
  writeJson(paths.manifestPath, manifest);

  try {
    await materializeImageOutputs(
      request,
      result,
      manifest,
      paths,
      operation,
      options,
    );
  } catch (error) {
    const failure = markImageMaterializationFailure(
      request,
      paths,
      manifest,
      error,
    );
    finalizeImageRun(request, paths, manifest, { updateHero: false });
    throw createImageMaterializationError(paths, failure, error);
  }

  delete manifest.materializationStatus;
  delete manifest.recoverableFailure;
  return manifest;
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
    creativeFormat: normalized.creativeFormat,
    creativeFormatLabel: normalized.creativeFormatLabel,
    targetAspectRatio: normalized.targetAspectRatio,
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

function updateAssetIndexRecoverableFailure(paths, failurePointer) {
  const current = readJsonIfExists(paths.indexJsonPath) || {
    assetId: path.basename(paths.absoluteAssetDir),
    images: [],
    videos: [],
    audio: [],
    uploads: [],
  };
  const currentFailures = Array.isArray(current.recoverableFailures)
    ? current.recoverableFailures
    : [];
  const next = {
    ...current,
    recoverableFailures: [
      ...currentFailures.filter(
        (failure) =>
          failure?.runId !== failurePointer.runId ||
          failure?.code !== failurePointer.code,
      ),
      failurePointer,
    ],
  };

  writeJson(paths.indexJsonPath, next);
  return next;
}

function clearAssetIndexRecoverableFailure(paths, runId) {
  const current = readJsonIfExists(paths.indexJsonPath);
  if (!current || !Array.isArray(current.recoverableFailures)) {
    return current;
  }

  const next = {
    ...current,
    recoverableFailures: current.recoverableFailures.filter(
      (failure) => failure?.runId !== runId,
    ),
  };
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
  const currentAsset = readJsonIfExists(paths.assetJsonPath) || {};
  const assetUpdates = {
    heroImagePath:
      options.updateHero === false
        ? undefined
        : manifest.assets[0]?.assetRelativePath || null,
  };
  if (manifest.recoverableFailure) {
    assetUpdates.status = 'materialization_failed';
    assetUpdates.lastRunStatus = IMAGE_MATERIALIZATION_FAILURE_CODE;
    assetUpdates.lastRecoverableError = manifest.recoverableFailure;
  } else if (manifest.assets.length > 0) {
    assetUpdates.lastRunStatus = manifest.providerStatus || 'completed';
    assetUpdates.lastRecoverableError = null;
    if (currentAsset.status === 'materialization_failed') {
      assetUpdates.status = 'review_pending';
    }
  }
  upsertAssetRecord(request, paths, {
    ...assetUpdates,
  });
  updateAssetIndex(paths, 'image', indexEntries);
  if (manifest.recoverableFailure) {
    updateAssetIndexRecoverableFailure(paths, manifest.recoverableFailure);
  } else if (manifest.assets.length > 0) {
    clearAssetIndexRecoverableFailure(paths, request.runId);
  }
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
