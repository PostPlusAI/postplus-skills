#!/usr/bin/env node

import path from "node:path";
import {
  cleanString,
  parseArgs,
  parseNumber,
  readJson,
  toArray,
  toIsoDate,
  uniqueStrings,
  writeJson
} from "../../tiktok-research/scripts/lib/tiktok_common.mjs";

function usage() {
  console.error(
    "Usage: node normalize_tiktok_ads_dataset.mjs --input <dataset.json> [--actor <actor-id>] [--output <normalized.json>]"
  );
}

function pickFirst(item, keys) {
  for (const key of keys) {
    const value = key.split(".").reduce((current, part) => current?.[part], item);
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
}

function firstArray(item, keys) {
  for (const key of keys) {
    const value = pickFirst(item, [key]);
    if (Array.isArray(value) && value.length) {
      return value;
    }
  }
  return [];
}

function normalizeItem(item, actorId, input, fetchedAt) {
  const analytics = item?.analytics && typeof item.analytics === "object" ? item.analytics : null;
  const videoInfo = analytics?.video_info || item?.video_info || null;
  const keywordList = uniqueStrings([
    ...toArray(pickFirst(item, ["keyword_list"])),
    ...toArray(pickFirst(analytics || {}, ["keyword_list"]))
  ]);
  const regions = uniqueStrings([
    ...firstArray(item, ["country_code", "country_codes"]),
    ...firstArray(analytics || {}, ["country_code", "country_codes"])
  ]);

  return {
    platform: "tiktok",
    recordType: "ad",
    adId: cleanString(pickFirst(item, ["id"])),
    adTitle: cleanString(pickFirst(item, ["ad_title", "analytics.ad_title"])) || "",
    brandName: cleanString(pickFirst(item, ["brand_name", "analytics.brand_name"])),
    objectiveKey: cleanString(pickFirst(item, ["objective_key", "analytics.objective_key"])),
    industryKey: cleanString(pickFirst(item, ["industry_key", "analytics.industry_key"])),
    keywordList,
    regions,
    languages: uniqueStrings(toArray(pickFirst(item, ["language", "languages", "analytics.languages"]))),
    adFormat: cleanString(pickFirst(item, ["ad_format", "format", "analytics.ad_format"])),
    landingPageUrl: cleanString(pickFirst(item, ["analytics.landing_page", "landing_page"])),
    caption: cleanString(pickFirst(item, ["analytics.caption", "caption"])) || "",
    summary: cleanString(pickFirst(item, ["analytics.highlight_text", "summary"])) || "",
    isSearchAd: Boolean(pickFirst(item, ["is_search", "analytics.is_search"])),
    isSpotlight: Boolean(input?.top_ads_spotlight),
    likeCount: parseNumber(pickFirst(item, ["like", "analytics.like"])),
    commentCount: parseNumber(pickFirst(item, ["comment", "analytics.comment"])),
    shareCount: parseNumber(pickFirst(item, ["share", "analytics.share"])),
    ctr: parseNumber(pickFirst(item, ["ctr", "analytics.ctr"])),
    cvr: parseNumber(pickFirst(item, ["cvr", "analytics.cvr"])),
    cost: parseNumber(pickFirst(item, ["cost", "analytics.cost"])),
    durationSeconds: parseNumber(pickFirst(videoInfo || {}, ["duration"])),
    coverUrl: cleanString(pickFirst(videoInfo || {}, ["cover"])),
    videoUrl: cleanString(pickFirst(videoInfo || {}, ["video_url.720p", "video_url.540p", "video_url.360p"])),
    keyframeMetrics: item?.keyframe_metrics || null,
    source: {
      actorId,
      scrapedAt: toIsoDate(fetchedAt) || new Date().toISOString(),
      inputPath: null
    },
    raw: item
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const raw = readJson(args.input);
  const actorId = cleanString(args.actor || raw?.actorId) || "codebyte/tiktok-creative-center-top-ads";
  const items = Array.isArray(raw?.items) ? raw.items : toArray(raw);
  const normalizedItems = items.map((item) => normalizeItem(item, actorId, raw?.input || null, raw?.fetchedAt));
  const normalized = {
    platform: "tiktok",
    datasetType: "ads",
    actorId,
    fetchedAt: cleanString(raw?.fetchedAt) || new Date().toISOString(),
    input: raw?.input || null,
    inputPath: path.resolve(args.input),
    itemCount: normalizedItems.length,
    items: normalizedItems
  };

  if (args.output) {
    writeJson(args.output, normalized);
    console.log(`Saved normalized ad dataset to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(normalized, null, 2));
}

main();
