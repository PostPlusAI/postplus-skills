#!/usr/bin/env node

import {
  ARK_API_BASE,
  buildRequestPaths,
  createRenderManifestBase,
  fetchJson,
  maybeDownloadOutputs,
  parseArgs,
  readJson,
  unwrapProviderResult,
  writeJson
} from "./_shared.mjs";

function usage() {
  console.error("Usage: node poll_prediction.mjs --request <request.json> [--response <response.json>]");
}

function inferResultUrl(request, responsePayload) {
  const payload = unwrapProviderResult(responsePayload);
  if (request?.provider === "ark") {
    const taskId = payload?.id || responsePayload?.id;
    if (taskId) {
      return `${ARK_API_BASE}/contents/generations/tasks/${taskId}`;
    }
  }
  if (typeof payload?.urls?.get === "string" && payload.urls.get.length > 0) {
    return payload.urls.get;
  }
  if (payload?.id && request?.provider === "hosted-media") {
    return payload.id;
  }
  throw new Error("Could not infer result URL from request/response.");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.request && !args.response) {
    usage();
    process.exitCode = 1;
    return;
  }

  const request = args.request ? readJson(args.request) : null;
  const priorResponse = args.response
    ? readJson(args.response)
    : request
      ? readJson(buildRequestPaths(request.localOutputDir).responsePath)
      : null;

  if (!request) {
    throw new Error("--request is required when manifest refresh depends on local output paths.");
  }

  const paths = buildRequestPaths(request.localOutputDir);
  const resultUrl = args["result-url"] || inferResultUrl(request, priorResponse);

  const { data: rawResult } = await fetchJson(resultUrl);

  writeJson(paths.responsePath, rawResult);

  const result = unwrapProviderResult(rawResult);

  const manifest = createRenderManifestBase(request, paths);
  manifest.generationHandle =
    request.provider === "hosted-media" ? result?.id || priorResponse?.id || null : null;
  manifest.providerTaskId =
    request.provider === "ark" ? result?.id || priorResponse?.id || null : null;
  manifest.providerStatus = result?.status || null;
  manifest.providerUrls = result?.urls || priorResponse?.urls || null;
  manifest.hasNsfwContents = Array.isArray(result?.has_nsfw_contents) ? result.has_nsfw_contents : [];
  manifest.returnLastFrame = request.returnLastFrame;
  manifest.generateAudio = request.generateAudio;
  manifest.serviceTier = result?.service_tier || request.serviceTier || null;
  manifest.watermark = request.watermark;
  manifest.content = request.provider === "ark" ? result?.content || null : undefined;
  manifest.usage = result?.usage || null;
  manifest.error = result?.error || null;

  await maybeDownloadOutputs(result, manifest, paths);

  writeJson(paths.manifestPath, manifest);
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
