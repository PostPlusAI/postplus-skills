#!/usr/bin/env node

import {
  buildRequestPaths,
  buildNormalizedTranscript,
  createManifestBase,
  downloadProviderOutputs,
  extractTranscriptData,
  normalizeTranscriptionInput,
  parseArgs,
  pollPredictionResult,
  readJson,
  unwrapProviderResult,
  writeJson
} from "./_shared.mjs";

function usage() {
  console.error("Usage: node poll_transcription.mjs --request <request.json> [--result-url <url>]");
}

function inferGetUrl(resultUrl, request, rawResponse) {
  if (resultUrl) {
    return resultUrl;
  }
  const responsePayload = rawResponse?.data || rawResponse || {};
  return responsePayload?.urls?.get || responsePayload?.id || null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.request) {
    usage();
    process.exitCode = 1;
    return;
  }

  const input = readJson(args.request);
  const request = normalizeTranscriptionInput(input, input.video ? "video" : "audio");
  const paths = buildRequestPaths(request.localOutputDir);
  const rawResponse = readJson(paths.responsePath);
  const getUrl = inferGetUrl(args["result-url"], request, rawResponse);

  if (!getUrl) {
    throw new Error("Could not infer result URL from response.json. Pass --result-url explicitly.");
  }

  const rawResult = await pollPredictionResult(getUrl);
  writeJson(paths.responsePath, rawResult);

  const result = unwrapProviderResult(rawResult);
  const manifest = createManifestBase(request, paths);
  manifest.generationHandle = result?.id || null;
  manifest.providerStatus = result?.status || null;
  manifest.providerUrls = result?.urls || null;
  manifest.downloadedArtifacts = await downloadProviderOutputs(result, paths);

  const transcriptData = extractTranscriptData(result);
  manifest.transcriptText = transcriptData.transcriptText;
  manifest.segmentCount = transcriptData.segments.length;
  manifest.wordCount = transcriptData.words.length;
  manifest.normalizedTranscriptPath = paths.normalizedTranscriptPath;

  writeJson(paths.manifestPath, manifest);
  writeJson(
    paths.normalizedTranscriptPath,
    buildNormalizedTranscript({ request, manifest, paths, transcriptData })
  );
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
