#!/usr/bin/env node

import path from "node:path";
import {
  cleanString,
  parseArgs,
  readJson,
  splitCsv,
  uniqueStrings,
  writeJson
} from "./lib/instagram_common.mjs";

function usage() {
  console.error(
    "Usage: node build_instagram_watchlist.mjs [--profiles <normalized-profiles.json>] [--posts <normalized-posts.json>] [--tagged <normalized-tagged.json>] [--hashtags skincare,ugc] [--usernames creator1,creator2] [--type accounts|hashtags|tagged] [--output <watchlist.json>]"
  );
}

function collectUsernames(items, key) {
  return uniqueStrings(
    items.map((item) => cleanString(item?.[key])).filter(Boolean)
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const profileItems = args.profiles ? readJson(args.profiles).items || [] : [];
  const postItems = args.posts ? readJson(args.posts).items || [] : [];
  const taggedItems = args.tagged ? readJson(args.tagged).items || [] : [];
  const explicitHashtags = splitCsv(args.hashtags);
  const explicitUsernames = splitCsv(args.usernames);

  const accounts = uniqueStrings([
    ...explicitUsernames,
    ...collectUsernames(profileItems, "username"),
    ...collectUsernames(postItems, "ownerUsername"),
    ...collectUsernames(taggedItems, "ownerUsername"),
    ...collectUsernames(taggedItems, "targetUsername")
  ]);

  const hashtags = uniqueStrings([
    ...explicitHashtags,
    ...postItems.flatMap((item) => Array.isArray(item.hashtags) ? item.hashtags : []),
    ...taggedItems.flatMap((item) => Array.isArray(item.hashtags) ? item.hashtags : [])
  ]);

  const taggedTargets = uniqueStrings([
    ...collectUsernames(taggedItems, "targetUsername")
  ]);

  const requestedType = cleanString(args.type) || "accounts";
  const entities =
    requestedType === "hashtags" ? hashtags :
    requestedType === "tagged" ? taggedTargets :
    accounts;

  const payload = {
    generatedAt: new Date().toISOString(),
    watchlistType: requestedType,
    entityCount: entities.length,
    entities,
    metadata: {
      accounts,
      hashtags,
      taggedTargets
    },
    input: {
      profilesPath: args.profiles ? path.resolve(args.profiles) : null,
      postsPath: args.posts ? path.resolve(args.posts) : null,
      taggedPath: args.tagged ? path.resolve(args.tagged) : null
    }
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved watchlist to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
