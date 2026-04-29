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

export function buildSearchQuery(platform, requestText) {
  const cleaned = normalizeWhitespace(
    String(requestText || "")
      .replace(/https?:\/\/\S+/gi, " ")
      .replace(/\b(linkedin|youtube|facebook)\b/gi, " ")
      .replace(/\b(find|search|analyze|collect|show|get)\b/gi, " ")
      .replace(/[找搜分析收集查看给我帮我条个视频帖子內容内容最近公开相关高互动观看点赞评论]+/g, " ")
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
