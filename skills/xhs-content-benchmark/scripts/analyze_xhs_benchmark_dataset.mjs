#!/usr/bin/env node

import path from "node:path";
import {
  normalizeDataset,
  parseArgs,
  readJson,
  summarizeBenchmarkItems,
  writeJson
} from "./lib/xhs_common.mjs";

function usage() {
  console.error(
    "Usage: node analyze_xhs_benchmark_dataset.mjs --input <normalized-or-raw.json> [--output <analysis.json>]"
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const raw = readJson(args.input);
  const dataset =
    raw?.platform === "xiaohongshu" && raw?.datasetType === "benchmark-posts" && Array.isArray(raw?.items)
      ? raw
      : normalizeDataset(raw, { inputPath: args.input });

  if (!dataset.items.length) {
    throw new Error("Cannot analyze an empty XHS benchmark dataset.");
  }

  const summary = summarizeBenchmarkItems(dataset.items);
  const payload = {
    generatedAt: new Date().toISOString(),
    datasetPath: path.resolve(args.input),
    actorId: dataset.actorId,
    ...summary
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved XHS benchmark analysis to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
