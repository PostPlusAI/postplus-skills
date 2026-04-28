import fs from "node:fs";
import path from "node:path";
import { maybeRegisterCampaignReport } from "../../_postplus_shared/scripts/lib/campaign-report-manifest.mjs";

export const SCHEMA_VERSION = "1.0.0";
export const DEFAULT_ACCOUNT_ACTOR = "easyapi/rednote-xiaohongshu-user-posts-scraper";
export const DEFAULT_SEARCH_ACTOR = "easyapi/rednote-xiaohongshu-search-scraper";
export const SEARCH_MIN_ITEMS = 100;

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

export function splitCsv(value) {
  return uniqueStrings(String(value || "").split(","));
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

  const date = new Date(text);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

export function pickNested(item, key) {
  return String(key || "")
    .split(".")
    .reduce((current, part) => current?.[part], item);
}

export function pickFirst(item, keys) {
  for (const key of keys) {
    const value = key.includes(".") ? pickNested(item, key) : item?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
}

export function firstLine(text) {
  const normalized = cleanString(text);
  if (!normalized) {
    return null;
  }
  return normalized.split(/\n+/)[0].trim() || normalized;
}

export function openerLabel(text) {
  const title = firstLine(text);
  if (!title) {
    return null;
  }
  const byPunctuation = title.split(/[，,。！？!?：:｜|]/)[0]?.trim();
  if (byPunctuation) {
    return byPunctuation.slice(0, 18);
  }
  return title.slice(0, 12);
}

export function aspectBucket(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return "unknown";
  }
  const ratio = width / height;
  if (ratio <= 0.72) return "portrait-tall";
  if (ratio <= 0.9) return "portrait-standard";
  if (ratio <= 1.1) return "squareish";
  return "landscape";
}

function classifyRawContentType(rawType, pageCount) {
  const type = safeLower(rawType);
  if (Number.isFinite(pageCount) && pageCount >= 2) {
    return "carousel";
  }
  if (type.includes("video")) {
    return "video";
  }
  if (type.includes("image") || type.includes("normal")) {
    return "image";
  }
  return "unknown";
}

function normalizeCover(cover) {
  if (!cover || typeof cover !== "object") {
    return {
      coverUrl: null,
      coverWidth: null,
      coverHeight: null,
      coverAspectBucket: "unknown"
    };
  }

  const coverUrl = cleanString(
    pickFirst(cover, [
      "urlDefault",
      "url_default",
      "urlPre",
      "url_pre",
      "url",
      "defaultUrl",
      "infoList.0.url",
      "info_list.0.url"
    ])
  );
  const coverWidth = parseNumber(pickFirst(cover, ["width"]));
  const coverHeight = parseNumber(pickFirst(cover, ["height"]));
  return {
    coverUrl,
    coverWidth,
    coverHeight,
    coverAspectBucket: aspectBucket(coverWidth, coverHeight)
  };
}

function normalizeSearchImageList(imageList) {
  const images = [];
  for (const entry of toArray(imageList)) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const width = parseNumber(pickFirst(entry, ["width"]));
    const height = parseNumber(pickFirst(entry, ["height"]));
    const url = cleanString(
      pickFirst(entry, [
        "url",
        "url_default",
        "url_pre",
        "info_list.0.url",
        "infoList.0.url"
      ])
    );
    if (!url) {
      continue;
    }
    images.push({ url, width, height });
  }
  return images;
}

function normalizeUserPostItem(item, actorId, input, fetchedAt) {
  const post = item?.postData && typeof item.postData === "object" ? item.postData : {};
  const user = post?.user && typeof post.user === "object" ? post.user : {};
  const rawType = cleanString(post.type);
  const pageCount = parseNumber(pickFirst(post, ["pageCount", "imageList.length"])) ?? null;
  const cover = normalizeCover(post.cover);
  return {
    platform: "xiaohongshu",
    recordType: "post",
    noteId: cleanString(post.noteId),
    noteUrl: cleanString(post.postUrl),
    profileUrl: cleanString(item.profileUrl),
    authorId: cleanString(pickFirst(user, ["userId", "user_id"])),
    authorName: cleanString(pickFirst(user, ["nickname", "nickName", "nick_name"])),
    title: cleanString(post.displayTitle) || "",
    titleHook: firstLine(post.displayTitle) || "",
    rawContentType: rawType,
    contentType: classifyRawContentType(rawType, pageCount),
    likeCount: parseNumber(pickFirst(post, ["interactInfo.likedCount", "interactInfo.liked_count"])),
    commentCount: parseNumber(pickFirst(post, ["interactInfo.commentCount", "interactInfo.comment_count"])),
    collectCount: parseNumber(pickFirst(post, ["interactInfo.collectCount", "interactInfo.collect_count"])),
    shareCount: parseNumber(pickFirst(post, ["interactInfo.shareCount", "interactInfo.share_count"])),
    pageCount,
    ...cover,
    sourceSurface: "profile",
    sourceQuery: cleanString(item.profileUrl) || cleanString(toArray(input?.profileUrls)[0]),
    scrapedAt: toIsoDate(item?.scrapedAt || fetchedAt) || new Date().toISOString(),
    source: {
      actorId,
      scrapedAt: toIsoDate(fetchedAt) || new Date().toISOString()
    },
    raw: item
  };
}

function normalizeSearchItem(item, actorId, fetchedAt) {
  const record = item?.item && typeof item.item === "object" ? item.item : item;
  const card = record?.note_card && typeof record.note_card === "object" ? record.note_card : record;
  const user = card?.user && typeof card.user === "object" ? card.user : {};
  const imageList = normalizeSearchImageList(card.image_list);
  const pageCount = imageList.length || null;
  const cover = normalizeCover(card.cover || imageList[0]);
  const rawType = cleanString(card.type || record.type);
  return {
    platform: "xiaohongshu",
    recordType: "post",
    noteId: cleanString(record.id || card.note_id),
    noteUrl: cleanString(item.link || record.link || record.url),
    profileUrl: cleanString(record.profileUrl),
    authorId: cleanString(pickFirst(user, ["user_id", "userId"])),
    authorName: cleanString(pickFirst(user, ["nick_name", "nickname", "nickName"])),
    title: cleanString(card.display_title || record.displayTitle || record.title) || "",
    titleHook: firstLine(card.display_title || record.displayTitle || record.title) || "",
    rawContentType: rawType,
    contentType: classifyRawContentType(rawType, pageCount),
    likeCount: parseNumber(pickFirst(card, ["interact_info.liked_count", "interactInfo.likedCount"])),
    commentCount: parseNumber(pickFirst(card, ["interact_info.comment_count", "interactInfo.commentCount"])),
    collectCount: parseNumber(pickFirst(card, ["interact_info.collected_count", "interactInfo.collectCount"])),
    shareCount: parseNumber(pickFirst(card, ["interact_info.share_count", "interactInfo.shareCount"])),
    pageCount,
    ...cover,
    sourceSurface: "search",
    sourceQuery: cleanString(item.keyword || record.keyword),
    scrapedAt: toIsoDate(item?.scrapedAt || fetchedAt) || new Date().toISOString(),
    source: {
      actorId,
      scrapedAt: toIsoDate(fetchedAt) || new Date().toISOString()
    },
    raw: item
  };
}

export function normalizeDataset(raw, options = {}) {
  const actorId = cleanString(options.actorId || raw?.actorId);
  if (!actorId) {
    throw new Error("Cannot normalize XHS dataset without actorId.");
  }
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const fetchedAt = cleanString(raw?.fetchedAt) || new Date().toISOString();
  let normalizedItems;

  if (actorId === DEFAULT_ACCOUNT_ACTOR) {
    normalizedItems = items.map((item) => normalizeUserPostItem(item, actorId, raw?.input || null, fetchedAt));
  } else if (actorId === DEFAULT_SEARCH_ACTOR) {
    normalizedItems = items.map((item) => normalizeSearchItem(item, actorId, fetchedAt));
  } else {
    throw new Error(`Unsupported XHS actor for normalization: ${actorId}`);
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    platform: "xiaohongshu",
    datasetType: cleanString(options.datasetType) || "benchmark-posts",
    actorId,
    fetchedAt,
    input: raw?.input || null,
    inputPath: options.inputPath ? path.resolve(options.inputPath) : null,
    itemCount: normalizedItems.length,
    items: normalizedItems
  };
}

export function classifyTitlePattern(title) {
  const value = safeLower(title);
  if (!value) {
    return "unknown";
  }
  if (/^\d+/.test(value) || /盘点|合集|推荐|总结/.test(value)) {
    return "listicle";
  }
  if (/差距|对比|vs|有多/.test(value)) {
    return "contrast";
  }
  if (/怎么|如何|建议|不要|别|一定|必须/.test(value)) {
    return "advice";
  }
  if (/打工人|职场|上班|老板|同事|办公室|年底|过年|每天/.test(value)) {
    return "relatable-worklife";
  }
  if (/崩溃|心酸|尴尬|笑死|气死|破防/.test(value)) {
    return "emotion";
  }
  return "general";
}

export function scoreRelevance(item, themeKeywords) {
  const keywords = uniqueStrings(themeKeywords || []);
  if (!keywords.length) {
    return 0;
  }
  const haystack = [
    cleanString(item.title),
    cleanString(item.authorName),
    cleanString(item.sourceQuery)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let matches = 0;
  for (const keyword of keywords) {
    if (haystack.includes(keyword.toLowerCase())) {
      matches += 1;
    }
  }
  return matches;
}

export function scoreBenchmarkPost(item, themeKeywords = []) {
  const likeScore = Math.log10((item.likeCount || 0) + 1) * 12;
  const relevanceScore = scoreRelevance(item, themeKeywords) * 6;
  const carouselBonus = item.contentType === "carousel" ? 4 : 0;
  const imageBonus = item.contentType === "image" ? 2 : 0;
  const videoBonus = item.contentType === "video" ? 1 : 0;
  const pageBonus = Number.isFinite(item.pageCount) ? Math.min(item.pageCount, 8) * 0.4 : 0;
  const titlePenalty = cleanString(item.title) ? 0 : -4;
  return Number(
    (likeScore + relevanceScore + carouselBonus + imageBonus + videoBonus + pageBonus + titlePenalty).toFixed(3)
  );
}

export function topEntries(map, limit = 10) {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([key, value]) => ({ key, value }));
}

function bucketPageCount(pageCount) {
  if (!Number.isFinite(pageCount)) {
    return "unknown";
  }
  if (pageCount <= 1) return "1";
  if (pageCount <= 3) return "2-3";
  if (pageCount <= 6) return "4-6";
  return "7+";
}

function buildCardSuggestions(patternCounts) {
  const suggestions = [];
  for (const { key } of topEntries(patternCounts, 3)) {
    if (key === "relatable-worklife") {
      suggestions.push("把高频职场/打工人标题改成 4-6 页观察型图文卡片。");
    } else if (key === "contrast") {
      suggestions.push("把高频对比类标题改成 before/after 或 A/B 差异卡片。");
    } else if (key === "listicle") {
      suggestions.push("把高频盘点/推荐类标题改成多页清单式卡片。");
    } else if (key === "advice") {
      suggestions.push("把高频建议类标题改成问题-建议-行动三段式卡片。");
    }
  }
  return uniqueStrings(suggestions);
}

export function summarizeBenchmarkItems(items) {
  const normalizedItems = Array.isArray(items) ? items : [];
  const contentTypeCounts = new Map();
  const sourceSurfaceCounts = new Map();
  const openerCounts = new Map();
  const authorCounts = new Map();
  const aspectCounts = new Map();
  const patternCounts = new Map();
  const pageCountCounts = new Map();

  let pageCountKnownCount = 0;
  for (const item of normalizedItems) {
    const contentType = cleanString(item.contentType) || "unknown";
    contentTypeCounts.set(contentType, (contentTypeCounts.get(contentType) || 0) + 1);

    const sourceSurface = cleanString(item.sourceSurface) || "unknown";
    sourceSurfaceCounts.set(sourceSurface, (sourceSurfaceCounts.get(sourceSurface) || 0) + 1);

    const opener = openerLabel(item.title);
    if (opener) {
      openerCounts.set(opener, (openerCounts.get(opener) || 0) + 1);
    }

    const author = cleanString(item.authorName);
    if (author) {
      authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
    }

    const aspect = cleanString(item.coverAspectBucket) || "unknown";
    aspectCounts.set(aspect, (aspectCounts.get(aspect) || 0) + 1);

    const pattern = classifyTitlePattern(item.title);
    patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);

    const pageBucket = bucketPageCount(item.pageCount);
    pageCountCounts.set(pageBucket, (pageCountCounts.get(pageBucket) || 0) + 1);
    if (Number.isFinite(item.pageCount)) {
      pageCountKnownCount += 1;
    }
  }

  const topByLikes = [...normalizedItems]
    .sort((left, right) => (right.likeCount || 0) - (left.likeCount || 0))
    .slice(0, 10);

  return {
    itemCount: normalizedItems.length,
    pageCountKnownCount,
    pageCountMissingCount: normalizedItems.length - pageCountKnownCount,
    contentTypeBreakdown: topEntries(contentTypeCounts, 10),
    sourceSurfaceBreakdown: topEntries(sourceSurfaceCounts, 10),
    recurringOpeners: topEntries(openerCounts, 15),
    topAuthors: topEntries(authorCounts, 15),
    coverAspectBreakdown: topEntries(aspectCounts, 10),
    titlePatternBreakdown: topEntries(patternCounts, 10),
    pageCountBreakdown: topEntries(pageCountCounts, 10),
    topByLikes,
    topHooks: topByLikes.map((item) => ({
      noteUrl: item.noteUrl,
      title: item.title,
      likeCount: item.likeCount
    })),
    cardSuggestions: buildCardSuggestions(patternCounts)
  };
}

export function expandProfileIds(profileIds) {
  return uniqueStrings(toArray(profileIds)).map(
    (profileId) => `https://www.xiaohongshu.com/user/profile/${profileId}`
  );
}

export function compileBriefToActorRequest(brief, options = {}) {
  if (!brief || typeof brief !== "object" || Array.isArray(brief)) {
    throw new Error("XHS benchmark brief must be a JSON object.");
  }

  const profileUrls = uniqueStrings([
    ...toArray(brief.profileUrls),
    ...expandProfileIds(brief.profileIds)
  ]);
  const keywords = uniqueStrings(toArray(brief.keywords));

  if (profileUrls.length && keywords.length) {
    throw new Error("Provide either profileUrls/profileIds or keywords, not both in the same brief.");
  }
  if (!profileUrls.length && !keywords.length) {
    throw new Error("Provide profileUrls/profileIds or keywords for XHS benchmark collection.");
  }

  const explicitActor = cleanString(options.actorId);
  if (profileUrls.length) {
    const maxItems = parseNumber(brief.limit) ?? 12;
    if (!Number.isFinite(maxItems) || maxItems <= 0) {
      throw new Error("Account benchmark limit must be a positive number.");
    }
    return {
      actorId: explicitActor || DEFAULT_ACCOUNT_ACTOR,
      route: "account-benchmark",
      experimental: false,
      input: {
        profileUrls,
        maxItems
      }
    };
  }

  const maxItems = parseNumber(brief.limit) ?? SEARCH_MIN_ITEMS;
  if (!Number.isFinite(maxItems) || maxItems <= 0) {
    throw new Error("Keyword benchmark limit must be a positive number.");
  }
  if (maxItems < SEARCH_MIN_ITEMS) {
    throw new Error(
      `Keyword benchmark currently requires limit >= ${SEARCH_MIN_ITEMS} because the validated search actor rejects smaller maxItems.`
    );
  }

  return {
    actorId: explicitActor || DEFAULT_SEARCH_ACTOR,
    route: "keyword-benchmark",
    experimental: true,
    input: {
      keywords,
      maxItems
    }
  };
}
