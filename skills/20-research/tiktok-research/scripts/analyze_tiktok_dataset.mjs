#!/usr/bin/env node

import {
  cleanString,
  normalizeDataset,
  parseArgs,
  readJson,
  writeJson
} from "./lib/tiktok_common.mjs";

function topEntries(map, limit = 10) {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([key, value]) => ({ key, value }));
}

function firstLine(text) {
  return String(text || "").split(/\n+/)[0].trim().slice(0, 120);
}

function classifyStructure(text) {
  const lower = String(text || "").toLowerCase();
  if (/\bbefore\b|\bafter\b|\bvs\b/.test(lower)) {
    return "before_after";
  }
  if (/\bpov\b|\bwhen you\b/.test(lower)) {
    return "pov_relatable";
  }
  if (/\bhow to\b|\bstop\b|\btutorial\b|\btip\b|\btips\b|\bguide\b/.test(lower)) {
    return "tutorial_problem_solution";
  }
  if (/\b\d+\b.*\btools\b|\b\d+\b.*\bways\b|\btop \d+\b|\bpart \d+\b/.test(lower)) {
    return "listicle_series";
  }
  if (/\bgmail\b|\bnotion\b|\bworkflow\b|\bautomation\b|\bwithout leaving\b|\binside\b/.test(lower)) {
    return "workflow_demo";
  }
  return "general_showcase";
}

function normalizeIntoVideos(dataset) {
  if (dataset.datasetType === "videos") {
    return dataset.items;
  }

  if (dataset.datasetType === "profiles" || dataset.datasetType === "user-search") {
    return dataset.items.map((item) => ({
      recordType: "video",
      videoId: item.profileId,
      authorUsername: item.username,
      authorDisplayName: item.displayName,
      text: item.signature || "",
      hashtags: [],
      mentions: [],
      likeCount: item.likesReceivedCount || 0,
      commentCount: 0,
      shareCount: 0,
      viewCount: item.followersCount || 0,
      videoDurationSeconds: null,
      publishedAt: item.source?.scrapedAt || null,
      videoUrl: item.profileUrl || null
    }));
  }

  return [];
}

function summarize(dataset) {
  const videos = normalizeIntoVideos(dataset);
  const hashtagCounts = new Map();
  const authorCounts = new Map();
  const hookCounts = new Map();
  const structureCounts = new Map();
  const sourceSurfaceCounts = new Map();
  const sourceQueryCounts = new Map();

  for (const item of videos) {
    for (const hashtag of item.hashtags || []) {
      const key = cleanString(hashtag)?.toLowerCase();
      if (!key) {
        continue;
      }
      hashtagCounts.set(key, (hashtagCounts.get(key) || 0) + 1);
    }

    const author = cleanString(item.authorUsername || item.authorDisplayName);
    if (author) {
      authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
    }

    const sourceSurface = cleanString(item.sourceSurface);
    if (sourceSurface) {
      sourceSurfaceCounts.set(sourceSurface, (sourceSurfaceCounts.get(sourceSurface) || 0) + 1);
    }

    const sourceQuery = cleanString(item.sourceQuery);
    if (sourceQuery) {
      sourceQueryCounts.set(sourceQuery, (sourceQueryCounts.get(sourceQuery) || 0) + 1);
    }

    if (item.text) {
      const hook = firstLine(item.text);
      if (hook) {
        hookCounts.set(hook, (hookCounts.get(hook) || 0) + 1);
      }
      const structure = classifyStructure(item.text);
      structureCounts.set(structure, (structureCounts.get(structure) || 0) + 1);
    }
  }

  const topByViews = [...videos]
    .sort((left, right) => (right.viewCount || 0) - (left.viewCount || 0))
    .slice(0, 10);
  const topByEngagement = [...videos]
    .sort((left, right) =>
      ((right.likeCount || 0) + (right.commentCount || 0) * 2 + (right.shareCount || 0) * 3) -
      ((left.likeCount || 0) + (left.commentCount || 0) * 2 + (left.shareCount || 0) * 3)
    )
    .slice(0, 10);

  return {
    datasetType: dataset.datasetType,
    itemCount: videos.length,
    topHashtags: topEntries(hashtagCounts, 15),
    topAuthors: topEntries(authorCounts, 15),
    sourceSurfaces: topEntries(sourceSurfaceCounts, 10),
    sourceQueries: topEntries(sourceQueryCounts, 15),
    recurringHooks: topEntries(hookCounts, 15),
    structurePatterns: topEntries(structureCounts, 10),
    topByViews,
    topByEngagement
  };
}

function usage() {
  console.error("Usage: node analyze_tiktok_dataset.mjs --input <dataset.json> [--output <summary.json>]");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const raw = readJson(args.input);
  const dataset = raw?.platform === "tiktok" && Array.isArray(raw?.items)
    ? raw
    : normalizeDataset(raw, { inputPath: args.input });
  const summary = summarize(dataset);

  if (args.output) {
    writeJson(args.output, summary);
    console.log(`Saved summary to ${args.output}`);
    return;
  }

  console.log(JSON.stringify(summary, null, 2));
}

main();
