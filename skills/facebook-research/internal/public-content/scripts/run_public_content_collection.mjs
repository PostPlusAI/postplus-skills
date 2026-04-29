#!/usr/bin/env node

import path from "node:path";

import { buildCollectionPlan } from "./build_collection_plan.mjs";
import { collectFromPlan } from "./collect_public_posts.mjs";
import { discoverUrls } from "./discover_public_urls_with_mcp.mjs";
import { buildBrief } from "./parse_collection_brief.mjs";
import { normalizeRawPayloads } from "./normalize_public_posts.mjs";
import { renderSummary } from "./render_collection_summary.mjs";
import {
  formatSupportedPlatforms,
  normalizeSupportedPlatforms,
  ensureDir,
  isDirectRun,
  parseArgs,
  requireArg,
  writeJson,
  writeText
} from "./lib/public_content_common.mjs";

export async function main(
  argv = process.argv.slice(2),
  io = console,
  fetchImpl = globalThis.fetch,
  options = {}
) {
  const args = parseArgs(argv);
  const outputDir = requireArg(args, "output-dir");
  const urls = args.urls ? String(args.urls).split(",").map((item) => item.trim()).filter(Boolean) : [];
  const requestText = args.request ? String(args.request) : "";
  const supportedPlatforms = normalizeSupportedPlatforms(options.supportedPlatforms);

  const rootDir = path.resolve(outputDir);
  ensureDir(rootDir);
  ensureDir(path.join(rootDir, "raw"));
  ensureDir(path.join(rootDir, "normalized"));
  ensureDir(path.join(rootDir, "analysis"));

  const brief = buildBrief({ requestText, urls, supportedPlatforms });
  let workingBrief = brief;
  let discovery = null;
  if (workingBrief.urls.length === 0) {
    discovery = await discoverUrls(workingBrief, fetchImpl);
    if (discovery.urls.length === 0) {
      throw new Error(
        `No ${formatSupportedPlatforms(supportedPlatforms)} public URLs were discovered from the request`
      );
    }
    workingBrief = {
      ...workingBrief,
      urls: discovery.urls
    };
  }
  const plan = buildCollectionPlan(workingBrief, { supportedPlatforms });
  const { raw } = await collectFromPlan(plan, fetchImpl, io);
  const normalizedItems = normalizeRawPayloads(raw);
  const normalized = {
    itemCount: normalizedItems.length,
    items: normalizedItems
  };
  const summary = renderSummary(normalized);

  writeJson(path.join(rootDir, "brief.json"), workingBrief);
  writeJson(path.join(rootDir, "plan.json"), plan);
  if (discovery) {
    ensureDir(path.join(rootDir, "discovery"));
    writeJson(path.join(rootDir, "discovery", "discovered-urls.json"), {
      itemCount: discovery.urls.length,
      urls: discovery.urls
    });
    for (const [platform, payload] of Object.entries(discovery.discovered)) {
      writeJson(path.join(rootDir, "discovery", `${platform}-search.json`), payload);
    }
  }
  for (const [platform, payload] of Object.entries(raw)) {
    writeJson(path.join(rootDir, "raw", `${platform}.json`), payload);
  }
  writeJson(path.join(rootDir, "normalized", "posts.json"), normalized);
  writeText(path.join(rootDir, "analysis", "summary.md"), summary);

  io.log(
    JSON.stringify(
      {
        outputDir: rootDir,
        itemCount: normalized.itemCount
      },
      null,
      2
    )
  );
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
