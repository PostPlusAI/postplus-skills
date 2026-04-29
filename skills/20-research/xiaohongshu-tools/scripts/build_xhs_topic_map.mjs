#!/usr/bin/env node

import path from "node:path";
import {
  cleanString,
  parseArgs,
  readJson,
  safeLower,
  writeJson
} from "./lib/xhs_common.mjs";

function usage() {
  console.error(
    "Usage: node build_xhs_topic_map.mjs --input <normalized-posts-or-search.json> [--output <topic-map.json>]"
  );
}

function bump(map, key) {
  if (!key) {
    return;
  }
  map.set(key, (map.get(key) || 0) + 1);
}

function topEntries(map, limit = 20) {
  return Array.from(map.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

function inferContentPillar(post) {
  const text = safeLower([post.title, post.description, ...(post.hashtags || [])].filter(Boolean).join(" "));
  if (text.includes("测评") || text.includes("评测")) {
    return "review";
  }
  if (text.includes("教程") || text.includes("攻略")) {
    return "tutorial";
  }
  if (text.includes("推荐") || text.includes("种草")) {
    return "recommendation";
  }
  if (text.includes("vlog") || text.includes("日常")) {
    return "lifestyle";
  }
  return "general";
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const dataset = readJson(args.input);
  const items = Array.isArray(dataset.items) ? dataset.items : [];
  const hashtagCounts = new Map();
  const authorCounts = new Map();
  const pillarCounts = new Map();

  for (const item of items) {
    for (const hashtag of item.hashtags || []) {
      bump(hashtagCounts, cleanString(hashtag));
    }
    bump(authorCounts, cleanString(item.authorNickname));
    bump(pillarCounts, inferContentPillar(item));
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      datasetPath: path.resolve(args.input)
    },
    itemCount: items.length,
    topHashtags: topEntries(hashtagCounts),
    topAuthors: topEntries(authorCounts),
    topContentPillars: topEntries(pillarCounts)
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved topic map to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
