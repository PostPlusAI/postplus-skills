#!/usr/bin/env node

import path from "node:path";

import {
  collectPublicContent,
  ensureDir,
  isDirectRun,
  parseArgs,
  readJson,
  requireArg,
  summarizePlatformItems,
  writeJson
} from "./lib/public_content_common.mjs";

export async function collectFromPlan(plan, fetchImpl = globalThis.fetch, logger = console) {
  const grouped = new Map();

  for (const item of plan.items || []) {
    const current = grouped.get(item.platform) || [];
    current.push(item);
    grouped.set(item.platform, current);
  }

  const raw = {};
  const summary = {};

  for (const [platform, items] of grouped.entries()) {
    const sourceId = items[0].sourceId;
    const input = items.map((item) => item.input || { url: item.url });
    const result = await collectPublicContent({
      sourceId,
      input,
      fetchImpl,
      logger
    });
    raw[platform] = result;
    summary[platform] = {
      sourceId,
      ...summarizePlatformItems(
        (Array.isArray(result) ? result : []).map((item) => ({
          metrics: {
            likes: item.likes ?? item.num_likes ?? item.digg_count ?? null,
            comments: item.comments ?? item.num_comments ?? item.comment_count ?? null,
            shares: item.shares ?? item.num_shares ?? item.share_count ?? null,
            views: item.views ?? item.play_count ?? null
          }
        }))
      )
    };
  }

  return { raw, summary };
}

export async function main(argv = process.argv.slice(2), io = console, fetchImpl = globalThis.fetch) {
  const args = parseArgs(argv);
  const planPath = requireArg(args, "plan");
  const outputDir = requireArg(args, "output-dir");
  const plan = readJson(planPath);

  ensureDir(outputDir);
  ensureDir(path.join(outputDir, "raw"));

  const { raw, summary } = await collectFromPlan(plan, fetchImpl, io);

  for (const [platform, result] of Object.entries(raw)) {
    writeJson(path.join(outputDir, "raw", `${platform}.json`), result);
  }

  const envelope = {
    requestedAt: new Date().toISOString(),
    planPath,
    outputDir: path.resolve(outputDir),
    summary
  };
  writeJson(path.join(outputDir, "collection-report.json"), envelope);
  io.log(JSON.stringify(envelope, null, 2));
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
