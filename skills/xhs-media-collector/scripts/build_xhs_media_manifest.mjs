#!/usr/bin/env node

import path from "node:path";
import { buildMediaManifest, parseArgs, readJson, writeJson } from "./lib/media_common.mjs";

function usage() {
  console.error(
    "Usage: node build_xhs_media_manifest.mjs --input <normalized.json> [--limit <n>] [--output <manifest.json>]"
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const input = readJson(args.input);
  const manifest = buildMediaManifest(input, {
    inputPath: path.resolve(args.input),
    limit: args.limit
  });

  if (args.output) {
    writeJson(args.output, manifest);
    console.log(`Saved XHS media manifest to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(manifest, null, 2));
}

main();
