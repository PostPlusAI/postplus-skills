import fs from "node:fs";
import path from "node:path";
import { maybeRegisterCampaignReport } from "../../../scripts/lib/campaign-report-manifest.mjs";

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
    const value = item?.[key];
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
  const text = cleanString(value)?.toLowerCase();
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

export function safeLower(value) {
  return cleanString(value)?.toLowerCase() || "";
}

export function computeRate(numerator, denominator, precision = 6) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }
  return Number((numerator / denominator).toFixed(precision));
}

export function splitCsv(value) {
  return uniqueStrings(
    String(value || "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
  );
}

function detectSourceSurface(actorId, datasetType) {
  const actor = safeLower(actorId);
  if (datasetType === "tagged") return "tagged";
  if (datasetType === "hashtags") return "hashtag";
  if (actor.includes("search")) return "search";
  if (actor.includes("hashtag")) return "hashtag";
  if (actor.includes("tagged")) return "tagged";
  if (actor.includes("reel")) return "reel";
  if (actor.includes("post")) return "post";
  if (actor.includes("profile")) return "profile";
  return "direct-url";
}

function detectSourceQuery(input, datasetType) {
  if (!input || typeof input !== "object") {
    return null;
  }
  const candidates =
    datasetType === "hashtags"
      ? toArray(input.hashtags)
      : [
          ...toArray(input.searchTerms),
          ...toArray(input.keywords),
          ...toArray(input.hashtags),
          ...toArray(input.usernames),
          ...toArray(input.directUrls)
        ];
  return cleanString(candidates[0]);
}

function normalizeMediaList(item) {
  const sources = [
    ...toArray(item.displayUrl),
    ...toArray(item.displayUrls),
    ...toArray(item.imageUrl),
    ...toArray(item.imageUrls),
    ...toArray(item.images),
    ...toArray(item.videoUrl),
    ...toArray(item.videoUrls),
    ...toArray(item.videos),
    ...toArray(item.media),
    ...toArray(item.childPosts),
    ...toArray(item.carouselMedia)
  ];

  const media = [];
  for (const entry of sources) {
    if (typeof entry === "string") {
      media.push({
        url: cleanString(entry),
        type: entry.includes(".mp4") ? "video" : "image"
      });
      continue;
    }
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const url = cleanString(
      pickFirst(entry, ["url", "src", "displayUrl", "videoUrl", "imageUrl"])
    );
    if (!url) {
      continue;
    }
    media.push({
      url,
      type: cleanString(pickFirst(entry, ["type", "mediaType"])) || (url.includes(".mp4") ? "video" : "image"),
      width: parseNumber(pickFirst(entry, ["width"])),
      height: parseNumber(pickFirst(entry, ["height"]))
    });
  }

  const seen = new Set();
  return media.filter((entry) => {
    if (!entry.url || seen.has(entry.url)) {
      return false;
    }
    seen.add(entry.url);
    return true;
  });
}

function normalizeHashtags(item) {
  return uniqueStrings([
    ...toArray(item.hashtags).map((entry) => {
      if (typeof entry === "string") {
        return entry.replace(/^#/, "");
      }
      if (entry && typeof entry.name === "string") {
        return entry.name.replace(/^#/, "");
      }
      return null;
    }),
    ...String(pickFirst(item, ["caption", "text"]) || "")
      .match(/#[\p{L}\p{N}_]+/gu)?.map((tag) => tag.slice(1)) || []
  ]);
}

function normalizeMentions(item) {
  return uniqueStrings([
    ...toArray(item.mentions).map((entry) => {
      if (typeof entry === "string") {
        return entry.replace(/^@/, "");
      }
      if (entry && typeof entry.username === "string") {
        return entry.username.replace(/^@/, "");
      }
      if (entry && typeof entry.name === "string") {
        return entry.name.replace(/^@/, "");
      }
      return null;
    }),
    ...String(pickFirst(item, ["caption", "text"]) || "")
      .match(/@[\p{L}\p{N}._]+/gu)?.map((mention) => mention.slice(1)) || []
  ]);
}

function normalizeCoauthors(item) {
  return uniqueStrings(
    toArray(
      pickFirst(item, ["coauthors", "collaborators", "sponsorUsers", "taggedUsers"])
    ).map((entry) => {
      if (typeof entry === "string") {
        return entry.replace(/^@/, "");
      }
      if (entry && typeof entry.username === "string") {
        return entry.username.replace(/^@/, "");
      }
      if (entry && typeof entry.name === "string") {
        return entry.name.replace(/^@/, "");
      }
      return null;
    })
  );
}

function inferDatasetType(actorId, explicitDatasetType, items) {
  const provided = cleanString(explicitDatasetType);
  if (provided) {
    return provided;
  }

  const actor = safeLower(actorId);
  if (actor.includes("profile")) return "profiles";
  if (actor.includes("followers-count")) return "followers-snapshots";
  if (actor.includes("comment")) return "comments";
  if (actor.includes("hashtag-analytics")) return "hashtags";
  if (actor.includes("hashtag-scraper")) return "posts";
  if (actor.includes("hashtag")) return "hashtags";
  if (actor.includes("tagged")) return "tagged";
  if (actor.includes("reel")) return "reels";
  if (actor.includes("post")) return "posts";
  if (actor.includes("search")) return "search";

  const sample = Array.isArray(items) ? items[0] : null;
  if (!sample || typeof sample !== "object") {
    return "unknown";
  }
  if (sample.followersCount !== undefined && sample.biography !== undefined) {
    return "profiles";
  }
  if (sample.ownerUsername !== undefined && sample.text !== undefined && sample.postId !== undefined) {
    return "comments";
  }
  if (sample.shortCode !== undefined || sample.caption !== undefined) {
    return "posts";
  }
  return "unknown";
}

function normalizeProfileItem(item, actorId, sourceInput, datasetType) {
  const website = cleanString(pickFirst(item, ["website", "externalUrl", "link"]));
  return {
    platform: "instagram",
    recordType: "profile",
    profileId: cleanString(pickFirst(item, ["id", "profileId", "userId"])),
    username: cleanString(pickFirst(item, ["username", "userName", "handle"])),
    fullName: cleanString(pickFirst(item, ["fullName", "name"])),
    biography: cleanString(pickFirst(item, ["biography", "bio"])),
    website,
    followersCount: parseNumber(pickFirst(item, ["followersCount", "followers"])),
    followsCount: parseNumber(pickFirst(item, ["followsCount", "followingCount", "following"])),
    postsCount: parseNumber(pickFirst(item, ["postsCount", "posts", "totalPosts"])),
    isVerified: parseBoolean(pickFirst(item, ["verified", "isVerified"])),
    category: cleanString(pickFirst(item, ["categoryName", "category"])),
    businessAddress: cleanString(
      pickFirst(item, ["businessAddress", "address", "locationName", "location"])
    ),
    profileUrl: cleanString(
      pickFirst(item, ["profileUrl", "url"]) ||
        (cleanString(pickFirst(item, ["username", "userName"])) ?
          `https://www.instagram.com/${cleanString(pickFirst(item, ["username", "userName"]))}/` :
          null)
    ),
    profilePicUrl: cleanString(pickFirst(item, ["profilePicUrl", "profilePictureUrl"])),
    latestPosts: toArray(pickFirst(item, ["latestPosts", "posts"]))
      .slice(0, 12)
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }
        return {
          postId: cleanString(pickFirst(entry, ["id", "postId"])),
          shortCode: cleanString(pickFirst(entry, ["shortCode", "code"])),
          caption: cleanString(pickFirst(entry, ["caption", "text"])),
          likeCount: parseNumber(pickFirst(entry, ["likesCount", "likeCount", "likes"])),
          commentCount: parseNumber(pickFirst(entry, ["commentsCount", "commentCount", "comments"])),
          publishedAt: toIsoDate(pickFirst(entry, ["timestamp", "publishedAt", "takenAt"]))
        };
      })
      .filter(Boolean),
    contactSignals: {
      email: cleanString(String(pickFirst(item, ["biography", "bio"]) || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]),
      website,
      bioLink: website,
      dmOpen: null
    },
    sourceEvidence: {
      matchedContentCount: 0,
      discoveryPaths: [detectSourceSurface(actorId, datasetType)]
    },
    source: {
      actorId,
      sourceUrl: cleanString(pickFirst(item, ["profileUrl", "url"])),
      scrapedAt: toIsoDate(pickFirst(item, ["scrapedAt", "fetchedAt", "timestamp"])),
      sourceSurface: detectSourceSurface(actorId, datasetType),
      sourceQuery: detectSourceQuery(sourceInput, datasetType)
    }
  };
}

function inferContentType(item, datasetType) {
  if (datasetType === "reels") {
    return "reel";
  }
  const mediaType = safeLower(pickFirst(item, ["type", "productType", "mediaType"]));
  if (mediaType.includes("video") || mediaType.includes("clip") || mediaType.includes("reel")) {
    return "reel";
  }
  const childCount = toArray(pickFirst(item, ["childPosts", "carouselMedia"])).length;
  if (childCount > 1) {
    return "carousel";
  }
  return "post";
}

function normalizePostItem(item, actorId, datasetType, sourceInput) {
  const ownerUsername = cleanString(
    pickFirst(item, ["ownerUsername", "username", "userName", "owner", "authorUsername"])
  );
  const targetUsername = cleanString(
    pickFirst(item, ["targetUsername", "mentionedUsername", "taggedUsername", "inputUsername"])
  );
  const shortCode = cleanString(pickFirst(item, ["shortCode", "code"]));
  const postUrl = cleanString(
    pickFirst(item, ["postUrl", "url"]) ||
      (shortCode ? `https://www.instagram.com/p/${shortCode}/` : null)
  );

  return {
    platform: "instagram",
    recordType: datasetType === "tagged" ? "tagged" : "post",
    contentType: inferContentType(item, datasetType),
    postId: cleanString(pickFirst(item, ["id", "postId"])),
    shortCode,
    ownerUsername,
    targetUsername: datasetType === "tagged" ? targetUsername : null,
    caption: cleanString(pickFirst(item, ["caption", "text"])),
    hashtags: normalizeHashtags(item),
    mentions: normalizeMentions(item),
    likeCount: parseNumber(pickFirst(item, ["likesCount", "likeCount", "likes"])),
    commentCount: parseNumber(pickFirst(item, ["commentsCount", "commentCount", "comments"])),
    viewCount: parseNumber(pickFirst(item, ["videoViewCount", "viewCount", "playCount", "viewsCount"])),
    videoDurationSeconds: parseNumber(
      pickFirst(item, ["videoDuration", "videoDurationSeconds", "durationSeconds"])
    ),
    isSponsored: parseBoolean(pickFirst(item, ["isSponsored", "sponsored"])),
    coauthors: normalizeCoauthors(item),
    publishedAt: toIsoDate(pickFirst(item, ["timestamp", "takenAt", "publishedAt"])),
    postUrl,
    media: normalizeMediaList(item),
    sourceSurface: detectSourceSurface(actorId, datasetType),
    sourceQuery: detectSourceQuery(sourceInput, datasetType),
    locationName: cleanString(
      pickFirst(item, ["locationName", "location"]) ||
        (item.location && typeof item.location === "object" ? item.location.name : null)
    ),
    source: {
      actorId,
      sourceUrl: cleanString(pickFirst(item, ["url", "postUrl"])),
      scrapedAt: toIsoDate(pickFirst(item, ["scrapedAt", "fetchedAt", "timestamp"]))
    }
  };
}

function normalizeCommentItem(item, actorId, sourceInput, datasetType) {
  return {
    platform: "instagram",
    recordType: "comment",
    commentId: cleanString(pickFirst(item, ["id", "commentId"])),
    postId: cleanString(pickFirst(item, ["postId", "mediaId"])),
    postUrl: cleanString(pickFirst(item, ["postUrl", "url"])),
    ownerUsername: cleanString(
      pickFirst(item, ["ownerUsername", "username", "userName", "authorUsername"])
    ),
    text: cleanString(pickFirst(item, ["text", "comment"])),
    likeCount: parseNumber(pickFirst(item, ["likesCount", "likeCount", "likes"])),
    publishedAt: toIsoDate(pickFirst(item, ["timestamp", "publishedAt", "createdAt"])),
    replyCount: parseNumber(pickFirst(item, ["replyCount", "repliesCount"])),
    source: {
      actorId,
      sourceUrl: cleanString(pickFirst(item, ["url", "postUrl"])),
      scrapedAt: toIsoDate(pickFirst(item, ["scrapedAt", "fetchedAt", "timestamp"])),
      sourceSurface: detectSourceSurface(actorId, datasetType),
      sourceQuery: detectSourceQuery(sourceInput, datasetType)
    }
  };
}

function normalizeHashtagItem(item, actorId, sourceInput, datasetType) {
  return {
    platform: "instagram",
    recordType: "hashtag",
    hashtag: cleanString(pickFirst(item, ["hashtag", "tag", "name"]))?.replace(/^#/, "") || null,
    relatedHashtags: uniqueStrings(
      toArray(pickFirst(item, ["relatedHashtags", "relatedTags"])).map((entry) => {
        if (typeof entry === "string") {
          return entry.replace(/^#/, "");
        }
        if (entry && typeof entry.name === "string") {
          return entry.name.replace(/^#/, "");
        }
        return null;
      })
    ),
    postCount: parseNumber(pickFirst(item, ["postCount", "postsCount", "posts"])),
    topPosts: toArray(pickFirst(item, ["topPosts"])).slice(0, 10),
    recentPosts: toArray(pickFirst(item, ["recentPosts", "posts"])).slice(0, 10),
    source: {
      actorId,
      sourceUrl: cleanString(pickFirst(item, ["url"])),
      scrapedAt: toIsoDate(pickFirst(item, ["scrapedAt", "fetchedAt", "timestamp"])),
      sourceSurface: detectSourceSurface(actorId, datasetType),
      sourceQuery: detectSourceQuery(sourceInput, datasetType)
    }
  };
}

function normalizeFollowersSnapshotItem(item, actorId, sourceInput, datasetType) {
  return {
    platform: "instagram",
    recordType: "followersSnapshot",
    username: cleanString(pickFirst(item, ["username", "userName", "handle"])),
    followersCount: parseNumber(pickFirst(item, ["followersCount", "followers"])),
    capturedAt: toIsoDate(
      pickFirst(item, ["capturedAt", "timestamp", "recordedAt", "scrapedAt", "fetchedAt"])
    ),
    source: {
      actorId,
      sourceUrl: cleanString(pickFirst(item, ["profileUrl", "url"])),
      scrapedAt: toIsoDate(pickFirst(item, ["scrapedAt", "fetchedAt", "timestamp"])),
      sourceSurface: detectSourceSurface(actorId, datasetType),
      sourceQuery: detectSourceQuery(sourceInput, datasetType)
    }
  };
}

export function normalizeItem(item, options = {}) {
  const actorId = cleanString(options.actorId);
  const datasetType = inferDatasetType(actorId, options.datasetType, [item]);
  const sourceInput = options.sourceInput;

  if (datasetType === "profiles" || datasetType === "search") {
    return normalizeProfileItem(item, actorId, sourceInput, datasetType);
  }
  if (datasetType === "posts" || datasetType === "reels" || datasetType === "tagged") {
    return normalizePostItem(item, actorId, datasetType, sourceInput);
  }
  if (datasetType === "comments") {
    return normalizeCommentItem(item, actorId, sourceInput, datasetType);
  }
  if (datasetType === "hashtags") {
    return normalizeHashtagItem(item, actorId, sourceInput, datasetType);
  }
  if (datasetType === "followers-snapshots") {
    return normalizeFollowersSnapshotItem(item, actorId, sourceInput, datasetType);
  }

  return {
    platform: "instagram",
    recordType: "unknown",
    raw: item,
    source: {
      actorId,
      scrapedAt: new Date().toISOString()
    }
  };
}

export function normalizeDataset(input, options = {}) {
  const actorId = cleanString(options.actorId || input?.actorId);
  const rawItems = Array.isArray(input?.items) ? input.items : toArray(input);
  const datasetType = inferDatasetType(actorId, options.datasetType, rawItems);

  return {
    schemaVersion: SCHEMA_VERSION,
    platform: "instagram",
    datasetType,
    actorId,
    fetchedAt: cleanString(input?.fetchedAt) || new Date().toISOString(),
    input: input?.input || null,
    inputPath: cleanString(options.inputPath),
    itemCount: rawItems.length,
    items: rawItems.map((item) => normalizeItem(item, { actorId, datasetType, sourceInput: input?.input || null }))
  };
}

export function summarizeByUsername(items, key = "ownerUsername") {
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
