#!/usr/bin/env node

import { parseArgs, readJson } from "./lib/media_common.mjs";
import { verifyDownloadedManifest } from "./lib/media_common.mjs";

function usage() {
  console.error(
    "Usage: node verify_xhs_media_manifest.mjs --manifest <download-report.json>"
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.manifest) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const manifest = readJson(args.manifest);
  const report = verifyDownloadedManifest(manifest);
  if (report.failedCount > 0) {
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return;
  }
  console.log(JSON.stringify(report, null, 2));
}

main();
