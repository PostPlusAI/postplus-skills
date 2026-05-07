#!/usr/bin/env node

import path from "node:path";

import {
  discoverPublicContent,
  clampRequestedCount,
  classifyPlatformFromUrl,
  isDirectRun,
  normalizeWhitespace,
  parseArgs,
  readJson,
  requireArg,
  writeJson
} from "./lib/public_content_common.mjs";
import { canonicalizeFacebookUrl } from "./lib/facebook_urls.mjs";

const BILINGUAL_DISCOVERY_STOPWORDS = Object.freeze([
  "find", "search", "analyze", "collect", "show", "get", "recent", "public",
  "relevant", "high engagement", "views", "likes", "comments", "posts",
  "videos", "items", "给我", "帮我", "找", "搜", "分析", "收集", "查看",
  "条", "个", "视频", "帖子", "內容", "内容", "最近", "公开", "相关",
  "高互动", "观看", "点赞", "评论",
]);

function removeDiscoveryStopwords(value) {
  return BILINGUAL_DISCOVERY_STOPWORDS.reduce(
    (current, term) => current.replaceAll(term, " "),
    value.toLowerCase(),
  );
}

export function buildSearchQuery(platform, requestText) {
  const cleaned = normalizeWhitespace(
    removeDiscoveryStopwords(
      String(requestText || "")
        .replace(/https?:\/\/\S+/gi, " ")
        .replace(/\b(linkedin|youtube|facebook)\b/gi, " "),
    )
  );

  if (platform === "linkedin") {
    return `site:linkedin.com/posts ${cleaned}`.trim();
  }
  if (platform === "youtube") {
    return `site:youtube.com/watch ${cleaned}`.trim();
  }
  if (platform === "facebook") {
    return `site:facebook.com ${cleaned} facebook post`.trim();
  }
  throw new Error(`Unsupported discovery platform: ${platform}`);
}

export function extractUrlsFromSearchResult(result, platform, resultCount) {
  let links = (result.organic || [])
    .map((item) => item.link)
    .filter((item) => classifyPlatformFromUrl(item) === platform);

  if (platform === "facebook") {
    links = links
      .map((item) => canonicalizeFacebookUrl(item))
      .filter((item) => !/\/(mentions|about|photos)\/?$/i.test(item));
  }

  return Array.from(new Set(links)).slice(0, clampRequestedCount(resultCount));
}

export async function discoverUrls(brief, fetchImpl = globalThis.fetch) {
  const discovered = {};
  const allUrls = [];

  for (const platform of brief.platforms || []) {
    const result = await discoverPublicContent({
      discoveryTool: "search_engine",
      args: {
        query: buildSearchQuery(platform, brief.requestText),
        engine: "google",
        geo_location: "us"
      },
      fetchImpl
    });
    const urls = extractUrlsFromSearchResult(result, platform, brief.resultCount);
    discovered[platform] = {
      query: buildSearchQuery(platform, brief.requestText),
      result
    };
    allUrls.push(...urls);
  }

  return {
    urls: Array.from(new Set(allUrls)),
    discovered
  };
}

export async function main(argv = process.argv.slice(2), io = console, fetchImpl = globalThis.fetch) {
  const args = parseArgs(argv);
  const briefPath = requireArg(args, "brief");
  const outputDir = requireArg(args, "output-dir");
  const brief = readJson(briefPath);
  const result = await discoverUrls(brief, fetchImpl);

  for (const [platform, payload] of Object.entries(result.discovered)) {
    writeJson(path.join(outputDir, `${platform}-search.json`), payload);
  }
  writeJson(path.join(outputDir, "discovered-urls.json"), {
    itemCount: result.urls.length,
    urls: result.urls
  });
  io.log(JSON.stringify({ outputDir: path.resolve(outputDir), itemCount: result.urls.length }, null, 2));
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
