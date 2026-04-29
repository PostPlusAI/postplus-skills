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
    "Usage: node rank_xhs_products.mjs --input <normalized-products.json> [--output <ranking.json>]"
  );
}

function inferProductRole(item) {
  const salesText = safeLower(item.salesText);
  const title = safeLower(item.title);
  if (salesText.includes("已售") || salesText.includes("销量")) {
    return "hero-sku-candidate";
  }
  if (title.includes("套装") || title.includes("组合")) {
    return "bundle";
  }
  if (title.includes("配件") || title.includes("替换")) {
    return "accessory";
  }
  return "catalog";
}

function inferPriceBand(item) {
  const price = item.price;
  if (!Number.isFinite(price)) {
    return "unknown";
  }
  if (price < 50) {
    return "low";
  }
  if (price < 200) {
    return "mid";
  }
  return "high";
}

function scoreProduct(item) {
  let score = 0;
  score += Number.isFinite(item.price) ? 5 : 0;
  score += item.salesText ? 6 : 0;
  score += item.isAvailable === false ? 0 : 2;
  score += item.category ? 2 : 0;
  score += item.brand ? 1 : 0;
  return score;
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

  const ranked = items
    .map((item) => ({
      ...item,
      productRole: inferProductRole(item),
      priceBand: inferPriceBand(item),
      shortlistScore: scoreProduct(item)
    }))
    .sort((left, right) => right.shortlistScore - left.shortlistScore);

  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      datasetPath: path.resolve(args.input)
    },
    itemCount: ranked.length,
    topProductIds: ranked.slice(0, 10).map((item) => item.productId).filter(Boolean),
    items: ranked
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved ranked products to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
