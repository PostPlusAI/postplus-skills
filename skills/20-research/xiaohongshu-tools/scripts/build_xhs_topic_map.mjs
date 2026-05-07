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

const BILINGUAL_CONTENT_PILLAR_TERMS = Object.freeze({
  review: ["review", "test", "测评", "评测"],
  tutorial: ["tutorial", "guide", "how to", "教程", "攻略"],
  recommendation: ["recommendation", "recommended", "must-have", "种草", "推荐"],
  lifestyle: ["vlog", "daily", "routine", "日常"],
});

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function inferContentPillar(post) {
  const text = safeLower([post.title, post.description, ...(post.hashtags || [])].filter(Boolean).join(" "));
  if (includesAny(text, BILINGUAL_CONTENT_PILLAR_TERMS.review)) {
    return "review";
  }
  if (includesAny(text, BILINGUAL_CONTENT_PILLAR_TERMS.tutorial)) {
    return "tutorial";
  }
  if (includesAny(text, BILINGUAL_CONTENT_PILLAR_TERMS.recommendation)) {
    return "recommendation";
  }
  if (includesAny(text, BILINGUAL_CONTENT_PILLAR_TERMS.lifestyle)) {
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
