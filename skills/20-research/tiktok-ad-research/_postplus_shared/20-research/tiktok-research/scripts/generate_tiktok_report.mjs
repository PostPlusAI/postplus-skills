#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, readJson } from "./lib/tiktok_common.mjs";

function list(items, count, formatter) {
  return items.slice(0, count).map((item) => `- ${formatter(item)}`).join("\n");
}

function markdown(args) {
  const keyword = readJson(args["keyword-summary"]);
  const hashtag = readJson(args["hashtag-summary"]);
  const competitor = readJson(args["competitor-summary"]);
  const comments = readJson(args["comments-summary"]);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return `# TikTok Research Draft

Date: ${today}

## Scope

- Platform: TikTok
- Focus: keyword discovery, hashtag discovery, creator sampling, comment sampling

## Executive Summary

- The strongest recurring value framing is practical and workflow-oriented, not abstract category language.
- High-signal samples repeatedly use simple educational structures: problem/solution, listicle, workflow demo, and POV framing.
- Creator discovery should not stop at direct competitors; adjacent educators and productivity creators matter too.

## Keyword Findings

Top recurring hashtags:
${list(keyword.topHashtags || [], 10, (item) => `#${item.key} (${item.value})`)}

Top structure patterns:
${list(keyword.structurePatterns || [], 10, (item) => `${item.key} (${item.value})`)}

Notable hooks:
${list(keyword.recurringHooks || [], 8, (item) => item.key)}

## Hashtag Findings

Top recurring hashtags:
${list(hashtag.topHashtags || [], 12, (item) => `#${item.key} (${item.value})`)}

Top authors:
${list(hashtag.topAuthors || [], 10, (item) => `${item.key} (${item.value})`)}

## Competitor and Creator Findings

Top sampled authors:
${list(competitor.topAuthors || [], 12, (item) => `${item.key} (${item.value})`)}

Top structure patterns:
${list(competitor.structurePatterns || [], 10, (item) => `${item.key} (${item.value})`)}

## Comment Insights

Comment-type distribution:
${list(comments.commentTypes || [], 10, (item) => `${item.key} (${item.value})`)}

Common comment vocabulary:
${list(comments.topWords || [], 15, (item) => `${item.key} (${item.value})`)}

Representative high-signal comments:
${list(comments.topComments || [], 8, (item) => String(item.text || "").slice(0, 140))}
`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const required = ["keyword-summary", "hashtag-summary", "competitor-summary", "comments-summary", "output"];
  for (const key of required) {
    if (!args[key]) {
      console.error(`Missing --${key}`);
      process.exitCode = 1;
      return;
    }
  }

  const report = markdown(args);
  const outputPath = path.resolve(args.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, report);
  console.log(`Saved report to ${outputPath}`);
}

main();
