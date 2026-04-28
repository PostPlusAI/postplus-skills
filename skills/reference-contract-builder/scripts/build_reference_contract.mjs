#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/shared-runtime/scripts/lib/local_skill_cli.mjs";

export function buildReferenceContract(input = {}) {
  return {
    excludedReferences: input.excludedReferences || ["full style board"],
    mayLearn: ["camera grammar", "visible proof sequence", "opening timing"],
    mustNotCopy: ["exact identity", "exact location", "exact wardrobe"],
    testPurpose: input.testPurpose || "hook rhythm only",
  };
}

function usage() {
  console.error(
    "Usage: node build_reference_contract.mjs [--input <brief.json>] [--output <contract.json>]",
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
  const payload = buildReferenceContract(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
