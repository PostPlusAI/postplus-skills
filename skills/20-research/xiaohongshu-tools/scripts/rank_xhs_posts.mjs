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
    "Usage: node rank_xhs_posts.mjs --input <normalized-posts.json> [--keywords <comma-separated>] [--output <ranking.json>]"
  );
}

const BILINGUAL_REVIEW_TERMS = Object.freeze(["review", "test", "测评", "评测"]);

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function parseKeywords(value) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function keywordHits(post, keywords) {
  if (!keywords.length) {
    return 0;
  }
  const haystack = [
    cleanString(post.title),
    cleanString(post.description),
    ...(Array.isArray(post.hashtags) ? post.hashtags : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return keywords.filter((keyword) => haystack.includes(keyword)).length;
}

function scorePost(post, keywords) {
  let score = 0;
  score += Math.min(Math.log10((post.likeCount || 0) + 1) * 15, 45);
  score += Math.min(Math.log10((post.commentCount || 0) + 1) * 10, 20);
  score += Math.min(Math.log10((post.shareCount || 0) + 1) * 10, 15);
  score += Math.min(keywordHits(post, keywords) * 6, 18);
  score += post.contentType === "video" ? 4 : 0;
  return Number(score.toFixed(3));
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
  const keywords = parseKeywords(args.keywords);

  const ranked = items
    .map((post) => {
      const row = {
        ...post,
        keywordHitCount: keywordHits(post, keywords)
      };
      row.shortlistScore = scorePost(post, keywords);
      row.contentPillar = includesAny(safeLower(post.description), BILINGUAL_REVIEW_TERMS) ? "review" : "general";
      return row;
    })
    .sort((left, right) => right.shortlistScore - left.shortlistScore);

  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      datasetPath: path.resolve(args.input),
      keywords
    },
    itemCount: ranked.length,
    shortlistCount: Math.min(ranked.length, 10),
    items: ranked
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved ranked posts to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
