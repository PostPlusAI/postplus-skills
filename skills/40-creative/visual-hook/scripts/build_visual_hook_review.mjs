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
    throw new Error(`visual-hook requires ${fieldName}.`);
  }
  return value.trim();
}

function readOptionalString(input, fieldName) {
  const value = input?.[fieldName];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readRequiredStringArray(input, fieldName) {
  const value = input?.[fieldName];
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`visual-hook requires non-empty ${fieldName}.`);
  }

  const strings = value.filter(
    (item) => typeof item === "string" && item.trim(),
  );
  if (strings.length === 0) {
    throw new Error(`visual-hook requires non-empty ${fieldName}.`);
  }

  return strings;
}

export function buildVisualHookReview(input) {
  return {
    strongestHook: readRequiredString(input, "strongestHook"),
    firstFrame: readRequiredString(input, "firstFrame"),
    actionInProgress: readRequiredString(input, "actionInProgress"),
    evidenceDetail: readRequiredString(input, "evidenceDetail"),
    viewerQuestion: readRequiredString(input, "viewerQuestion"),
    nextShot: readRequiredString(input, "nextShot"),
    avoid: readOptionalString(input, "avoid"),
    visualProof: readRequiredStringArray(input, "visualProof"),
    doNext: readRequiredStringArray(input, "doNext"),
  };
}

function usage() {
  console.error(
    "Usage: node build_visual_hook_review.mjs --input <input.json> [--output <review.json>]",
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
  const payload = buildVisualHookReview(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
