#!/usr/bin/env node

import path from "node:path";
import {
  average,
  cleanString,
  computeRate,
  parseArgs,
  readJson,
  summarizeByKey,
  writeJson
} from "./lib/xhs_common.mjs";

function usage() {
  console.error(
    "Usage: node build_xhs_merchant_report.mjs --profiles <profiles.json> --posts <posts.json> [--comments <comments.json>] [--products <products.json>] [--profile-id <id>] [--output <report.json>]"
  );
}

function bump(map, key) {
  if (!key) {
    return;
  }
  map.set(key, (map.get(key) || 0) + 1);
}

function topEntries(map, limit = 10) {
  return Array.from(map.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

const BILINGUAL_ACCOUNT_TYPE_TERMS = Object.freeze({
  merchant: ["shop", "store", "seller", "店"],
  buyer: ["buyer", "curator", "good finds", "买手", "好物"],
  brand: ["brand", "official", "旗舰", "品牌"],
});

const BILINGUAL_PRODUCT_CATEGORY_TERMS = Object.freeze({
  outerwear: ["hardshell", "shell jacket", "冲锋衣"],
  downwear: ["down", "puffer", "羽绒"],
  bundle: ["set", "bundle", "kit", "套装"],
  footwear: ["shoe", "shoes", "footwear", "鞋"],
});

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function inferAccountType(profile, products) {
  const description = cleanString(profile.description)?.toLowerCase() || "";
  if (products.length >= 8 || includesAny(description, BILINGUAL_ACCOUNT_TYPE_TERMS.merchant)) {
    return "merchant";
  }
  if (products.length >= 3 || includesAny(description, BILINGUAL_ACCOUNT_TYPE_TERMS.buyer)) {
    return "buyer";
  }
  if (includesAny(description, BILINGUAL_ACCOUNT_TYPE_TERMS.brand)) {
    return "brand";
  }
  return "creator";
}

function inferCommerceRole(accountType, productCount) {
  if (accountType === "merchant") {
    return "merchant-led";
  }
  if (accountType === "buyer") {
    return "buyer-led";
  }
  if (productCount > 0) {
    return "mixed";
  }
  return "inspiration-only";
}

function inferPriceBand(price) {
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

function classifyProductTitle(text) {
  const lower = cleanString(text)?.toLowerCase() || "";
  if (!lower) {
    return "general";
  }
  if (includesAny(lower, BILINGUAL_PRODUCT_CATEGORY_TERMS.outerwear)) {
    return "outerwear";
  }
  if (includesAny(lower, BILINGUAL_PRODUCT_CATEGORY_TERMS.downwear)) {
    return "downwear";
  }
  if (includesAny(lower, BILINGUAL_PRODUCT_CATEGORY_TERMS.bundle)) {
    return "bundle";
  }
  if (includesAny(lower, BILINGUAL_PRODUCT_CATEGORY_TERMS.footwear)) {
    return "footwear";
  }
  return "general";
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.profiles || !args.posts) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const profiles = readJson(args.profiles).items || [];
  const posts = readJson(args.posts).items || [];
  const comments = args.comments ? (readJson(args.comments).items || []) : [];
  const products = args.products ? (readJson(args.products).items || []) : [];

  const targetProfile =
    profiles.find((item) => item.profileId === args["profile-id"]) ||
    profiles[0];

  if (!targetProfile) {
    console.error("No profile items found.");
    process.exitCode = 1;
    return;
  }

  const targetProfileId = targetProfile.profileId;
  const targetProfileUrl = cleanString(targetProfile.profileUrl);
  const filteredPosts = posts.filter(
    (item) =>
      (targetProfileId && cleanString(item.authorId) === targetProfileId) ||
      (targetProfileUrl &&
        cleanString(item.authorProfileUrl) === targetProfileUrl),
  );
  const filteredProducts = products.filter((item) => item.ownerProfileId === targetProfileId);
  const postIds = new Set(filteredPosts.map((item) => item.postId).filter(Boolean));
  const postUrls = new Set(
    filteredPosts.map((item) => cleanString(item.postUrl)).filter(Boolean),
  );
  const filteredComments = comments.filter(
    (item) =>
      (!postIds.size || postIds.has(item.postId)) ||
      (!postUrls.size || postUrls.has(cleanString(item.postUrl))),
  );
  const fallbackProducts =
    filteredProducts.length === 0 && products.length > 0 ? products : [];
  const reportProducts = filteredProducts.length > 0 ? filteredProducts : fallbackProducts;

  const commentThemeCounts = new Map();
  const hashtagCounts = new Map();
  const priceBandCounts = new Map();
  const productCategoryCounts = new Map();

  for (const comment of filteredComments) {
    bump(commentThemeCounts, cleanString(comment.commentTheme));
  }
  for (const post of filteredPosts) {
    for (const hashtag of post.hashtags || []) {
      bump(hashtagCounts, hashtag);
    }
  }
  for (const product of reportProducts) {
    bump(priceBandCounts, inferPriceBand(product.price));
    bump(productCategoryCounts, classifyProductTitle(product.title || product.description));
  }

  const engagements = filteredPosts.map((item) => (item.likeCount || 0) + (item.commentCount || 0) + (item.shareCount || 0));
  const engagementRates = engagements
    .map((value) => computeRate(value, targetProfile.followersCount || 0))
    .filter((value) => value !== null);

  const rankedPosts = [...filteredPosts]
    .sort((left, right) =>
      ((right.likeCount || 0) + (right.commentCount || 0) + (right.shareCount || 0)) -
      ((left.likeCount || 0) + (left.commentCount || 0) + (left.shareCount || 0))
    )
    .slice(0, 5)
    .map((item) => ({
      postId: item.postId,
      title: item.title,
      description: item.description,
      postUrl: item.postUrl,
      likeCount: item.likeCount || 0,
      commentCount: item.commentCount || 0,
      shareCount: item.shareCount || 0
    }));

  const rankedProducts = [...reportProducts]
    .sort((left, right) => (right.price || 0) - (left.price || 0))
    .slice(0, 8)
    .map((item) => ({
      productId: item.productId,
      title: item.title,
      price: item.price,
      priceTag: item.priceTag || null,
      stockStatus: item.stockStatus || null,
      productUrl: item.productUrl
    }));

  const accountType = inferAccountType(targetProfile, reportProducts);
  const commerceRole = inferCommerceRole(accountType, reportProducts.length);
  const dataQualityWarnings = [
    filteredPosts.length === 0
      ? "post layer did not join cleanly to the requested profile; report may be incomplete"
      : null,
    filteredProducts.length === 0 && fallbackProducts.length > 0
      ? "product pool came from an explicit vendor-page fallback and was not account-id joined"
      : null,
  ].filter(Boolean);

  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      profilesPath: path.resolve(args.profiles),
      postsPath: path.resolve(args.posts),
      commentsPath: args.comments ? path.resolve(args.comments) : null,
      productsPath: args.products ? path.resolve(args.products) : null
    },
    targetProfileId,
    targetNickname: targetProfile.nickname,
    accountType,
    commerceRole,
    dataQualityWarnings,
    accountSnapshot: {
      followersCount: targetProfile.followersCount || 0,
      followingCount: targetProfile.followingCount || 0,
      likesAndCollectionsCount: targetProfile.likesAndCollectionsCount || 0,
      location: targetProfile.location || null,
      profileUrl: targetProfile.profileUrl || null
    },
    contentSummary: {
      postCount: filteredPosts.length,
      averageEngagementPerPost: average(engagements),
      averageEngagementRate: average(engagementRates),
      topHashtags: topEntries(hashtagCounts, 10),
      topPosts: rankedPosts
    },
    audienceVoice: {
      commentCount: filteredComments.length,
      topCommentThemes: topEntries(commentThemeCounts, 10),
      examples: filteredComments.slice(0, 8).map((item) => ({
        text: item.text,
        commentTheme: item.commentTheme || null,
        ownerNickname: item.ownerNickname || null,
        postUrl: item.postUrl || null
      }))
    },
    productPool: {
      productCount: reportProducts.length,
      joinStatus:
        filteredProducts.length > 0 ? "profile-linked" : fallbackProducts.length > 0
          ? "vendor-page-fallback"
          : "missing",
      topPriceBands: topEntries(priceBandCounts, 10),
      topProductCategories: topEntries(productCategoryCounts, 10),
      topProducts: rankedProducts
    }
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved merchant report to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
