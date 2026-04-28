#!/usr/bin/env node

import {
  cleanString,
  parseArgs,
  readJson,
  toArray,
  writeJson
} from "../../tiktok-research/scripts/lib/tiktok_common.mjs";

function usage() {
  console.error(
    "Usage: node analyze_tiktok_ads_dataset.mjs --input <normalized.json> [--output <analysis.json>]"
  );
}

function topEntries(map, limit = 10) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, value]) => ({ key, value }));
}

function firstLine(text) {
  return String(text || "").split(/\n+/)[0].trim().slice(0, 120);
}

function collectCounts(items, getter) {
  const map = new Map();
  for (const item of items) {
    for (const value of toArray(getter(item))) {
      const key = cleanString(value);
      if (!key) {
        continue;
      }
      map.set(key, (map.get(key) || 0) + 1);
    }
  }
  return map;
}

function classifyOffer(text) {
  const lower = String(text || "").toLowerCase();
  if (/% off|discount|sale|buy 1 free 1|free shipping/.test(lower)) return "discount_offer";
  if (/limited|today only|ends tonight|last chance/.test(lower)) return "urgency_offer";
  if (/free trial|try it free|no cost/.test(lower)) return "free_trial";
  return "generic_offer";
}

function classifyCta(text) {
  const lower = String(text || "").toLowerCase();
  if (/shop now|buy now|order now/.test(lower)) return "shop_now";
  if (/learn more|see more|find out more/.test(lower)) return "learn_more";
  if (/download|get started|start now/.test(lower)) return "start_or_download";
  if (/sign up|join now/.test(lower)) return "signup";
  return "weak_or_missing";
}

function analyze(dataset) {
  const items = Array.isArray(dataset?.items) ? dataset.items : [];
  const brandCounts = collectCounts(items, (item) => item.brandName);
  const objectiveCounts = collectCounts(items, (item) => item.objectiveKey);
  const industryCounts = collectCounts(items, (item) => item.industryKey);
  const regionCounts = collectCounts(items, (item) => item.regions);
  const keywordCounts = collectCounts(items, (item) => item.keywordList);
  const hookCounts = new Map();
  const offerCounts = new Map();
  const ctaCounts = new Map();
  const durationBuckets = new Map();

  for (const item of items) {
    const hook = firstLine(item.adTitle || item.caption || item.summary);
    if (hook) {
      hookCounts.set(hook, (hookCounts.get(hook) || 0) + 1);
    }

    const offer = classifyOffer(`${item.adTitle || ""} ${item.caption || ""} ${item.summary || ""}`);
    offerCounts.set(offer, (offerCounts.get(offer) || 0) + 1);

    const cta = classifyCta(`${item.adTitle || ""} ${item.caption || ""} ${item.summary || ""}`);
    ctaCounts.set(cta, (ctaCounts.get(cta) || 0) + 1);

    const duration = Number(item.durationSeconds || 0);
    const bucket =
      duration <= 15 ? "0-15s" :
      duration <= 30 ? "16-30s" :
      duration <= 45 ? "31-45s" :
      duration <= 60 ? "46-60s" :
      "60s+";
    durationBuckets.set(bucket, (durationBuckets.get(bucket) || 0) + 1);
  }

  const topByLikes = [...items]
    .sort((a, b) => (Number(b.likeCount || 0) - Number(a.likeCount || 0)))
    .slice(0, 10);
  const topByCtr = [...items]
    .filter((item) => Number.isFinite(Number(item.ctr)))
    .sort((a, b) => (Number(b.ctr || 0) - Number(a.ctr || 0)))
    .slice(0, 10);

  return {
    datasetType: "ads",
    itemCount: items.length,
    topBrands: topEntries(brandCounts, 15),
    topObjectives: topEntries(objectiveCounts, 10),
    topIndustries: topEntries(industryCounts, 10),
    topRegions: topEntries(regionCounts, 15),
    topKeywords: topEntries(keywordCounts, 20),
    recurringHooks: topEntries(hookCounts, 15),
    offerPatterns: topEntries(offerCounts, 10),
    ctaPatterns: topEntries(ctaCounts, 10),
    durationBuckets: topEntries(durationBuckets, 10),
    topByLikes,
    topByCtr
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const dataset = readJson(args.input);
  const analysis = analyze(dataset);

  if (args.output) {
    writeJson(args.output, analysis);
    console.log(`Saved ad analysis to ${args.output}`);
    return;
  }

  console.log(JSON.stringify(analysis, null, 2));
}

main();
