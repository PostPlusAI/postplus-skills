#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/local_skill_cli.mjs";

function readRequiredString(input, fieldName) {
  const value = input?.[fieldName];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`benchmark-to-brief requires ${fieldName}.`);
  }
  return value.trim();
}

function readRequiredStringArray(input, fieldName) {
  const value = input?.[fieldName];
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`benchmark-to-brief requires non-empty ${fieldName}.`);
  }

  const strings = value.filter(
    (item) => typeof item === "string" && item.trim(),
  );
  if (strings.length === 0) {
    throw new Error(`benchmark-to-brief requires non-empty ${fieldName}.`);
  }

  return strings;
}

export function buildBenchmarkBrief(input) {
  return {
    brief: {
      corePromise: readRequiredString(input, "corePromise"),
      hookOptions: readRequiredStringArray(input, "hookOptions"),
      workflow: readRequiredString(input, "workflow"),
    },
    sourceFacts: readRequiredStringArray(input, "sourceFacts"),
    sourceBasis: readRequiredStringArray(input, "sourceBasis"),
  };
}

function usage() {
  console.error(
    "Usage: node build_benchmark_brief.mjs --input <input.json> [--output <brief.json>]",
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    process.exitCode = 0;
    return;
  }

  if (!args.input) {
    usage();
    process.exitCode = 1;
    return;
  }

  const input = readJson(args.input);
  const payload = buildBenchmarkBrief(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
