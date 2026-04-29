#!/usr/bin/env node

import path from "node:path";
import {
  cadenceLabel,
  cleanString,
  computeRate,
  parseArgs,
  readJson,
  safeLower,
  toArray,
  uniqueStrings,
  summarizeByUsername,
  writeJson
} from "./lib/tiktok_common.mjs";

function usage() {
  console.error(
    "Usage: node rank_tiktok_accounts.mjs --profiles <normalized-profiles.json> [--videos <normalized-videos.json>] [--output <ranking.json>]"
  );
}

function average(numbers) {
  const values = numbers.filter((value) => Number.isFinite(value));
  if (!values.length) {
    return null;
  }
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3));
}

function inferAccountType(profile, videos) {
  const signature = safeLower(profile.signature);
  const combined = videos.map((item) => safeLower(item.text)).join(" ");
  if (profile.isSeller) return "shop-creator";
  if (signature.includes("ugc") || signature.includes("creator")) return "creator";
  if (signature.includes("agency") || signature.includes("growth")) return "agency";
  if (signature.includes("founder") || signature.includes("building")) return "founder";
  if (combined.includes("tutorial") || combined.includes("how to") || combined.includes("tips")) return "educator";
  if (combined.includes("amazon finds") || combined.includes("shop")) return "commerce";
  return "general";
}

function countMatches(texts, terms) {
  const normalizedTexts = texts.map((text) => safeLower(text)).filter(Boolean);
  const normalizedTerms = terms.map((term) => safeLower(term)).filter(Boolean);
  if (!normalizedTexts.length || !normalizedTerms.length) {
    return 0;
  }

  let matches = 0;
  for (const text of normalizedTexts) {
    if (normalizedTerms.some((term) => text.includes(term))) {
      matches += 1;
    }
  }
  return matches;
}

function detectCreatorType(accountType) {
  if (accountType === "creator" || accountType === "commerce" || accountType === "founder") {
    return "individual_creator";
  }
  if (accountType === "educator") {
    return "educator_consultant";
  }
  if (accountType === "agency") {
    return "aggregator";
  }
  if (accountType === "shop-creator") {
    return "brand_product_account";
  }
  return "unknown";
}

function scoreAccount(row) {
  let score = 0;
  score += Math.min(Math.log10((row.followersCount || 0) + 1) * 8, 24);
  score += Math.min((row.averageEngagementRate || 0) * 1200, 18);
  score += Math.min((row.averageCommentsPerVideo || 0) / 10, 8);
  score += Math.min((row.recentVideosCount || 0) * 1.8, 14);
  score += Math.min((row.matchedContentCount || 0) * 3, 18);
  score += Math.min((row.topicFit || 0) * 18, 18);
  score += Math.min((row.languageFit || 0) * 8, 8);
  score += Math.min((row.graphEvidence?.relatedVideoCount || 0) * 1.5, 10);
  score += row.hasBioLink ? 5 : 0;
  score += row.isSeller ? 2 : 0;
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
  const videosDataset = args.videos ? readJson(args.videos) : { items: [] };
  const videoItems = Array.isArray(videosDataset.items) ? videosDataset.items : [];
  const videosByUsername = summarizeByUsername(videoItems, "authorUsername");
  const targetTerms = uniqueStrings([
    ...toArray(profilesDataset?.input?.searchQueries),
    ...toArray(videosDataset?.input?.searchQueries),
    ...toArray(videosDataset?.input?.keywords),
    ...toArray(videosDataset?.input?.hashtags)
  ]);

  const ranked = profileItems.map((profile) => {
    const username = cleanString(profile.username);
    const videos = username ? videosByUsername.get(username) || [] : [];
    const engagements = videos.map((item) => (item.likeCount || 0) + (item.commentCount || 0) + (item.shareCount || 0));
    const comments = videos.map((item) => item.commentCount || 0);
    const videoTexts = videos.map((item) => item.text || "");
    const matchedQueries = uniqueStrings(videos.flatMap((item) => [item.sourceQuery, item.searchKeyword]));
    const matchedHashtags = uniqueStrings(videos.flatMap((item) => item.hashtags || []));
    const matchedVideoUrls = uniqueStrings(videos.map((item) => item.videoUrl));
    const discoveryPaths = uniqueStrings(videos.map((item) => item.sourceSurface).filter(Boolean));
    const textLanguages = uniqueStrings(videos.map((item) => item.textLanguage).filter(Boolean));
    const topicMatchCount = countMatches(videoTexts, targetTerms);
    const queryMatchCount = countMatches(matchedQueries, targetTerms);
    const hashtagMatchCount = countMatches(matchedHashtags, targetTerms);
    const engagementRates = engagements
      .map((value) => computeRate(value, profile.followersCount || 0))
      .filter((value) => value !== null);
    const topicFitNumerator = topicMatchCount + queryMatchCount + hashtagMatchCount;
    const topicFitDenominator = videos.length + matchedQueries.length + matchedHashtags.length;
    const topicFit = topicFitDenominator > 0
      ? Number(Math.min(topicFitNumerator / topicFitDenominator, 1).toFixed(3))
      : 0;
    const languageFit = textLanguages.length <= 1 && textLanguages.length > 0 ? 1 : textLanguages.length ? 0.6 : 0;
    const relatedVideoCount = videos.filter((item) => item.sourceSurface === "video").length;

    const row = {
      username,
      displayName: cleanString(profile.displayName),
      signature: cleanString(profile.signature),
      profileUrl: cleanString(profile.profileUrl),
      bioLink: cleanString(profile.bioLink),
      followersCount: profile.followersCount || 0,
      followingCount: profile.followingCount || 0,
      likesReceivedCount: profile.likesReceivedCount || 0,
      videoCount: profile.videoCount || 0,
      isVerified: Boolean(profile.isVerified),
      isSeller: Boolean(profile.isSeller),
      hasBioLink: Boolean(cleanString(profile.bioLink)),
      recentVideosCount: videos.length,
      recentPostCadence: cadenceLabel(videos.length),
      averageCommentsPerVideo: average(comments),
      averageEngagementPerVideo: average(engagements),
      averageEngagementRate: average(engagementRates),
      matchedQueries,
      matchedHashtags,
      matchedVideoUrls,
      matchedContentCount: videos.length,
      sourceEvidence: {
        matchedContentCount: videos.length,
        topMatchedThemes: targetTerms.filter((term) => {
          const lowered = safeLower(term);
          return matchedQueries.some((query) => safeLower(query).includes(lowered)) ||
            matchedHashtags.some((tag) => safeLower(tag).includes(lowered)) ||
            videoTexts.some((text) => safeLower(text).includes(lowered));
        }).slice(0, 10),
        discoveryPaths
      },
      graphEvidence: {
        relatedVideoCount
      },
      languageSignals: textLanguages,
      languageFit,
      topicFit,
      accountType: inferAccountType(profile, videos)
    };
    row.creatorType = detectCreatorType(row.accountType);
    row.score = scoreAccount(row);
    return row;
  });

  ranked.sort((left, right) => right.score - left.score);

  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      profilesPath: path.resolve(args.profiles),
      videosPath: args.videos ? path.resolve(args.videos) : null
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
