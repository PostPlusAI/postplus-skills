#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  buildAssetPaths,
  createImageManifestBase,
  downloadFile,
  ensureDir,
  fetchJson,
  finalizeImageRun,
  getHostedImageModelConfig,
  inferSeedreamSize,
  normalizeGenerationInput,
  parseArgs,
  readJson,
  sha256,
  toAssetRelative,
  unwrapProviderResult,
  writeJson
} from "./_shared.mjs";

function usage() {
  console.error("Usage: node generate_image.mjs --request <request.json>");
}

function buildProviderBody(request) {
  const modelConfig = getHostedImageModelConfig(request.model, "text-to-image");
  if (modelConfig.modelGroup === "seedream") {
    const body = {
      prompt: request.prompt,
      size: inferSeedreamSize(request),
      output_format: request.outputFormat,
      enable_sync_mode: request.enableSyncMode,
      enable_base64_output: request.enableBase64Output
    };
    if (Number.isInteger(request.maxImages)) {
      body.max_images = request.maxImages;
    }
    return {
      endpointKey: modelConfig.endpointKey,
      body
    };
  }

  return {
    endpointKey: modelConfig.endpointKey,
    body: {
      prompt: request.prompt,
      aspect_ratio: request.aspectRatio,
      resolution: request.resolution,
      enable_web_search: request.enableWebSearch,
      output_format: request.outputFormat,
      enable_sync_mode: request.enableSyncMode,
      enable_base64_output: request.enableBase64Output
    }
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.request) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const input = readJson(args.request);
  const request = normalizeGenerationInput(input, "text-to-image");
  const paths = buildAssetPaths(request.localAssetDir, request.runId, "image");
  writeJson(paths.requestPath, request);

  const providerRequest = buildProviderBody(request);
  const { data } = await fetchJson(providerRequest.endpointKey, {
    method: "POST",
    body: JSON.stringify(providerRequest.body)
  });

  writeJson(paths.responsePath, data);

  const manifest = createImageManifestBase(request, paths);
  const result = unwrapProviderResult(data);
  manifest.generationHandle = result?.id || null;
  manifest.providerStatus = result?.status || null;
  manifest.providerUrls = result?.urls || null;
  manifest.mediaType = "image";
  const outputs = Array.isArray(result?.outputs) ? result.outputs : [];

  for (let index = 0; index < outputs.length; index += 1) {
    const output = outputs[index];
    const fileExt = request.outputFormat === "jpeg" ? "jpeg" : "png";
    const imageId = `img-${String(index + 1).padStart(3, "0")}`;
    const localPath = path.join(paths.candidatesDir, `${imageId}.${fileExt}`);

    if (typeof output === "string" && /^https?:\/\//.test(output)) {
      await downloadFile(output, localPath);
      manifest.assets.push({
        assetId: imageId,
        localPath,
        assetRelativePath: toAssetRelative(paths.absoluteAssetDir, localPath),
        remoteUrl: output,
        mimeType: `image/${fileExt}`,
        promptHash: `sha256:${sha256(request.prompt)}`,
        sourceBasis: request.sourceBasis
      });
      continue;
    }

    if (typeof output === "string" && request.enableBase64Output) {
      const bytes = Buffer.from(output, "base64");
      ensureDir(path.dirname(localPath));
      fs.writeFileSync(localPath, bytes);
      manifest.assets.push({
        assetId: imageId,
        localPath,
        assetRelativePath: toAssetRelative(paths.absoluteAssetDir, localPath),
        remoteUrl: null,
        mimeType: `image/${fileExt}`,
        promptHash: `sha256:${sha256(request.prompt)}`,
        sourceBasis: request.sourceBasis
      });
    }
  }

  finalizeImageRun(request, paths, manifest);
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
