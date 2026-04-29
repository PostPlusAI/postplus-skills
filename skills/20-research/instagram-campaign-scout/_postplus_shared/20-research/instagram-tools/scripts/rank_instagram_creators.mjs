#!/usr/bin/env node

import path from "node:path";
import {
  cleanString,
  computeRate,
  parseArgs,
  readJson,
  safeLower,
  summarizeByUsername,
  toArray,
  uniqueStrings,
  writeJson
} from "./lib/instagram_common.mjs";

function usage() {
  console.error(
    "Usage: node rank_instagram_creators.mjs --profiles <normalized-profiles.json> [--content <normalized-posts.json>] [--candidates <candidate-usernames.json>] [--route <route>] [--shortlist-size 20] [--output <ranking.json>]"
  );
}

function average(numbers) {
  const values = numbers.filter((value) => Number.isFinite(value));
  if (!values.length) {
    return null;
  }
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(6));
}

function detectCreatorType(profile, posts) {
  const bio = safeLower(profile.biography);
  const category = safeLower(profile.category);
  const text = posts
    .map((item) => [item.caption, ...(Array.isArray(item.hashtags) ? item.hashtags : [])].filter(Boolean).join(" "))
    .join(" ")
    .toLowerCase();

  if (
    bio.includes("coach") ||
    bio.includes("consultant") ||
    bio.includes("mentor") ||
    bio.includes("educator") ||
    text.includes("tutorial") ||
    text.includes("how to")
  ) {
    return "educator_consultant";
  }

  if (
    bio.includes("shop") ||
    bio.includes("store") ||
    bio.includes("app") ||
    bio.includes("brand") ||
    category.includes("shopping") ||
    category.includes("brand")
  ) {
    return "brand_product_account";
  }

  if (
    bio.includes("meme") ||
    bio.includes("media") ||
    text.includes("meme")
  ) {
    return "media_meme";
  }

  if (
    bio.includes("creator") ||
    bio.includes("ugc") ||
    bio.includes("influencer") ||
    bio.includes("student") ||
    bio.includes("founder")
  ) {
    return "individual_creator";
  }

  if (text.includes("top 5") || text.includes("best tools") || text.includes("deals")) {
    return "aggregator";
  }

  return "unknown";
}

function extractEmail(text) {
  const match = String(text || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : null;
}

function topicFit(candidate, posts) {
  const terms = uniqueStrings([
    ...toArray(candidate?.matchedHashtags),
    ...toArray(candidate?.topMatchedThemes)
  ]).map((entry) => safeLower(entry));

  if (!terms.length) {
    return posts.length ? 0.35 : 0;
  }

  const texts = posts.map((item) => safeLower([
    cleanString(item.caption),
    ...(Array.isArray(item.hashtags) ? item.hashtags : []),
    ...(Array.isArray(item.mentions) ? item.mentions : [])
  ].filter(Boolean).join(" ")));

  let hits = 0;
  for (const term of terms) {
    if (texts.some((text) => text.includes(term))) {
      hits += 1;
    }
  }

  const score = Math.min(hits / Math.max(terms.length, 1), 1);
  return Number(score.toFixed(3));
}

function audienceFit(profile, posts) {
  const text = safeLower([
    profile.biography,
    ...posts.map((item) => item.caption)
  ].filter(Boolean).join(" "));

  let score = 0;
  if (text.includes("student") || text.includes("study")) score += 0.3;
  if (text.includes("founder") || text.includes("creator") || text.includes("marketer")) score += 0.2;
  if (text.includes("productivity") || text.includes("workflow") || text.includes("tool")) score += 0.25;
  if (posts.length >= 4) score += 0.15;
  if (cleanString(profile.website)) score += 0.1;
  return Number(Math.min(score, 1).toFixed(3));
}

function scoreCreator(row) {
  let score = 0;
  score += Math.min(Math.log10((row.followersCount || 0) + 1) * 10, 30);
  score += Math.min((row.engagementRateApprox || 0) * 1200, 20);
  score += Math.min((row.recentContentCount || 0) * 2, 16);
  score += Math.min((row.sourceEvidence?.matchedContentCount || 0) * 4, 20);
  score += Math.min((row.topicFit || 0) * 18, 18);
  score += Math.min((row.audienceFit || 0) * 12, 12);
  score += Math.min((row.discoveryPathDiversity || 0) * 3, 9);
  score += row.contactSignals?.email ? 5 : 0;
  score += row.contactSignals?.website ? 2 : 0;
  if (row.creatorType === "individual_creator") score += 4;
  if (row.creatorType === "educator_consultant") score += 3;
  if (row.creatorType === "brand_product_account") score -= 6;
  return Number(score.toFixed(3));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.profiles) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const route = cleanString(args.route) || "content-first";
  const shortlistSize = Number(args["shortlist-size"] || 20);
  const profilesDataset = readJson(args.profiles);
  const profileItems = Array.isArray(profilesDataset.items) ? profilesDataset.items : [];
  const contentDataset = args.content ? readJson(args.content) : { items: [] };
  const contentItems = Array.isArray(contentDataset.items) ? contentDataset.items : [];
  const candidatesDataset = args.candidates ? readJson(args.candidates) : { items: [] };
  const candidateItems = Array.isArray(candidatesDataset.items) ? candidatesDataset.items : [];

  const contentByUsername = summarizeByUsername(contentItems, "ownerUsername");
  const candidatesByUsername = new Map(
    candidateItems
      .map((item) => [cleanString(item.username), item])
      .filter(([username]) => username)
  );

  const ranked = profileItems.map((profile) => {
    const username = cleanString(profile.username);
    const posts = username ? contentByUsername.get(username) || [] : [];
    const candidate = username ? candidatesByUsername.get(username) || null : null;
    const likes = posts.map((item) => item.likeCount || 0);
    const comments = posts.map((item) => item.commentCount || 0);
    const views = posts.map((item) => item.viewCount || 0).filter((value) => Number.isFinite(value) && value > 0);
    const engagements = posts.map((item) => (item.likeCount || 0) + (item.commentCount || 0));
    const engagementRates = engagements
      .map((value) => computeRate(value, profile.followersCount || 0))
      .filter((value) => value !== null);

    const creatorType = detectCreatorType(profile, posts);
    const row = {
      platform: "instagram",
      username,
      displayName: cleanString(profile.fullName),
      profileUrl: cleanString(profile.profileUrl),
      followersCount: profile.followersCount || 0,
      creatorType,
      route: candidate?.route || route,
      topicFit: topicFit(candidate, posts),
      audienceFit: audienceFit(profile, posts),
      contactSignals: {
        email: extractEmail(profile.biography),
        website: cleanString(profile.website),
        bioLink: cleanString(profile.website),
        dmOpen: null
      },
      sourceEvidence: {
        matchedContentCount: candidate?.matchedContentCount || posts.length,
        topMatchedThemes: uniqueStrings([
          ...toArray(candidate?.topMatchedThemes),
          ...posts.flatMap((item) => Array.isArray(item.hashtags) ? item.hashtags : [])
        ]).slice(0, 10),
        notes: uniqueStrings([
          candidate?.sourceSurfaces?.length ? `source-surfaces:${candidate.sourceSurfaces.join(",")}` : null,
          candidate?.targetUsernames?.length ? `tagged-targets:${candidate.targetUsernames.join(",")}` : null
        ])
      },
      engagementRateApprox: average(engagementRates),
      recentContentCount: posts.length,
      averageLikesPerPost: average(likes),
      averageCommentsPerPost: average(comments),
      averageViewsPerPost: average(views),
      discoveryPathDiversity: uniqueStrings(candidate?.sourceSurfaces || []).length,
      platformMetrics: {
        postsCount: profile.postsCount || 0,
        followsCount: profile.followsCount || 0,
        recentContentCount: posts.length
      }
    };
    row.score = scoreCreator(row);
    return row;
  }).sort((left, right) => right.score - left.score);

  const shortlist = ranked.slice(0, Number.isFinite(shortlistSize) ? shortlistSize : 20);
  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      profilesPath: path.resolve(args.profiles),
      contentPath: args.content ? path.resolve(args.content) : null,
      candidatesPath: args.candidates ? path.resolve(args.candidates) : null,
      route
    },
    itemCount: ranked.length,
    shortlistCount: shortlist.length,
    topUsernames: shortlist.map((item) => item.username).filter(Boolean),
    research_pool: ranked,
    shortlist
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved ranked creators to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
