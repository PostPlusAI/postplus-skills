#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import {
  requestHostedMediaGenerationJson,
  uploadHostedMediaFile,
} from '../../../00-core/shared-runtime/scripts/lib/hosted_media_generation_bridge.mjs';

export const DEFAULT_PROVIDER = 'hosted-media';
export const DEFAULT_AUDIO_MODEL = 'transcription-whisper';
export const DEFAULT_VIDEO_MODEL = 'transcription-whisper-with-video';
export const DEFAULT_LANGUAGE = 'auto';
export const DEFAULT_TASK = 'transcribe';
export const DEFAULT_POLL_MAX_ATTEMPTS = 150;
export const DEFAULT_POLL_INTERVAL_MS = 2000;
export const TRANSCRIPTION_POLL_WINDOW_SECONDS = Math.floor(
  (DEFAULT_POLL_MAX_ATTEMPTS * DEFAULT_POLL_INTERVAL_MS) / 1000,
);

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

export async function fetchJson(url, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const requestBody =
    typeof options.body === 'string' && options.body.trim().length > 0
      ? JSON.parse(options.body)
      : (options.body ?? undefined);
  const providerBody =
    requestBody && typeof requestBody === 'object'
      ? { ...requestBody }
      : requestBody;
  const mediaSeconds = Number(requestBody?.duration_seconds);
  const requestDimensions =
    method !== 'POST' ||
	    ![
	      'transcription-whisper',
	      'transcription-whisper-turbo',
	      'transcription-whisper-with-video',
	    ].includes(url)
      ? undefined
      : Number.isFinite(mediaSeconds) && mediaSeconds > 0
        ? {
            billableUnitCount: 1,
            mediaSeconds: Math.ceil(mediaSeconds),
	            operationKey:
	              requestBody?.enable_timestamps === true
	                ? `${url}:timestamps`
	                : url,
            requestBytes: Buffer.byteLength(JSON.stringify(providerBody)),
          }
        : (() => {
            throw new Error(
              'request.durationSeconds is required for hosted transcription billing.',
            );
          })();

  const result = await requestHostedMediaGenerationJson(url, {
    method,
    body:
      providerBody && typeof providerBody === 'object'
        ? Object.fromEntries(
            Object.entries(providerBody).filter(
              ([key]) => key !== 'duration_seconds',
            ),
          )
        : providerBody,
    requestDimensions,
  });

  return {
    data: result.data,
    response: {
      headers: {},
      status: 200,
    },
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
  {
    maxAttempts = DEFAULT_POLL_MAX_ATTEMPTS,
    intervalMs = DEFAULT_POLL_INTERVAL_MS,
  } = {},
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

export function buildTranscriptionPollingPreflight(request) {
  const durationSeconds = Number(request.durationSeconds);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error('request.durationSeconds is required.');
  }

  const normalizedDurationSeconds = Math.ceil(durationSeconds);
  const mayExceedPollWindow =
    normalizedDurationSeconds >= TRANSCRIPTION_POLL_WINDOW_SECONDS;

  return {
    durationSeconds: normalizedDurationSeconds,
    mediaType: request.mediaType,
    mayExceedPollWindow,
    pollWindowSeconds: TRANSCRIPTION_POLL_WINDOW_SECONDS,
    message: mayExceedPollWindow
      ? `transcription_polling_boundary: ${request.mediaType} duration is ${normalizedDurationSeconds}s, at or above the ${TRANSCRIPTION_POLL_WINDOW_SECONDS}s polling window. Submit only if a 5-minute poll timeout is acceptable; otherwise stop and split or use a supported longer-running path.`
      : `transcription_polling_preflight: ${request.mediaType} duration is ${normalizedDurationSeconds}s; current polling window is ${TRANSCRIPTION_POLL_WINDOW_SECONDS}s.`,
  };
}

export function logTranscriptionPollingPreflight(request, { logger = console } = {}) {
  const preflight = buildTranscriptionPollingPreflight(request);
  if (preflight.mayExceedPollWindow) {
    logger.warn(preflight.message);
  } else {
    logger.log(preflight.message);
  }
  return preflight;
}

export function buildRequestPaths(localOutputDir) {
  const absoluteOutputDir = path.resolve(localOutputDir);
  return {
    absoluteOutputDir,
    requestPath: path.join(absoluteOutputDir, 'request.json'),
    responsePath: path.join(absoluteOutputDir, 'response.json'),
    manifestPath: path.join(absoluteOutputDir, 'manifest.json'),
    normalizedTranscriptPath: path.join(
      absoluteOutputDir,
      'normalized-transcript.json',
    ),
    mediaUploadRequestPath: path.join(
      absoluteOutputDir,
      'media-upload.request.json',
    ),
    mediaUploadResponsePath: path.join(
      absoluteOutputDir,
      'media-upload.response.json',
    ),
    outputsDir: path.join(absoluteOutputDir, 'outputs'),
  };
}

function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true;
    }
    if (value.toLowerCase() === 'false') {
      return false;
    }
  }
  return fallback;
}

export function normalizeTranscriptionInput(input, mediaType) {
  if (!input?.jobId) {
    throw new Error('request.jobId is required.');
  }
  if (!input?.localOutputDir) {
    throw new Error('request.localOutputDir is required.');
  }
  const durationSeconds = Number(input.durationSeconds ?? input.duration);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error('request.durationSeconds is required.');
  }

  const mediaField = mediaType === 'video' ? 'video' : 'audio';
  if (!input?.[mediaField]) {
    throw new Error(`request.${mediaField} is required.`);
  }

  return {
    provider: input.provider || DEFAULT_PROVIDER,
    model:
      input.model ||
      (mediaType === 'video' ? DEFAULT_VIDEO_MODEL : DEFAULT_AUDIO_MODEL),
    mediaType,
    jobId: input.jobId,
    audio: mediaType === 'audio' ? input.audio : null,
    video: mediaType === 'video' ? input.video : null,
    language: input.language || DEFAULT_LANGUAGE,
    task: input.task || DEFAULT_TASK,
    prompt: input.prompt || '',
    durationSeconds: Math.ceil(durationSeconds),
    enableTimestamps: toBoolean(input.enableTimestamps, false),
    enableSyncMode: toBoolean(input.enableSyncMode, false),
    localOutputDir: input.localOutputDir,
    sourceBasis: Array.isArray(input.sourceBasis) ? input.sourceBasis : [],
    upstreamRefs: input.upstreamRefs || {},
  };
}

function inferMimeTypeFromPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
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

export async function uploadHostedMedia(filePath, paths) {
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
  const uploadResult = unwrapProviderResult(data);
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

  return {
    sourceLocalFilePath: absolutePath,
    uploadedUrl,
  };
}

export async function toProviderPayload(request, { paths } = {}) {
  const payload = {
    language: request.language,
    task: request.task,
    enable_sync_mode: request.enableSyncMode,
  };
  payload.duration_seconds = request.durationSeconds;

  if (request.mediaType === 'audio') {
    payload.audio = await resolveProviderMediaInput(request.audio, { paths });
  }
  if (request.mediaType === 'video') {
    payload.video = await resolveProviderMediaInput(request.video, { paths });
  }
  if (request.enableTimestamps) {
    payload.enable_timestamps = true;
  }
  if (request.prompt) {
    payload.prompt = request.prompt;
  }

  return payload;
}

export async function resolveProviderMediaInput(value, { paths } = {}) {
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

  if (!paths) {
    throw new Error('paths are required to upload local media inputs.');
  }

  const upload = await uploadHostedMedia(candidatePath, paths);
  return upload.uploadedUrl;
}

export function createManifestBase(request, paths) {
  return {
    jobId: request.jobId,
    provider: request.provider,
    model: request.model,
    mediaType: request.mediaType,
    requestPath: paths.requestPath,
    responsePath: paths.responsePath,
    createdAt: nowIso(),
    language: request.language,
    task: request.task,
    enableTimestamps: request.enableTimestamps,
    sourceBasis: request.sourceBasis,
    upstreamRefs: request.upstreamRefs,
    downloadedArtifacts: [],
  };
}

function safeFileStem(index) {
  return `output-${String(index + 1).padStart(3, '0')}`;
}

function safeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function inferExtension(url, contentType) {
  try {
    const ext = path.extname(new URL(url).pathname);
    if (ext) {
      return ext;
    }
  } catch {
    // ignore
  }

  if (contentType?.includes('json')) {
    return '.json';
  }
  if (contentType?.startsWith('text/')) {
    return '.txt';
  }
  return '.bin';
}

function normalizeEmbeddedOutputItem(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return null;
  }

  return {
    srt: safeString(item.srt),
    text: safeString(item.text),
    textDetails: Array.isArray(item.text_details) ? item.text_details : [],
  };
}

export async function downloadProviderOutputs(result, paths) {
  if (!Array.isArray(result?.outputs) || result.outputs.length === 0) {
    return [];
  }

  ensureDir(paths.outputsDir);
  const downloadedArtifacts = [];

  for (let index = 0; index < result.outputs.length; index += 1) {
    const outputItem = result.outputs[index];
    if (
      typeof outputItem === 'object' &&
      outputItem !== null &&
      !Array.isArray(outputItem)
    ) {
      const embedded = normalizeEmbeddedOutputItem(outputItem);
      if (!embedded) {
        continue;
      }

      if (embedded.srt) {
        const localPath = path.join(
          paths.outputsDir,
          `${safeFileStem(index)}.srt`,
        );
        fs.writeFileSync(localPath, `${embedded.srt}\n`);
        downloadedArtifacts.push({
          localPath,
          contentType: 'application/x-subrip',
        });
      }

      if (embedded.text) {
        const localPath = path.join(
          paths.outputsDir,
          `${safeFileStem(index)}.txt`,
        );
        fs.writeFileSync(localPath, `${embedded.text}\n`);
        downloadedArtifacts.push({
          localPath,
          contentType: 'text/plain',
        });
      }

      if (embedded.textDetails.length > 0) {
        const localPath = path.join(
          paths.outputsDir,
          `${safeFileStem(index)}.segments.json`,
        );
        writeJson(localPath, {
          transcriptText: embedded.text || null,
          segments: embedded.textDetails
            .map((segment) => ({
              start: Number(segment.start ?? 0),
              end: Number(segment.end ?? 0),
              text: safeString(segment.text),
            }))
            .filter(
              (segment) =>
                segment.text &&
                Number.isFinite(segment.start) &&
                Number.isFinite(segment.end) &&
                segment.end > segment.start,
            ),
        });
        downloadedArtifacts.push({
          localPath,
          contentType: 'application/json',
        });
      }
      continue;
    }

    const remoteUrl = outputItem;
    const response = await fetch(remoteUrl);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Failed to download output ${remoteUrl}: ${response.status} ${text}`,
      );
    }
    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';
    const extension = inferExtension(remoteUrl, contentType);
    const localPath = path.join(
      paths.outputsDir,
      `${safeFileStem(index)}${extension}`,
    );

    if (contentType.includes('json')) {
      const payload = await response.json();
      writeJson(localPath, payload);
      downloadedArtifacts.push({
        remoteUrl,
        localPath,
        contentType,
      });
      continue;
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(localPath, bytes);
    downloadedArtifacts.push({
      remoteUrl,
      localPath,
      contentType,
    });
  }

  return downloadedArtifacts;
}

export function extractTranscriptData(result) {
  const firstOutput = Array.isArray(result?.outputs) ? result.outputs[0] : null;
  const transcriptText =
    result?.text ||
    result?.transcript ||
    result?.output_text ||
    result?.output?.text ||
    (firstOutput && typeof firstOutput === 'object'
      ? firstOutput.text || null
      : null) ||
    null;

  const segments =
    result?.segments ||
    result?.output?.segments ||
    result?.timestamps ||
    (firstOutput && typeof firstOutput === 'object'
      ? firstOutput.text_details || null
      : null) ||
    null;

  const words = result?.words || result?.output?.words || null;

  return {
    transcriptText,
    segments: Array.isArray(segments) ? segments : [],
    words: Array.isArray(words) ? words : [],
  };
}

function toFiniteNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toSafeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function roundTimestamp(value, decimals = 3) {
  return Number(Number(value).toFixed(decimals));
}

export function normalizeTranscriptSegments(rawSegments = []) {
  return rawSegments
    .map((segment, index) => {
      const start = toFiniteNumber(
        segment?.start ?? segment?.start_time ?? segment?.from,
        null,
      );
      const end = toFiniteNumber(
        segment?.end ?? segment?.end_time ?? segment?.to,
        null,
      );
      const text = toSafeText(segment?.text ?? segment?.content);

      if (!text || start === null || end === null || end <= start) {
        return null;
      }

      return {
        id: `seg-${String(index + 1).padStart(3, '0')}`,
        start: roundTimestamp(start),
        end: roundTimestamp(end),
        duration: roundTimestamp(end - start),
        text,
        words: [],
      };
    })
    .filter(Boolean);
}

export function normalizeTranscriptWords(rawWords = []) {
  return rawWords
    .map((word, index) => {
      const start = toFiniteNumber(
        word?.start ?? word?.start_time ?? word?.from,
        null,
      );
      const end = toFiniteNumber(word?.end ?? word?.end_time ?? word?.to, null);
      const text = toSafeText(word?.text ?? word?.word ?? word?.content);

      if (!text || start === null || end === null || end < start) {
        return null;
      }

      return {
        id: `word-${String(index + 1).padStart(4, '0')}`,
        start: roundTimestamp(start),
        end: roundTimestamp(end),
        duration: roundTimestamp(end - start),
        text,
      };
    })
    .filter(Boolean);
}

export function buildNormalizedTranscript({
  request,
  manifest,
  paths,
  transcriptData,
}) {
  const segments = normalizeTranscriptSegments(transcriptData?.segments || []);
  const words = normalizeTranscriptWords(transcriptData?.words || []);

  return {
    schemaVersion: 'subtitle-normalized/v1',
    jobId: request.jobId,
    source: {
      mediaType: request.mediaType,
      sourceVideoPath: request.video || null,
      sourceAudioPath: request.audio || null,
    },
    language: request.language,
    transcriptText: transcriptData?.transcriptText || '',
    segments,
    words,
    meta: {
      provider: manifest.provider,
      model: manifest.model,
      task: manifest.task,
      enableTimestamps: manifest.enableTimestamps,
      createdAt: manifest.createdAt,
      requestPath: paths.requestPath,
      responsePath: paths.responsePath,
      manifestPath: paths.manifestPath,
    },
  };
}
