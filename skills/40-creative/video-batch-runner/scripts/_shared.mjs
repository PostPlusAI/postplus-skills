#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import {
  downloadHostedMediaFile,
  requestHostedMediaGenerationJson,
  uploadHostedMediaFile,
} from '../_postplus_shared/00-core/shared-runtime/scripts/lib/hosted_media_generation_bridge.mjs';

export const ARK_API_BASE = 'https://ark.cn-beijing.volces.com/api/v3';
export const DEFAULT_PROVIDER = 'hosted-media';
export const DEFAULT_MODEL = 'video-infinitetalk';
export const DEFAULT_RESOLUTION = '720p';

export const HOSTED_VIDEO_MODELS = {
  'video-infinitetalk': {
    modelGroup: 'infinitetalk',
    endpointKey: 'video-infinitetalk',
    requiredFields: ['image', 'audio'],
    supportsSeed: true,
  },
  'video-kling-v2-6-pro-motion-control': {
    modelGroup: 'kling-motion-control',
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
    return trimmed;
  }

  const stat = fs.statSync(candidatePath);
  if (!stat.isFile()) {
    return trimmed;
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

function normalizeContentItem(item) {
  if (!item || typeof item !== 'object' || !item.type) {
    throw new Error('Each request.content item must be an object with a type.');
  }

  if (item.type === 'text') {
    if (typeof item.text !== 'string' || !item.text.trim()) {
      throw new Error('text content requires a non-empty text field.');
    }
    return { type: 'text', text: item.text.trim() };
  }

  if (item.type === 'image_url') {
    const url = item.image_url?.url;
    if (typeof url !== 'string' || !url.trim()) {
      throw new Error('image_url content requires image_url.url.');
    }
    return {
      type: 'image_url',
      image_url: { url: url.trim() },
      ...(item.role ? { role: item.role } : {}),
    };
  }

  if (item.type === 'video_url') {
    const url = item.video_url?.url;
    if (typeof url !== 'string' || !url.trim()) {
      throw new Error('video_url content requires video_url.url.');
    }
    return {
      type: 'video_url',
      video_url: { url: url.trim() },
      ...(item.role ? { role: item.role } : {}),
    };
  }

  if (item.type === 'audio_url') {
    const url = item.audio_url?.url;
    if (typeof url !== 'string' || !url.trim()) {
      throw new Error('audio_url content requires audio_url.url.');
    }
    return {
      type: 'audio_url',
      audio_url: { url: url.trim() },
      ...(item.role ? { role: item.role } : {}),
    };
  }

  if (item.type === 'draft_task') {
    const id = item.draft_task?.id;
    if (typeof id !== 'string' || !id.trim()) {
      throw new Error('draft_task content requires draft_task.id.');
    }
    return {
      type: 'draft_task',
      draft_task: { id: id.trim() },
    };
  }

  throw new Error(`Unsupported request.content item type: ${item.type}`);
}

function buildSeedancePromptFromPlan(plan = {}, fallbackPrompt = null) {
  if (!plan || typeof plan !== 'object') {
    return fallbackPrompt || null;
  }

  const sections = [];
  const core = dedupeStrings([
    plan.subject,
    plan.action,
    plan.scene,
    plan.style,
    plan.mood,
    plan.timeOfDay,
    plan.lighting,
    plan.color,
  ]);
  if (core.length > 0) {
    sections.push(core.join('，'));
  }

  const framing = dedupeStrings([
    plan.shotType,
    plan.camera,
    plan.lens,
    plan.motion,
    plan.pacing,
  ]);
  if (framing.length > 0) {
    sections.push(`镜头与节奏：${framing.join('，')}`);
  }

  const environment = dedupeStrings([
    plan.background,
    plan.props,
    plan.wardrobe,
    plan.composition,
  ]);
  if (environment.length > 0) {
    sections.push(`环境与构图：${environment.join('，')}`);
  }

  const audio = dedupeStrings([
    plan.dialogue ? `人物对白：${plan.dialogue}` : null,
    plan.audio,
    plan.music,
    plan.soundEffects,
  ]);
  if (audio.length > 0) {
    sections.push(`声音：${audio.join('，')}`);
  }

  const continuity = dedupeStrings(plan.continuity || []);
  if (continuity.length > 0) {
    sections.push(`连续性要求：${continuity.join('，')}`);
  }

  const keep = dedupeStrings(plan.mustKeep || []);
  if (keep.length > 0) {
    sections.push(`必须保留：${keep.join('，')}`);
  }

  const avoid = dedupeStrings(plan.mustAvoid || []);
  if (avoid.length > 0) {
    sections.push(`避免：${avoid.join('，')}`);
  }

  const referenceMap = Array.isArray(plan.referenceMap)
    ? plan.referenceMap
        .map((item, index) => {
          if (typeof item === 'string' && item.trim()) {
            return `[图${index + 1}]${item.trim()}`;
          }
          return null;
        })
        .filter(Boolean)
    : [];
  if (referenceMap.length > 0) {
    sections.push(`参考绑定：${referenceMap.join('；')}`);
  }

  if (typeof fallbackPrompt === 'string' && fallbackPrompt.trim()) {
    sections.unshift(fallbackPrompt.trim());
  }

  const prompt = sections.join('。').trim();
  return prompt || null;
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

function readHostedRequiredInput(input, field) {
  if (field === 'motionVideo') {
    return input.motionVideo || input.motion_video || input.video || null;
  }
  if (field === 'characterOrientation') {
    return input.characterOrientation || input.character_orientation || null;
  }
  return input?.[field] || null;
}

function normalizeArkContent(input) {
  if (Array.isArray(input.content) && input.content.length > 0) {
    return input.content.map(normalizeContentItem);
  }

  const content = [];
  const prompt = buildSeedancePromptFromPlan(
    input.promptPlan,
    input.prompt || input.text || null,
  );
  if (prompt) {
    content.push({ type: 'text', text: prompt });
  }

  const images = Array.isArray(input.images) ? input.images : [];
  for (const image of images) {
    content.push(
      normalizeContentItem({
        type: 'image_url',
        image_url: { url: image.url || image.image || image },
        role: image.role,
      }),
    );
  }

  const videos = Array.isArray(input.videos) ? input.videos : [];
  for (const video of videos) {
    content.push(
      normalizeContentItem({
        type: 'video_url',
        video_url: { url: video.url || video.video || video },
        role: video.role || 'reference_video',
      }),
    );
  }

  const audios = Array.isArray(input.audios) ? input.audios : [];
  for (const audio of audios) {
    content.push(
      normalizeContentItem({
        type: 'audio_url',
        audio_url: { url: audio.url || audio.audio || audio },
        role: audio.role || 'reference_audio',
      }),
    );
  }

  if (input.draftTaskId) {
    content.push(
      normalizeContentItem({
        type: 'draft_task',
        draft_task: { id: input.draftTaskId },
      }),
    );
  }

  if (content.length === 0) {
    throw new Error(
      'Ark Seedance requests require request.content or shorthand text/images/videos/audios/draftTaskId.',
    );
  }

  return content;
}

export function normalizeRenderInput(input) {
  if (!input?.jobId) {
    throw new Error('request.jobId is required.');
  }
  if (!input?.localOutputDir) {
    throw new Error('request.localOutputDir is required.');
  }

  const provider = input.provider || DEFAULT_PROVIDER;
  const model = input.model || DEFAULT_MODEL;
  const hostedModelConfig =
    provider === 'hosted-media' ? getHostedVideoModelConfig(model) : null;
  const prompt = buildSeedancePromptFromPlan(
    input.promptPlan,
    input.prompt || input.text || null,
  );

  if (provider === 'hosted-media') {
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
    ratio: input.ratio || input.aspect_ratio || input.aspectRatio || null,
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
    upstreamRefs: {
      image: input.upstreamRefs?.image || null,
      audio: input.upstreamRefs?.audio || null,
    },
  };

  if (provider === 'ark') {
    normalized.content = normalizeArkContent(input);
    normalized.prompt =
      normalized.content.find((item) => item.type === 'text')?.text || null;
  } else {
    normalized.content = [];
  }

  return normalized;
}

export function createRenderManifestBase(normalized, paths) {
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
    requestPath: paths.requestPath,
    responsePath: paths.responsePath,
    createdAt: nowIso(),
    sourceBasis: normalized.sourceBasis,
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

export async function toProviderPayload(normalized, { paths } = {}) {
  if (normalized.provider === 'ark') {
    const payload = {
      model: normalized.model,
      content: normalized.content,
    };

    if (normalized.callbackUrl) {
      payload.callback_url = normalized.callbackUrl;
    }
    if (typeof normalized.returnLastFrame === 'boolean') {
      payload.return_last_frame = normalized.returnLastFrame;
    }
    if (normalized.serviceTier) {
      payload.service_tier = normalized.serviceTier;
    }
    if (Number.isInteger(normalized.executionExpiresAfter)) {
      payload.execution_expires_after = normalized.executionExpiresAfter;
    }
    if (typeof normalized.generateAudio === 'boolean') {
      payload.generate_audio = normalized.generateAudio;
    }
    if (typeof normalized.draft === 'boolean') {
      payload.draft = normalized.draft;
    }
    if (Array.isArray(normalized.tools) && normalized.tools.length > 0) {
      payload.tools = normalized.tools;
    }
    if (normalized.safetyIdentifier) {
      payload.safety_identifier = normalized.safetyIdentifier;
    }
    if (normalized.resolution) {
      payload.resolution = normalized.resolution;
    }
    if (normalized.ratio) {
      payload.ratio = normalized.ratio;
    }
    if (Number.isInteger(normalized.frames)) {
      payload.frames = normalized.frames;
    } else if (Number.isInteger(normalized.duration)) {
      payload.duration = normalized.duration;
    }
    if (Number.isInteger(normalized.seed)) {
      payload.seed = normalized.seed;
    }
    if (typeof normalized.cameraFixed === 'boolean') {
      payload.camera_fixed = normalized.cameraFixed;
    }
    if (typeof normalized.watermark === 'boolean') {
      payload.watermark = normalized.watermark;
    }

    return payload;
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

  if (hostedModelConfig.modelGroup === 'kling-motion-control') {
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
  if (manifest.provider === 'ark') {
    if (
      result?.status !== 'succeeded' ||
      typeof result?.content !== 'object' ||
      !result.content
    ) {
      return manifest;
    }

    ensureDir(paths.rendersDir);
    if (
      typeof result.content.video_url === 'string' &&
      result.content.video_url
    ) {
      const localPath = path.join(paths.rendersDir, 'render-001.mp4');
      await downloadFile(result.content.video_url, localPath);
      manifest.assets.push({
        assetId: `${manifest.jobId}-video-001`,
        localPath,
        remoteUrl: result.content.video_url,
        mimeType: 'video/mp4',
        createdAt: nowIso(),
      });
    }

    if (
      typeof result.content.last_frame_url === 'string' &&
      result.content.last_frame_url
    ) {
      const localPath = path.join(paths.rendersDir, 'last-frame-001.png');
      await downloadFile(result.content.last_frame_url, localPath);
      manifest.assets.push({
        assetId: `${manifest.jobId}-last-frame-001`,
        localPath,
        remoteUrl: result.content.last_frame_url,
        mimeType: 'image/png',
        createdAt: nowIso(),
      });
    }

    return manifest;
  }

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
  if (request.provider === 'ark') {
    return {
      baseUrl: ARK_API_BASE,
      submitUrl: `${ARK_API_BASE}/contents/generations/tasks`,
    };
  }

  return {
    baseUrl: 'hosted-media',
    submitUrl: getHostedVideoModelConfig(request.model).endpointKey,
  };
}
