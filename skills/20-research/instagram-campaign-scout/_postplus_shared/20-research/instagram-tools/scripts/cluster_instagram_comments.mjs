#!/usr/bin/env node

import path from "node:path";
import {
  cleanString,
  parseArgs,
  readJson,
  safeLower,
  writeJson
} from "./lib/instagram_common.mjs";

function usage() {
  console.error(
    "Usage: node cluster_instagram_comments.mjs --input <normalized-comments.json> [--output <clusters.json>]"
  );
}

const BUCKETS = [
  {
    key: "purchase-intent",
    patterns: ["where can i buy", "where do i buy", "need this", "i want this", "buy", "price", "link", "ordered", "shipping"]
  },
  {
    key: "objection",
    patterns: ["too expensive", "expensive", "scam", "fake", "not worth", "doesn't work", "does not work", "bad", "hate"]
  },
  {
    key: "question",
    patterns: ["how", "what", "where", "when", "why", "?"]
  },
  {
    key: "request-for-details",
    patterns: ["tutorial", "part 2", "details", "ingredients", "shade", "name please", "link please", "routine"]
  },
  {
    key: "praise",
    patterns: ["love", "amazing", "so good", "beautiful", "wow", "need this", "obsessed", "perfect"]
  }
];

function classifyComment(text) {
  const normalized = safeLower(text);
  if (!normalized) {
    return "low-signal-meme";
  }
  for (const bucket of BUCKETS) {
    if (bucket.patterns.some((pattern) => normalized.includes(pattern))) {
      return bucket.key;
    }
  }
  if (normalized.length < 8 || ["lol", "lmao", "omg", "wow", "haha"].includes(normalized)) {
    return "low-signal-meme";
  }
  return "general-feedback";
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
  const clusters = new Map();

  for (const comment of items) {
    const bucket = classifyComment(comment.text);
    if (!clusters.has(bucket)) {
      clusters.set(bucket, {
        bucket,
        count: 0,
        examples: [],
        usernames: new Set(),
        postUrls: new Set()
      });
    }
    const entry = clusters.get(bucket);
    entry.count += 1;
    if (entry.examples.length < 10 && cleanString(comment.text)) {
      entry.examples.push({
        text: cleanString(comment.text),
        ownerUsername: cleanString(comment.ownerUsername),
        postUrl: cleanString(comment.postUrl),
        likeCount: comment.likeCount || 0
      });
    }
    if (cleanString(comment.ownerUsername)) {
      entry.usernames.add(cleanString(comment.ownerUsername));
    }
    if (cleanString(comment.postUrl)) {
      entry.postUrls.add(cleanString(comment.postUrl));
    }
  }

  const outputClusters = Array.from(clusters.values())
    .map((entry) => ({
      bucket: entry.bucket,
      count: entry.count,
      uniqueUserCount: entry.usernames.size,
      uniquePostCount: entry.postUrls.size,
      examples: entry.examples
    }))
    .sort((left, right) => right.count - left.count);

  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      datasetPath: path.resolve(args.input)
    },
    itemCount: items.length,
    clusterCount: outputClusters.length,
    items: items.map((comment) => ({
      ...comment,
      commentTheme: classifyComment(comment.text)
    })),
    clusters: outputClusters
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved comment clusters to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
