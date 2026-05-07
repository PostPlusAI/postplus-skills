#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runHostedCapabilityRequest } from "../../../../_postplus_shared/00-core/shared-runtime/scripts/lib/postplus_cloud_client.mjs";

export const SOURCE_IDS = {
  linkedinPosts: "gd_lyy3tktm25m4avu764",
  youtubeVideos: "gd_lk56epmy2i5g7lzu0k",
  facebookProfilePosts: "gd_lkaxegm826bjpoo9m5",
  facebookGroupPosts: "gd_lz11l67o2cb3r0lkj3",
  facebookPostByUrl: "gd_lyclm1571iy3mv57zw"
};

const SOURCE_KEYS_BY_SOURCE_ID = new Map([
  [SOURCE_IDS.linkedinPosts, "linkedin-posts"],
  [SOURCE_IDS.youtubeVideos, "youtube-videos"],
  [SOURCE_IDS.facebookProfilePosts, "facebook-profile-posts"],
  [SOURCE_IDS.facebookGroupPosts, "facebook-group-posts"],
  [SOURCE_IDS.facebookPostByUrl, "facebook-post-by-url"],
]);

const SNAPSHOT_POLL_MS = 3000;
const MIN_SNAPSHOT_WAIT_MS = 60000;
const PER_REQUESTED_ITEM_WAIT_MS = 24000;
const DEFAULT_MAX_SNAPSHOT_WAIT_MS = 1800000;
const SNAPSHOT_HEARTBEAT_EVERY_ATTEMPTS = 10;

export const DEFAULT_SUPPORTED_PLATFORMS = Object.freeze(["linkedin", "youtube", "facebook"]);

export function normalizeSupportedPlatforms(platforms = DEFAULT_SUPPORTED_PLATFORMS) {
  const normalized = Array.from(
    new Set((Array.isArray(platforms) ? platforms : []).map((item) => String(item || "").trim()))
  ).filter(Boolean);

  if (normalized.length === 0) {
    throw new Error("supportedPlatforms must contain at least one Public content platform");
  }

  const invalid = normalized.filter((item) => !DEFAULT_SUPPORTED_PLATFORMS.includes(item));
  if (invalid.length > 0) {
    throw new Error(`Unsupported Public content platforms: ${invalid.join(", ")}`);
  }

  return normalized;
}

export function formatSupportedPlatforms(platforms = DEFAULT_SUPPORTED_PLATFORMS) {
  return normalizeSupportedPlatforms(platforms).join(", ");
}

export function readPositiveIntegerEnv(name, fallback) {
  const rawValue = process.env[name];
  if (rawValue === undefined || rawValue === null || rawValue === "") {
    return fallback;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number`);
  }

  return Math.ceil(parsed);
}

export function formatSnapshotLog({
  snapshotId,
  status,
  attempt,
  maxAttempts,
  elapsedMs
}) {
  const elapsedSeconds = Math.round(elapsedMs / 1000);
  return `[public-content] snapshot ${snapshotId} status=${status} attempt=${attempt}/${maxAttempts} elapsed=${elapsedSeconds}s`;
}

export function shouldLogSnapshotProgress({ attempt, status, previousStatus }) {
  if (attempt === 1) return true;
  if (status !== previousStatus) return true;
  return attempt % SNAPSHOT_HEARTBEAT_EVERY_ATTEMPTS === 0;
}

export function resolveRequestedItemCount(input) {
  const items = Array.isArray(input) ? input : [];
  if (items.length === 0) return 1;

  return items.reduce((total, item) => {
    const requestedPosts = Number(item?.num_of_posts);
    if (Number.isFinite(requestedPosts) && requestedPosts > 0) {
      return total + Math.ceil(requestedPosts);
    }
    return total + 1;
  }, 0);
}

export function resolveSnapshotPolling(input) {
  const requestedItemCount = resolveRequestedItemCount(input);
  const maxSnapshotWaitMs = readPositiveIntegerEnv(
    "PUBLIC_CONTENT_MAX_SNAPSHOT_WAIT_MS",
    DEFAULT_MAX_SNAPSHOT_WAIT_MS
  );
  const maxWaitMs = Math.min(
    maxSnapshotWaitMs,
    Math.max(
      MIN_SNAPSHOT_WAIT_MS,
      MIN_SNAPSHOT_WAIT_MS + requestedItemCount * PER_REQUESTED_ITEM_WAIT_MS
    )
  );

  return {
    pollMs: SNAPSHOT_POLL_MS,
    maxAttempts: Math.ceil(maxWaitMs / SNAPSHOT_POLL_MS)
  };
}

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith("--")) continue;
    const key = current.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

export function isDirectRun(metaUrl) {
  if (!process.argv[1]) {
    return false;
  }

  try {
    return (
      fs.realpathSync(fileURLToPath(metaUrl)) ===
      fs.realpathSync(path.resolve(process.argv[1]))
    );
  } catch {
    return metaUrl.endsWith(process.argv[1]);
  }
}

export function requireArg(args, key) {
  const value = args[key];
  if (!value) {
    throw new Error(`Missing required argument --${key}`);
  }
  return String(value);
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
}

export function writeJson(filePath, value) {
  const resolved = path.resolve(filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, JSON.stringify(value, null, 2));
}

export function writeText(filePath, value) {
  const resolved = path.resolve(filePath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, value);
}

export function ensureDir(dirPath) {
  fs.mkdirSync(path.resolve(dirPath), { recursive: true });
}

export function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function extractUrls(text) {
  return Array.from(
    new Set((String(text || "").match(/https?:\/\/[^\s]+/g) || []).map((item) => item.trim()))
  );
}

export function classifyPlatformFromUrl(url) {
  const current = String(url || "").trim();
  if (/linkedin\.com\/(posts|feed\/update)/i.test(current)) {
    return "linkedin";
  }
  if (/youtube\.com\/watch/i.test(current) || /youtu\.be\//i.test(current)) {
    return "youtube";
  }
  if (/facebook\.com\//i.test(current)) {
    return "facebook";
  }
  return null;
}

const BILINGUAL_SUPPORTED_PLATFORM_TERMS = Object.freeze({
  linkedin: ["linkedin", "领英"],
  youtube: ["youtube", "油管"],
  facebook: ["facebook", "脸书"],
});

const BILINGUAL_UNSUPPORTED_PLATFORM_TERMS = Object.freeze({
  tiktok: ["tiktok", "tik tok", "抖音"],
  instagram: ["instagram", "ig", "ins", "xiaohongshu", "小红书"],
  x: ["twitter", "x", "推特"],
});

const BILINGUAL_COUNT_UNITS = Object.freeze(["result", "results", "post", "posts", "video", "videos", "item", "items", "条", "个"]);

function includesBilingualTerm(value, terms) {
  return terms.some((term) => {
    if (/^[a-z ]+$/.test(term)) {
      return new RegExp(`(^|[^a-z])${term.replace(/ /g, "\\s+")}([^a-z]|$)`).test(value);
    }
    return value.includes(term);
  });
}

export function detectPlatforms(text) {
  const value = String(text || "").toLowerCase();
  const platforms = [];
  for (const [platform, terms] of Object.entries(BILINGUAL_SUPPORTED_PLATFORM_TERMS)) {
    if (includesBilingualTerm(value, terms)) {
      platforms.push(platform);
    }
  }
  return platforms;
}

export function detectUnsupportedPlatforms(text) {
  const value = String(text || "").toLowerCase();
  const unsupported = [];
  for (const [platform, terms] of Object.entries(BILINGUAL_UNSUPPORTED_PLATFORM_TERMS)) {
    if (includesBilingualTerm(value, terms)) {
      unsupported.push(platform);
    }
  }
  return Array.from(new Set(unsupported));
}

export function parseRequestedCount(text, fallback = 50) {
  const value = String(text || "");
  const countUnitPattern = BILINGUAL_COUNT_UNITS.join("|");
  const directMatch = value.match(new RegExp(`(\\d+)\\s*(${countUnitPattern})`, "i"));
  if (directMatch) {
    const parsed = Number(directMatch[1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  const looseMatch = value.match(new RegExp(`(\\d+)[^\\d]{0,20}(${countUnitPattern})`, "i"));
  if (looseMatch) {
    const parsed = Number(looseMatch[1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return fallback;
}

export function clampRequestedCount(count, min = 1, max = 10) {
  const parsed = Number(count);
  if (!Number.isFinite(parsed)) return max;
  return Math.min(max, Math.max(min, parsed));
}

export function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = String(value).replace(/,/g, "").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function scoreEngagement(metrics) {
  return [
    metrics.likes,
    metrics.comments,
    metrics.shares,
    metrics.views
  ].reduce((total, value) => total + (toNumber(value) || 0), 0);
}

export async function collectPublicContent({
  sourceId,
  input,
  fetchImpl = globalThis.fetch,
  logger = console
}) {
  void fetchImpl;
  void logger;
  if (!Array.isArray(input) || input.length === 0) {
    throw new Error("Public content scrape input must contain at least one item");
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("fetch is required for Public content requests");
  }

  return await runHostedCapabilityRequest({
    capability: "public-content-collection",
    operation: "scrape",
    sourceKey: resolveSourceKey(sourceId),
    input,
  });
}

function parsePublicContentBody(bodyText) {
  try {
    return JSON.parse(bodyText);
  } catch {
    const lines = bodyText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      throw new Error("Public content returned an empty body");
    }
    return lines.map((line) => JSON.parse(line));
  }
}

export function summarizePlatformItems(items) {
  const normalizedItems = Array.isArray(items) ? items : [];
  return {
    itemCount: normalizedItems.length,
    withLikes: normalizedItems.filter((item) => item.metrics.likes !== null).length,
    withViews: normalizedItems.filter((item) => item.metrics.views !== null).length
  };
}

export async function discoverPublicContent({ discoveryTool, args, fetchImpl = globalThis.fetch }) {
  void fetchImpl;
  return await runHostedCapabilityRequest({
    capability: "public-content-discovery",
    operation: "tool-call",
    toolKey: resolveDiscoveryToolKey(discoveryTool),
    args,
  });
}

function resolveSourceKey(sourceId) {
  const sourceKey = SOURCE_KEYS_BY_SOURCE_ID.get(sourceId);
  if (!sourceKey) {
    throw new Error(`Unsupported public content source: ${sourceId}`);
  }
  return sourceKey;
}

function resolveDiscoveryToolKey(discoveryTool) {
  if (discoveryTool === "search_engine") {
    return "web-search";
  }
  throw new Error(`Unsupported public content discovery tool: ${discoveryTool}`);
}
