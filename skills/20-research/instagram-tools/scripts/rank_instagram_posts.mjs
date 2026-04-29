#!/usr/bin/env node

import path from "node:path";
import {
  cleanString,
  parseArgs,
  readJson,
  splitCsv,
  writeJson
} from "./lib/instagram_common.mjs";

function usage() {
  console.error(
    "Usage: node rank_instagram_posts.mjs --input <normalized-posts.json> [--theme 'keyword1,keyword2'] [--shortlist-size 8] [--output <ranking.json>]"
  );
}

function daysSince(isoDate) {
  const value = cleanString(isoDate);
  if (!value) {
    return null;
  }
  const diff = Date.now() - new Date(value).valueOf();
  if (!Number.isFinite(diff)) {
    return null;
  }
  return diff / 86_400_000;
}

function scoreRelevance(item, themeKeywords) {
  if (!themeKeywords.length) {
    return 0;
  }
  const haystack = [
    cleanString(item.caption),
    ...(Array.isArray(item.hashtags) ? item.hashtags : []),
    ...(Array.isArray(item.mentions) ? item.mentions : []),
    cleanString(item.ownerUsername)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let matches = 0;
  for (const keyword of themeKeywords) {
    if (haystack.includes(keyword.toLowerCase())) {
      matches += 1;
    }
  }
  return matches;
}

function scorePost(item, themeKeywords) {
  const likeScore = Math.log10((item.likeCount || 0) + 1) * 12;
  const commentScore = Math.log10((item.commentCount || 0) + 1) * 10;
  const viewScore = Math.log10((item.viewCount || 0) + 1) * 8;
  const relevanceScore = scoreRelevance(item, themeKeywords) * 6;
  const reelBonus = item.contentType === "reel" ? 6 : 0;
  const carouselBonus = item.contentType === "carousel" ? 3 : 0;
  const sponsoredPenalty = item.isSponsored ? -5 : 0;
  const ageDays = daysSince(item.publishedAt);
  const recencyPenalty = ageDays === null ? 0 : Math.min(ageDays / 30, 8);

  return Number(
    (likeScore + commentScore + viewScore + relevanceScore + reelBonus + carouselBonus + sponsoredPenalty - recencyPenalty).toFixed(3)
  );
}

function summarizeHooks(items) {
  return items
    .map((item) => cleanString(item.caption))
    .filter(Boolean)
    .map((caption) => caption.split(/\n|\./)[0]?.trim() || caption)
    .slice(0, 12);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const input = readJson(args.input);
  const items = Array.isArray(input.items) ? input.items : [];
  const shortlistSize = Number(args["shortlist-size"] || 8);
  const themeKeywords = splitCsv(args.theme);

  const ranked = items
    .map((item) => ({
      ...item,
      score: scorePost(item, themeKeywords),
      themeMatchCount: scoreRelevance(item, themeKeywords)
    }))
    .sort((left, right) => right.score - left.score);

  const shortlist = ranked.slice(0, Number.isFinite(shortlistSize) ? shortlistSize : 8);
  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      datasetPath: path.resolve(args.input),
      themeKeywords,
      shortlistSize: shortlist.length
    },
    itemCount: ranked.length,
    shortlistCount: shortlist.length,
    hooks: summarizeHooks(shortlist),
    items: ranked,
    shortlist
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved ranked posts to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
