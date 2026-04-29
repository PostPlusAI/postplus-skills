#!/usr/bin/env node

import path from "node:path";
import {
  normalizeDataset,
  parseArgs,
  readJson,
  scoreBenchmarkPost,
  scoreRelevance,
  splitCsv,
  writeJson
} from "./lib/xhs_common.mjs";

function usage() {
  console.error(
    "Usage: node rank_xhs_benchmark_posts.mjs --input <normalized-or-raw.json> [--theme 'keyword1,keyword2'] [--shortlist-size 10] [--output <ranking.json>]"
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const raw = readJson(args.input);
  const dataset =
    raw?.platform === "xiaohongshu" && raw?.datasetType === "benchmark-posts" && Array.isArray(raw?.items)
      ? raw
      : normalizeDataset(raw, { inputPath: args.input });

  const themeKeywords = splitCsv(args.theme);
  const shortlistSize = Number(args["shortlist-size"] || 10);
  const ranked = dataset.items
    .map((item) => ({
      ...item,
      score: scoreBenchmarkPost(item, themeKeywords),
      themeMatchCount: scoreRelevance(item, themeKeywords)
    }))
    .sort((left, right) => right.score - left.score);

  const payload = {
    generatedAt: new Date().toISOString(),
    datasetPath: path.resolve(args.input),
    themeKeywords,
    itemCount: ranked.length,
    shortlistCount: Math.min(shortlistSize, ranked.length),
    items: ranked,
    shortlist: ranked.slice(0, Math.max(1, shortlistSize))
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved ranked XHS benchmark posts to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
