#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/shared-runtime/scripts/lib/local_skill_cli.mjs";

export function runPromptPreflight(brief = {}) {
  const text = String(brief.prompt || "").toLowerCase();
  const missingFields = [];
  const majorRisks = [];

  if (!text.includes("first frame") && !text.includes("opening")) {
    missingFields.push("opening mechanism");
    majorRisks.push("weak first frame");
  }
  if (!text.includes("product")) {
    missingFields.push("product timing");
    majorRisks.push("product may appear too late or not at all");
  }
  if (!text.includes("do not") && !text.includes("avoid")) {
    missingFields.push("negative constraints");
    majorRisks.push("drift risk is under-specified");
  }

  return {
    canRunNow: missingFields.length === 0,
    fixNow: missingFields,
    likelyDrift: majorRisks,
    majorRisks,
    missingFields,
    verdict: missingFields.length === 0 ? "pass" : "risky",
  };
}

function usage() {
  console.error(
    "Usage: node run_prompt_preflight.mjs [--input <brief.json>] [--output <report.json>]",
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
  const payload = runPromptPreflight(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
