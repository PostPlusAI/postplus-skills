#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/local_skill_cli.mjs";

export function routePatternJob(brief = {}) {
  const segmentType = brief.segmentType || "hook";
  const primaryPattern =
    segmentType === "hook"
      ? "problem-first"
      : segmentType === "benefit"
        ? "proof-first"
        : "direct";

  return {
    nextSkill:
      brief.target === "request"
        ? "video-request-architect"
        : "reference-decode",
    openingMechanism:
      segmentType === "hook"
        ? "show the visible friction before the solution"
        : "show one clear proof moment",
    primaryPattern,
    productRevealRule:
      segmentType === "hook"
        ? "product can appear in opening if it carries the proof"
        : "show proof before dense explanation",
    segmentType,
    supportPattern: "single-idea",
    viewerQuestion:
      brief.viewerQuestion || "Why should I keep watching this short?",
  };
}

function usage() {
  console.error(
    "Usage: node route_pattern_job.mjs [--input <brief.json>] [--output <route.json>]",
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
  const payload = routePatternJob(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
