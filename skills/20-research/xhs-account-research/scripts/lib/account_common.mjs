import fs from "node:fs";
import path from "node:path";
import { maybeRegisterCampaignReport } from "../../_postplus_shared/scripts/lib/campaign-report-manifest.mjs";

export const SCHEMA_VERSION = "1.0.0";
export const DEFAULT_ACCOUNT_ACTOR = "easyapi/rednote-xiaohongshu-user-posts-scraper";

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

export function topEntries(map, limit = 10) {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([key, value]) => ({ key, value }));
}

export function expandProfileIds(profileIds) {
  return uniqueStrings(toArray(profileIds)).map(
    (profileId) => `https://www.xiaohongshu.com/user/profile/${profileId}`
  );
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

function normalizeUserPostItem(item, sourceId, input, fetchedAt) {
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
      sourceId,
      scrapedAt: toIsoDate(fetchedAt) || new Date().toISOString()
    },
    raw: item
  };
}

export function normalizeDataset(raw, options = {}) {
  const sourceId = cleanString(options.sourceId || raw?.sourceId);
  if (!sourceId) {
    throw new Error("Cannot normalize XHS dataset without sourceId.");
  }
  if (sourceId !== DEFAULT_ACCOUNT_ACTOR) {
    throw new Error(`Unsupported XHS account actor for normalization: ${sourceId}`);
  }
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const fetchedAt = cleanString(raw?.fetchedAt) || new Date().toISOString();
  const normalizedItems = items.map((item) => normalizeUserPostItem(item, sourceId, raw?.input || null, fetchedAt));
  return {
    schemaVersion: SCHEMA_VERSION,
    platform: "xiaohongshu",
    datasetType: cleanString(options.datasetType) || "account-posts",
    sourceId,
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
  const includesAny = (terms) => terms.some((term) => value.includes(term));
  const bilingualTitleLexicon = {
    listicle: ["list", "roundup", "collection", "recommendation", "summary", "盘点", "合集", "推荐", "总结"],
    contrast: ["contrast", "comparison", "compare", "vs", "difference", "差距", "对比", "有多"],
    advice: ["how to", "how", "tips", "advice", "avoid", "must", "should", "怎么", "如何", "建议", "不要", "别", "一定", "必须"],
    relatableWorklife: ["workplace", "office workers", "office", "boss", "coworker", "daily work", "打工人", "职场", "上班", "老板", "同事", "办公室", "年底", "过年", "每天"],
    emotion: ["breakdown", "awkward", "painful", "hilarious", "angry", "too real", "崩溃", "心酸", "尴尬", "笑死", "气死", "破防"],
  };
  if (/^\d+/.test(value) || includesAny(bilingualTitleLexicon.listicle)) {
    return "listicle";
  }
  if (includesAny(bilingualTitleLexicon.contrast)) {
    return "contrast";
  }
  if (includesAny(bilingualTitleLexicon.advice)) {
    return "advice";
  }
  if (includesAny(bilingualTitleLexicon.relatableWorklife)) {
    return "relatable-worklife";
  }
  if (includesAny(bilingualTitleLexicon.emotion)) {
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

export function buildAccountActorInput(brief) {
  if (!brief || typeof brief !== "object" || Array.isArray(brief)) {
    throw new Error("XHS account brief must be a JSON object.");
  }
  const profileUrls = uniqueStrings([
    ...toArray(brief.profileUrls),
    ...expandProfileIds(brief.profileIds)
  ]);
  if (!profileUrls.length) {
    throw new Error("Provide profileUrls or profileIds for XHS account research.");
  }
  const maxItems = parseNumber(brief.limit) ?? 12;
  if (!Number.isFinite(maxItems) || maxItems <= 0) {
    throw new Error("XHS account research limit must be a positive number.");
  }
  return {
    profileUrls,
    maxItems
  };
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((left, right) => left - right);
  if (!sorted.length) {
    return null;
  }
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[middle];
  }
  return Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(3));
}

function average(values) {
  const filtered = values.filter(Number.isFinite);
  if (!filtered.length) {
    return null;
  }
  return Number((filtered.reduce((sum, value) => sum + value, 0) / filtered.length).toFixed(3));
}

function summarizeMapFromItems(items, selector, limit = 10) {
  const counts = new Map();
  for (const item of items) {
    const key = cleanString(selector(item)) || "unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return topEntries(counts, limit);
}

function scoreAccount(account, themeKeywords) {
  const medianLike = account.likeStats.median ?? 0;
  const maxLike = account.likeStats.max ?? 0;
  const sampleScore = Math.min(account.samplePostCount, 15) * 1.2;
  const relevanceScore = account.themeMatchCount * 4;
  const medianScore = Math.log10(medianLike + 1) * 10;
  const maxScore = Math.log10(maxLike + 1) * 8;
  return Number((sampleScore + relevanceScore + medianScore + maxScore).toFixed(3));
}

export function aggregateAccountsFromPosts(items, themeKeywords = []) {
  const groups = new Map();
  for (const item of Array.isArray(items) ? items : []) {
    const groupKey = cleanString(item.profileUrl) || cleanString(item.authorId) || cleanString(item.authorName);
    if (!groupKey) {
      continue;
    }
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey).push(item);
  }

  return [...groups.entries()].map(([groupKey, posts]) => {
    const likeValues = posts.map((item) => item.likeCount).filter(Number.isFinite);
    const themeMatchCount = posts.reduce((sum, item) => sum + scoreRelevance(item, themeKeywords), 0);
    const topNotes = [...posts]
      .sort((left, right) => (right.likeCount || 0) - (left.likeCount || 0))
      .slice(0, 5)
      .map((item) => ({
        noteId: item.noteId,
        noteUrl: item.noteUrl,
        title: item.title,
        likeCount: item.likeCount,
        contentType: item.contentType
      }));
    const account = {
      profileUrl: cleanString(posts[0].profileUrl),
      authorId: cleanString(posts[0].authorId),
      authorName: cleanString(posts[0].authorName) || groupKey,
      samplePostCount: posts.length,
      likeStats: {
        average: average(likeValues),
        median: median(likeValues),
        max: likeValues.length ? Math.max(...likeValues) : null
      },
      themeMatchCount,
      contentTypeBreakdown: summarizeMapFromItems(posts, (item) => item.contentType),
      titlePatternBreakdown: summarizeMapFromItems(posts, (item) => classifyTitlePattern(item.title)),
      coverAspectBreakdown: summarizeMapFromItems(posts, (item) => item.coverAspectBucket),
      topNotes,
      dataQualityWarnings: uniqueStrings([
        "validated profile actor returned empty profileData during workspace testing",
        posts.every((item) => !Number.isFinite(item.commentCount))
          ? "comment counts missing from validated actor output"
          : null,
        posts.every((item) => !Number.isFinite(item.pageCount))
          ? "page counts missing from validated actor output"
          : null
      ])
    };
    return {
      ...account,
      accountScore: scoreAccount(account, themeKeywords)
    };
  });
}

export function normalizeAccountDataset(raw, options = {}) {
  return normalizeDataset(raw, {
    sourceId: options.sourceId,
    inputPath: options.inputPath,
    datasetType: "account-posts"
  });
}
