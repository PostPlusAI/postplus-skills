#!/usr/bin/env node

import path from "node:path";
import {
  parseArgs,
  readDatasetForAnalysis,
  writeJson
} from "./lib/amazon_normalize.mjs";

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

function compactProduct(item) {
  return {
    asin: item.identity.asin,
    title: item.identity.title,
    brand: item.identity.brand,
    productUrl: item.identity.productUrl,
    currentPrice: item.pricing.currentPrice,
    ratingAverage: item.proof.ratingAverage,
    reviewCount: item.proof.reviewCount,
    bestsellerRank: item.proof.bestsellerRank,
    sellerName: item.seller.sellerName
  };
}

function benchmarkScore(item) {
  const reviewCount = item.proof.reviewCount || 0;
  const ratingAverage = item.proof.ratingAverage || 0;
  const bestsellerRank = item.proof.bestsellerRank || 999999;
  const boughtPastMonth = item.proof.boughtPastMonth || 0;
  const price = item.pricing.currentPrice || 0;

  return (
    reviewCount * 1.2 +
    ratingAverage * 100 +
    boughtPastMonth * 0.5 +
    Math.max(0, 1000 - bestsellerRank) * 0.1 +
    Math.max(0, 100 - price)
  );
}

function compactReview(item) {
  return {
    asin: item.identity.asin,
    title: item.review.reviewTitle || item.identity.title,
    rating: item.proof.ratingAverage,
    helpfulVotes: item.proof.helpfulVotes,
    verifiedPurchase: item.review.verifiedPurchase,
    reviewerName: item.review.reviewerName,
    reviewDate: item.review.reviewDate,
    reviewText: item.review.reviewText
  };
}

function detectIssueTags(text) {
  const normalized = String(text || "").toLowerCase();
  const issueMatchers = [
    ["battery", /\bbattery|charge|charging|dies|drain\b/],
    ["quality", /\bcheap|broke|broken|flimsy|defect|defective|poor quality\b/],
    ["shipping", /\bshipping|delivery|arrived|late|package|packaging\b/],
    ["size_fit", /\bsize|fit|small|large|too big|too small\b/],
    ["setup", /\bsetup|install|assembly|instructions|manual\b/],
    ["seller_service", /\bseller|support|service|refund|return|replacement\b/],
    ["misleading", /\bnot as described|misleading|fake|counterfeit|different\b/],
    ["durability", /\bdurable|durability|lasted|stopped working|wear\b/]
  ];

  return issueMatchers
    .filter(([, matcher]) => matcher.test(normalized))
    .map(([key]) => key);
}

function summarizeProducts(items) {
  const prices = [];
  const ratings = [];
  const reviewCounts = [];
  const brandCounts = new Map();
  const sellerCounts = new Map();
  const categoryCounts = new Map();

  for (const item of items) {
    if (typeof item.pricing.currentPrice === "number") {
      prices.push(item.pricing.currentPrice);
    }
    if (typeof item.proof.ratingAverage === "number") {
      ratings.push(item.proof.ratingAverage);
    }
    if (typeof item.proof.reviewCount === "number") {
      reviewCounts.push(item.proof.reviewCount);
    }
    if (item.identity.brand) {
      brandCounts.set(item.identity.brand, (brandCounts.get(item.identity.brand) || 0) + 1);
    }
    if (item.seller.sellerName) {
      sellerCounts.set(item.seller.sellerName, (sellerCounts.get(item.seller.sellerName) || 0) + 1);
    }
    if (item.merchandising.category) {
      categoryCounts.set(
        item.merchandising.category,
        (categoryCounts.get(item.merchandising.category) || 0) + 1
      );
    }
  }

  const topByReviews = [...items]
    .sort((a, b) => (b.proof.reviewCount || 0) - (a.proof.reviewCount || 0))
    .slice(0, 10)
    .map(compactProduct);

  const benchmarkCandidates = [...items]
    .sort((a, b) => benchmarkScore(b) - benchmarkScore(a))
    .slice(0, 10)
    .map((item) => ({
      ...compactProduct(item),
      benchmarkScore: benchmarkScore(item)
    }));

  return {
    itemCount: items.length,
    priceStats: stats(prices),
    ratingStats: stats(ratings),
    reviewCountStats: stats(reviewCounts),
    topBrands: topEntries(brandCounts, 15),
    topSellers: topEntries(sellerCounts, 15),
    topCategories: topEntries(categoryCounts, 15),
    topByReviews,
    benchmarkCandidates
  };
}

function summarizeReviews(items) {
  const ratings = [];
  const helpfulVotes = [];
  const lowRatingReviews = [];
  const issueCounts = new Map();

  for (const item of items) {
    if (typeof item.proof.ratingAverage === "number") {
      ratings.push(item.proof.ratingAverage);
    }
    if (typeof item.proof.helpfulVotes === "number") {
      helpfulVotes.push(item.proof.helpfulVotes);
    }
    if ((item.proof.ratingAverage || 0) <= 3) {
      lowRatingReviews.push(item);
      for (const tag of detectIssueTags(item.review.reviewText || item.review.reviewTitle)) {
        issueCounts.set(tag, (issueCounts.get(tag) || 0) + 1);
      }
    }
  }

  const lowRatingSamples = lowRatingReviews
    .sort((a, b) => (b.proof.helpfulVotes || 0) - (a.proof.helpfulVotes || 0))
    .slice(0, 10)
    .map(compactReview);

  return {
    itemCount: items.length,
    ratingStats: stats(ratings),
    helpfulVoteStats: stats(helpfulVotes),
    lowRatingReviewCount: lowRatingReviews.length,
    topIssueTags: topEntries(issueCounts, 15),
    lowRatingSamples
  };
}

function summarize(dataset) {
  const items = dataset.items || [];
  const productItems = items.filter((item) => item.entityType === "product");
  const reviewItems = items.filter((item) => item.entityType === "review");

  return {
    schemaVersion: "1.0.0",
    analyzedAt: new Date().toISOString(),
    source: dataset.source || {},
    itemCount: items.length,
    productSummary: summarizeProducts(productItems),
    reviewSummary: summarizeReviews(reviewItems)
  };
}

function usage() {
  console.error(
    "Usage: node analyze_amazon_dataset.mjs --input <dataset.json> [--output <summary.json>] [--actor <actor-id>]"
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
