#!/usr/bin/env node

import path from "node:path";
import {
  cleanString,
  computeRate,
  parseArgs,
  readJson,
  summarizeByUsername,
  writeJson
} from "./lib/instagram_common.mjs";

function usage() {
  console.error(
    "Usage: node rank_instagram_accounts.mjs --profiles <normalized-profiles.json> [--posts <normalized-posts.json>] [--output <ranking.json>]"
  );
}

function average(numbers) {
  const values = numbers.filter((value) => Number.isFinite(value));
  if (!values.length) {
    return null;
  }
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3));
}

function scoreAccount(row) {
  let score = 0;
  score += Math.min(Math.log10((row.followersCount || 0) + 1) * 12, 60);
  score += Math.min((row.averageEngagementRate || 0) * 1200, 25);
  score += Math.min((row.averageCommentsPerPost || 0) / 8, 10);
  score += Math.min((row.recentPostsCount || 0) * 1.5, 10);
  score += row.isVerified ? 5 : 0;
  return Number(score.toFixed(3));
}

function inferAccountType(profile, posts) {
  const bio = cleanString(profile.biography)?.toLowerCase() || "";
  const category = cleanString(profile.category)?.toLowerCase() || "";
  const captionText = posts.map((item) => cleanString(item.caption)?.toLowerCase() || "").join(" ");

  if (bio.includes("shop") || bio.includes("store") || category.includes("shopping")) {
    return "store";
  }
  if (bio.includes("founder") || bio.includes("brand") || category.includes("brand")) {
    return "brand";
  }
  if (bio.includes("meme") || captionText.includes("meme")) {
    return "meme-page";
  }
  if (bio.includes("creator") || bio.includes("ugc") || bio.includes("influencer")) {
    return "creator";
  }
  return "general";
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
  const postItems = Array.isArray(postsDataset.items) ? postsDataset.items : [];
  const postsByUsername = summarizeByUsername(postItems, "ownerUsername");

  const ranked = profileItems.map((profile) => {
    const username = cleanString(profile.username);
    const posts = username ? postsByUsername.get(username) || [] : [];
    const likes = posts.map((item) => item.likeCount || 0);
    const comments = posts.map((item) => item.commentCount || 0);
    const engagements = posts.map((item) => (item.likeCount || 0) + (item.commentCount || 0));
    const engagementRates = engagements
      .map((value) => computeRate(value, profile.followersCount || 0))
      .filter((value) => value !== null);

    const row = {
      username,
      fullName: cleanString(profile.fullName),
      followersCount: profile.followersCount || 0,
      followsCount: profile.followsCount || 0,
      postsCount: profile.postsCount || 0,
      isVerified: Boolean(profile.isVerified),
      category: cleanString(profile.category),
      website: cleanString(profile.website),
      profileUrl: cleanString(profile.profileUrl),
      recentPostsCount: posts.length,
      averageLikesPerPost: average(likes),
      averageCommentsPerPost: average(comments),
      averageEngagementPerPost: average(engagements),
      averageEngagementRate: average(engagementRates),
      accountType: inferAccountType(profile, posts)
    };
    row.score = scoreAccount(row);
    return row;
  });

  ranked.sort((left, right) => right.score - left.score);

  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      profilesPath: path.resolve(args.profiles),
      postsPath: args.posts ? path.resolve(args.posts) : null
    },
    itemCount: ranked.length,
    topUsernames: ranked.slice(0, 10).map((item) => item.username).filter(Boolean),
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
