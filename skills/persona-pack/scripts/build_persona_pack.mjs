#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/shared-runtime/scripts/lib/local_skill_cli.mjs";

export function buildPersonaPack(input = {}) {
  return {
    personas: [
      {
        keyPain:
          input.keyPain || "Too many disconnected tools in one workflow",
        name: input.name || "Workflow-conscious operator",
        proofNeed:
          input.proofNeed ||
          "wants one visible before/after workflow improvement",
      },
    ],
  };
}

function usage() {
  console.error(
    "Usage: node build_persona_pack.mjs [--input <input.json>] [--output <personas.json>]",
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
  const payload = buildPersonaPack(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
