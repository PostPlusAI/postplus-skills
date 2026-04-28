#!/usr/bin/env node

import path from "node:path";
import {
  normalizeDataset,
  parseArgs,
  readJson,
  writeJson
} from "./lib/instagram_common.mjs";

function usage() {
  console.error(
    "Usage: node normalize_instagram_dataset.mjs --input <dataset.json> [--dataset-type <type>] [--actor <actor-id>] [--output <normalized.json>]"
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
  const normalized = normalizeDataset(input, {
    actorId: args.actor,
    datasetType: args["dataset-type"],
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
