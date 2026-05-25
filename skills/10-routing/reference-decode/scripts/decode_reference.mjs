#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/local_skill_cli.mjs";

export function decodeReference(brief = {}) {
  return {
    forbiddenDrift: [
      "Do not copy the original creator identity or exact environment.",
      "Do not collapse the opening into generic cinematic filler.",
    ],
    hookEssence:
      brief.hookEssence || "Open on the visible pain before any explanation.",
    mustCopyVisualGrammar: [
      "Problem appears in the first shot.",
      "One concrete proof object is visible before explanation.",
    ],
    viewerQuestion:
      brief.viewerQuestion ||
      "What changes in the first seconds that makes this worth watching?",
  };
}

function usage() {
  console.error(
    "Usage: node decode_reference.mjs --input <brief.json> [--output <decode.json>]",
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
  const payload = decodeReference(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
