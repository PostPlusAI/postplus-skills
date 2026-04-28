#!/usr/bin/env node

import path from "node:path";
import {
  cleanString,
  parseArgs,
  readJson,
  safeLower,
  toArray,
  uniqueStrings,
  writeJson
} from "./lib/instagram_common.mjs";

function usage() {
  console.error(
    "Usage: node extract_instagram_candidate_usernames.mjs --input <normalized-content.json> [--route <route>] [--output <candidates.json>]"
  );
}

function summarizeTerms(item) {
  return uniqueStrings([
    ...toArray(item.hashtags),
    ...toArray(item.mentions),
    cleanString(item.username),
    cleanString(item.ownerUsername),
    ...String(cleanString(item.caption) || "")
      .split(/\n|\./)
      .map((entry) => cleanString(entry))
      .filter(Boolean)
      .slice(0, 2)
  ]);
}

function normalizeSourceSurface(dataset, item) {
  if (item.recordType === "tagged") {
    return "tagged";
  }
  if (item.recordType === "profile") {
    return "search";
  }
  const actorId = safeLower(dataset.actorId);
  if (actorId.includes("search")) return "search";
  if (actorId.includes("hashtag")) return "hashtag";
  if (actorId.includes("reel")) return "reel";
  if (actorId.includes("post")) return "post";
  return dataset.datasetType || "unknown";
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
  const route = cleanString(args.route) || "content-first";
  const candidates = new Map();

  for (const item of items) {
    const username = cleanString(item.ownerUsername || item.username);
    if (!username) {
      continue;
    }

    if (!candidates.has(username)) {
      candidates.set(username, {
        platform: "instagram",
        username,
        route,
        matchedContentCount: 0,
        matchedPostUrls: [],
        matchedHashtags: [],
        topMatchedThemes: [],
        sourceSurfaces: [],
        targetUsernames: [],
        notes: []
      });
    }

    const row = candidates.get(username);
    row.matchedContentCount += 1;
    row.matchedPostUrls = uniqueStrings([...row.matchedPostUrls, cleanString(item.postUrl)]);
    row.matchedHashtags = uniqueStrings([...row.matchedHashtags, ...toArray(item.hashtags)]);
    row.topMatchedThemes = uniqueStrings([...row.topMatchedThemes, ...summarizeTerms(item)]).slice(0, 12);
    row.sourceSurfaces = uniqueStrings([...row.sourceSurfaces, normalizeSourceSurface(dataset, item)]);

    if (cleanString(item.targetUsername)) {
      row.targetUsernames = uniqueStrings([...row.targetUsernames, cleanString(item.targetUsername)]);
    }

    if (item.recordType === "profile") {
      row.notes = uniqueStrings([
        ...row.notes,
        cleanString(item.fullName) ? `full-name:${cleanString(item.fullName)}` : null,
        cleanString(item.category) ? `category:${cleanString(item.category)}` : null,
      ]);
    }
  }

  const itemsOut = Array.from(candidates.values())
    .sort((left, right) => right.matchedContentCount - left.matchedContentCount || left.username.localeCompare(right.username));

  const payload = {
    generatedAt: new Date().toISOString(),
    input: {
      datasetPath: path.resolve(args.input),
      route,
      actorId: cleanString(dataset.actorId),
      datasetType: cleanString(dataset.datasetType)
    },
    itemCount: itemsOut.length,
    usernames: itemsOut.map((item) => item.username),
    items: itemsOut
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved candidate usernames to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
