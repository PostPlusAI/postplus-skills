#!/usr/bin/env node

import path from "node:path";
import {
  normalizeDataset,
  parseArgs,
  readJson,
  writeJson
} from "./lib/amazon_normalize.mjs";

function usage() {
  console.error(
    "Usage: node normalize_amazon_dataset.mjs --input <dataset.json> [--output <normalized.json>] [--actor <actor-id>]"
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) {
    usage();
    process.exitCode = 1;
    return;
  }

  const input = readJson(args.input);
  const normalized = normalizeDataset(input, {
    sourceId: args.actor,
    inputPath: path.resolve(args.input)
  });

  if (args.output) {
    writeJson(args.output, normalized);
    console.log(`Saved normalized dataset to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(normalized, null, 2));
}

main();
