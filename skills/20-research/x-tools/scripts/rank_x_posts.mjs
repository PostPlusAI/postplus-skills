#!/usr/bin/env node

import path from "node:path";
import {
  cleanString,
  parseArgs,
  readJson,
  safeLower,
  writeJson
} from "./lib/x_common.mjs";

function usage() {
  console.error(
    "Usage: node rank_x_posts.mjs --input <normalized-tweets.json> [--query <term>] [--top <n>] [--output <ranking.json>]"
  );
}

function scoreTweet(tweet, queryTerms) {
  let score = 0;
  score += (tweet.likeCount || 0) * 1;
  score += (tweet.replyCount || 0) * 6;
  score += (tweet.retweetCount || 0) * 4;
  score += (tweet.quoteCount || 0) * 5;
  score += Math.min((tweet.viewCount || 0) / 1000, 20);
  score += tweet.isQuote ? 3 : 0;
  score += tweet.isReply ? -6 : 0;
  const text = safeLower(tweet.text);
  if (queryTerms.length && queryTerms.some((term) => text.includes(term))) {
    score += 12;
  }
  if (text.includes("thread") || text.includes("1/")) {
    score += 4;
  }
  return Number(score.toFixed(3));
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
  const top = Number(args.top || 20);
  const queryTerms = String(args.query || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  const ranked = items
    .map((tweet) => ({
      ...tweet,
      engagementScore: scoreTweet(tweet, queryTerms)
    }))
    .sort((left, right) => right.engagementScore - left.engagementScore);

  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      datasetPath: path.resolve(args.input),
      query: cleanString(args.query)
    },
    itemCount: ranked.length,
    shortlistCount: Math.min(top, ranked.length),
    topTweetUrls: ranked.slice(0, top).map((item) => item.tweetUrl).filter(Boolean),
    items: ranked
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved ranked tweets to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
