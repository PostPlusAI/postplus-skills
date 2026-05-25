#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/local_skill_cli.mjs";

export function routeSocialMediaExtractor(brief = {}) {
  const requestedPlatforms = Array.isArray(brief.platforms)
    ? brief.platforms
    : ["tiktok", "instagram", "x"];
  const goal = brief.goal || "benchmark";

  const routePlan = requestedPlatforms.map((platform) => ({
    platform,
    skillId:
      platform === "tiktok"
        ? "tiktok-research"
        : platform === "instagram"
          ? goal === "creator-shortlist"
            ? "instagram-creator-discovery"
            : "instagram-content-benchmark"
          : platform === "x"
            ? "x-tools"
            : `${platform}-research`,
  }));

  return {
    mergedSummaryAfterNormalization: true,
    nextSkill:
      goal === "creator-shortlist"
        ? "creator-discovery-router"
        : "benchmark-to-brief",
    requestedPlatforms,
    routePlan,
    workspacePackage: {
      perPlatform: ["raw", "normalized", "summary"],
      rootDirs: ["raw", "normalized"],
    },
  };
}

function usage() {
  console.error(
    "Usage: node route_social_media_extractor.mjs --input <brief.json> [--output <route.json>]",
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
  const payload = routeSocialMediaExtractor(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
