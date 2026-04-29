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
    "Usage: node cluster_x_bios_and_posts.mjs [--profiles <profiles.json>] [--tweets <tweets.json>] [--output <clusters.json>]"
  );
}

const BUCKETS = [
  {
    key: "builder-operator",
    patterns: ["founder", "building", "operator", "marketer", "growth", "launch", "pipeline", "agency"]
  },
  {
    key: "creator-education",
    patterns: ["creator", "writer", "newsletter", "thread", "tutorial", "explained", "guide", "tips"]
  },
  {
    key: "pain-and-objection",
    patterns: ["hate", "annoying", "problem", "pain", "manual", "too slow", "frustrating", "switching tabs"]
  },
  {
    key: "tool-discovery",
    patterns: ["tool", "stack", "workflow", "ai tool", "automation", "prompt", "assistant", "copilot"]
  },
  {
    key: "proof-and-credibility",
    patterns: ["case study", "results", "grew", "mrr", "revenue", "customers", "benchmark", "tested"]
  }
];

function classify(text) {
  const normalized = safeLower(text);
  if (!normalized) {
    return "low-signal";
  }
  for (const bucket of BUCKETS) {
    if (bucket.patterns.some((pattern) => normalized.includes(pattern))) {
      return bucket.key;
    }
  }
  return "general";
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || (!args.profiles && !args.tweets)) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const profiles = args.profiles ? (readJson(args.profiles).items || []) : [];
  const tweets = args.tweets ? (readJson(args.tweets).items || []) : [];
  const entries = [];

  for (const profile of profiles) {
    entries.push({
      sourceType: "profile",
      username: cleanString(profile.username),
      text: cleanString(profile.description),
      profileUrl: cleanString(profile.profileUrl)
    });
  }
  for (const tweet of tweets) {
    entries.push({
      sourceType: "tweet",
      username: cleanString(tweet.authorUsername),
      text: cleanString(tweet.text),
      tweetUrl: cleanString(tweet.tweetUrl)
    });
  }

  const clusters = new Map();
  const labeled = entries.map((entry) => {
    const bucket = classify(entry.text);
    if (!clusters.has(bucket)) {
      clusters.set(bucket, {
        bucket,
        count: 0,
        examples: []
      });
    }
    const cluster = clusters.get(bucket);
    cluster.count += 1;
    if (cluster.examples.length < 10 && cleanString(entry.text)) {
      cluster.examples.push(entry);
    }
    return {
      ...entry,
      languageTheme: bucket
    };
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      profilesPath: args.profiles ? path.resolve(args.profiles) : null,
      tweetsPath: args.tweets ? path.resolve(args.tweets) : null
    },
    itemCount: labeled.length,
    clusterCount: clusters.size,
    items: labeled,
    clusters: Array.from(clusters.values()).sort((left, right) => right.count - left.count)
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved language clusters to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
