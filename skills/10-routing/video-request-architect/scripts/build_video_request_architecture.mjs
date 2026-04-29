#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/local_skill_cli.mjs";

export function buildVideoRequestArchitecture(input = {}) {
  return {
    cameraGrammar: input.cameraGrammar || "handheld UGC close-medium coverage",
    duration: input.duration || 8,
    hookLogic: input.hookLogic || "show the workflow pain before the fix",
    mainRisks: ["opening drift", "over-explaining before proof"],
    productPolicy:
      input.productPolicy || "show product only when it proves the claim",
    referencePolicy:
      input.referencePolicy || "learn the structure, not the identity",
    segmentType: input.segmentType || "hook",
    skeleton: {
      goal: input.goal || "hook replication",
      outputSpec: "9:16 short-form social video",
      role: "director brief",
      timecodedBeatSheet: true,
    },
    viewerQuestion:
      input.viewerQuestion ||
      "Why is this workflow better than the old one?",
  };
}

function usage() {
  console.error(
    "Usage: node build_video_request_architecture.mjs [--input <brief.json>] [--output <request.json>]",
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
  const payload = buildVideoRequestArchitecture(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
