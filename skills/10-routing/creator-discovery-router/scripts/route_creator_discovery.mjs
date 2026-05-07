#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/local_skill_cli.mjs";

export function routeCreatorDiscovery(brief = {}) {
  const platform = brief.platform || "tiktok";
  const route =
    brief.seedUsernames?.length || brief.seedHashtags?.length
      ? "graph-first"
      : brief.platform === "instagram"
        ? "content-first"
        : "content-first";

  return {
    explanation:
      platform === "tiktok"
        ? "Start from genuinely relevant content, then enrich profiles and filter candidates."
        : "Collect an initial pass from related content and authors, then enrich account data for filtering.",
    handoffReady: true,
    platform,
    primarySkill:
      platform === "instagram"
        ? "instagram-creator-discovery"
        : platform === "x"
          ? "x-research"
          : "tiktok-research",
    route,
  };
}

function usage() {
  console.error(
    "Usage: node route_creator_discovery.mjs [--input <brief.json>] [--output <route.json>]",
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
  const payload = routeCreatorDiscovery(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
