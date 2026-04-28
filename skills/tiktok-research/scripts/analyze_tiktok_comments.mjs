#!/usr/bin/env node

import {
  normalizeDataset,
  parseArgs,
  readJson,
  writeJson
} from "./lib/tiktok_common.mjs";

const STOPWORDS = new Set([
  "the", "and", "for", "that", "this", "you", "your", "with", "its", "just", "have",
  "what", "how", "are", "was", "but", "not", "from", "they", "them", "about", "would",
  "there", "their", "when", "where", "which", "into", "than", "then", "like", "can",
  "get", "got", "all", "out", "too", "why", "who", "did", "does", "has", "had", "use",
  "using", "please", "need", "want", "more", "make", "made", "because", "really"
]);

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function topEntries(map, limit = 20) {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([key, value]) => ({ key, value }));
}

function classifyComment(text) {
  const lower = String(text || "").toLowerCase();
  if (/\?/.test(lower) || /\bhow\b|\bwhat\b|\bwhere\b|\blink\b|\bname\b/.test(lower)) {
    return "question_or_info_request";
  }
  if (/\bneed this\b|\bwant this\b|\bsold\b|\btrying this\b|\bgame changer\b|\blife saver\b/.test(lower)) {
    return "high_intent_positive";
  }
  if (/\btoo expensive\b|\bpay\b|\bprivacy\b|\bscam\b|\bdoesn't work\b|\bnot work\b/.test(lower)) {
    return "objection_or_risk";
  }
  if (/\bthank you\b|\bthanks\b|\bhelpful\b|\buseful\b/.test(lower)) {
    return "gratitude";
  }
  return "general_reaction";
}

function summarize(dataset) {
  const normalized = dataset.items.filter((item) => item.recordType === "comment" && item.text);
  const wordCounts = new Map();
  const classCounts = new Map();

  for (const item of normalized) {
    const klass = classifyComment(item.text);
    classCounts.set(klass, (classCounts.get(klass) || 0) + 1);
    for (const token of tokenize(item.text)) {
      wordCounts.set(token, (wordCounts.get(token) || 0) + 1);
    }
  }

  const topComments = [...normalized]
    .sort((left, right) => ((right.likeCount || 0) + (right.replyCount || 0)) - ((left.likeCount || 0) + (left.replyCount || 0)))
    .slice(0, 15);

  return {
    itemCount: normalized.length,
    topWords: topEntries(wordCounts, 25),
    commentTypes: topEntries(classCounts, 10),
    topComments
  };
}

function usage() {
  console.error("Usage: node analyze_tiktok_comments.mjs --input <comments.json> [--output <summary.json>]");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const raw = readJson(args.input);
  const dataset = raw?.platform === "tiktok" && raw?.datasetType === "comments"
    ? raw
    : normalizeDataset(raw, { datasetType: "comments", inputPath: args.input });
  const summary = summarize(dataset);

  if (args.output) {
    writeJson(args.output, summary);
    console.log(`Saved summary to ${args.output}`);
    return;
  }

  console.log(JSON.stringify(summary, null, 2));
}

main();
