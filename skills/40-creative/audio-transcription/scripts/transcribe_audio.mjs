#!/usr/bin/env node

import fs from "node:fs";

import {
  buildRequestPaths,
  createManifestBase,
  downloadProviderOutputs,
  extractTranscriptData,
  fetchJson,
  normalizeTranscriptionInput,
  parseArgs,
  pollPredictionResult,
  readJson,
  toProviderPayload,
  unwrapProviderResult,
  writeJson
} from "./_shared.mjs";

function usage() {
  console.error("Usage: node transcribe_audio.mjs --request <request.json>");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.request) {
    usage();
    process.exitCode = 1;
    return;
  }

  const request = normalizeTranscriptionInput(readJson(args.request), "audio");
  const paths = buildRequestPaths(request.localOutputDir);

  writeJson(paths.requestPath, request);

  const { data: rawResult } = await fetchJson(request.model, {
    method: "POST",
    body: JSON.stringify(await toProviderPayload(request, { paths }))
  });

  writeJson(paths.responsePath, rawResult);

  let result = unwrapProviderResult(rawResult);
  if (result?.status === "created" && result?.urls?.get) {
    const polledRawResult = await pollPredictionResult(result.urls.get);
    writeJson(paths.responsePath, polledRawResult);
    result = unwrapProviderResult(polledRawResult);
  }
  const manifest = createManifestBase(request, paths);
  manifest.generationHandle = result?.id || null;
  manifest.providerStatus = result?.status || null;
  manifest.providerUrls = result?.urls || null;
  manifest.mediaUploadRequestPath = fs.existsSync(paths.mediaUploadRequestPath) ? paths.mediaUploadRequestPath : null;
  manifest.mediaUploadResponsePath = fs.existsSync(paths.mediaUploadResponsePath) ? paths.mediaUploadResponsePath : null;

  const transcriptData = extractTranscriptData(result);
  manifest.transcriptText = transcriptData.transcriptText;
  manifest.segmentCount = transcriptData.segments.length;
  manifest.wordCount = transcriptData.words.length;

  if (result?.status === "completed") {
    manifest.downloadedArtifacts = await downloadProviderOutputs(result, paths);
  }

  writeJson(paths.manifestPath, manifest);
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
