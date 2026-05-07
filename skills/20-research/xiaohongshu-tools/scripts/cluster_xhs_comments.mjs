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
    "Usage: node cluster_xhs_comments.mjs --input <normalized-comments.json> [--output <clusters.json>]"
  );
}

const BUCKETS = [
  {
    key: "purchase-intent",
    patterns: ["price", "how much", "where to buy", "buy link", "want to buy", "link", "多少钱", "怎么买", "求链接", "想买", "有链接", "在哪买", "怎么买到", "链接"]
  },
  {
    key: "objection",
    patterns: ["too expensive", "not worth it", "overpriced", "average", "avoid", "fake", "太贵", "不值", "智商税", "一般", "避雷", "踩雷", "鸡肋", "假的"]
  },
  {
    key: "question",
    patterns: ["how", "why", "what", "?", "？", "怎么", "为啥", "为什么", "吗"]
  },
  {
    key: "request-for-details",
    patterns: ["tutorial please", "list please", "model number", "brand", "store", "details", "link please", "求教程", "求清单", "求型号", "求品牌", "求店铺", "细节"]
  },
  {
    key: "praise",
    patterns: ["love it", "looks good", "impressive", "nice", "premium", "want it", "种草", "好看", "喜欢", "绝了", "太香了", "不错", "高级", "厉害"]
  }
];

const BILINGUAL_LOW_SIGNAL_COMMENTS = Object.freeze([
  "lol", "haha", "here", "following", "哈哈", "笑死", "6", "来了", "蹲",
]);

function classifyComment(text) {
  const normalized = safeLower(text);
  if (!normalized) {
    return "low-signal";
  }
  for (const bucket of BUCKETS) {
    if (bucket.patterns.some((pattern) => normalized.includes(pattern))) {
      return bucket.key;
    }
  }
  if (normalized.length < 4 || BILINGUAL_LOW_SIGNAL_COMMENTS.includes(normalized)) {
    return "low-signal";
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
        authors: new Set(),
        posts: new Set()
      });
    }
    const entry = clusters.get(bucket);
    entry.count += 1;
    if (entry.examples.length < 10 && cleanString(comment.text)) {
      entry.examples.push({
        text: cleanString(comment.text),
        ownerNickname: cleanString(comment.ownerNickname),
        postUrl: cleanString(comment.postUrl),
        likeCount: comment.likeCount || 0
      });
    }
    if (cleanString(comment.ownerNickname)) {
      entry.authors.add(cleanString(comment.ownerNickname));
    }
    if (cleanString(comment.postUrl)) {
      entry.posts.add(cleanString(comment.postUrl));
    }
  }

  const outputClusters = Array.from(clusters.values())
    .map((entry) => ({
      bucket: entry.bucket,
      count: entry.count,
      uniqueAuthorCount: entry.authors.size,
      uniquePostCount: entry.posts.size,
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
