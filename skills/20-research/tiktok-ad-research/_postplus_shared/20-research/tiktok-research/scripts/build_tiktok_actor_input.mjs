#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  cleanString,
  parseBoolean,
  parseArgs,
  parseNumber,
  readJson,
  toArray,
  writeJson
} from "./lib/tiktok_common.mjs";

const DEFAULT_COST_MODE = "bounded";
const DEFAULT_BOUNDED_QUERY_LIMIT = 4;
const DEFAULT_BOUNDED_HASHTAG_LIMIT = 3;
const DEFAULT_BOUNDED_DISCOVERY_RESULTS_MIN = 5;
const DEFAULT_BOUNDED_DISCOVERY_RESULTS_MAX = 12;
const DEFAULT_BOUNDED_USER_SEARCH_RESULTS_MIN = 5;
const DEFAULT_BOUNDED_USER_SEARCH_RESULTS_MAX = 10;
const DEFAULT_BOUNDED_PROFILE_RESULTS = 8;
const DEFAULT_BOUNDED_PROFILE_RESULTS_MIN = 6;
const DEFAULT_BOUNDED_PROFILE_RESULTS_MAX = 12;
const DEFAULT_SUBTITLE_MODE = "NEVER_DOWNLOAD_SUBTITLES";

function usage() {
  console.error(
    "Usage: node build_tiktok_actor_input.mjs (--brief <brief.json> | --query <text> [--query <text> ...]) --actor <actor-id> [--output <input.json>]"
  );
}

function readRepeatedFlagValues(argv, flagName) {
  const values = [];

  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] !== `--${flagName}`) {
      continue;
    }

    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      continue;
    }

    values.push(next);
    index += 1;
  }

  return values;
}

function buildBriefFromArgs(argv, args) {
  const queries = readRepeatedFlagValues(argv, "query");
  const hashtags = readRepeatedFlagValues(argv, "hashtag");
  const usernames = readRepeatedFlagValues(argv, "username");
  const urls = readRepeatedFlagValues(argv, "url");

  const brief = {
    ...(queries.length > 0 ? { queries } : {}),
    ...(hashtags.length > 0 ? { hashtags } : {}),
    ...(usernames.length > 0 ? { usernames } : {}),
    ...(urls.length > 0 ? { urls } : {})
  };

  for (const [argKey, briefKey] of [
    ["task", "task"],
    ["limit", "limit"],
    ["country", "country"],
    ["sortType", "sortType"],
    ["searchSection", "searchSection"],
    ["resultsPerPage", "resultsPerPage"],
    ["maxProfilesPerQuery", "maxProfilesPerQuery"],
    ["commentsPerPost", "commentsPerPost"],
    ["scrapeRelatedVideos", "scrapeRelatedVideos"],
    ["proxyCountryCode", "proxyCountryCode"]
  ]) {
    if (args[argKey] !== undefined) {
      brief[briefKey] = args[argKey];
    }
  }

  return Object.keys(brief).length > 0 ? brief : null;
}

function normalizeStringArray(values) {
  return toArray(values)
    .map((value) => cleanString(value))
    .filter(Boolean);
}

function parsePositiveInteger(value) {
  const parsed = parseNumber(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.floor(parsed);
}

function clampInteger(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function readCostMode(brief) {
  const raw = cleanString(brief.costMode || brief.collectionMode);
  if (!raw) {
    return DEFAULT_COST_MODE;
  }

  const normalized = raw.toLowerCase();
  if (
    normalized === "expanded" ||
    normalized === "broad" ||
    normalized === "max-recall" ||
    normalized === "deep"
  ) {
    return "expanded";
  }

  return DEFAULT_COST_MODE;
}

function limitValues(values, explicitLimit, fallbackLimit, costMode) {
  if (costMode !== DEFAULT_COST_MODE) {
    return values;
  }

  if (explicitLimit) {
    return values.slice(0, explicitLimit);
  }

  return values.slice(0, fallbackLimit);
}

function readExplicitCountLimit(brief, keys) {
  for (const key of keys) {
    const parsed = parsePositiveInteger(brief[key]);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function readTargetLimit(brief) {
  return (
    readExplicitCountLimit(brief, [
      "targetResultCount",
      "limit",
      "maxItems",
      "resultsPerPage",
      "maxProfilesPerQuery"
    ]) || 20
  );
}

function resolveBoundedPerSurfaceCount(input) {
  if (input.explicit) {
    return input.explicit;
  }

  if (input.costMode !== DEFAULT_COST_MODE) {
    return input.expandedDefault;
  }

  const divisor = Math.min(Math.max(input.surfaceCount, 1), 4);
  const estimated = Math.ceil(Math.max(input.targetLimit, input.min) / divisor);

  return clampInteger(estimated, input.min, input.max);
}

function normalizeClockworksSearchSection(value, fallback) {
  const normalized = cleanString(value)?.toLowerCase();

  if (!normalized) {
    return fallback;
  }

  if (normalized === "top" || normalized === "/top") {
    return "";
  }

  if (normalized === "video" || normalized === "/video") {
    return "/video";
  }

  if (
    normalized === "user" ||
    normalized === "/user" ||
    normalized === "profile" ||
    normalized === "/profile"
  ) {
    return "user";
  }

  return fallback;
}

function normalizeProfileSorting(value, fallback = "latest") {
  const normalized = cleanString(value)?.toLowerCase();

  if (
    normalized === "latest" ||
    normalized === "popular" ||
    normalized === "oldest"
  ) {
    return normalized;
  }

  return fallback;
}

function normalizeStringArrayField(value) {
  return normalizeStringArray(value);
}

function readBooleanWithDefault(value, fallback) {
  const parsed = parseBoolean(value);
  return parsed === null ? fallback : parsed;
}

function normalizeSourceIdForInput(sourceId) {
  const actor = String(sourceId || "").toLowerCase();

  if (actor === "tiktok-scraper") {
    return "clockworks/tiktok-scraper";
  }

  if (actor === "tiktok-scraper-api") {
    return "apidojo/tiktok-scraper-api";
  }

  return actor;
}

function shouldUseGraphExpansion(task, brief) {
  if (parseBoolean(brief.scrapeRelatedVideos) === true) {
    return true;
  }

  const normalizedTask = cleanString(task)?.toLowerCase() || "";

  return (
    normalizedTask.includes("graph") ||
    normalizedTask.includes("related-video") ||
    normalizedTask.includes("related video")
  );
}

function hashtagUrl(hashtag) {
  return `https://www.tiktok.com/tag/${encodeURIComponent(String(hashtag).replace(/^#/, ""))}`;
}

function profileUrl(username) {
  return `https://www.tiktok.com/@${String(username).replace(/^@/, "")}`;
}

function passthroughFields(brief) {
  const reserved = new Set([
    "task",
    "queries",
    "searchQueries",
    "keywords",
    "hashtags",
    "usernames",
    "profiles",
    "handles",
    "urls",
    "postUrls",
    "startUrls",
    "limit",
    "maxItems",
    "resultsPerPage",
    "maxProfilesPerQuery",
    "country",
    "location",
    "regionCode",
    "sortType",
    "targetResultCount",
    "costMode",
    "collectionMode",
    "maxQueryCount",
    "maxHashtagCount"
  ]);
  return Object.fromEntries(
    Object.entries(brief).filter(([key]) => !reserved.has(key))
  );
}

export function buildInput(brief, sourceId) {
  const actor = normalizeSourceIdForInput(sourceId);
  const task = cleanString(brief.task) || "video-discovery";
  const costMode = readCostMode(brief);
  const rawQueries = normalizeStringArray(brief.queries || brief.searchQueries || brief.keywords);
  const rawHashtags = normalizeStringArray(brief.hashtags);
  const usernames = normalizeStringArray(brief.usernames || brief.profiles || brief.handles);
  const urls = normalizeStringArray(brief.urls || brief.postUrls || brief.startUrls);
  const queryCountLimit = readExplicitCountLimit(brief, ["maxQueryCount"]);
  const hashtagCountLimit = readExplicitCountLimit(brief, ["maxHashtagCount"]);
  const queries = limitValues(
    rawQueries,
    queryCountLimit,
    rawHashtags.length > 0 ? DEFAULT_BOUNDED_QUERY_LIMIT : 6,
    costMode
  );
  const hashtags = limitValues(
    rawHashtags,
    hashtagCountLimit,
    rawQueries.length > 0 ? DEFAULT_BOUNDED_HASHTAG_LIMIT : 5,
    costMode
  );
  const limit = readTargetLimit(brief);
  const country = cleanString(brief.country || brief.location || brief.regionCode);
  const sortType = cleanString(brief.sortType);
  const extra = passthroughFields(brief);
  const proxyCountryCode = cleanString(brief.proxyCountryCode || country)?.toUpperCase() || null;
  const scrapeRelatedVideos = shouldUseGraphExpansion(task, brief);
  const discoverySurfaceCount =
    queries.length +
    hashtags.length +
    usernames.length +
    (scrapeRelatedVideos ? urls.length : 0);
  const explicitResultsPerPage = readExplicitCountLimit(brief, [
    "resultsPerPage"
  ]);
  const explicitMaxProfilesPerQuery = readExplicitCountLimit(brief, [
    "maxProfilesPerQuery"
  ]);

  if (actor.includes("user-search")) {
    return {
      ...extra,
      searchQueries: queries,
      maxProfilesPerQuery: resolveBoundedPerSurfaceCount({
        costMode,
        expandedDefault: limit,
        explicit: explicitMaxProfilesPerQuery,
        max: DEFAULT_BOUNDED_USER_SEARCH_RESULTS_MAX,
        min: DEFAULT_BOUNDED_USER_SEARCH_RESULTS_MIN,
        surfaceCount: queries.length,
        targetLimit: limit
      })
    };
  }

  if (actor.includes("profile-scraper")) {
    const resultsPerPage = resolveBoundedPerSurfaceCount({
      costMode,
      expandedDefault: limit,
      explicit: explicitResultsPerPage,
      max: DEFAULT_BOUNDED_PROFILE_RESULTS_MAX,
      min: DEFAULT_BOUNDED_PROFILE_RESULTS_MIN,
      surfaceCount: 1,
      targetLimit: DEFAULT_BOUNDED_PROFILE_RESULTS
    });

    if (actor.includes("apidojo/")) {
      return {
        ...extra,
        startUrls: [
          ...urls.map((url) => ({ url })),
          ...usernames.map((username) => ({ url: profileUrl(username) }))
        ],
        maxItems: resultsPerPage
      };
    }
    return {
      ...extra,
      profiles: usernames.length ? usernames : urls.map((url) => url.replace(/^https?:\/\/www\.tiktok\.com\/@/, "").replace(/\/.*$/, "")),
      shouldDownloadCovers: readBooleanWithDefault(
        brief.shouldDownloadCovers,
        false
      ),
      shouldDownloadSlideshowImages: readBooleanWithDefault(
        brief.shouldDownloadSlideshowImages,
        false
      ),
      shouldDownloadSubtitles: readBooleanWithDefault(
        brief.shouldDownloadSubtitles,
        false
      ),
      shouldDownloadVideos: readBooleanWithDefault(
        brief.shouldDownloadVideos,
        false
      ),
      resultsPerPage
    };
  }

  if (actor.includes("video-scraper")) {
    return {
      ...extra,
      postURLs: urls,
      resultsPerPage: limit
    };
  }

  if (actor.includes("comments-scraper")) {
    if (actor.includes("apidojo/")) {
      return {
        ...extra,
        startUrls: urls.map((url) => ({ url })),
        maxItems: explicitResultsPerPage || limit
      };
    }
    return {
      ...extra,
      postUrls: urls,
      postURLs: urls,
      commentsPerPost: explicitResultsPerPage || limit,
      maxRepliesPerComment:
        readExplicitCountLimit(brief, ["maxRepliesPerComment"]) || 0
    };
  }

  if (actor.includes("hashtag-scraper")) {
    return {
      ...extra,
      hashtags,
      resultsPerPage: limit
    };
  }

  if (actor.includes("shop-creators")) {
    return {
      ...extra,
      usernames,
      maxItems: limit
    };
  }

  if (actor.includes("apidojo/tiktok-scraper-api")) {
    if (task === "profile-enrichment") {
      return {
        ...extra,
        profiles: usernames,
        resultsPerPage: limit
      };
    }
    if (task === "comments") {
      return {
        ...extra,
        commentsForVideos: urls,
        resultsPerPage: limit
      };
    }
    return {
      ...extra,
      search: queries,
      hashtagSearch: hashtags,
      resultsPerPage: limit
    };
  }

  if (actor.includes("apidojo/tiktok-scraper")) {
    const startUrls = [
      ...urls.map((url) => ({ url })),
      ...hashtags.map((hashtag) => ({ url: hashtagUrl(hashtag) })),
      ...usernames.map((username) => ({ url: profileUrl(username) }))
    ];
    const input = {
      ...extra,
      startUrls,
      keywords: queries,
      maxItems: limit
    };
    if (country) {
      input.location = country;
    }
    if (sortType) {
      input.sortType = sortType;
    }
    return input;
  }

  if (actor.includes("clockworks/tiktok-scraper")) {
    const resultsPerPage = resolveBoundedPerSurfaceCount({
      costMode,
      expandedDefault: limit,
      explicit: explicitResultsPerPage,
      max: DEFAULT_BOUNDED_DISCOVERY_RESULTS_MAX,
      min: DEFAULT_BOUNDED_DISCOVERY_RESULTS_MIN,
      surfaceCount: discoverySurfaceCount,
      targetLimit: limit
    });
    const searchSection = normalizeClockworksSearchSection(
      brief.searchSection,
      queries.length > 0 ? "/video" : ""
    );
    const profileScrapeSections = normalizeStringArrayField(
      brief.profileScrapeSections
    );
    const input = {
      ...extra,
      searchQueries: queries,
      hashtags,
      profiles: usernames,
      postURLs: urls,
      resultsPerPage,
      scrapeRelatedVideos,
      commentsPerPost:
        readExplicitCountLimit(brief, ["commentsPerPost"]) || 0,
      topLevelCommentsPerPost:
        readExplicitCountLimit(brief, ["topLevelCommentsPerPost"]) || 0,
      maxRepliesPerComment:
        readExplicitCountLimit(brief, ["maxRepliesPerComment"]) || 0,
      maxFollowersPerProfile:
        readExplicitCountLimit(brief, ["maxFollowersPerProfile"]) || 0,
      maxFollowingPerProfile:
        readExplicitCountLimit(brief, ["maxFollowingPerProfile"]) || 0,
      shouldDownloadVideos: readBooleanWithDefault(
        brief.shouldDownloadVideos,
        false
      ),
      shouldDownloadCovers: readBooleanWithDefault(
        brief.shouldDownloadCovers,
        false
      ),
      shouldDownloadSlideshowImages: readBooleanWithDefault(
        brief.shouldDownloadSlideshowImages,
        false
      ),
      shouldDownloadAvatars: readBooleanWithDefault(
        brief.shouldDownloadAvatars,
        false
      ),
      shouldDownloadMusicCovers: readBooleanWithDefault(
        brief.shouldDownloadMusicCovers,
        false
      ),
      downloadSubtitlesOptions:
        cleanString(brief.downloadSubtitlesOptions) || DEFAULT_SUBTITLE_MODE
    };

    if (searchSection) {
      input.searchSection = searchSection;
    }

    if (queries.length > 0 && input.searchSection === "user") {
      input.maxProfilesPerQuery =
        explicitMaxProfilesPerQuery ||
        resolveBoundedPerSurfaceCount({
          costMode,
          expandedDefault: limit,
          explicit: null,
          max: DEFAULT_BOUNDED_USER_SEARCH_RESULTS_MAX,
          min: DEFAULT_BOUNDED_USER_SEARCH_RESULTS_MIN,
          surfaceCount: queries.length,
          targetLimit: limit
        });
    }

    const normalizedSearchSorting = cleanString(brief.searchSorting);
    if (normalizedSearchSorting) {
      input.searchSorting = normalizedSearchSorting;
    }

    const normalizedSearchDatePosted = cleanString(brief.searchDatePosted);
    if (normalizedSearchDatePosted) {
      input.searchDatePosted = normalizedSearchDatePosted;
    }

    if (usernames.length > 0) {
      input.excludePinnedPosts = readBooleanWithDefault(
        brief.excludePinnedPosts,
        true
      );
      input.profileScrapeSections =
        profileScrapeSections.length > 0 ? profileScrapeSections : ["videos"];
      input.profileSorting = normalizeProfileSorting(brief.profileSorting);
    }

    const oldestPostDateUnified = cleanString(brief.oldestPostDateUnified);
    if (oldestPostDateUnified) {
      input.oldestPostDateUnified = oldestPostDateUnified;
    }

    const newestPostDate = cleanString(brief.newestPostDate);
    if (newestPostDate) {
      input.newestPostDate = newestPostDate;
    }

    const leastDiggs = parsePositiveInteger(brief.leastDiggs);
    if (leastDiggs) {
      input.leastDiggs = leastDiggs;
    }

    const mostDiggs = parsePositiveInteger(brief.mostDiggs);
    if (mostDiggs) {
      input.mostDiggs = mostDiggs;
    }

    if (proxyCountryCode && proxyCountryCode.length === 2) {
      input.proxyCountryCode = proxyCountryCode;
    }

    return input;
  }

  return {
    task,
    queries,
    hashtags,
    usernames,
    urls,
    limit,
    country,
    sortType
  };
}

function main() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);
  const briefFromArgs = buildBriefFromArgs(argv, args);

  if (args.help || (!args.brief && !briefFromArgs) || !args.actor) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const brief = args.brief ? readJson(args.brief) : briefFromArgs;
  const sourceId = cleanString(args.actor);
  const input = buildInput(brief, sourceId);
  const payload = {
    sourceId,
    builtAt: new Date().toISOString(),
    briefPath: args.brief ? path.resolve(args.brief) : null,
    input
  };

  if (args.output) {
    writeJson(args.output, input);
    console.log(`Saved actor input to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

const isDirectRun = (() => {
  if (!process.argv[1]) {
    return false;
  }

  try {
    return (
      fs.realpathSync(process.argv[1]) ===
      fs.realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  }
})();

if (isDirectRun) {
  main();
}
