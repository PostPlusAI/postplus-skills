#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/shared-runtime/scripts/lib/local_skill_cli.mjs";

export function buildVisualHookReview(input = {}) {
  return {
    doNext:
      Array.isArray(input.doNext) && input.doNext.length > 0
        ? input.doNext
        : ["show the device loading step immediately", "cut the generic intro"],
    strongestHook:
      input.strongestHook || "visible workflow contrast in first frame",
    visualProof:
      Array.isArray(input.visualProof) && input.visualProof.length > 0
        ? input.visualProof
        : ["device", "screen state", "result state"],
  };
}

function usage() {
  console.error(
    "Usage: node build_visual_hook_review.mjs [--input <input.json>] [--output <review.json>]",
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    process.exitCode = 0;
    return;
  }

  const input = args.input ? readJson(args.input) : {};
  const payload = buildVisualHookReview(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
