#!/usr/bin/env node

import path from "node:path";
import { downloadAsset, parseArgs, readJson, writeJson } from "./lib/media_common.mjs";

function usage() {
  console.error(
    "Usage: node download_xhs_media_assets.mjs --manifest <manifest.json> --output-dir <dir> [--output <download-report.json>]"
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.manifest || !args["output-dir"]) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const manifest = readJson(args.manifest);
  const assets = Array.isArray(manifest?.assets) ? manifest.assets : [];
  if (!assets.length) {
    throw new Error("Manifest has no assets to download.");
  }

  const results = [];
  for (const asset of assets) {
    try {
      results.push(await downloadAsset(asset, args["output-dir"]));
    } catch (error) {
      results.push({
        ...asset,
        localPath: null,
        httpStatus: null,
        byteSize: 0,
        downloadStatus: "failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const payload = {
    downloadedAt: new Date().toISOString(),
    manifestPath: path.resolve(args.manifest),
    outputDir: path.resolve(args["output-dir"]),
    assetCount: results.length,
    downloadedCount: results.filter((asset) => asset.downloadStatus === "downloaded").length,
    failedCount: results.filter((asset) => asset.downloadStatus !== "downloaded").length,
    assets: results
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved XHS media download report to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
