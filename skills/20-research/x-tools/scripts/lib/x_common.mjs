import fs from "node:fs";
import path from "node:path";
import { maybeRegisterCampaignReport } from "../../_postplus_shared/scripts/lib/campaign-report-manifest.mjs";

export const SCHEMA_VERSION = "1.0.0";

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith("--")) {
      continue;
    }
    const key = current.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
}

export function writeJson(filePath, value) {
  const absolutePath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, JSON.stringify(value, null, 2));
  maybeRegisterCampaignReport(absolutePath);
}

export function cleanString(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value).trim();
  return text ? text : null;
}

export function safeLower(value) {
  return cleanString(value)?.toLowerCase() || "";
}

export function toArray(value) {
  if (Array.isArray(value)) {
    return value.filter((entry) => entry !== null && entry !== undefined);
  }
  if (value === null || value === undefined || value === "") {
    return [];
  }
  return [value];
}

export function pickFirst(item, keys) {
  for (const key of keys) {
    const value = key.includes(".")
      ? key.split(".").reduce((current, part) => current?.[part], item)
      : item?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
}

export function parseNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const raw = String(value).trim().toLowerCase();
  if (!raw) {
    return null;
  }

  const multiplier =
    raw.endsWith("k") ? 1_000 :
    raw.endsWith("m") ? 1_000_000 :
    raw.endsWith("b") ? 1_000_000_000 :
    1;

  const numericPart = raw.replace(/,/g, "").replace(/[^0-9.+-]/g, "");
  if (!numericPart) {
    return null;
  }

  const parsed = Number(numericPart);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed * multiplier;
}

export function parseBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }
  const text = safeLower(value);
  if (!text) {
    return null;
  }
  if (["true", "yes", "y", "1"].includes(text)) {
    return true;
  }
  if (["false", "no", "n", "0"].includes(text)) {
    return false;
  }
  return null;
}

export function toIsoDate(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const millis = value > 1e12 ? value : value * 1000;
    const date = new Date(millis);
    return Number.isNaN(date.valueOf()) ? null : date.toISOString();
  }

  const text = cleanString(value);
  if (!text) {
    return null;
  }

  const asNumber = Number(text);
  if (Number.isFinite(asNumber)) {
    return toIsoDate(asNumber);
  }

  const date = new Date(text);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

export function uniqueStrings(values) {
  const deduped = [];
  const seen = new Set();
  for (const value of values) {
    const text = cleanString(value);
    if (!text) {
      continue;
    }
    const key = text.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(text);
  }
  return deduped;
}

export function computeRate(numerator, denominator, precision = 6) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }
  return Number((numerator / denominator).toFixed(precision));
}

function matchArrayText(item, keys) {
  return uniqueStrings(
    toArray(pickFirst(item, keys)).map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }
      if (entry && typeof entry === "object") {
        return cleanString(pickFirst(entry, ["text", "url", "expanded_url", "expandedUrl", "screen_name", "username", "name"]));
      }
      return null;
    })
  );
}

function normalizeHashtags(item) {
  return uniqueStrings([
    ...matchArrayText(item, ["hashtags", "entities.hashtags", "tags"]).map((entry) => entry.replace(/^#/, "")),
    ...(String(pickFirst(item, ["full_text", "text", "tweetText", "description"]) || "")
      .match(/#[\p{L}\p{N}_]+/gu)?.map((tag) => tag.slice(1)) || [])
  ]);
}

function normalizeMentions(item) {
  return uniqueStrings([
    ...matchArrayText(item, ["mentions", "user_mentions", "entities.user_mentions"]).map((entry) => entry.replace(/^@/, "")),
    ...(String(pickFirst(item, ["full_text", "text", "tweetText", "description"]) || "")
      .match(/@[\p{L}\p{N}_]+/gu)?.map((mention) => mention.slice(1)) || [])
  ]);
}

function normalizeUrls(item) {
  return uniqueStrings(matchArrayText(item, ["urls", "entities.urls", "expandedUrls"]));
}

export function inferDatasetType(sourceId, explicitDatasetType, items) {
  const provided = cleanString(explicitDatasetType);
  if (provided) {
    return provided;
  }

  const actor = safeLower(sourceId);
  if (actor.includes("tweet")) return "tweets";
  if (actor.includes("follower")) return "followers";
  if (actor.includes("following")) return "following";
  if (actor.includes("retweeter")) return "retweeters";
  if (actor.includes("user") || actor.includes("profile")) return "profiles";

  const sample = Array.isArray(items) ? items[0] : null;
  if (!sample || typeof sample !== "object") {
    return "unknown";
  }
  if (pickFirst(sample, ["full_text", "text", "tweetId", "conversationId"])) {
    return "tweets";
  }
  if (pickFirst(sample, ["followersCount", "screen_name", "userName", "username"])) {
    return "profiles";
  }
  return "unknown";
}

function normalizeProfileUrl(username, item) {
  return cleanString(pickFirst(item, ["profileUrl", "url", "twitterUrl", "link"])) ||
    (username ? `https://x.com/${username}` : null);
}

function normalizeTweetItem(item, sourceId) {
  const authorUsername = cleanString(
    pickFirst(item, [
      "author.userName",
      "author.username",
      "author.screen_name",
      "userName",
      "username",
      "screen_name"
    ])
  );
  const tweetId = cleanString(pickFirst(item, ["id", "tweetId", "rest_id", "tweet_id"]));
  return {
    platform: "x",
    recordType: "tweet",
    tweetId,
    conversationId: cleanString(pickFirst(item, ["conversationId", "conversation_id"])),
    authorUsername,
    authorDisplayName: cleanString(
      pickFirst(item, ["author.name", "author.displayName", "displayName", "name"])
    ),
    text: cleanString(pickFirst(item, ["full_text", "text", "tweetText", "content"])),
    lang: cleanString(pickFirst(item, ["lang", "language"])),
    hashtags: normalizeHashtags(item),
    mentions: normalizeMentions(item),
    urls: normalizeUrls(item),
    likeCount: parseNumber(pickFirst(item, ["favorite_count", "likes", "likeCount"])),
    replyCount: parseNumber(pickFirst(item, ["reply_count", "replies", "replyCount"])),
    retweetCount: parseNumber(pickFirst(item, ["retweet_count", "retweets", "retweetCount"])),
    quoteCount: parseNumber(pickFirst(item, ["quote_count", "quotes", "quoteCount"])),
    bookmarkCount: parseNumber(pickFirst(item, ["bookmark_count", "bookmarkCount"])),
    viewCount: parseNumber(pickFirst(item, ["view_count", "views", "viewCount"])),
    isRetweet: Boolean(parseBoolean(pickFirst(item, ["isRetweet", "retweeted"]))),
    isReply: Boolean(pickFirst(item, ["in_reply_to_status_id_str", "inReplyToStatusId", "inReplyToUsername"])),
    isQuote: Boolean(parseBoolean(pickFirst(item, ["isQuote", "quoted"]))),
    inReplyToUsername: cleanString(pickFirst(item, ["in_reply_to_screen_name", "inReplyToUsername"])),
    tweetUrl: cleanString(pickFirst(item, ["url", "tweetUrl"])) ||
      (authorUsername && tweetId ? `https://x.com/${authorUsername}/status/${tweetId}` : null),
    publishedAt: toIsoDate(pickFirst(item, ["created_at", "createdAt", "timestamp"])),
    source: {
      sourceId,
      sourceUrl: cleanString(pickFirst(item, ["url", "tweetUrl"])),
      scrapedAt: toIsoDate(pickFirst(item, ["scrapedAt", "fetchedAt", "timestamp"]))
    }
  };
}

function normalizeProfileItem(item, sourceId) {
  const username = cleanString(
    pickFirst(item, ["screen_name", "userName", "username", "handle"])
  );
  const website =
    cleanString(pickFirst(item, ["url", "website"])) ||
    cleanString(item?.entities?.url?.urls?.[0]?.expanded_url) ||
    cleanString(item?.entities?.url?.urls?.[0]?.url);
  return {
    platform: "x",
    recordType: "profile",
    userId: cleanString(pickFirst(item, ["id", "userId", "rest_id"])),
    username,
    displayName: cleanString(pickFirst(item, ["name", "displayName"])),
    description: cleanString(pickFirst(item, ["description", "bio", "legacy.description"])),
    location: cleanString(pickFirst(item, ["location"])),
    website,
    followersCount: parseNumber(pickFirst(item, ["followers_count", "followersCount", "followers"])),
    followingCount: parseNumber(pickFirst(item, ["friends_count", "followingCount", "following"])),
    statusesCount: parseNumber(pickFirst(item, ["statuses_count", "statusesCount", "tweetCount"])),
    favouritesCount: parseNumber(pickFirst(item, ["favourites_count", "favouritesCount", "favoritesCount"])),
    listedCount: parseNumber(pickFirst(item, ["listed_count", "listedCount"])),
    mediaCount: parseNumber(pickFirst(item, ["media_count", "mediaCount"])),
    isVerified: Boolean(parseBoolean(pickFirst(item, ["verified", "isVerified"]))),
    isBlueVerified: parseBoolean(pickFirst(item, ["is_blue_verified", "isBlueVerified"])),
    canDm: parseBoolean(pickFirst(item, ["can_dm", "canDm"])),
    joinedAt: toIsoDate(pickFirst(item, ["created_at", "createdAt", "joinDate"])),
    profileUrl: normalizeProfileUrl(username, item),
    profileImageUrl: cleanString(pickFirst(item, ["profile_image_url_https", "profileImageUrl", "profilePicture"])),
    bannerImageUrl: cleanString(pickFirst(item, ["profile_banner_url", "bannerImageUrl", "coverPicture"])),
    professionalCategory: cleanString(
      pickFirst(item, ["professional_category", "professionalCategory", "professional.professional_type"])
    ),
    email: cleanString(pickFirst(item, ["email"])),
    source: {
      sourceId,
      sourceUrl: cleanString(pickFirst(item, ["url", "profileUrl"])),
      scrapedAt: toIsoDate(pickFirst(item, ["scrapedAt", "fetchedAt", "timestamp"]))
    }
  };
}

function normalizeRelationshipItem(item, sourceId, relationshipType) {
  const normalizedProfile = normalizeProfileItem(item, sourceId);
  return {
    ...normalizedProfile,
    relationship: {
      platform: "x",
      recordType: "relationship",
      relationshipType,
      sourceUsername: cleanString(pickFirst(item, ["sourceUsername", "inputUsername", "requestedUsername"])),
      targetUsername: normalizedProfile.username,
      sourceUserId: cleanString(pickFirst(item, ["sourceUserId", "inputUserId"])),
      targetUserId: normalizedProfile.userId,
      tweetId: cleanString(pickFirst(item, ["tweetId"])),
      capturedAt: toIsoDate(pickFirst(item, ["capturedAt", "scrapedAt", "fetchedAt", "timestamp"])) || new Date().toISOString()
    }
  };
}

export function normalizeItem(item, options = {}) {
  const sourceId = cleanString(options.sourceId);
  const datasetType = inferDatasetType(sourceId, options.datasetType, [item]);

  if (datasetType === "tweets") {
    return normalizeTweetItem(item, sourceId);
  }
  if (datasetType === "profiles") {
    return normalizeProfileItem(item, sourceId);
  }
  if (datasetType === "followers" || datasetType === "following" || datasetType === "retweeters") {
    return normalizeRelationshipItem(item, sourceId, datasetType.slice(0, -1));
  }

  return {
    platform: "x",
    recordType: "unknown",
    raw: item,
    source: {
      sourceId,
      scrapedAt: new Date().toISOString()
    }
  };
}

export function normalizeDataset(input, options = {}) {
  const sourceId = cleanString(options.sourceId || input?.sourceId);
  const rawItems = Array.isArray(input?.items) ? input.items : toArray(input);
  const datasetType = inferDatasetType(sourceId, options.datasetType, rawItems);

  return {
    schemaVersion: SCHEMA_VERSION,
    platform: "x",
    datasetType,
    sourceId,
    fetchedAt: cleanString(input?.fetchedAt) || new Date().toISOString(),
    input: input?.input || null,
    inputPath: cleanString(options.inputPath),
    itemCount: rawItems.length,
    items: rawItems.map((item) => normalizeItem(item, { sourceId, datasetType }))
  };
}

export function summarizeByUsername(items, key = "username") {
  const map = new Map();
  for (const item of items) {
    const username = cleanString(item?.[key]);
    if (!username) {
      continue;
    }
    if (!map.has(username)) {
      map.set(username, []);
    }
    map.get(username).push(item);
  }
  return map;
}
