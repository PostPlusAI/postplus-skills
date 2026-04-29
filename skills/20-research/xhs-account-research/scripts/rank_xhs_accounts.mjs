#!/usr/bin/env node

import path from "node:path";
import { aggregateAccountsFromPosts, normalizeAccountDataset, parseArgs, readJson, writeJson } from "./lib/account_common.mjs";

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function usage() {
  console.error(
    "Usage: node rank_xhs_accounts.mjs --input <normalized-or-raw.json> [--theme 'keyword1,keyword2'] [--output <ranking.json>]"
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
    raw?.platform === "xiaohongshu" && raw?.datasetType === "account-posts" && Array.isArray(raw?.items)
      ? raw
      : normalizeAccountDataset(raw, { inputPath: args.input });
  const themeKeywords = splitCsv(args.theme);
  const accounts = aggregateAccountsFromPosts(dataset.items, themeKeywords)
    .sort((left, right) => right.accountScore - left.accountScore);

  const payload = {
    generatedAt: new Date().toISOString(),
    datasetPath: path.resolve(args.input),
    themeKeywords,
    accountCount: accounts.length,
    accounts
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved ranked XHS accounts to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
