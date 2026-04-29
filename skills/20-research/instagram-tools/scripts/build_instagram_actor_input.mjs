#!/usr/bin/env node

import path from "node:path";
import {
  cleanString,
  parseArgs,
  readJson,
  splitCsv,
  toArray,
  writeJson
} from "./lib/instagram_common.mjs";

function usage() {
  console.error(
    "Usage: node build_instagram_actor_input.mjs --brief <brief.json> --actor <actor-id> [--output <input.json>]"
  );
}

function normalizeStringArray(values) {
  return toArray(values)
    .flatMap((value) => typeof value === "string" ? splitCsv(value) : [value])
    .map((value) => cleanString(value))
    .filter(Boolean);
}

function usernameToProfileUrl(username) {
  const normalized = String(username || "").replace(/^@/, "");
  return normalized ? `https://www.instagram.com/${normalized}/` : null;
}

function hashtagToUrl(hashtag) {
  const normalized = String(hashtag || "").replace(/^#/, "");
  return normalized ? `https://www.instagram.com/explore/tags/${normalized}/` : null;
}

function passthroughFields(brief) {
  const reserved = new Set([
    "task",
    "route",
    "queries",
    "searchQueries",
    "keywords",
    "hashtags",
    "usernames",
    "profiles",
    "handles",
    "urls",
    "postUrls",
    "directUrls",
    "resultsLimit",
    "resultsPerPage",
    "limit",
    "maxItems",
    "contentType",
    "targetUsername",
    "country"
  ]);
  return Object.fromEntries(
    Object.entries(brief).filter(([key]) => !reserved.has(key))
  );
}

function buildInput(brief, sourceId) {
  const actor = String(sourceId || "").toLowerCase();
  const queries = normalizeStringArray(brief.queries || brief.searchQueries || brief.keywords);
  const hashtags = normalizeStringArray(brief.hashtags);
  const usernames = normalizeStringArray(brief.usernames || brief.profiles || brief.handles);
  const urls = normalizeStringArray(brief.urls || brief.postUrls || brief.directUrls);
  const limit = Number(brief.limit || brief.maxItems || brief.resultsLimit || brief.resultsPerPage || 20);
  const contentType = cleanString(brief.contentType);
  const targetUsername = cleanString(brief.targetUsername);
  const extra = passthroughFields(brief);

  if (actor.includes("instagram-search-scraper")) {
    const inferredSearchType =
      contentType === "profiles" ||
      (queries.length > 0 && hashtags.length === 0)
        ? "user"
        : "hashtag";
    return {
      ...extra,
      searchType: inferredSearchType,
      searchLimit: limit,
      searchTerms: queries.length ? queries : hashtags
    };
  }

  if (actor.includes("instagram-profile-scraper")) {
    return {
      ...extra,
      usernames,
      resultsLimit: limit
    };
  }

  if (actor.includes("coderx/instagram-profile-scraper-api")) {
    return {
      ...extra,
      usernames,
      includeAboutSection: true,
      includeRelatedProfiles: true
    };
  }

  if (actor.includes("instagram-post-scraper")) {
    if (usernames.length > 0) {
      return {
        ...extra,
        username: usernames,
        resultsLimit: limit
      };
    }

    return {
      ...extra,
      directUrls: [
        ...urls,
        ...hashtags.map((hashtag) => hashtagToUrl(hashtag)).filter(Boolean)
      ],
      resultsLimit: limit
    };
  }

  if (actor.includes("instagram-reel-scraper")) {
    if (usernames.length > 0) {
      return {
        ...extra,
        username: usernames,
        resultsLimit: limit
      };
    }

    return {
      ...extra,
      directUrls: [
        ...urls,
        ...hashtags.map((hashtag) => hashtagToUrl(hashtag)).filter(Boolean)
      ],
      resultsLimit: limit
    };
  }

  if (actor.includes("instagram-hashtag-scraper")) {
    return {
      ...extra,
      hashtags,
      resultsLimit: limit
    };
  }

  if (actor.includes("instagram-tagged-scraper")) {
    const taggedUsernames = targetUsername
      ? [targetUsername]
      : usernames;
    return {
      ...extra,
      username: taggedUsernames,
      resultsLimit: limit
    };
  }

  if (actor.includes("instagram-comment-scraper")) {
    return {
      ...extra,
      directUrls: urls,
      resultsLimit: limit
    };
  }

  if (actor.includes("instagram-email-scraper")) {
    return {
      ...extra,
      keywords: queries,
      usernames,
      maxItems: limit
    };
  }

  if (actor.includes("instagram-scraper")) {
    return {
      ...extra,
      directUrls: [
        ...urls,
        ...usernames.map((username) => usernameToProfileUrl(username)).filter(Boolean),
        ...hashtags.map((hashtag) => hashtagToUrl(hashtag)).filter(Boolean)
      ],
      resultsLimit: limit
    };
  }

  return {
    queries,
    hashtags,
    usernames,
    urls,
    limit,
    contentType,
    targetUsername
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.brief || !args.actor) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const brief = readJson(args.brief);
  const sourceId = cleanString(args.actor);
  const input = buildInput(brief, sourceId);
  const payload = {
    sourceId,
    builtAt: new Date().toISOString(),
    briefPath: path.resolve(args.brief),
    input
  };

  if (args.output) {
    writeJson(args.output, input);
    console.log(`Saved actor input to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
