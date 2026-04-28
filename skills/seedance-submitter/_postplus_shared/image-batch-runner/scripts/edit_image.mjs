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
  getWaveSpeedImageModelConfig,
  inferSeedreamSize,
  normalizeGenerationInput,
  parseArgs,
  readJson,
  sha256,
  toAssetRelative,
  writeJson
} from "./_shared.mjs";

function usage() {
  console.error("Usage: node edit_image.mjs --request <request.json>");
}

function normalizeEditRequest(input) {
  const base = normalizeGenerationInput(input, "edit");
  const inputUrls = Array.isArray(input.inputUrls) ? input.inputUrls : [];
  const inputImages = Array.isArray(input.inputImages) ? input.inputImages : [];
  const resolvedUrls = [...inputUrls, ...inputImages].filter(Boolean);
  if (!resolvedUrls.length) {
    throw new Error("request.inputUrls is required. Run upload_media first if you only have local files.");
  }
  const nonUrl = resolvedUrls.find((entry) => typeof entry === "string" && !/^https?:\/\//.test(entry));
  if (nonUrl) {
    throw new Error(`edit_image expects uploaded image URLs. Invalid entry: ${nonUrl}`);
  }
  return {
    ...base,
    inputUrls: resolvedUrls
  };
}

function buildProviderBody(request) {
  const modelConfig = getWaveSpeedImageModelConfig(request.model, "edit");
  if (modelConfig.family === "seedream") {
    const body = {
      images: request.inputUrls,
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
      endpoint: modelConfig.endpoint,
      body
    };
  }

  return {
    endpoint: modelConfig.endpoint,
    body: {
      images: request.inputUrls,
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

function unwrapProviderResult(payload) {
  if (payload && typeof payload === "object" && payload.data && typeof payload.data === "object") {
    return payload.data;
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

  const input = readJson(args.request);
  const request = normalizeEditRequest(input);
  const paths = buildAssetPaths(request.localAssetDir, request.runId, "image");
  writeJson(paths.requestPath, request);

  const providerRequest = buildProviderBody(request);
  const { data } = await fetchJson(providerRequest.endpoint, {
    method: "POST",
    body: JSON.stringify(providerRequest.body)
  });

  writeJson(paths.responsePath, data);

  const manifest = createImageManifestBase(request, paths);
  const result = unwrapProviderResult(data);
  manifest.providerPredictionId = result?.id || null;
  manifest.providerStatus = result?.status || null;
  manifest.providerUrls = result?.urls || null;
  manifest.mediaType = "image";
  const outputs = Array.isArray(result?.outputs) ? result.outputs : [];

  for (let index = 0; index < outputs.length; index += 1) {
    const output = outputs[index];
    if (typeof output !== "string") {
      continue;
    }
    const fileExt = request.outputFormat === "jpeg" ? "jpeg" : "png";
    const imageId = `img-${String(index + 1).padStart(3, "0")}`;
    const localPath = path.join(paths.candidatesDir, `${imageId}.${fileExt}`);
    if (/^https?:\/\//.test(output)) {
      await downloadFile(output, localPath);
    } else if (request.enableBase64Output) {
      const bytes = Buffer.from(output, "base64");
      ensureDir(path.dirname(localPath));
      fs.writeFileSync(localPath, bytes);
    } else {
      continue;
    }
    manifest.assets.push({
      assetId: imageId,
      localPath,
      assetRelativePath: toAssetRelative(paths.absoluteAssetDir, localPath),
      remoteUrl: /^https?:\/\//.test(output) ? output : null,
      mimeType: `image/${fileExt}`,
      promptHash: `sha256:${sha256(request.prompt)}`,
      sourceBasis: request.sourceBasis
    });
  }

  finalizeImageRun(request, paths, manifest);
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
