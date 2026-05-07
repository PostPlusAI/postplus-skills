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
    "Usage: node rank_xhs_accounts.mjs --profiles <normalized-profiles.json> [--posts <normalized-posts.json>] [--products <normalized-products.json>] [--output <ranking.json>]"
  );
}

const BILINGUAL_ACCOUNT_TYPE_TERMS = Object.freeze({
  merchant: ["shop", "store", "seller", "店"],
  buyer: ["buyer", "curator", "good finds", "买手", "好物"],
  brand: ["brand", "official", "旗舰", "品牌"],
});

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function inferAccountType(profile, posts, products) {
  const description = cleanString(profile.description)?.toLowerCase() || "";
  const productCount = products.length;
  const totalPosts = posts.length;

  if (productCount >= 8 || includesAny(description, BILINGUAL_ACCOUNT_TYPE_TERMS.merchant)) {
    return "merchant";
  }
  if (productCount >= 3 || includesAny(description, BILINGUAL_ACCOUNT_TYPE_TERMS.buyer)) {
    return "buyer";
  }
  if (includesAny(description, BILINGUAL_ACCOUNT_TYPE_TERMS.brand)) {
    return "brand";
  }
  if (totalPosts >= 5) {
    return "creator";
  }
  return "general";
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

function scoreAccount(row) {
  let score = 0;
  score += Math.min(Math.log10((row.followersCount || 0) + 1) * 12, 55);
  score += Math.min((row.averageEngagementRate || 0) * 1200, 25);
  score += Math.min((row.averageCommentsPerPost || 0) / 8, 10);
  score += Math.min((row.recentPostsCount || 0) * 1.5, 10);
  score += Math.min((row.productCount || 0) * 0.8, 10);
  return Number(score.toFixed(3));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.profiles) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const profilesDataset = readJson(args.profiles);
  const profileItems = Array.isArray(profilesDataset.items) ? profilesDataset.items : [];
  const postsDataset = args.posts ? readJson(args.posts) : { items: [] };
  const productsDataset = args.products ? readJson(args.products) : { items: [] };
  const postItems = Array.isArray(postsDataset.items) ? postsDataset.items : [];
  const productItems = Array.isArray(productsDataset.items) ? productsDataset.items : [];

  const postsByAuthorId = summarizeByKey(postItems, "authorId");
  const productsByOwnerId = summarizeByKey(productItems, "ownerProfileId");

  const ranked = profileItems.map((profile) => {
    const profileId = cleanString(profile.profileId);
    const posts = profileId ? postsByAuthorId.get(profileId) || [] : [];
    const products = profileId ? productsByOwnerId.get(profileId) || [] : [];
    const likes = posts.map((item) => item.likeCount || 0);
    const comments = posts.map((item) => item.commentCount || 0);
    const engagements = posts.map((item) => (item.likeCount || 0) + (item.commentCount || 0) + (item.shareCount || 0));
    const engagementRates = engagements
      .map((value) => computeRate(value, profile.followersCount || 0))
      .filter((value) => value !== null);

    const accountType = inferAccountType(profile, posts, products);
    const row = {
      profileId,
      nickname: cleanString(profile.nickname),
      redId: cleanString(profile.redId),
      followersCount: profile.followersCount || 0,
      followingCount: profile.followingCount || 0,
      likesAndCollectionsCount: profile.likesAndCollectionsCount || 0,
      location: cleanString(profile.location),
      profileUrl: cleanString(profile.profileUrl),
      recentPostsCount: posts.length,
      productCount: products.length,
      averageLikesPerPost: average(likes),
      averageCommentsPerPost: average(comments),
      averageEngagementPerPost: average(engagements),
      averageEngagementRate: average(engagementRates),
      accountType,
      commerceRole: inferCommerceRole(accountType, products.length)
    };
    row.score = scoreAccount(row);
    return row;
  });

  ranked.sort((left, right) => right.score - left.score);

  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      profilesPath: path.resolve(args.profiles),
      postsPath: args.posts ? path.resolve(args.posts) : null,
      productsPath: args.products ? path.resolve(args.products) : null
    },
    itemCount: ranked.length,
    topProfiles: ranked.slice(0, 10).map((item) => item.nickname).filter(Boolean),
    items: ranked
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved ranked accounts to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
