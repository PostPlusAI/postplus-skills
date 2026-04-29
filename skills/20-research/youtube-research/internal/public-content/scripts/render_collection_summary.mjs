#!/usr/bin/env node

import path from "node:path";

import {
  isDirectRun,
  parseArgs,
  readJson,
  requireArg,
  toNumber,
  writeText
} from "./lib/public_content_common.mjs";

export function renderSummary(dataset) {
  const items = Array.isArray(dataset.items) ? dataset.items : [];
  const byPlatform = new Map();

  for (const item of items) {
    const current = byPlatform.get(item.platform) || [];
    current.push(item);
    byPlatform.set(item.platform, current);
  }

  const lines = [
    "# Public content Public Content Summary",
    "",
    `Total items: ${items.length}`,
    ""
  ];

  for (const platform of ["linkedin", "youtube", "facebook"]) {
    const current = byPlatform.get(platform) || [];
    if (current.length === 0) continue;
    const likes = current.reduce((total, item) => total + (toNumber(item.metrics.likes) || 0), 0);
    const views = current.reduce((total, item) => total + (toNumber(item.metrics.views) || 0), 0);
    lines.push(`## ${platform}`);
    lines.push("");
    lines.push(`- items: ${current.length}`);
    lines.push(`- total likes: ${likes}`);
    lines.push(`- total views: ${views}`);
    lines.push("");

    for (const item of current.slice(0, 5)) {
      lines.push(`- ${item.title || item.url}`);
      lines.push(`  url: ${item.url}`);
      lines.push(`  likes: ${item.metrics.likes ?? "null"}, comments: ${item.metrics.comments ?? "null"}, shares: ${item.metrics.shares ?? "null"}, views: ${item.metrics.views ?? "null"}`);
    }
    lines.push("");
  }

  if (items.length === 0) {
    lines.push("No items were normalized.");
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  const input = requireArg(args, "input");
  const output = requireArg(args, "output");
  const dataset = readJson(input);
  const markdown = renderSummary(dataset);
  writeText(output, markdown);
  io.log(JSON.stringify({ output: path.resolve(output), itemCount: dataset.itemCount || 0 }, null, 2));
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
