#!/usr/bin/env node

import path from "node:path";

import { formatCliError } from "../_postplus_shared/00-core/shared-runtime/scripts/lib/network_runtime.mjs";
import {
  buildRequestPaths,
  createHostedMediaGenerationFailedError,
  createReviewStub,
  downloadFile,
  fetchJson,
  inferAudioExtension,
  isHostedMediaGenerationFailedResult,
  nowIso,
  parseArgs,
  readHostedMediaGenerationFailure,
  readHostedJson,
  readJson,
  unwrapProviderResult,
  writeJson
} from "./_shared.mjs";

function usage() {
  console.error("Usage: node poll_clone_voice.mjs --request <request.json> [--response <response.json>] [--result-url <url>]");
}

function inferResultUrl(responsePayload) {
  const result = unwrapProviderResult(responsePayload);
  if (typeof result?.urls?.get === "string" && result.urls.get.length > 0) {
    return result.urls.get;
  }
  if (typeof result?.id === "string" && result.id.length > 0) {
    return result.id;
  }
  throw new Error("Could not infer result URL from response.");
}

function buildManifest(request, paths, responsePayload, priorManifest = null, audioPath = null) {
  const result = unwrapProviderResult(responsePayload);
  return {
    jobId: request.jobId,
    campaignId: request.campaignId || null,
    personaId: request.personaId || null,
    voiceProfileId: request.voiceProfileId || null,
    voiceIdentityId: request.voiceIdentityId || null,
    provider: request.provider || "hosted-media",
    model: request.model || "voice-qwen3-clone",
    mode: request.mode || "voice_clone_take",
    requestPath: paths.requestPath,
    responsePath: paths.responsePath,
    manifestPath: paths.manifestPath,
    audioPath: audioPath || priorManifest?.audioPath || null,
    outputUrls: Array.isArray(result?.outputs) ? result.outputs : [],
    generationHandle: result?.id || priorManifest?.generationHandle || null,
    providerStatus: result?.status || priorManifest?.providerStatus || null,
    providerUrls: result?.urls || priorManifest?.providerUrls || null,
    referenceAudioUrl: priorManifest?.referenceAudioUrl || request.referenceAudioUrl || null,
    uploadRecord: priorManifest?.uploadRecord || null,
    createdAt: priorManifest?.createdAt || nowIso(),
    updatedAt: nowIso(),
    sourceBasis: Array.isArray(request.sourceBasis) ? request.sourceBasis : [],
    reviewStatus: priorManifest?.reviewStatus || "pending_review",
    error: readHostedMediaGenerationFailure(result)
  };
}

async function maybeDownloadFirstOutput(resultPayload, paths) {
  const result = unwrapProviderResult(resultPayload);
  const outputs = Array.isArray(result?.outputs) ? result.outputs : [];
  const firstOutput = outputs[0] || null;
  if (!firstOutput) return null;
  const ext = inferAudioExtension(firstOutput, "wav");
  const audioPath = path.join(paths.audioDir, `take-001.${ext}`);
  await downloadFile(firstOutput, audioPath);
  return audioPath;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.request) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const request = readHostedJson(args.request);
  const paths = buildRequestPaths(request.localOutputDir);
  const responsePayload =
    args.response
      ? readJson(args.response)
      : args["result-url"]
        ? null
        : readJson(paths.responsePath);
  const priorManifest = (() => {
    try {
      return readJson(paths.manifestPath);
    } catch {
      return null;
    }
  })();

  const resultUrl = args["result-url"] || inferResultUrl(responsePayload);
  const { data } = await fetchJson(resultUrl);

  writeJson(paths.responsePath, data);

  const result = unwrapProviderResult(data);
  const audioPath =
    result?.status === "completed"
      ? await maybeDownloadFirstOutput(data, paths)
      : priorManifest?.audioPath || null;

  const manifest = buildManifest(request, paths, data, priorManifest, audioPath);
  writeJson(paths.requestPath, request);
  writeJson(paths.manifestPath, manifest);
  writeJson(paths.reviewPath, createReviewStub());

  if (isHostedMediaGenerationFailedResult(result)) {
    throw createHostedMediaGenerationFailedError(result, {
      label: "Voice clone polling",
    });
  }
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(formatCliError(error));
  process.exitCode = 1;
});
