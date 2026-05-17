#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  downloadHostedMediaFile,
  requestHostedMediaGenerationJson,
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
export const DEFAULT_MODEL = 'video-infinitetalk';
export const DEFAULT_RESOLUTION = '720p';
const VIDEO_RUNNER_ARCHIVED_REQUEST_ERROR_CODE =
  'postplus_video_batch_runner_archived_request_not_executable';
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

export const HOSTED_VIDEO_MODELS = {
  'video-infinitetalk': {
    modelGroup: 'infinitetalk',
    endpointKey: 'video-infinitetalk',
    requiredFields: ['image', 'audio'],
    supportsSeed: true,
  },
  'video-kling-v2-6-pro-motion-control': {
    modelGroup: 'kling-reference-motion-transfer',
    endpointKey: 'video-kling-v2-6-pro-motion-control',
    requiredFields: ['image', 'motionVideo', 'characterOrientation'],
    supportsSeed: false,
  },
  'video-seedance-2-image': {
    modelGroup: 'seedance-2.0',
    endpointKey: 'video-seedance-2-image',
    mode: 'image-to-video',
    requiredFields: ['prompt', 'image'],
    supportsAspectRatio: true,
    supportsWebSearch: true,
    supportsSeed: false,
  },
  'video-seedance-2-image-turbo': {
    modelGroup: 'seedance-2.0',
    endpointKey: 'video-seedance-2-image-turbo',
    mode: 'image-to-video',
    requiredFields: ['prompt', 'image'],
    supportsAspectRatio: true,
    supportsWebSearch: true,
    supportsSeed: false,
  },
  'video-seedance-2-text': {
    modelGroup: 'seedance-2.0',
    endpointKey: 'video-seedance-2-text',
    mode: 'text-to-video',
    requiredFields: ['prompt'],
    supportsAspectRatio: true,
    supportsWebSearch: true,
    supportsSeed: false,
  },
  'video-seedance-2-text-turbo': {
    modelGroup: 'seedance-2.0',
    endpointKey: 'video-seedance-2-text-turbo',
    mode: 'text-to-video',
    requiredFields: ['prompt'],
    supportsAspectRatio: true,
    supportsWebSearch: true,
    supportsSeed: false,
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
  const absolutePath = path.resolve(filePath);
  const payload = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

  try {
    return readHostedSkillExecutionInput(payload);
  } catch (error) {
    throw enhanceHostedEnvelopeError(error, payload, absolutePath);
  }
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

function resolveBillableVideoDuration(body) {
  const value = Number(body?.duration ?? body?.durationSeconds ?? 5);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Hosted video billing requires a positive duration.');
  }
  return Math.ceil(value);
}

export function buildHostedVideoRequestDimensions(endpointKey, body) {
  const requestBody = body ?? {};
  const dimensions = {
    audioMode: 'on',
    billableUnitCount: 1,
    duration: resolveBillableVideoDuration(requestBody),
    operationKey: endpointKey,
    resolution: requestBody.resolution ?? DEFAULT_RESOLUTION,
    requestBytes: Buffer.byteLength(JSON.stringify(requestBody)),
  };

  if (
    endpointKey === 'video-seedance-2-text' ||
    endpointKey === 'video-seedance-2-text-turbo'
  ) {
    const referenceVideoCount = Array.isArray(requestBody.reference_videos)
      ? requestBody.reference_videos.length
      : 0;

    dimensions.referenceVideoCount = referenceVideoCount;
    dimensions.referenceVideoMode =
      referenceVideoCount > 0
        ? 'with_reference_videos'
        : 'without_reference_videos';
  }

  if (endpointKey === 'video-kling-v2-6-pro-motion-control') {
    dimensions.motionControlMode = 'reference_motion_transfer';
    dimensions.characterOrientation =
      requestBody.character_orientation ?? 'image';
  }

  return dimensions;
}

export async function fetchJson(url, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const requestBody =
    typeof options.body === 'string' && options.body.trim().length > 0
      ? JSON.parse(options.body)
      : (options.body ?? {});

  return requestHostedMediaGenerationJson(url, {
    method,
    body: requestBody,
    requestDimensions:
      method !== 'POST'
        ? undefined
        : buildHostedVideoRequestDimensions(url, requestBody),
  }).then((result) => ({
    data: result.data,
    response: {
      headers: {},
      status: 200,
    },
  }));
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

export function buildRequestPaths(localOutputDir) {
  const absoluteOutputDir = path.resolve(localOutputDir);
  const requestPath = path.join(absoluteOutputDir, 'request.json');
  const responsePath = path.join(absoluteOutputDir, 'response.json');
  const manifestPath = path.join(absoluteOutputDir, 'manifest.json');
  const rendersDir = path.join(absoluteOutputDir, 'renders');
  const qaDir = path.join(absoluteOutputDir, 'qa');
  return {
    absoluteOutputDir,
    requestPath,
    responsePath,
    manifestPath,
    mediaUploadRequestPath: path.join(absoluteOutputDir, 'media-upload.request.json'),
    mediaUploadResponsePath: path.join(absoluteOutputDir, 'media-upload.response.json'),
    rendersDir,
    qaDir,
  };
}

function enhanceHostedEnvelopeError(error, payload, absolutePath) {
  if (
    error?.code !== 'postplus_hosted_skill_execution_envelope_required' ||
    !isArchivedNormalizedVideoRequest(payload)
  ) {
    return error;
  }

  const manifestPath = buildRequestPaths(payload.localOutputDir).manifestPath;
  const executionEnvelopePath =
    readExecutionEnvelopePathFromManifest(manifestPath) ||
    inferExecutionEnvelopePath(payload, absolutePath);
  const lines = [
    'This video-batch-runner request is an archived normalized request, not an executable hosted execution envelope.',
    `Archived request path: ${absolutePath}`,
    '`poll_prediction.mjs --request` requires the hosted execution envelope with `schemaVersion: 1` and `input`.',
  ];

  if (executionEnvelopePath) {
    lines.push(
      `Use executionEnvelopePath/pollRequestPath instead: ${executionEnvelopePath}`,
    );
  } else {
    lines.push(
      `Use executionEnvelopePath or pollRequestPath from ${manifestPath}.`,
    );
  }

  const archivedRequestError = new Error(lines.join('\n'));
  archivedRequestError.code = VIDEO_RUNNER_ARCHIVED_REQUEST_ERROR_CODE;
  archivedRequestError.productErrorCode = VIDEO_RUNNER_ARCHIVED_REQUEST_ERROR_CODE;
  archivedRequestError.status = 400;
  archivedRequestError.archivedRequestPath = absolutePath;
  archivedRequestError.executionEnvelopePath = executionEnvelopePath;
  archivedRequestError.manifestPath = manifestPath;
  archivedRequestError.cause = error;
  return archivedRequestError;
}

function isArchivedNormalizedVideoRequest(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      value.schemaVersion !== 1 &&
      typeof value.jobId === 'string' &&
      value.jobId.trim() &&
      typeof value.localOutputDir === 'string' &&
      value.localOutputDir.trim(),
  );
}

function readExecutionEnvelopePathFromManifest(manifestPath) {
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.resolve(manifestPath), 'utf8'),
    );
    return normalizePathField(
      manifest?.executionEnvelopePath || manifest?.pollRequestPath,
    );
  } catch {
    return null;
  }
}

function inferExecutionEnvelopePath(request, absoluteArchivedRequestPath) {
  const archivedOutputDir = path.resolve(
    request.localOutputDir || path.dirname(absoluteArchivedRequestPath),
  );
  const jobDirName = path.basename(archivedOutputDir);
  const parentDir = path.dirname(archivedOutputDir);

  if (path.basename(parentDir) !== 'videos') {
    return null;
  }

  return path.join(
    path.dirname(parentDir),
    '.postplus',
    'video-batch-runner',
    jobDirName,
    'request.json',
  );
}

function normalizePathField(value) {
  return typeof value === 'string' && value.trim()
    ? path.resolve(value.trim())
    : null;
}

function inferMimeTypeFromPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.mp4') return 'video/mp4';
  if (ext === '.mov') return 'video/quicktime';
  if (ext === '.m4v') return 'video/x-m4v';
  if (ext === '.webm') return 'video/webm';
  if (ext === '.mp3') return 'audio/mpeg';
  if (ext === '.wav') return 'audio/wav';
  if (ext === '.m4a') return 'audio/mp4';
  return 'application/octet-stream';
}

function isRemoteOrDataUrl(value) {
  return /^https?:\/\//iu.test(value) || /^data:/iu.test(value);
}

async function uploadHostedMedia(filePath, paths) {
  const absolutePath = path.resolve(filePath);
  const requestRecord = {
    provider: 'hosted-media',
    operation: 'media-upload',
    sourceLocalFilePath: absolutePath,
    fileName: path.basename(absolutePath),
    mimeType: inferMimeTypeFromPath(absolutePath),
    uploadedAt: nowIso(),
  };

  writeJson(paths.mediaUploadRequestPath, requestRecord);
  const data = await uploadHostedMediaFile(
    absolutePath,
    requestRecord.mimeType,
  );
  writeJson(paths.mediaUploadResponsePath, data);

  const uploadResult =
    data && typeof data === 'object' && data.data && typeof data.data === 'object'
      ? data.data
      : data;
  const uploadedUrl =
    uploadResult?.download_url ||
    uploadResult?.url ||
    uploadResult?.downloadUrl ||
    null;

  if (!uploadedUrl) {
    throw new Error(
      `Hosted media upload did not return a download URL: ${JSON.stringify(data)}`,
    );
  }

  return uploadedUrl;
}

async function resolveProviderMediaInput(value, paths) {
  if (typeof value !== 'string' || value.trim() === '') {
    return value;
  }

  const trimmed = value.trim();
  if (isRemoteOrDataUrl(trimmed)) {
    return trimmed;
  }

  const candidatePath = path.resolve(trimmed);
  if (!fs.existsSync(candidatePath)) {
    throw new Error(`Local media file does not exist: ${candidatePath}`);
  }

  const stat = fs.statSync(candidatePath);
  if (!stat.isFile()) {
    throw new Error(`Local media path is not a file: ${candidatePath}`);
  }

  return await uploadHostedMedia(candidatePath, paths);
}

async function resolveProviderMediaList(values, paths) {
  const result = [];
  for (const value of values) {
    result.push(await resolveProviderMediaInput(value, paths));
  }
  return result;
}

function dedupeStrings(values) {
  return Array.from(
    new Set(
      values
        .flat()
        .filter((value) => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeStoryboardTimeline(timeline) {
  if (!timeline) {
    return null;
  }

  if (typeof timeline === 'string') {
    const normalized = timeline.trim();
    return normalized || null;
  }

  if (!Array.isArray(timeline)) {
    return null;
  }

  const lines = timeline
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry.trim();
      }
      if (!entry || typeof entry !== 'object') {
        return '';
      }

      const time =
        typeof entry.time === 'string' && entry.time.trim()
          ? entry.time.trim()
          : formatTimelineRange(entry.startSeconds, entry.endSeconds);
      const action =
        typeof entry.action === 'string' && entry.action.trim()
          ? entry.action.trim()
          : typeof entry.visual === 'string' && entry.visual.trim()
            ? entry.visual.trim()
            : '';
      const dialogue =
        typeof entry.dialogue === 'string' && entry.dialogue.trim()
          ? entry.dialogue.trim()
          : '';

      if (!time || !action) {
        return '';
      }

      return dialogue
        ? `${time}: ${action} Dialogue: "${dialogue}"`
        : `${time}: ${action}`;
    })
    .filter(Boolean);

  return lines.length > 0 ? lines.join('\n') : null;
}

function formatTimelineRange(startSeconds, endSeconds) {
  const hasStart = Number.isFinite(Number(startSeconds));
  const hasEnd = Number.isFinite(Number(endSeconds));
  if (!hasStart && !hasEnd) {
    return '';
  }
  if (hasStart && hasEnd) {
    return `${Number(startSeconds).toFixed(1)}-${Number(endSeconds).toFixed(1)}s`;
  }
  if (hasStart) {
    return `${Number(startSeconds).toFixed(1)}s`;
  }
  return `${Number(endSeconds).toFixed(1)}s`;
}

function buildSeedancePromptFromPlan(plan = {}, fallbackPrompt = null) {
  if (!plan || typeof plan !== 'object') {
    return fallbackPrompt || null;
  }

  const storyboardTimeline = normalizeStoryboardTimeline(plan.storyboardTimeline);
  const sections = [];
  const core = dedupeStrings([
    plan.subject,
    plan.scene,
    plan.style,
    plan.mood,
    plan.timeOfDay,
    plan.lighting,
    plan.color,
  ]);
  if (core.length > 0) {
    sections.push(core.join(' '));
  }

  if (storyboardTimeline) {
    sections.push(storyboardTimeline);
  }

  const framing = dedupeStrings([
    plan.shotType,
    plan.camera,
    plan.lens,
    plan.motion,
    plan.pacing,
  ]);
  if (framing.length > 0) {
    sections.push(framing.join(' '));
  }

  const environment = dedupeStrings([
    plan.background,
    plan.props,
    plan.wardrobe,
    plan.composition,
  ]);
  if (environment.length > 0) {
    sections.push(environment.join(' '));
  }

  const audio = dedupeStrings([
    plan.audio,
    plan.music,
    plan.soundEffects,
  ]);
  if (audio.length > 0) {
    sections.push(audio.join(' '));
  }

  const continuity = dedupeStrings(plan.continuity || []);
  if (continuity.length > 0) {
    sections.push(continuity.join(' '));
  }

  const keep = dedupeStrings(plan.mustKeep || []);
  if (keep.length > 0) {
    sections.push(`Keep these true: ${keep.join(' ')}`);
  }

  const avoid = dedupeStrings(plan.mustAvoid || []);
  if (avoid.length > 0) {
    sections.push(`Avoid ${avoid.join(', ')}.`);
  }

  const referenceMap = Array.isArray(plan.referenceMap)
    ? plan.referenceMap
        .map((item, index) => {
          if (typeof item === 'string' && item.trim()) {
            const trimmed = item.trim();
            if (/^\[(image|video|audio)\s+\d+\]/i.test(trimmed)) {
              return trimmed;
            }
            const lower = trimmed.toLowerCase();
            if (lower.includes('[audio ')) {
              return trimmed;
            }
            if (lower.includes('[video ')) {
              return trimmed;
            }
            if (lower.includes('[image ')) {
              return trimmed;
            }
            return `[image ${index + 1}] ${trimmed}`;
          }
          return null;
        })
        .filter(Boolean)
    : [];
  if (referenceMap.length > 0) {
    sections.push(referenceMap.join(' '));
  }

  if (typeof fallbackPrompt === 'string' && fallbackPrompt.trim()) {
    sections.unshift(fallbackPrompt.trim());
  }

  const prompt = sections.join('\n\n').trim();
  return prompt || null;
}

function assertNoDeprecatedPromptPlanFields(plan) {
  if (!plan || typeof plan !== 'object') {
    return;
  }

  const deprecated = [];
  if (typeof plan.action === 'string' && plan.action.trim()) {
    deprecated.push('promptPlan.action');
  }
  if (typeof plan.dialogue === 'string' && plan.dialogue.trim()) {
    deprecated.push('promptPlan.dialogue');
  }

  if (deprecated.length > 0) {
    throw new Error(
      `video-batch-runner no longer supports ${deprecated.join(', ')} for Seedance prompt assembly. Use promptPlan.storyboardTimeline instead so action and dialogue stay on the same timeline.`,
    );
  }
}

function stringList(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values
    .map((value) => {
      if (typeof value === 'string') {
        return value.trim();
      }
      if (value && typeof value === 'object') {
        const candidate =
          value.url || value.image || value.video || value.audio || '';
        return typeof candidate === 'string' ? candidate.trim() : '';
      }
      return '';
    })
    .filter(Boolean);
}

function getHostedVideoModelConfig(model) {
  const config = HOSTED_VIDEO_MODELS[model];
  if (!config) {
    throw new Error(`Unsupported hosted video model: ${model}`);
  }
  return config;
}

const UNSUPPORTED_HOSTED_STRUCTURED_MOTION_CONTROL_PATHS = [
  'camera',
  'camera_fixed',
  'cameraFixed',
  'camera_control',
  'cameraControl',
  'camera_trajectory',
  'cameraTrajectory',
  'camera_trajectories',
  'cameraTrajectories',
  'object_trajectory',
  'objectTrajectory',
  'object_trajectories',
  'objectTrajectories',
  'motion_brush',
  'motionBrush',
  'motion_brushes',
  'motionBrushes',
  'brush_mask',
  'brushMask',
  'promptPlan.camera_control',
  'promptPlan.cameraControl',
  'promptPlan.camera_trajectory',
  'promptPlan.cameraTrajectory',
  'promptPlan.camera_trajectories',
  'promptPlan.cameraTrajectories',
  'promptPlan.object_trajectory',
  'promptPlan.objectTrajectory',
  'promptPlan.object_trajectories',
  'promptPlan.objectTrajectories',
  'promptPlan.motion_brush',
  'promptPlan.motionBrush',
  'promptPlan.motion_brushes',
  'promptPlan.motionBrushes',
  'promptPlan.brush_mask',
  'promptPlan.brushMask',
];

const UNSUPPORTED_STRUCTURED_MOTION_CONTROL_PATHS = [
  'camera_trajectory',
  'cameraTrajectory',
  'camera_trajectories',
  'cameraTrajectories',
  'object_trajectory',
  'objectTrajectory',
  'object_trajectories',
  'objectTrajectories',
  'motion_brush',
  'motionBrush',
  'motion_brushes',
  'motionBrushes',
  'brush_mask',
  'brushMask',
  'promptPlan.camera_trajectory',
  'promptPlan.cameraTrajectory',
  'promptPlan.camera_trajectories',
  'promptPlan.cameraTrajectories',
  'promptPlan.object_trajectory',
  'promptPlan.objectTrajectory',
  'promptPlan.object_trajectories',
  'promptPlan.objectTrajectories',
  'promptPlan.motion_brush',
  'promptPlan.motionBrush',
  'promptPlan.motion_brushes',
  'promptPlan.motionBrushes',
  'promptPlan.brush_mask',
  'promptPlan.brushMask',
];

function hasOwnPath(input, dottedPath) {
  const parts = dottedPath.split('.');
  let current = input;
  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return false;
    }
    if (!Object.hasOwn(current, part)) {
      return false;
    }
    current = current[part];
  }
  return true;
}

function collectExistingPaths(input, fieldPaths) {
  return fieldPaths.filter((fieldPath) => hasOwnPath(input, fieldPath));
}

function assertNoUnsupportedStructuredMotionControls(input) {
  const unsupportedPaths = collectExistingPaths(
    input,
    UNSUPPORTED_STRUCTURED_MOTION_CONTROL_PATHS,
  );

  if (unsupportedPaths.length === 0) {
    return;
  }

  throw new Error(
    `video-batch-runner does not support provider-native structured motion controls: ${unsupportedPaths.join(', ')}. The current implementation only supports reference-motion transfer with video-kling-v2-6-pro-motion-control.`,
  );
}

function assertNoUnsupportedHostedStructuredMotionControls(input, model) {
  const unsupportedPaths = collectExistingPaths(
    input,
    UNSUPPORTED_HOSTED_STRUCTURED_MOTION_CONTROL_PATHS,
  );

  if (unsupportedPaths.length === 0) {
    return;
  }

  throw new Error(
    `Hosted video model ${model} does not support provider-native structured motion controls: ${unsupportedPaths.join(', ')}. The current hosted reference-motion transfer endpoint only supports image, motionVideo, characterOrientation, and optional prompt/negativePrompt/keepOriginalSound.`,
  );
}

function readHostedRequiredInput(input, field) {
  if (field === 'motionVideo') {
    return input.motionVideo || input.motion_video || input.video || null;
  }
  if (field === 'characterOrientation') {
    return input.characterOrientation || input.character_orientation || null;
  }
  return input?.[field] || null;
}

export function normalizeRenderInput(input) {
  if (!input?.jobId) {
    throw new Error('request.jobId is required.');
  }
  if (!input?.localOutputDir) {
    throw new Error('request.localOutputDir is required.');
  }

  assertNoDeprecatedPromptPlanFields(input.promptPlan);

  const provider = input.provider || DEFAULT_PROVIDER;
  if (provider !== 'hosted-media') {
    throw new Error(
      `unsupported_video_provider: ${provider}. Released video-batch-runner only supports provider "hosted-media".`,
    );
  }
  const model = input.model || DEFAULT_MODEL;
  const hostedModelConfig = getHostedVideoModelConfig(model);
  const creativeFormat = resolveCreativeFormat(input);
  const modelSupportsAspectRatio = hostedModelConfig.supportsAspectRatio === true;
  const prompt = buildSeedancePromptFromPlan(
    input.promptPlan,
    input.prompt || input.text || null,
  );

  if (provider === 'hosted-media') {
    assertNoUnsupportedHostedStructuredMotionControls(input, model);

    for (const field of hostedModelConfig.requiredFields) {
      if (field === 'prompt' && !prompt) {
        throw new Error(
          `Hosted video model ${model} requires request.prompt or request.promptPlan.`,
        );
      }
      if (field !== 'prompt' && !readHostedRequiredInput(input, field)) {
        throw new Error(`Hosted video model ${model} requires request.${field}.`);
      }
    }
  }
  const normalized = {
    provider,
    model,
    creativeFormat: creativeFormat.id,
    creativeFormatLabel: creativeFormat.label,
    targetAspectRatio: creativeFormat.aspectRatio,
    jobId: input.jobId,
    campaignId: input.campaignId || null,
    personaId: input.personaId || null,
    conceptId: input.conceptId || null,
    scriptId: input.scriptId || null,
    voiceTakeId: input.voiceTakeId || null,
    imageAssetId: input.imageAssetId || null,
    assetPurpose: input.assetPurpose || null,
    image: input.image || null,
    motionVideo: input.motionVideo || input.motion_video || input.video || null,
    audio: input.audio || null,
    maskImage: input.maskImage || null,
    prompt,
    negativePrompt: input.negativePrompt || input.negative_prompt || null,
    promptPlan: input.promptPlan || null,
    resolution: input.resolution || DEFAULT_RESOLUTION,
    characterOrientation:
      input.characterOrientation || input.character_orientation || null,
    ratio: modelSupportsAspectRatio ? creativeFormat.aspectRatio : null,
    duration: Number.isInteger(input.duration) ? input.duration : null,
    frames: Number.isInteger(input.frames) ? input.frames : null,
    seed: Number.isInteger(input.seed) ? input.seed : -1,
    watermark: typeof input.watermark === 'boolean' ? input.watermark : false,
    cameraFixed:
      typeof input.camera_fixed === 'boolean'
        ? input.camera_fixed
        : typeof input.cameraFixed === 'boolean'
          ? input.cameraFixed
          : null,
    returnLastFrame:
      typeof input.return_last_frame === 'boolean'
        ? input.return_last_frame
        : typeof input.returnLastFrame === 'boolean'
          ? input.returnLastFrame
          : false,
    generateAudio:
      typeof input.generate_audio === 'boolean'
        ? input.generate_audio
        : typeof input.generateAudio === 'boolean'
          ? input.generateAudio
          : null,
    keepOriginalSound:
      typeof input.keep_original_sound === 'boolean'
        ? input.keep_original_sound
        : typeof input.keepOriginalSound === 'boolean'
          ? input.keepOriginalSound
          : null,
    enableWebSearch:
      typeof input.enable_web_search === 'boolean'
        ? input.enable_web_search
        : typeof input.enableWebSearch === 'boolean'
          ? input.enableWebSearch
          : null,
    lastImage: input.last_image || input.lastImage || null,
    referenceImages: stringList(
      input.reference_images || input.referenceImages || input.images,
    ),
    referenceVideos: stringList(
      input.reference_videos || input.referenceVideos || input.videos,
    ),
    referenceAudios: stringList(
      input.reference_audios || input.referenceAudios || input.audios,
    ),
    callbackUrl: input.callback_url || input.callbackUrl || null,
    serviceTier: input.service_tier || input.serviceTier || null,
    executionExpiresAfter: Number.isInteger(input.execution_expires_after)
      ? input.execution_expires_after
      : Number.isInteger(input.executionExpiresAfter)
        ? input.executionExpiresAfter
        : null,
    draft: typeof input.draft === 'boolean' ? input.draft : null,
    tools: Array.isArray(input.tools) ? input.tools : [],
    safetyIdentifier: input.safety_identifier || input.safetyIdentifier || null,
    localOutputDir: input.localOutputDir,
    sourceBasis: Array.isArray(input.sourceBasis) ? input.sourceBasis : [],
    mustKeep: Array.isArray(input.mustKeep) ? input.mustKeep : [],
    canVary: Array.isArray(input.canVary) ? input.canVary : [],
    feedback: Array.isArray(input.feedback) ? input.feedback : [],
    continuityPolicy:
      input.continuityPolicy && typeof input.continuityPolicy === 'object'
        ? input.continuityPolicy
        : null,
    continuityReport:
      input.continuityReport && typeof input.continuityReport === 'object'
        ? input.continuityReport
        : null,
    upstreamRefs: {
      image: input.upstreamRefs?.image || null,
      audio: input.upstreamRefs?.audio || null,
    },
  };

  normalized.content = [];

  return normalized;
}

export function createRenderManifestBase(normalized, paths, options = {}) {
  const executionEnvelopePath = normalizePathField(
    options.executionEnvelopePath,
  );

  return {
    jobId: normalized.jobId,
    campaignId: normalized.campaignId,
    personaId: normalized.personaId,
    conceptId: normalized.conceptId,
    scriptId: normalized.scriptId,
    voiceTakeId: normalized.voiceTakeId,
    imageAssetId: normalized.imageAssetId,
    assetPurpose: normalized.assetPurpose,
    provider: normalized.provider,
    model: normalized.model,
    creativeFormat: normalized.creativeFormat,
    creativeFormatLabel: normalized.creativeFormatLabel,
    targetAspectRatio: normalized.targetAspectRatio,
    executionEnvelopePath,
    pollRequestPath: executionEnvelopePath,
    pollCommand: executionEnvelopePath
      ? buildPollCommand(executionEnvelopePath)
      : null,
    archivedRequestPath: paths.requestPath,
    responsePath: paths.responsePath,
    createdAt: nowIso(),
    sourceBasis: normalized.sourceBasis,
    continuityPolicy: normalized.continuityPolicy,
    continuityReport: normalized.continuityReport,
    upstreamRefs: normalized.upstreamRefs,
    prompt: normalized.prompt,
    resolution: normalized.resolution,
    ratio: normalized.ratio,
    duration: normalized.duration,
    frames: normalized.frames,
    seed: normalized.seed,
    enableWebSearch: normalized.enableWebSearch,
    lastImage: normalized.lastImage,
    referenceImages: normalized.referenceImages,
    referenceVideos: normalized.referenceVideos,
    referenceAudios: normalized.referenceAudios,
    assets: [],
    feedback: normalized.feedback,
  };
}

export function buildPollCommand(executionEnvelopePath) {
  const normalizedExecutionEnvelopePath = normalizePathField(
    executionEnvelopePath,
  );
  if (!normalizedExecutionEnvelopePath) {
    throw new Error('executionEnvelopePath is required to build poll command.');
  }

  return [
    'node',
    shellQuote(path.join(SCRIPT_DIR, 'poll_prediction.mjs')),
    '--request',
    shellQuote(normalizedExecutionEnvelopePath),
  ].join(' ');
}

function shellQuote(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=@-]+$/.test(text)) {
    return text;
  }

  return `'${text.replaceAll("'", "'\\''")}'`;
}

export async function toProviderPayload(normalized, { paths } = {}) {
  if (normalized.provider !== 'hosted-media') {
    throw new Error(
      `unsupported_video_provider: ${normalized.provider}. Released video-batch-runner only supports provider "hosted-media".`,
    );
  }

  const hostedModelConfig = getHostedVideoModelConfig(normalized.model);
  if (hostedModelConfig.modelGroup === 'seedance-2.0') {
    const payload = {
      prompt: normalized.prompt,
      resolution: normalized.resolution,
    };

    if (Number.isInteger(normalized.duration)) {
      payload.duration = normalized.duration;
    }
    if (normalized.ratio) {
      payload.aspect_ratio = normalized.ratio;
    }
    if (typeof normalized.enableWebSearch === 'boolean') {
      payload.enable_web_search = normalized.enableWebSearch;
    }

    if (hostedModelConfig.mode === 'image-to-video') {
      payload.image = await resolveProviderMediaInput(normalized.image, paths);
      if (normalized.lastImage) {
        payload.last_image = await resolveProviderMediaInput(
          normalized.lastImage,
          paths,
        );
      }
    } else {
      if (normalized.referenceImages.length > 0) {
        payload.reference_images = await resolveProviderMediaList(
          normalized.referenceImages,
          paths,
        );
      }
      if (normalized.referenceVideos.length > 0) {
        payload.reference_videos = await resolveProviderMediaList(
          normalized.referenceVideos,
          paths,
        );
      }
      if (normalized.referenceAudios.length > 0) {
        payload.reference_audios = await resolveProviderMediaList(
          normalized.referenceAudios,
          paths,
        );
      }
    }

    return payload;
  }

  if (hostedModelConfig.modelGroup === 'kling-reference-motion-transfer') {
    const payload = {
      image: await resolveProviderMediaInput(normalized.image, paths),
      video: await resolveProviderMediaInput(normalized.motionVideo, paths),
      character_orientation: normalized.characterOrientation,
    };

    if (normalized.prompt) {
      payload.prompt = normalized.prompt;
    }
    if (normalized.negativePrompt) {
      payload.negative_prompt = normalized.negativePrompt;
    }
    if (typeof normalized.keepOriginalSound === 'boolean') {
      payload.keep_original_sound = normalized.keepOriginalSound;
    }

    return payload;
  }

  const payload = {
    image: await resolveProviderMediaInput(normalized.image, paths),
    audio: await resolveProviderMediaInput(normalized.audio, paths),
    resolution: normalized.resolution,
  };

  if (hostedModelConfig.supportsSeed && Number.isInteger(normalized.seed)) {
    payload.seed = normalized.seed;
  }

  if (normalized.maskImage) {
    payload.mask_image = await resolveProviderMediaInput(
      normalized.maskImage,
      paths,
    );
  }
  if (normalized.prompt) {
    payload.prompt = normalized.prompt;
  }

  return payload;
}

export async function maybeDownloadOutputs(result, manifest, paths) {
  if (result?.status !== 'completed' || !Array.isArray(result?.outputs)) {
    return manifest;
  }

  ensureDir(paths.rendersDir);
  for (let index = 0; index < result.outputs.length; index += 1) {
    const remoteUrl = result.outputs[index];
    const localPath = path.join(
      paths.rendersDir,
      `render-${String(index + 1).padStart(3, '0')}.mp4`,
    );
    await downloadFile(remoteUrl, localPath);
    manifest.assets.push({
      assetId: `${manifest.jobId}-video-${String(index + 1).padStart(3, '0')}`,
      localPath,
      remoteUrl,
      mimeType: 'video/mp4',
      createdAt: nowIso(),
    });
  }

  return manifest;
}

export function getProviderApiConfig(request) {
  if (request.provider !== 'hosted-media') {
    throw new Error(
      `unsupported_video_provider: ${request.provider}. Released video-batch-runner only supports provider "hosted-media".`,
    );
  }

  return {
    baseUrl: 'hosted-media',
    submitUrl: getHostedVideoModelConfig(request.model).endpointKey,
  };
}
