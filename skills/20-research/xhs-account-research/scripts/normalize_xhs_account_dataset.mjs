#!/usr/bin/env node

import path from "node:path";
import { normalizeAccountDataset, parseArgs, readJson, writeJson } from "./lib/account_common.mjs";

function usage() {
  console.error(
    "Usage: node normalize_xhs_account_dataset.mjs --input <dataset.json> [--output <normalized.json>]"
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
  const normalized = normalizeAccountDataset(raw, { inputPath: args.input });
  if (normalized.itemCount === 0) {
    throw new Error("XHS account normalization produced zero posts.");
  }

  if (args.output) {
    writeJson(args.output, normalized);
    console.log(`Saved normalized XHS account dataset to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(normalized, null, 2));
}

main();
