#!/usr/bin/env node

import path from "node:path";
import {
  parseArgs,
  readDatasetForAnalysis,
  writeJson
} from "./lib/tiktok_shop_normalize.mjs";

function median(values) {
  if (!values.length) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function stats(values) {
  if (!values.length) {
    return {
      count: 0,
      min: null,
      max: null,
      average: null,
      median: null
    };
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    average: total / values.length,
    median: median(values)
  };
}

function topEntries(map, limit = 10) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, value]) => ({ key, value }));
}

function orderScore(item) {
  return item.proof.orders || 0;
}

function reviewScore(item) {
  return item.proof.reviewCount || item.proof.ratingCount || 0;
}

function benchmarkScore(item) {
  const price = item.pricing.currentPrice || item.pricing.priceMin || 0;
  const rating = item.proof.ratingAverage || 0;
  const reviews = item.proof.reviewCount || 0;
  const orders = item.proof.orders || 0;
  return orders * 1.5 + reviews + rating * 100 + Math.max(0, 100 - price);
}

function compactProduct(item) {
  return {
    productId: item.identity.productId,
    title: item.identity.title,
    productUrl: item.identity.productUrl,
    shopName: item.identity.shopName,
    category: item.merchandising.category,
    currentPrice: item.pricing.currentPrice,
    originalPrice: item.pricing.originalPrice,
    orders: item.proof.orders,
    ratingAverage: item.proof.ratingAverage,
    reviewCount: item.proof.reviewCount
  };
}

function summarize(dataset) {
  const items = dataset.items || [];
  const prices = [];
  const orderCounts = [];
  const reviewCounts = [];
  const ratingValues = [];
  const categoryCounts = new Map();
  const shopCounts = new Map();
  const brandCounts = new Map();

  for (const item of items) {
    const price =
      item.pricing.currentPrice ??
      item.pricing.priceMin ??
      item.pricing.priceMax;
    if (typeof price === "number") {
      prices.push(price);
    }

    if (typeof item.proof.orders === "number") {
      orderCounts.push(item.proof.orders);
    }
    if (typeof item.proof.reviewCount === "number") {
      reviewCounts.push(item.proof.reviewCount);
    }
    if (typeof item.proof.ratingAverage === "number") {
      ratingValues.push(item.proof.ratingAverage);
    }

    if (item.merchandising.category) {
      categoryCounts.set(
        item.merchandising.category,
        (categoryCounts.get(item.merchandising.category) || 0) + 1
      );
    }
    if (item.identity.shopName) {
      shopCounts.set(
        item.identity.shopName,
        (shopCounts.get(item.identity.shopName) || 0) + 1
      );
    }
    if (item.identity.brand) {
      brandCounts.set(
        item.identity.brand,
        (brandCounts.get(item.identity.brand) || 0) + 1
      );
    }
  }

  const topByOrders = [...items]
    .sort((a, b) => orderScore(b) - orderScore(a))
    .slice(0, 10)
    .map(compactProduct);
  const topByReviews = [...items]
    .sort((a, b) => reviewScore(b) - reviewScore(a))
    .slice(0, 10)
    .map(compactProduct);
  const benchmarkCandidates = [...items]
    .sort((a, b) => benchmarkScore(b) - benchmarkScore(a))
    .slice(0, 10)
    .map((item) => ({
      ...compactProduct(item),
      benchmarkScore: benchmarkScore(item)
    }));

  const pricedItems = prices.length;
  const discountedItems = items.filter((item) => {
    const currentPrice = item.pricing.currentPrice;
    const originalPrice = item.pricing.originalPrice;
    return (
      typeof currentPrice === "number" &&
      typeof originalPrice === "number" &&
      originalPrice > currentPrice
    );
  }).length;

  return {
    schemaVersion: "1.0.0",
    analyzedAt: new Date().toISOString(),
    source: dataset.source || {},
    itemCount: items.length,
    coverage: {
      pricedItems,
      discountedItems,
      itemsWithOrders: orderCounts.length,
      itemsWithReviews: reviewCounts.length,
      itemsWithRatings: ratingValues.length
    },
    priceStats: stats(prices),
    orderStats: stats(orderCounts),
    reviewStats: stats(reviewCounts),
    ratingStats: stats(ratingValues),
    topCategories: topEntries(categoryCounts, 15),
    topShops: topEntries(shopCounts, 15),
    topBrands: topEntries(brandCounts, 15),
    topByOrders,
    topByReviews,
    benchmarkCandidates
  };
}

function usage() {
  console.error(
    "Usage: node analyze_tiktok_shop_dataset.mjs --input <dataset.json> [--output <summary.json>] [--actor <actor-id>]"
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) {
    usage();
    process.exitCode = 1;
    return;
  }

  const dataset = readDatasetForAnalysis(args.input, args.actor || null);
  const summary = summarize(dataset);

  if (args.output) {
    writeJson(args.output, summary);
    console.log(`Saved summary to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(summary, null, 2));
}

main();
