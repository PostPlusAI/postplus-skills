#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/local_skill_cli.mjs";

export function buildEditingDecisionPackage(input = {}) {
  const beats = Array.isArray(input.beats) ? input.beats : [];

  return {
    beatCount: beats.length,
    editThesis:
      input.editThesis ||
      "stay on face for claim, cut away only for proof",
    items: beats.map((beat, index) => ({
      brollRole: index === 0 ? "support-proof" : "primary-proof",
      cutDecision: index === 0 ? "stay-on-a-roll" : "insert-b-roll",
      id: beat.id || `beat-${index + 1}`,
      text: beat.text || "",
    })),
    risks:
      Array.isArray(input.risks) && input.risks.length > 0
        ? input.risks
        : ["missing stronger proof clip for closing beat"],
  };
}

function usage() {
  console.error(
    "Usage: node build_editing_decision_package.mjs [--input <input.json>] [--output <decision-package.json>]",
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
  const payload = buildEditingDecisionPackage(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
