#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveCreativeFormat } from '../../../00-core/shared-runtime/scripts/lib/creative_format.mjs';
import {
  readDomainSkillExecutionInput,
  readHostedSkillExecutionInput,
} from '../../../00-core/shared-runtime/scripts/lib/hosted_execution_protocol.mjs';
import {
  createHostedMediaGenerationFailedError,
  downloadHostedMediaFile,
  isHostedMediaGenerationFailedResult,
  readHostedMediaGenerationFailure,
  requestHostedMediaGenerationJson,
  uploadHostedMediaFile,
} from '../../../00-core/shared-runtime/scripts/lib/hosted_media_generation_bridge.mjs';

export const DEFAULT_PROVIDER = 'hosted-media';
export const DEFAULT_MODEL = 'video-infinitetalk';
export const DEFAULT_RESOLUTION = '720p';
export {
  createHostedMediaGenerationFailedError,
  isHostedMediaGenerationFailedResult,
  readHostedMediaGenerationFailure,
};
export const SEEDANCE_TAIL_STRATEGY_PROMPTS = {
  natural_hold: 'natural hold with subtle breathing only',
  natural_hold_for_trim:
    'natural hold with subtle breathing and micro-expression only',
  micro_expression: 'subtle micro-expression only',
  settle: 'settle into the final pose with subtle breathing only',
  loopable_tail: 'loopable tail with no new action',
};
const SEEDANCE_PROVIDER_DURATION_VALUES_SECONDS = [5, 10, 15];
const KLING_V3_PROVIDER_DURATION_VALUES_SECONDS = [
  3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
];
const KLING_V3_TEXT_ASPECT_RATIOS = ['16:9', '9:16', '1:1'];
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
  'video-kling-v3-0-pro-image': {
    modelGroup: 'kling-v3.0',
    endpointKey: 'video-kling-v3-0-pro-image',
    mode: 'image-to-video',
    requiredFields: ['prompt', 'image'],
    supportsSeed: false,
  },
  'video-kling-v3-0-pro-text': {
    modelGroup: 'kling-v3.0',
    endpointKey: 'video-kling-v3-0-pro-text',
    mode: 'text-to-video',
    requiredFields: ['prompt'],
    supportsAspectRatio: true,
    supportsSeed: false,
  },
  'video-kling-v3-0-std-image': {
    modelGroup: 'kling-v3.0',
    endpointKey: 'video-kling-v3-0-std-image',
    mode: 'image-to-video',
    requiredFields: ['prompt', 'image'],
    supportsSeed: false,
  },
  'video-kling-v3-0-std-text': {
    modelGroup: 'kling-v3.0',
    endpointKey: 'video-kling-v3-0-std-text',
    mode: 'text-to-video',
    requiredFields: ['prompt'],
    supportsAspectRatio: true,
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
  if (body?.durationSeconds !== undefined) {
    throw new Error('request.durationSeconds is not supported. Use request.duration.');
  }
  const value = Number(body?.duration ?? 5);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Hosted video billing requires a positive duration.');
  }
  return Math.ceil(value);
}

export function buildHostedVideoRequestDimensions(endpointKey, body) {
  const requestBody = body ?? {};
  const audioMode =
    endpointKey.startsWith('video-kling-v3-0-') && requestBody.sound !== true
      ? 'off'
      : 'on';
  const dimensions = {
    audioMode,
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
    mediaUploadRequestPath: path.join(
      absoluteOutputDir,
      'media-upload.request.json',
    ),
    mediaUploadResponsePath: path.join(
      absoluteOutputDir,
      'media-upload.response.json',
    ),
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
  archivedRequestError.productErrorCode =
    VIDEO_RUNNER_ARCHIVED_REQUEST_ERROR_CODE;
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
    data &&
    typeof data === 'object' &&
    data.data &&
    typeof data.data === 'object'
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

function formatPromptStoryline(promptStoryline) {
  if (!Array.isArray(promptStoryline) || promptStoryline.length === 0) {
    throw new Error(
      'Seedance requests require promptPlan.prompt_storyline as a non-empty array.',
    );
  }

  const lines = promptStoryline.map((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      throw new Error(
        `Seedance promptPlan.prompt_storyline[${index}] must be an object.`,
      );
    }

    const shot = typeof entry.shot === 'string' ? entry.shot.trim() : '';
    const time = typeof entry.time === 'string' ? entry.time.trim() : '';
    const visual = typeof entry.visual === 'string' ? entry.visual.trim() : '';
    const dialogue =
      typeof entry.dialogue === 'string' ? entry.dialogue.trim() : '';

    if (!shot || !time || !visual) {
      throw new Error(
        `Seedance promptPlan.prompt_storyline[${index}] requires shot, time, and visual.`,
      );
    }

    return dialogue
      ? `${shot} | ${time}: ${visual} Dialogue: "${dialogue}"`
      : `${shot} | ${time}: ${visual}`;
  });

  return lines.join('\n');
}

function formatReferenceMap(referenceMap) {
  if (referenceMap == null) {
    return null;
  }
  if (!Array.isArray(referenceMap)) {
    throw new Error('Seedance promptPlan.referenceMap must be an array.');
  }
  if (referenceMap.length === 0) {
    return null;
  }

  const lines = referenceMap.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(
        `Seedance promptPlan.referenceMap[${index}] must be an object.`,
      );
    }
    const ref = typeof item.ref === 'string' ? item.ref.trim() : '';
    const role = typeof item.role === 'string' ? item.role.trim() : '';
    if (!ref || !role) {
      throw new Error(
        `Seedance promptPlan.referenceMap[${index}] requires ref and role.`,
      );
    }
    return `${ref} ${role}`;
  });

  return lines.join(' ');
}

function formatPromptSeconds(value) {
  return Number(value)
    .toFixed(3)
    .replace(/\.?0+$/u, '');
}

function toPositiveSeconds(value, fieldName) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(`${fieldName} must be a positive number of seconds.`);
  }
  return seconds;
}

function normalizeSeedanceEditTiming(
  input,
  providerDurationSeconds,
  modelGroup,
) {
  if (modelGroup !== 'seedance-2.0') {
    return {
      targetEditDurationSeconds: null,
      activePerformanceEndSeconds: null,
      tailStrategy: null,
      timeline: null,
    };
  }

  const timeline =
    input.timeline && typeof input.timeline === 'object' ? input.timeline : {};
  const targetEditRaw =
    input.targetEditDurationSeconds ?? input.target_edit_duration_seconds;
  const activeEndRaw =
    timeline.activePerformanceEndSeconds ??
    timeline.active_performance_end_seconds ??
    input.activePerformanceEndSeconds ??
    input.active_performance_end_seconds;
  const tailStrategyRaw =
    timeline.tailStrategy ??
    timeline.tail_strategy ??
    input.tailStrategy ??
    input.tail_strategy;

  if (targetEditRaw == null) {
    return {
      targetEditDurationSeconds: null,
      activePerformanceEndSeconds: null,
      tailStrategy: null,
      timeline: null,
    };
  }

  if (!Number.isFinite(providerDurationSeconds)) {
    throw new Error(
      'request.duration is required when request.targetEditDurationSeconds is set.',
    );
  }

  const targetEditDurationSeconds = toPositiveSeconds(
    targetEditRaw,
    'request.targetEditDurationSeconds',
  );
  if (targetEditDurationSeconds > providerDurationSeconds) {
    throw new Error(
      `request.targetEditDurationSeconds ${targetEditDurationSeconds}s exceeds provider duration ${providerDurationSeconds}s.`,
    );
  }

  const activePerformanceEndSeconds =
    activeEndRaw == null
      ? null
      : toPositiveSeconds(
          activeEndRaw,
          'request.timeline.activePerformanceEndSeconds',
        );
  if (
    activePerformanceEndSeconds != null &&
    activePerformanceEndSeconds > targetEditDurationSeconds
  ) {
    throw new Error(
      `request.timeline.activePerformanceEndSeconds ${activePerformanceEndSeconds}s exceeds targetEditDurationSeconds ${targetEditDurationSeconds}s.`,
    );
  }

  const tailStrategy =
    tailStrategyRaw == null ? null : String(tailStrategyRaw).trim();
  if (
    tailStrategy &&
    !Object.hasOwn(SEEDANCE_TAIL_STRATEGY_PROMPTS, tailStrategy)
  ) {
    throw new Error(
      `request.timeline.tailStrategy must be one of ${Object.keys(SEEDANCE_TAIL_STRATEGY_PROMPTS).join(', ')}.`,
    );
  }

  if (targetEditDurationSeconds < providerDurationSeconds) {
    if (activePerformanceEndSeconds == null) {
      throw new Error(
        'request.timeline.activePerformanceEndSeconds is required when targetEditDurationSeconds is shorter than duration.',
      );
    }
    if (!tailStrategy) {
      throw new Error(
        'request.timeline.tailStrategy is required when targetEditDurationSeconds is shorter than duration.',
      );
    }
  }

  return {
    targetEditDurationSeconds,
    activePerformanceEndSeconds,
    tailStrategy,
    timeline: {
      activePerformanceEndSeconds,
      tailStrategy,
    },
  };
}

function assertSeedanceProviderDuration(providerDurationSeconds, modelGroup) {
  if (modelGroup !== 'seedance-2.0' || providerDurationSeconds == null) {
    return;
  }
  if (
    SEEDANCE_PROVIDER_DURATION_VALUES_SECONDS.includes(providerDurationSeconds)
  ) {
    return;
  }

  throw new Error(
    `request.duration must be one of ${SEEDANCE_PROVIDER_DURATION_VALUES_SECONDS.join(', ')} seconds for Seedance.`,
  );
}

function assertKlingV3ProviderDuration(providerDurationSeconds, modelGroup) {
  if (modelGroup !== 'kling-v3.0' || providerDurationSeconds == null) {
    return;
  }
  if (
    KLING_V3_PROVIDER_DURATION_VALUES_SECONDS.includes(providerDurationSeconds)
  ) {
    return;
  }

  throw new Error(
    `request.duration must be an integer from 3 to 15 seconds for Kling 3.0.`,
  );
}

function buildSeedanceTailInstruction(timing, providerDurationSeconds) {
  if (
    !timing?.targetEditDurationSeconds ||
    !Number.isFinite(providerDurationSeconds) ||
    timing.targetEditDurationSeconds >= providerDurationSeconds
  ) {
    return null;
  }

  const activeEndSeconds =
    timing.activePerformanceEndSeconds ?? timing.targetEditDurationSeconds;
  const tailInstruction =
    SEEDANCE_TAIL_STRATEGY_PROMPTS[timing.tailStrategy] ||
    SEEDANCE_TAIL_STRATEGY_PROMPTS.natural_hold_for_trim;

  return [
    `0-${formatPromptSeconds(activeEndSeconds)}s: complete the active performance.`,
    `${formatPromptSeconds(activeEndSeconds)}-${formatPromptSeconds(providerDurationSeconds)}s: ${tailInstruction}, no new action or dialogue, designed for clean trimming.`,
  ].join('\n');
}

function buildSeedanceFinalPrompt(
  input,
  timing = null,
  providerDurationSeconds = null,
) {
  const plan = input.promptPlan;
  if (!plan || typeof plan !== 'object') {
    return null;
  }

  const promptSummary =
    typeof input.prompt_summary === 'string' ? input.prompt_summary.trim() : '';
  const promptStoryline = formatPromptStoryline(plan.prompt_storyline);
  const sections = [];

  if (promptSummary) {
    sections.push(promptSummary);
  }

  if (promptStoryline) {
    sections.push(promptStoryline);
  }

  const tailInstruction = buildSeedanceTailInstruction(
    timing,
    providerDurationSeconds,
  );
  if (tailInstruction) {
    sections.push(tailInstruction);
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

  const audio = dedupeStrings([plan.audio, plan.music, plan.soundEffects]);
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

  const referenceBindings = formatReferenceMap(plan.referenceMap);
  if (referenceBindings) {
    sections.push(referenceBindings);
  }

  const prompt = sections.join('\n\n').trim();
  return prompt || null;
}

function hasPromptStoryline(input) {
  return (
    Array.isArray(input.promptPlan?.prompt_storyline) &&
    input.promptPlan.prompt_storyline.length > 0
  );
}

function assertNoDeprecatedPromptPlanFields(plan) {
  if (!plan || typeof plan !== 'object') {
    return;
  }

  const deprecated = [];
  if (typeof plan.promptSummary === 'string' && plan.promptSummary.trim()) {
    deprecated.push('promptPlan.promptSummary');
  }
  if (typeof plan.intent === 'string' && plan.intent.trim()) {
    deprecated.push('promptPlan.intent');
  }
  if (
    typeof plan.storyboardTimeline === 'string' ||
    Array.isArray(plan.storyboardTimeline)
  ) {
    deprecated.push('promptPlan.storyboardTimeline');
  }
  if (
    typeof plan.promptStoryline === 'string' ||
    Array.isArray(plan.promptStoryline)
  ) {
    deprecated.push('promptPlan.promptStoryline');
  }
  if (typeof plan.action === 'string' && plan.action.trim()) {
    deprecated.push('promptPlan.action');
  }
  if (typeof plan.dialogue === 'string' && plan.dialogue.trim()) {
    deprecated.push('promptPlan.dialogue');
  }

  if (deprecated.length > 0) {
    throw new Error(
      `video-batch-runner no longer supports ${deprecated.join(', ')} for Seedance prompt assembly. Use request.prompt_summary and promptPlan.prompt_storyline.`,
    );
  }
}

function assertNoDeprecatedSeedancePromptFields(input) {
  const deprecated = [];
  if (typeof input.prompt === 'string' && input.prompt.trim()) {
    deprecated.push('request.prompt');
  }
  if (typeof input.text === 'string' && input.text.trim()) {
    deprecated.push('request.text');
  }
  if (typeof input.promptSummary === 'string' && input.promptSummary.trim()) {
    deprecated.push('request.promptSummary');
  }
  if (typeof input.finalPrompt === 'string' && input.finalPrompt.trim()) {
    deprecated.push('request.finalPrompt');
  }

  if (deprecated.length > 0) {
    throw new Error(
      `Seedance requests no longer support ${deprecated.join(', ')}. Use request.prompt_summary and promptPlan.prompt_storyline, or provide request.final_prompt explicitly.`,
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

function hasAnyOwnPath(input, fieldPaths) {
  return collectExistingPaths(input, fieldPaths).length > 0;
}

function assertKlingV3RequestContract(input, model, hostedModelConfig) {
  if (hostedModelConfig.modelGroup !== 'kling-v3.0') {
    return;
  }

  if (
    hasAnyOwnPath(input, [
      'resolution',
      'reference_images',
      'referenceImages',
      'reference_videos',
      'referenceVideos',
      'reference_audios',
      'referenceAudios',
      'images',
      'videos',
      'audios',
      'audio',
      'keep_original_sound',
      'keepOriginalSound',
    ])
  ) {
    throw new Error(
      `Hosted video model ${model} only supports prompt, optional negativePrompt, duration, cfgScale, shotType, sound/generateAudio, and image/endImage for image-to-video.`,
    );
  }

  const cfgScale = input.cfg_scale ?? input.cfgScale;
  if (
    cfgScale != null &&
    (typeof cfgScale !== 'number' ||
      !Number.isFinite(cfgScale) ||
      cfgScale < 0 ||
      cfgScale > 1)
  ) {
    throw new Error(
      `Hosted video model ${model} requires cfgScale between 0 and 1.`,
    );
  }

  const shotType = input.shot_type ?? input.shotType;
  if (
    shotType != null &&
    !['customize', 'intelligent'].includes(String(shotType))
  ) {
    throw new Error(
      `Hosted video model ${model} requires shotType to be customize or intelligent.`,
    );
  }

  if (hostedModelConfig.mode === 'text-to-video') {
    if (
      hasAnyOwnPath(input, [
        'image',
        'end_image',
        'endImage',
        'last_image',
        'lastImage',
        'motionVideo',
        'motion_video',
        'video',
      ])
    ) {
      throw new Error(
        `Hosted video model ${model} is text-to-video and does not accept image, video, or endImage inputs.`,
      );
    }

    const ratio =
      input.aspect_ratio ??
      input.aspectRatio ??
      input.ratio ??
      input.targetAspectRatio;
    if (ratio != null && !KLING_V3_TEXT_ASPECT_RATIOS.includes(String(ratio))) {
      throw new Error(
        `Hosted video model ${model} requires aspectRatio to be one of ${KLING_V3_TEXT_ASPECT_RATIOS.join(', ')}.`,
      );
    }
  }

  if (
    hostedModelConfig.mode === 'image-to-video' &&
    hasAnyOwnPath(input, [
      'aspect_ratio',
      'aspectRatio',
      'ratio',
      'targetAspectRatio',
    ])
  ) {
    throw new Error(
      `Hosted video model ${model} is image-to-video and does not accept aspectRatio; output ratio follows the input frame.`,
    );
  }
}

function resolveHostedPromptRequiredMessage(model, hostedModelConfig) {
  if (hostedModelConfig.modelGroup === 'seedance-2.0') {
    return `Hosted video model ${model} requires request.prompt_summary and promptPlan.prompt_storyline, or request.final_prompt.`;
  }

  return `Hosted video model ${model} requires request.prompt, request.text, or request.final_prompt.`;
}

function readOptionalIntegerSeconds(input, fieldName) {
  if (fieldName === 'duration' && input.durationSeconds !== undefined) {
    throw new Error('request.durationSeconds is not supported. Use request.duration.');
  }
  const value = input[fieldName];
  if (value == null) {
    return null;
  }
  if (Number.isInteger(value)) {
    return value;
  }

  throw new Error(`request.${fieldName} must be an integer number of seconds.`);
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

  const provider = input.provider || DEFAULT_PROVIDER;
  if (provider !== 'hosted-media') {
    throw new Error(
      `unsupported_video_provider: ${provider}. Released video-batch-runner only supports provider "hosted-media".`,
    );
  }
  const model = input.model || DEFAULT_MODEL;
  const hostedModelConfig = getHostedVideoModelConfig(model);
  const creativeFormat = resolveCreativeFormat(input);
  const modelSupportsAspectRatio =
    hostedModelConfig.supportsAspectRatio === true;
  const providerDurationSeconds = readOptionalIntegerSeconds(input, 'duration');
  assertSeedanceProviderDuration(
    providerDurationSeconds,
    hostedModelConfig.modelGroup,
  );
  assertKlingV3ProviderDuration(
    providerDurationSeconds,
    hostedModelConfig.modelGroup,
  );
  const seedanceEditTiming = normalizeSeedanceEditTiming(
    input,
    providerDurationSeconds,
    hostedModelConfig.modelGroup,
  );
  if (hostedModelConfig.modelGroup === 'seedance-2.0') {
    assertNoDeprecatedSeedancePromptFields(input);
    assertNoDeprecatedPromptPlanFields(input.promptPlan);
  }
  const promptSummary =
    typeof input.prompt_summary === 'string'
      ? input.prompt_summary.trim()
      : null;
  const finalPrompt =
    typeof input.final_prompt === 'string' && input.final_prompt.trim()
      ? input.final_prompt.trim()
      : hostedModelConfig.modelGroup === 'seedance-2.0'
        ? buildSeedanceFinalPrompt(
            input,
            seedanceEditTiming,
            providerDurationSeconds,
          )
        : input.prompt || input.text || null;

  if (
    hostedModelConfig.modelGroup === 'seedance-2.0' &&
    !input.final_prompt &&
    (!promptSummary || !hasPromptStoryline(input))
  ) {
    throw new Error(
      'Seedance requests require request.prompt_summary and promptPlan.prompt_storyline, unless request.final_prompt is provided.',
    );
  }

  if (provider === 'hosted-media') {
    assertNoUnsupportedHostedStructuredMotionControls(input, model);
    assertKlingV3RequestContract(input, model, hostedModelConfig);

    for (const field of hostedModelConfig.requiredFields) {
      if (field === 'prompt' && !finalPrompt) {
        throw new Error(
          resolveHostedPromptRequiredMessage(model, hostedModelConfig),
        );
      }
      if (field !== 'prompt' && !readHostedRequiredInput(input, field)) {
        throw new Error(
          `Hosted video model ${model} requires request.${field}.`,
        );
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
    promptSummary,
    finalPrompt,
    prompt: finalPrompt,
    negativePrompt: input.negativePrompt || input.negative_prompt || null,
    cfgScale:
      typeof input.cfg_scale === 'number'
        ? input.cfg_scale
        : typeof input.cfgScale === 'number'
          ? input.cfgScale
          : null,
    shotType:
      typeof input.shot_type === 'string' && input.shot_type.trim()
        ? input.shot_type.trim()
        : typeof input.shotType === 'string' && input.shotType.trim()
          ? input.shotType.trim()
          : null,
    promptPlan: input.promptPlan || null,
    resolution: input.resolution || DEFAULT_RESOLUTION,
    characterOrientation:
      input.characterOrientation || input.character_orientation || null,
    ratio: modelSupportsAspectRatio ? creativeFormat.aspectRatio : null,
    duration: providerDurationSeconds,
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
      typeof input.sound === 'boolean'
        ? input.sound
        : typeof input.generate_audio === 'boolean'
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
    providerDurationSeconds,
    targetEditDurationSeconds: seedanceEditTiming.targetEditDurationSeconds,
    activePerformanceEndSeconds: seedanceEditTiming.activePerformanceEndSeconds,
    tailStrategy: seedanceEditTiming.tailStrategy,
    timeline: seedanceEditTiming.timeline,
    lastImage:
      input.end_image ||
      input.endImage ||
      input.last_image ||
      input.lastImage ||
      null,
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
    prompt_summary: normalized.promptSummary,
    final_prompt: normalized.finalPrompt,
    prompt: normalized.prompt,
    resolution: normalized.resolution,
    ratio: normalized.ratio,
    providerDurationSeconds: normalized.providerDurationSeconds,
    targetEditDurationSeconds: normalized.targetEditDurationSeconds,
    activePerformanceEndSeconds: normalized.activePerformanceEndSeconds,
    tailStrategy: normalized.tailStrategy,
    timeline: normalized.timeline,
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

  if (hostedModelConfig.modelGroup === 'kling-v3.0') {
    const payload = {
      prompt: normalized.prompt,
    };

    if (hostedModelConfig.mode === 'image-to-video') {
      payload.image = await resolveProviderMediaInput(normalized.image, paths);
      if (normalized.lastImage) {
        payload.end_image = await resolveProviderMediaInput(
          normalized.lastImage,
          paths,
        );
      }
    } else if (normalized.ratio) {
      payload.aspect_ratio = normalized.ratio;
    }

    if (Number.isInteger(normalized.duration)) {
      payload.duration = normalized.duration;
    }
    if (normalized.negativePrompt) {
      payload.negative_prompt = normalized.negativePrompt;
    }
    if (typeof normalized.generateAudio === 'boolean') {
      payload.sound = normalized.generateAudio;
    }
    if (typeof normalized.cfgScale === 'number') {
      payload.cfg_scale = normalized.cfgScale;
    }
    if (normalized.shotType) {
      payload.shot_type = normalized.shotType;
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
