#!/usr/bin/env node

import path from "node:path";
import {
  buildRequestPaths,
  createReviewStub,
  DEFAULT_LANGUAGE,
  DEFAULT_PROVIDER,
  downloadFile,
  fetchJson,
  inferAudioExtension,
  nowIso,
  parseArgs,
  pollPredictionResult,
  readJson,
  unwrapProviderResult,
  uploadLocalMedia,
  writeJson
} from "./_shared.mjs";

const DEFAULT_MODEL = "voice-qwen3-clone";

function usage() {
  console.error("Usage: node clone_voice_take.mjs --request <request.json>");
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
    provider: input.provider || DEFAULT_PROVIDER,
    model: input.model || DEFAULT_MODEL,
    mode: input.mode || "voice_clone_take",
    text: input.text,
    referenceAudioUrl: input.referenceAudioUrl || null,
    referenceAudioPath: input.referenceAudioPath || null,
    referenceText: input.referenceText || null,
    language: input.language || DEFAULT_LANGUAGE,
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.request) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const request = normalizeRequest(readJson(args.request));
  const paths = buildRequestPaths(request.localOutputDir);
  writeJson(paths.requestPath, request);

  let uploadRecord = null;
  let referenceAudioUrl = request.referenceAudioUrl;
  if (!referenceAudioUrl && request.referenceAudioPath) {
    const uploaded = await uploadLocalMedia(request.referenceAudioPath);
    uploadRecord = {
      uploadedUrl: uploaded.uploadedUrl,
      raw: uploaded.raw,
      sourceLocalFilePath: path.resolve(request.referenceAudioPath)
    };
    referenceAudioUrl = uploaded.uploadedUrl;
  }

  const endpoint = "voice-qwen3-clone";
  const { data: submitData } = await fetchJson(endpoint, {
    method: "POST",
    body: JSON.stringify(buildProviderBody(request, referenceAudioUrl))
  });

  let finalData = submitData;
  let result = unwrapProviderResult(finalData);
  const getUrl = result?.urls?.get || result?.id || null;
  if (result?.status && result.status !== "completed" && getUrl) {
    finalData = await pollPredictionResult(getUrl);
    result = unwrapProviderResult(finalData);
  }

  writeJson(paths.responsePath, finalData);

  const outputs = Array.isArray(result?.outputs) ? result.outputs : [];
  const firstOutput = outputs[0] || null;
  const ext = firstOutput ? inferAudioExtension(firstOutput, "wav") : "wav";
  const audioPath = path.join(paths.audioDir, `take-001.${ext}`);
  if (firstOutput) {
    await downloadFile(firstOutput, audioPath);
  }

  const manifest = {
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
    audioPath: firstOutput ? audioPath : null,
    outputUrls: outputs,
    generationHandle: result?.id || null,
    providerStatus: result?.status || null,
    providerUrls: result?.urls || null,
    referenceAudioUrl,
    uploadRecord,
    createdAt: nowIso(),
    sourceBasis: request.sourceBasis,
    reviewStatus: "pending_review"
  };

  writeJson(paths.manifestPath, manifest);
  writeJson(paths.reviewPath, createReviewStub());
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
