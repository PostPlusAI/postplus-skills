import fs from "node:fs";
import path from "node:path";

import { readSkillExecutionInput } from "../../_postplus_shared/00-core/shared-runtime/scripts/lib/hosted_execution_protocol.mjs";

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
  return readSkillExecutionInput(
    JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8")),
  );
}

export function writeJson(filePath, value) {
  const absolutePath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, JSON.stringify(value, null, 2));
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
    if (key.includes(".")) {
      const value = pickNested(item, key);
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
      continue;
    }
    const value = item?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
}

function pickNested(item, key) {
  return key.split(".").reduce((current, part) => current?.[part], item);
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

export function cadenceLabel(itemCount) {
  if (!Number.isFinite(itemCount) || itemCount <= 0) {
    return null;
  }
  if (itemCount >= 20) return "daily";
  if (itemCount >= 8) return "weekly";
  if (itemCount >= 3) return "occasional";
  return "sparse";
}

function normalizeStartUrls(input) {
  return toArray(input?.startUrls).map((entry) => {
    if (typeof entry === "string") {
      return entry;
    }
    return cleanString(entry?.url);
  }).filter(Boolean);
}

function inferSourceSurface(sourceId, input, item) {
  const actor = safeLower(sourceId);
  const rawUrl = cleanString(
    pickFirst(item, ["url", "webVideoUrl", "videoUrl", "videoWebUrl", "aweme_url", "video_url"])
  );
  const startUrls = normalizeStartUrls(input);

  if (actor.includes("comments")) return "comments";
  if (actor.includes("shop-creators")) return "shop";
  if (actor.includes("creative-center") || actor.includes("top-ads")) return "ads";
  if (actor.includes("video-scraper")) return "video";
  if (actor.includes("profile")) return "profile";
  if (actor.includes("user-search")) return "search";
  if (actor.includes("hashtag")) return "hashtag";

  if (pickFirst(item, ["searchKeyword", "searchTerm", "keyword"])) return "search";
  if (pickFirst(item, ["hashtags", "challengeInfoList"])) return "hashtag";
  if (rawUrl?.includes("/tag/")) return "hashtag";
  if (rawUrl?.includes("/music/")) return "music";
  if (rawUrl?.includes("/@")) return rawUrl.includes("/video/") ? "video" : "profile";
  if (startUrls.some((url) => url.includes("/tag/"))) return "hashtag";
  if (startUrls.some((url) => url.includes("/music/"))) return "music";
  if (startUrls.some((url) => url.includes("/video/"))) return "video";
  if (startUrls.some((url) => url.includes("/@"))) return "profile";
  if (toArray(input?.keywords).length || toArray(input?.searchQueries).length || toArray(input?.search).length) {
    return "search";
  }
  return "unknown";
}

function inferSourceQuery(input, item, sourceSurface) {
  const itemQuery = cleanString(
    pickFirst(item, ["searchKeyword", "searchTerm", "keyword", "challengeName", "hashtagName", "hashtag"])
  );
  if (itemQuery) {
    return itemQuery;
  }

  if (sourceSurface === "search") {
    return cleanString(toArray(input?.keywords)[0] || toArray(input?.searchQueries)[0] || toArray(input?.search)[0]);
  }
  if (sourceSurface === "hashtag") {
    return cleanString(toArray(input?.hashtags)[0]);
  }
  if (sourceSurface === "profile") {
    return cleanString(toArray(input?.profiles)[0]);
  }
  if (sourceSurface === "video" || sourceSurface === "comments") {
    return cleanString(
      toArray(input?.postURLs)[0] ||
      toArray(input?.postUrls)[0] ||
      normalizeStartUrls(input)[0]
    );
  }
  return cleanString(normalizeStartUrls(input)[0]);
}

function inferRegionCode(input, item) {
  return cleanString(
    pickFirst(item, ["region", "regionCode", "country", "location"]) ||
    pickFirst(input, ["location", "country", "regionCode"])
  );
}

function extractHashtagsFromText(text) {
  return Array.from(String(text || "").matchAll(/#([\p{L}\p{N}_]+)/gu), (match) => match[1]);
}

function extractMentionsFromText(text) {
  return Array.from(String(text || "").matchAll(/@([\p{L}\p{N}._]+)/gu), (match) => match[1]);
}

function normalizeHashtags(item) {
  const collected = [
    ...toArray(pickFirst(item, ["hashtags", "textExtra", "challengeInfoList"])).map((entry) => {
      if (typeof entry === "string") {
        return entry.replace(/^#/, "");
      }
      if (entry && typeof entry === "object") {
        return cleanString(pickFirst(entry, ["name", "hashtagName", "hashtag"]))?.replace(/^#/, "");
      }
      return null;
    }),
    ...extractHashtagsFromText(pickFirst(item, ["text", "desc", "caption"]))
  ];
  return uniqueStrings(collected);
}

function normalizeMentions(item) {
  const collected = [
    ...toArray(pickFirst(item, ["mentions", "textExtra"])).map((entry) => {
      if (typeof entry === "string") {
        return entry.replace(/^@/, "");
      }
      if (entry && typeof entry === "object") {
        return cleanString(pickFirst(entry, ["uniqueId", "userUniqueId", "username", "userName"]))?.replace(/^@/, "");
      }
      return null;
    }),
    ...extractMentionsFromText(pickFirst(item, ["text", "desc", "caption"]))
  ];
  return uniqueStrings(collected);
}

export function inferDatasetType(sourceId, explicitDatasetType, items) {
  const provided = cleanString(explicitDatasetType);
  if (provided) {
    return provided;
  }

  const actor = safeLower(sourceId);
  if (actor.includes("user-search")) return "user-search";
  if (actor.includes("profile")) return "profiles";
  if (actor.includes("comment")) return "comments";
  if (actor.includes("shop-creators")) return "shop-creators";
  if (actor.includes("tiktok-scraper")) return "videos";

  const sample = Array.isArray(items) ? items[0] : null;
  if (!sample || typeof sample !== "object") {
    return "unknown";
  }
  if (pickFirst(sample, ["comment", "text", "digg_count", "reply_comment_total"]) && pickFirst(sample, ["aweme_id", "video_id", "videoWebUrl"])) {
    return "comments";
  }
  if (pickFirst(sample, ["authorMeta.name", "authorMeta.nickName", "webVideoUrl", "videoUrl", "createTimeISO"])) {
    return "videos";
  }
  if (pickFirst(sample, ["signature", "bioLink", "fans", "followerCount", "uniqueId"])) {
    return "profiles";
  }
  return "unknown";
}

function normalizeProfileUrl(username, item) {
  return cleanString(
    pickFirst(item, ["profileUrl", "url", "profileLink", "authorMeta.profileUrl"])
  ) || (username ? `https://www.tiktok.com/@${username}` : null);
}

function normalizeProfileItem(item, sourceId, datasetType, input) {
  const profileSource = item?.authorMeta && typeof item.authorMeta === "object" ? item.authorMeta : item;
  const username = cleanString(
    pickFirst(profileSource, [
      "uniqueId",
      "name",
      "username",
      "userName"
    ])
  );
  const sourceSurface = inferSourceSurface(sourceId, input, item);
  const sourceQuery = inferSourceQuery(input, item, sourceSurface);
  const regionCode = inferRegionCode(input, item);

  return {
    platform: "tiktok",
    recordType: "profile",
    profileId: cleanString(pickFirst(profileSource, ["id", "uid"])),
    username,
    displayName: cleanString(
      pickFirst(profileSource, ["nickName", "nickname", "displayName"])
    ),
    signature: cleanString(pickFirst(profileSource, ["signature", "bio"])),
    bioLink: cleanString(pickFirst(profileSource, ["bioLink", "link", "website"])),
    followersCount: parseNumber(pickFirst(profileSource, ["fans", "followerCount", "followersCount"])),
    followingCount: parseNumber(pickFirst(profileSource, ["following", "followingCount"])),
    likesReceivedCount: parseNumber(pickFirst(profileSource, ["heart", "heartCount", "likesCount"])),
    videoCount: parseNumber(pickFirst(profileSource, ["video", "videoCount", "videosCount"])),
    isVerified: Boolean(parseBoolean(pickFirst(profileSource, ["verified", "isVerified"]))),
    isPrivate: Boolean(parseBoolean(pickFirst(profileSource, ["privateAccount", "isPrivate"]))),
    isSeller: Boolean(
      parseBoolean(pickFirst(profileSource, ["commerceUserInfo.commerceUser"])) ||
      parseBoolean(pickFirst(profileSource, ["ttSeller", "isSeller"]))
    ),
    matchedQueries: [],
    matchedHashtags: [],
    matchedVideoUrls: [],
    sourceEvidence: {
      matchedContentCount: 0,
      discoveryPaths: uniqueStrings([sourceSurface])
    },
    sourceSurface,
    sourceQuery,
    regionCode,
    profileUrl: normalizeProfileUrl(username, profileSource),
    profileImageUrl: cleanString(
      pickFirst(profileSource, ["avatar", "avatarThumb", "avatarMedium", "avatarUrl", "originalAvatarUrl"])
    ),
    source: {
      sourceId,
      datasetType,
      sourceUrl: cleanString(pickFirst(profileSource, ["url", "profileUrl"])) || cleanString(pickFirst(item, ["url", "profileUrl"])),
      scrapedAt: toIsoDate(
        pickFirst(item, ["scrapedAt", "fetchedAt", "createTimeISO", "timestamp"]) ||
        pickFirst(profileSource, ["scrapedAt", "fetchedAt", "createTimeISO", "timestamp", "createTime"])
      )
    }
  };
}

function normalizeVideoItem(item, sourceId, input) {
  const username = cleanString(
    pickFirst(item, [
      "authorMeta.name",
      "authorMeta.uniqueId",
      "author.uniqueId",
      "username",
      "channel.username"
    ])
  );
  const displayName = cleanString(
    pickFirst(item, [
      "authorMeta.nickName",
      "author.nickname",
      "authorMeta.name",
      "channel.name"
    ])
  );
  const videoId = cleanString(pickFirst(item, ["id", "videoId", "aweme_id"]));
  const sourceSurface = inferSourceSurface(sourceId, input, item);
  const sourceQuery = inferSourceQuery(input, item, sourceSurface);
  const regionCode = inferRegionCode(input, item);
  return {
    platform: "tiktok",
    recordType: "video",
    videoId,
    authorUsername: username,
    authorDisplayName: displayName,
    text: cleanString(pickFirst(item, ["text", "desc", "caption"])) || "",
    hashtags: normalizeHashtags(item),
    mentions: normalizeMentions(item),
    sourceSurface,
    sourceQuery,
    searchKeyword: cleanString(pickFirst(item, ["searchKeyword", "searchTerm", "keyword"])) || sourceQuery,
    regionCode,
    likeCount: parseNumber(
      pickFirst(item, ["diggCount", "likes", "likeCount"])
    ),
    commentCount: parseNumber(
      pickFirst(item, ["commentCount", "comments"])
    ),
    shareCount: parseNumber(
      pickFirst(item, ["shareCount", "shares"])
    ),
    viewCount: parseNumber(
      pickFirst(item, ["playCount", "views", "viewCount"])
    ),
    saveCount: parseNumber(
      pickFirst(item, ["collectCount", "collects", "saveCount", "bookmarks"])
    ),
    videoDurationSeconds: parseNumber(
      pickFirst(item, ["videoDuration", "videoDurationSeconds", "duration", "video.duration"])
    ),
    musicId: cleanString(
      pickFirst(item, ["musicMeta.musicId", "music.id", "musicId", "song.id"])
    ),
    musicTitle: cleanString(
      pickFirst(item, [
        "musicMeta.musicName",
        "music.title",
        "musicTitle",
        "musicMeta.title",
        "song.title"
      ])
    ),
    textLanguage: cleanString(pickFirst(item, ["textLanguage", "language", "lang"])),
    commentsDatasetUrl: cleanString(pickFirst(item, ["commentsDatasetUrl", "commentsDatasetURL"])),
    publishedAt: toIsoDate(
      pickFirst(item, [
        "createTimeISO",
        "createTime",
        "timestamp",
        "uploadedAtFormatted",
        "uploadedAt"
      ])
    ),
    postPageUrl: cleanString(pickFirst(item, ["postPage", "inputSource"])),
    videoUrl: cleanString(
      pickFirst(item, ["postPage", "webVideoUrl", "video.url", "url", "videoUrl"])
    ) ||
      (username && videoId ? `https://www.tiktok.com/@${username}/video/${videoId}` : null),
    source: {
      sourceId,
      sourceUrl: cleanString(
        pickFirst(item, ["postPage", "inputSource", "url", "webVideoUrl", "video.url", "videoUrl"])
      ),
      scrapedAt: toIsoDate(
        pickFirst(item, ["scrapedAt", "fetchedAt", "createTimeISO", "timestamp"])
      )
    }
  };
}

function normalizeCommentItem(item, sourceId, input) {
  const sourceSurface = inferSourceSurface(sourceId, input, item);
  const sourceQuery = inferSourceQuery(input, item, sourceSurface);
  const regionCode = inferRegionCode(input, item);
  return {
    platform: "tiktok",
    recordType: "comment",
    commentId: cleanString(pickFirst(item, ["cid", "commentId", "id"])),
    videoId: cleanString(pickFirst(item, ["aweme_id", "video_id", "videoId"])),
    videoUrl: cleanString(pickFirst(item, ["videoWebUrl", "aweme_url", "video_url"])),
    authorUsername: cleanString(pickFirst(item, ["user.unique_id", "user.username", "username"])),
    sourceSurface,
    sourceQuery,
    regionCode,
    text: cleanString(pickFirst(item, ["text", "comment"])) || "",
    likeCount: parseNumber(pickFirst(item, ["digg_count", "diggCount", "likeCount"])),
    replyCount: parseNumber(pickFirst(item, ["reply_comment_total", "replyCount"])),
    publishedAt: toIsoDate(pickFirst(item, ["create_time", "createTime", "timestamp"])),
    source: {
      sourceId,
      sourceUrl: cleanString(pickFirst(item, ["videoWebUrl", "aweme_url", "video_url"])),
      scrapedAt: toIsoDate(pickFirst(item, ["scrapedAt", "fetchedAt", "timestamp"]))
    }
  };
}

function normalizeShopCreatorItem(item, sourceId, input) {
  const username = cleanString(pickFirst(item, ["username", "creatorUsername", "handle"]));
  const sourceSurface = inferSourceSurface(sourceId, input, item);
  const sourceQuery = inferSourceQuery(input, item, sourceSurface);
  const regionCode = inferRegionCode(input, item);
  return {
    platform: "tiktok",
    recordType: "shopCreator",
    creatorId: cleanString(pickFirst(item, ["id", "creatorId"])),
    username,
    displayName: cleanString(pickFirst(item, ["displayName", "nickname", "name"])),
    followersCount: parseNumber(pickFirst(item, ["followersCount", "fans"])),
    sourceSurface,
    sourceQuery,
    regionCode,
    gmv30d: parseNumber(pickFirst(item, ["gmv30d", "gmv", "last30DaysGmv"])),
    unitsSold30d: parseNumber(pickFirst(item, ["unitsSold30d", "last30DaysUnitsSold", "unitsSold"])),
    productCount30d: parseNumber(pickFirst(item, ["productCount30d", "products30d", "productCount"])),
    profileUrl: normalizeProfileUrl(username, item),
    source: {
      sourceId,
      sourceUrl: cleanString(pickFirst(item, ["url", "profileUrl"])),
      scrapedAt: toIsoDate(pickFirst(item, ["scrapedAt", "fetchedAt", "timestamp"]))
    }
  };
}

export function normalizeItem(item, options = {}) {
  const sourceId = cleanString(options.sourceId);
  const datasetType = inferDatasetType(sourceId, options.datasetType, [item]);
  const input = options.input || null;

  if (datasetType === "videos") {
    return normalizeVideoItem(item, sourceId, input);
  }
  if (datasetType === "profiles" || datasetType === "user-search") {
    return normalizeProfileItem(item, sourceId, datasetType, input);
  }
  if (datasetType === "comments") {
    return normalizeCommentItem(item, sourceId, input);
  }
  if (datasetType === "shop-creators") {
    return normalizeShopCreatorItem(item, sourceId, input);
  }

  return {
    platform: "tiktok",
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
  const actorInput = options.input || input?.input || null;
  const effectiveItems =
    datasetType === "profiles"
      ? rawItems
          .map((item) => {
            if (item?.error) {
              return null;
            }
            if (item?.authorMeta && typeof item.authorMeta === "object") {
              return item;
            }
            const username = cleanString(
              pickFirst(item, ["uniqueId", "name", "username", "userName"])
            );
            return username ? item : null;
          })
          .filter(Boolean)
      : rawItems;

  const normalizedItems = effectiveItems.map((item) => normalizeItem(item, { sourceId, datasetType, input: actorInput }));
  const dedupedItems =
    datasetType === "profiles" || datasetType === "user-search"
      ? normalizedItems.filter((item, index, items) => {
          const key = cleanString(item?.username) || cleanString(item?.profileId);
          if (!key) {
            return true;
          }
          return index === items.findIndex((candidate) => {
            const candidateKey = cleanString(candidate?.username) || cleanString(candidate?.profileId);
            return candidateKey === key;
          });
        })
      : normalizedItems;

  return {
    schemaVersion: SCHEMA_VERSION,
    platform: "tiktok",
    datasetType,
    sourceId,
    fetchedAt: cleanString(input?.fetchedAt) || new Date().toISOString(),
    input: actorInput,
    inputPath: cleanString(options.inputPath),
    itemCount: dedupedItems.length,
    items: dedupedItems
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
