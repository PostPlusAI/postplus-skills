#!/usr/bin/env node

import path from "node:path";
import {
  cleanString,
  parseArgs,
  readJson,
  safeLower,
  summarizeByUsername,
  writeJson
} from "./lib/x_common.mjs";

function usage() {
  console.error(
    "Usage: node rank_x_accounts.mjs --profiles <normalized-profiles.json> [--tweets <normalized-tweets.json>] [--output <ranking.json>]"
  );
}

function average(numbers) {
  const values = numbers.filter((value) => Number.isFinite(value));
  if (!values.length) {
    return null;
  }
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3));
}

function inferAccountType(profile, tweets) {
  const bio = safeLower(profile.description);
  const combined = tweets.map((item) => safeLower(item.text)).join(" ");
  if (bio.includes("founder") || bio.includes("building") || bio.includes("cofounder")) {
    return "founder";
  }
  if (bio.includes("agency") || bio.includes("growth") || bio.includes("ugc")) {
    return "agency";
  }
  if (bio.includes("investor") || bio.includes("vc")) {
    return "investor";
  }
  if (bio.includes("creator") || bio.includes("youtuber") || bio.includes("writer")) {
    return "creator";
  }
  if (bio.includes("brand") || bio.includes("official") || combined.includes("launch")) {
    return "brand";
  }
  if (bio.includes("operator") || bio.includes("marketer") || bio.includes("builder")) {
    return "operator";
  }
  if (combined.includes("thread") || combined.includes("1/")) {
    return "thread-account";
  }
  return "general";
}

function scoreAccount(row) {
  let score = 0;
  score += Math.min(Math.log10((row.followersCount || 0) + 1) * 14, 60);
  score += Math.min((row.averageEngagement || 0) / 150, 20);
  score += Math.min((row.averageReplies || 0) / 12, 10);
  score += Math.min((row.recentTweetsCount || 0) * 1.5, 10);
  score += row.isVerified ? 6 : 0;
  score += row.hasEmail ? 4 : 0;
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
  const tweetsDataset = args.tweets ? readJson(args.tweets) : { items: [] };
  const tweetItems = Array.isArray(tweetsDataset.items) ? tweetsDataset.items : [];
  const tweetsByUsername = summarizeByUsername(tweetItems, "authorUsername");

  const ranked = profileItems.map((profile) => {
    const username = cleanString(profile.username);
    const tweets = username ? tweetsByUsername.get(username) || [] : [];
    const engagements = tweets.map((item) => (item.likeCount || 0) + (item.replyCount || 0) + (item.retweetCount || 0));
    const replies = tweets.map((item) => item.replyCount || 0);

    const row = {
      username,
      displayName: cleanString(profile.displayName),
      description: cleanString(profile.description),
      profileUrl: cleanString(profile.profileUrl),
      followersCount: profile.followersCount || 0,
      followingCount: profile.followingCount || 0,
      statusesCount: profile.statusesCount || 0,
      listedCount: profile.listedCount || 0,
      isVerified: Boolean(profile.isVerified),
      professionalCategory: cleanString(profile.professionalCategory),
      location: cleanString(profile.location),
      hasEmail: Boolean(cleanString(profile.email)),
      recentTweetsCount: tweets.length,
      averageEngagement: average(engagements),
      averageReplies: average(replies),
      accountType: inferAccountType(profile, tweets)
    };
    row.score = scoreAccount(row);
    return row;
  });

  ranked.sort((left, right) => right.score - left.score);

  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      profilesPath: path.resolve(args.profiles),
      tweetsPath: args.tweets ? path.resolve(args.tweets) : null
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
