#!/usr/bin/env node

import path from "node:path";
import { aggregateAccountsFromPosts, normalizeAccountDataset, parseArgs, readJson, topEntries, writeJson } from "./lib/account_common.mjs";

function usage() {
  console.error(
    "Usage: node analyze_xhs_accounts.mjs --input <normalized-or-raw.json> [--output <analysis.json>]"
  );
}

function summarizeAccounts(accounts) {
  const warningCounts = new Map();
  for (const account of accounts) {
    for (const warning of account.dataQualityWarnings || []) {
      warningCounts.set(warning, (warningCounts.get(warning) || 0) + 1);
    }
  }
  return {
    accountCount: accounts.length,
    topAccounts: accounts.slice(0, 10).map((account) => ({
      authorName: account.authorName,
      profileUrl: account.profileUrl,
      accountScore: account.accountScore,
      medianLike: account.likeStats.median,
      maxLike: account.likeStats.max
    })),
    repeatedWarnings: topEntries(warningCounts, 10)
  };
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
  const accounts = aggregateAccountsFromPosts(dataset.items)
    .sort((left, right) => right.accountScore - left.accountScore);
  if (!accounts.length) {
    throw new Error("XHS account analysis produced zero accounts.");
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    datasetPath: path.resolve(args.input),
    ...summarizeAccounts(accounts),
    accounts
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved XHS account analysis to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
