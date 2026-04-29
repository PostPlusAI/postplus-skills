#!/usr/bin/env node

import {
  buildRequestPaths,
  createRenderManifestBase,
  fetchJson,
  getProviderApiConfig,
  maybeDownloadOutputs,
  normalizeRenderInput,
  parseArgs,
  readJson,
  toProviderPayload,
  unwrapProviderResult,
  writeJson
} from "./_shared.mjs";

function usage() {
  console.error("Usage: node generate_video_from_image_audio.mjs --request <request.json>");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.request) {
    usage();
    process.exitCode = 1;
    return;
  }

  const input = readJson(args.request);
  const request = normalizeRenderInput(input);
  const paths = buildRequestPaths(request.localOutputDir);
  const providerConfig = getProviderApiConfig(request);

  writeJson(paths.requestPath, request);

  const { data: rawResult } = await fetchJson(providerConfig.submitUrl, {
    method: "POST",
    body: JSON.stringify(await toProviderPayload(request, { paths }))
  });

  writeJson(paths.responsePath, rawResult);

  const result = unwrapProviderResult(rawResult);

  const manifest = createRenderManifestBase(request, paths);
  manifest.generationHandle = request.provider === "hosted-media" ? result?.id || null : null;
  manifest.providerTaskId = request.provider === "ark" ? result?.id || null : null;
  manifest.providerStatus = result?.status || null;
  manifest.providerUrls = result?.urls || null;
  manifest.hasNsfwContents = Array.isArray(result?.has_nsfw_contents) ? result.has_nsfw_contents : [];
  manifest.returnLastFrame = request.returnLastFrame;
  manifest.generateAudio = request.generateAudio;
  manifest.serviceTier = request.serviceTier;
  manifest.watermark = request.watermark;
  manifest.content = request.provider === "ark" ? request.content : undefined;

  await maybeDownloadOutputs(result, manifest, paths);

  writeJson(paths.manifestPath, manifest);
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
