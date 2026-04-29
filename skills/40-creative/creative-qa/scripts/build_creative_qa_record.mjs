#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/local_skill_cli.mjs";

export function buildCreativeQaRecord(input = {}) {
  return {
    checklistVersion: input.checklistVersion || "qa-v1",
    items: [
      {
        issue: input.issue || "opening promise is legible",
        status: input.status || "pass",
      },
    ],
    reviewTarget: input.reviewTarget || "voice-take-1",
  };
}

function usage() {
  console.error(
    "Usage: node build_creative_qa_record.mjs [--input <input.json>] [--output <qa-record.json>]",
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
  const payload = buildCreativeQaRecord(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
