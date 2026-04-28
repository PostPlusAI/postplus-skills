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
  parseArgs,
  readJson,
  sha256,
  toAssetRelative,
  unwrapProviderResult,
  writeJson
} from "./_shared.mjs";

function usage() {
  console.error("Usage: node poll_prediction.mjs --request <request.json> [--response <response.json>] [--result-url <url>]");
}

function inferResultUrl(request, responsePayload) {
  const payload = unwrapProviderResult(responsePayload);
  if (typeof payload?.urls?.get === "string" && payload.urls.get.length > 0) {
    return payload.urls.get;
  }
  if (payload?.id && request?.provider === "wavespeed") {
    return `https://api.wavespeed.ai/api/v3/predictions/${payload.id}/result`;
  }
  throw new Error("Could not infer result URL from request/response.");
}

function normalizePollRequest(request) {
  return {
    ...request,
    assetId: request.assetId || request.jobId,
    runId: request.runId || request.jobId,
    localAssetDir: request.localAssetDir || request.localOutputDir
  };
}

async function downloadOutputs(request, result, manifest, paths) {
  const outputs = Array.isArray(result?.outputs) ? result.outputs : [];
  const fileExt = request.outputFormat === "jpeg" ? "jpeg" : "png";

  ensureDir(paths.candidatesDir);
  for (let index = 0; index < outputs.length; index += 1) {
    const output = outputs[index];
    const assetId = `img-${String(index + 1).padStart(3, "0")}`;
    const localPath = path.join(paths.candidatesDir, `${assetId}.${fileExt}`);

    if (typeof output === "string" && /^https?:\/\//.test(output)) {
      await downloadFile(output, localPath);
      manifest.assets.push({
        assetId,
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
        assetId,
        localPath,
        assetRelativePath: toAssetRelative(paths.absoluteAssetDir, localPath),
        remoteUrl: null,
        mimeType: `image/${fileExt}`,
        promptHash: `sha256:${sha256(request.prompt)}`,
        sourceBasis: request.sourceBasis
      });
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.request && !args.response) {
    usage();
    process.exitCode = 1;
    return;
  }

  const rawRequest = args.request ? readJson(args.request) : null;
  if (!rawRequest) {
    throw new Error("--request is required.");
  }
  const request = normalizePollRequest(rawRequest);

  const paths = buildAssetPaths(request.localAssetDir, request.runId, "image");
  const priorResponse = args.response ? readJson(args.response) : readJson(paths.responsePath);
  const resultUrl = args["result-url"] || inferResultUrl(request, priorResponse);

  const { data: rawResult } = await fetchJson(resultUrl);

  writeJson(paths.responsePath, rawResult);

  const result = unwrapProviderResult(rawResult);
  const manifest = createImageManifestBase(request, paths);
  manifest.providerPredictionId = result?.id || null;
  manifest.providerStatus = result?.status || null;
  manifest.providerUrls = result?.urls || null;
  manifest.mediaType = "image";

  if (result?.status === "completed") {
    await downloadOutputs(request, result, manifest, paths);
  }

  finalizeImageRun(request, paths, manifest);
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
