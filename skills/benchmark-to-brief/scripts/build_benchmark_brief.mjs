#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../../shared-runtime/scripts/lib/local_skill_cli.mjs";

export function buildBenchmarkBrief(input = {}) {
  return {
    brief: {
      corePromise:
        input.corePromise ||
        "Keep the workflow in context instead of switching tabs.",
      hookOptions:
        Array.isArray(input.hookOptions) && input.hookOptions.length > 0
          ? input.hookOptions
          : ["Stop switching tabs to write one email."],
      workflow: input.workflow || "tutorial-led",
    },
    sourceFacts:
      Array.isArray(input.sourceFacts) && input.sourceFacts.length > 0
        ? input.sourceFacts
        : ["operators want in-context workflow proof"],
  };
}

function usage() {
  console.error(
    "Usage: node build_benchmark_brief.mjs [--input <input.json>] [--output <brief.json>]",
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
  const payload = buildBenchmarkBrief(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
