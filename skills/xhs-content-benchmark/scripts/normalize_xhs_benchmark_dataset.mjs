#!/usr/bin/env node

import path from "node:path";
import {
  normalizeDataset,
  parseArgs,
  readJson,
  writeJson
} from "./lib/xhs_common.mjs";

function usage() {
  console.error(
    "Usage: node normalize_xhs_benchmark_dataset.mjs --input <dataset.json> [--actor <actor-id>] [--output <normalized.json>]"
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
  const normalized = normalizeDataset(raw, {
    actorId: args.actor,
    inputPath: args.input
  });

  if (normalized.itemCount === 0) {
    throw new Error(
      `XHS benchmark normalization produced zero items for actor ${normalized.actorId}. Inspect the raw actor output first.`
    );
  }

  if (args.output) {
    writeJson(args.output, normalized);
    console.log(`Saved normalized XHS benchmark dataset to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(normalized, null, 2));
}

main();
