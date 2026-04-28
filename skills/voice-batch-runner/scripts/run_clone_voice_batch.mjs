#!/usr/bin/env node

import path from "node:path";
import {
  WAVESPEED_API_BASE,
  buildRequestPaths,
  createReviewStub,
  downloadFile,
  fetchJson,
  inferAudioExtension,
  nowIso,
  parseArgs,
  readJson,
  sleep,
  unwrapProviderResult,
  uploadLocalMedia,
  writeJson
} from "./_shared.mjs";

const DEFAULT_MODEL = "wavespeed-ai/qwen3-tts/voice-clone";
const DEFAULT_SUBMIT_INTERVAL_MS = 1000;
const DEFAULT_INITIAL_POLL_DELAY_MS = 15000;
const DEFAULT_POLL_INTERVAL_MS = 5000;
const DEFAULT_MAX_POLL_ROUNDS = 60;

function usage() {
  console.error(
    "Usage: node run_clone_voice_batch.mjs --batch <batch-manifest.json> [--submit-interval-ms 1000] [--initial-poll-delay-ms 15000] [--poll-interval-ms 5000] [--max-poll-rounds 60]"
  );
}

function toInt(value, fallback) {
  if (value === undefined || value === null) return fallback;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeRequest(input) {
  if (!input?.jobId) throw new Error("request.jobId is required.");
  if (!input?.text) throw new Error("request.text is required.");
  if (!input?.localOutputDir) throw new Error("request.localOutputDir is required.");
  if (!input?.referenceAudioUrl && !input?.referenceAudioPath) {
    throw new Error("request.referenceAudioUrl or request.referenceAudioPath is required.");
  }
  return {
    jobId: input.jobId,
    campaignId: input.campaignId || null,
    personaId: input.personaId || null,
    voiceProfileId: input.voiceProfileId || null,
    voiceIdentityId: input.voiceIdentityId || null,
    provider: input.provider || "wavespeed",
    model: input.model || DEFAULT_MODEL,
    mode: input.mode || "voice_clone_take",
    text: input.text,
    referenceAudioUrl: input.referenceAudioUrl || null,
    referenceAudioPath: input.referenceAudioPath || null,
    referenceText: input.referenceText || null,
    language: input.language || "auto",
    scriptSourcePath: input.scriptSourcePath || null,
    localOutputDir: input.localOutputDir,
    sourceBasis: Array.isArray(input.sourceBasis) ? input.sourceBasis : []
  };
}

function buildProviderBody(request, referenceAudioUrl) {
  const payload = {
    audio: referenceAudioUrl,
    text: request.text,
    language: request.language
  };
  if (request.referenceText) {
    payload.reference_text = request.referenceText;
  }
  return payload;
}

function buildManifest(request, paths, responsePayload, extras = {}) {
  const result = unwrapProviderResult(responsePayload);
  const outputs = Array.isArray(result?.outputs) ? result.outputs : [];
  return {
    jobId: request.jobId,
    campaignId: request.campaignId,
    personaId: request.personaId,
    voiceProfileId: request.voiceProfileId,
    voiceIdentityId: request.voiceIdentityId,
    provider: request.provider,
    model: request.model,
    mode: request.mode,
    requestPath: paths.requestPath,
    responsePath: paths.responsePath,
    manifestPath: paths.manifestPath,
    audioPath: extras.audioPath || null,
    outputUrls: outputs,
    providerPredictionId: result?.id || null,
    providerStatus: result?.status || null,
    providerUrls: result?.urls || null,
    referenceAudioUrl: extras.referenceAudioUrl || request.referenceAudioUrl || null,
    uploadRecord: extras.uploadRecord || null,
    createdAt: extras.createdAt || nowIso(),
    updatedAt: nowIso(),
    sourceBasis: request.sourceBasis,
    reviewStatus: extras.reviewStatus || "pending_review",
    error: extras.error || null
  };
}

function getResultUrl(responsePayload) {
  const result = unwrapProviderResult(responsePayload);
  if (typeof result?.urls?.get === "string" && result.urls.get.length > 0) {
    return result.urls.get;
  }
  if (typeof result?.id === "string" && result.id.length > 0) {
    return `${WAVESPEED_API_BASE}/predictions/${result.id}/result`;
  }
  return null;
}

async function maybeDownloadFirstOutput(responsePayload, paths) {
  const result = unwrapProviderResult(responsePayload);
  const outputs = Array.isArray(result?.outputs) ? result.outputs : [];
  const firstOutput = outputs[0] || null;
  if (!firstOutput) return null;
  const ext = inferAudioExtension(firstOutput, "wav");
  const audioPath = path.join(paths.audioDir, `take-001.${ext}`);
  await downloadFile(firstOutput, audioPath);
  return audioPath;
}

async function submitOne(requestPath, uploadCache) {
  const request = normalizeRequest(readJson(requestPath));
  const paths = buildRequestPaths(request.localOutputDir);
  writeJson(paths.requestPath, request);

  let uploadRecord = null;
  let referenceAudioUrl = request.referenceAudioUrl;
  if (!referenceAudioUrl && request.referenceAudioPath) {
    const cacheKey = path.resolve(request.referenceAudioPath);
    if (uploadCache.has(cacheKey)) {
      uploadRecord = uploadCache.get(cacheKey);
      referenceAudioUrl = uploadRecord.uploadedUrl;
    } else {
      const uploaded = await uploadLocalMedia(request.referenceAudioPath);
      uploadRecord = {
        uploadedUrl: uploaded.uploadedUrl,
        raw: uploaded.raw,
        sourceLocalFilePath: cacheKey
      };
      uploadCache.set(cacheKey, uploadRecord);
      referenceAudioUrl = uploadRecord.uploadedUrl;
    }
  }

  const endpoint = `${WAVESPEED_API_BASE}/wavespeed-ai/qwen3-tts/voice-clone`;
  const { data: submitData } = await fetchJson(endpoint, {
    method: "POST",
    body: JSON.stringify(buildProviderBody(request, referenceAudioUrl))
  });

  writeJson(paths.responsePath, submitData);

  let audioPath = null;
  const result = unwrapProviderResult(submitData);
  if (result?.status === "completed") {
    audioPath = await maybeDownloadFirstOutput(submitData, paths);
  }

  const manifest = buildManifest(request, paths, submitData, {
    audioPath,
    referenceAudioUrl,
    uploadRecord,
    createdAt: nowIso()
  });
  writeJson(paths.manifestPath, manifest);
  writeJson(paths.reviewPath, createReviewStub());

  return {
    request,
    paths,
    manifest,
    pending: manifest.providerStatus !== "completed" && manifest.providerStatus !== "failed"
  };
}

async function pollOne(item) {
  const request = normalizeRequest(readJson(item.requestPath));
  const paths = buildRequestPaths(request.localOutputDir);
  const priorResponse = readJson(paths.responsePath);
  const resultUrl = getResultUrl(priorResponse);

  if (!resultUrl) {
    const manifest = buildManifest(request, paths, priorResponse, {
      audioPath: item.manifest?.audioPath || null,
      referenceAudioUrl: item.manifest?.referenceAudioUrl || request.referenceAudioUrl || null,
      uploadRecord: item.manifest?.uploadRecord || null,
      createdAt: item.manifest?.createdAt || nowIso(),
      error: "Missing result URL for polling."
    });
    writeJson(paths.manifestPath, manifest);
    return { ...item, manifest, pending: false };
  }

  try {
    const { data } = await fetchJson(resultUrl);

    writeJson(paths.responsePath, data);

    let audioPath = item.manifest?.audioPath || null;
    const result = unwrapProviderResult(data);
    if (result?.status === "completed" && !audioPath) {
      audioPath = await maybeDownloadFirstOutput(data, paths);
    }

    const manifest = buildManifest(request, paths, data, {
      audioPath,
      referenceAudioUrl: item.manifest?.referenceAudioUrl || request.referenceAudioUrl || null,
      uploadRecord: item.manifest?.uploadRecord || null,
      createdAt: item.manifest?.createdAt || nowIso()
    });
    writeJson(paths.manifestPath, manifest);

    return {
      requestPath: item.requestPath,
      manifest,
      pending: manifest.providerStatus !== "completed" && manifest.providerStatus !== "failed"
    };
  } catch (error) {
    const manifest = {
      ...(item.manifest || {}),
      updatedAt: nowIso(),
      error: error instanceof Error ? error.message : String(error)
    };
    writeJson(paths.manifestPath, manifest);
    return {
      requestPath: item.requestPath,
      manifest,
      pending: true
    };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.batch) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const submitIntervalMs = toInt(args["submit-interval-ms"], DEFAULT_SUBMIT_INTERVAL_MS);
  const initialPollDelayMs = toInt(args["initial-poll-delay-ms"], DEFAULT_INITIAL_POLL_DELAY_MS);
  const pollIntervalMs = toInt(args["poll-interval-ms"], DEFAULT_POLL_INTERVAL_MS);
  const maxPollRounds = toInt(args["max-poll-rounds"], DEFAULT_MAX_POLL_ROUNDS);

  const batch = readJson(args.batch);
  const items = Array.isArray(batch?.items) ? batch.items : [];
  if (items.length === 0) {
    throw new Error("batch.items is empty.");
  }

  const uploadCache = new Map();
  const submitted = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (!item?.requestPath) {
      throw new Error(`batch.items[${index}].requestPath is required.`);
    }
    const submittedItem = await submitOne(item.requestPath, uploadCache);
    submitted.push({
      requestPath: item.requestPath,
      manifest: submittedItem.manifest
    });
    console.log(`[submit ${index + 1}/${items.length}] ${submittedItem.manifest.jobId} -> ${submittedItem.manifest.providerStatus}`);
    if (index < items.length - 1 && submitIntervalMs > 0) {
      await sleep(submitIntervalMs);
    }
  }

  let pending = submitted.filter((item) => {
    const status = item.manifest?.providerStatus;
    return status !== "completed" && status !== "failed";
  });

  if (pending.length === 0) {
    console.log(JSON.stringify({ submitted: items.length, completed: items.length, failed: 0, pending: 0 }, null, 2));
    return;
  }

  if (initialPollDelayMs > 0) {
    await sleep(initialPollDelayMs);
  }

  for (let round = 0; round < maxPollRounds && pending.length > 0; round += 1) {
    const nextPending = [];
    for (const item of pending) {
      const polled = await pollOne(item);
      const status = polled.manifest?.providerStatus || "unknown";
      console.log(`[poll ${round + 1}] ${polled.manifest?.jobId || item.requestPath} -> ${status}`);
      if (polled.pending) {
        nextPending.push(polled);
      }
    }
    pending = nextPending;
    if (pending.length > 0 && round < maxPollRounds - 1 && pollIntervalMs > 0) {
      await sleep(pollIntervalMs);
    }
  }

  const finalItems = items.map((item) => {
    const request = normalizeRequest(readJson(item.requestPath));
    const paths = buildRequestPaths(request.localOutputDir);
    const manifest = readJson(paths.manifestPath);
    return manifest;
  });

  const summary = {
    batchId: batch.batchId || null,
    submitted: finalItems.length,
    completed: finalItems.filter((item) => item.providerStatus === "completed").length,
    failed: finalItems.filter((item) => item.providerStatus === "failed").length,
    pending: finalItems.filter((item) => item.providerStatus !== "completed" && item.providerStatus !== "failed").length
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
