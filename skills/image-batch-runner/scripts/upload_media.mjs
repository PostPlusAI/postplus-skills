#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { formatCliError } from "../../shared-runtime/scripts/lib/network_runtime.mjs";
import {
  buildAssetPaths,
  finalizeUploadRun,
  nowIso,
  parseArgs,
  readJson,
  toAssetRelative,
  uploadLocalMedia,
  writeJson
} from "./_shared.mjs";

function usage() {
  console.error("Usage: node upload_media.mjs --request <request.json>");
}

function normalizeUploadRequest(input) {
  const assetId = input?.assetId || input?.jobId || null;
  const runId = input?.runId || input?.jobId || null;
  const localAssetDir = input?.localAssetDir || input?.localOutputDir || null;
  if (!assetId) {
    throw new Error("request.assetId is required. Legacy fallback: request.jobId.");
  }
  if (!runId) {
    throw new Error("request.runId is required. Legacy fallback: request.jobId.");
  }
  if (!input?.localFilePath) {
    throw new Error("request.localFilePath is required.");
  }
  if (!localAssetDir) {
    throw new Error("request.localAssetDir is required. Legacy fallback: request.localOutputDir.");
  }
  return {
    assetId,
    runId,
    jobId: input.jobId || runId,
    provider: input.provider || "wavespeed",
    localFilePath: path.resolve(input.localFilePath),
    localAssetDir,
    localOutputDir: input.localOutputDir || localAssetDir
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
  const request = normalizeUploadRequest(input);
  const paths = buildAssetPaths(request.localAssetDir, request.runId, "upload");
  writeJson(paths.requestPath, request);

  const data = await uploadLocalMedia(request.localFilePath);

  writeJson(paths.responsePath, data);

  const uploadedUrl = data?.data?.download_url || data?.download_url || null;
  const manifest = {
    assetId: request.assetId,
    runId: request.runId,
    jobId: request.jobId,
    provider: request.provider,
    mediaType: "upload",
    localAssetDir: paths.absoluteAssetDir,
    requestPath: paths.requestPath,
    responsePath: paths.responsePath,
    uploadedUrl,
    sourceLocalFilePath: request.localFilePath,
    sourceAssetRelativePath: toAssetRelative(paths.absoluteAssetDir, request.localFilePath),
    createdAt: nowIso()
  };
  finalizeUploadRun(request, paths, manifest);
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(formatCliError(error));
  process.exitCode = 1;
});
