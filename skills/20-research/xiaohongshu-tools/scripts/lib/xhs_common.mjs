import fs from "node:fs";
import path from "node:path";

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

  const maybeNumber = Number(text);
  if (Number.isFinite(maybeNumber)) {
    return toIsoDate(maybeNumber);
  }

  const date = new Date(text);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

export function safeLower(value) {
  return cleanString(value)?.toLowerCase() || "";
}

function aspectBucket(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || height <= 0) {
    return "unknown";
  }
  const ratio = width / height;
  if (ratio >= 1.2) return "landscape";
  if (ratio <= 0.85) return "portrait";
  return "squareish";
}

export function computeRate(numerator, denominator, precision = 6) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }
  return Number((numerator / denominator).toFixed(precision));
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

export function detectDatasetType(sourceId, explicitDatasetType) {
  if (cleanString(explicitDatasetType)) {
    return cleanString(explicitDatasetType);
  }
  const actor = safeLower(sourceId);
  if (actor.includes("comments")) {
    return "comments";
  }
  if (actor.includes("profile")) {
    return "profiles";
  }
  if (actor.includes("user-posts")) {
    return "posts";
  }
  if (actor.includes("user-products")) {
    return "products";
  }
  if (actor.includes("video-downloader") || actor.includes("downloader")) {
    return "downloads";
  }
  if (actor.includes("search")) {
    return "search";
  }
  return "search";
}

function normalizeHashtags(item) {
  return uniqueStrings([
    ...toArray(item.tagList).map((entry) => {
      if (typeof entry === "string") {
        return entry.replace(/^#/, "");
      }
      if (entry && typeof entry.name === "string") {
        return entry.name.replace(/^#/, "");
      }
      return null;
    }),
    ...toArray(item.hashtags).map((entry) => String(entry).replace(/^#/, "")),
    ...(String(pickFirst(item, ["desc", "description", "title", "text"]) || "")
      .match(/#[\p{L}\p{N}_-]+/gu) || []).map((tag) => tag.slice(1))
  ]);
}

function normalizeMedia(item) {
  const sources = [
    ...toArray(item.imageList),
    ...toArray(item.images),
    ...toArray(item.media),
    ...toArray(item.video),
    ...toArray(item.videoUrl),
    ...toArray(item.cover),
    ...toArray(item.coverUrl)
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
      pickFirst(entry, [
        "url",
        "url_default",
        "url_pre",
        "masterUrl",
        "thumbnail",
        "cover",
        "src",
        "info_list.0.url",
        "infoList.0.url"
      ])
    );
    if (!url) {
      continue;
    }
    media.push({
      url,
      type: cleanString(pickFirst(entry, ["type"])) || (url.includes(".mp4") ? "video" : "image"),
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

function normalizeCover(cover) {
  if (!cover || typeof cover !== "object") {
    return {
      coverUrl: null,
      coverWidth: null,
      coverHeight: null,
      coverAspectBucket: "unknown",
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
      "info_list.0.url",
    ]),
  );
  const coverWidth = parseNumber(pickFirst(cover, ["width"]));
  const coverHeight = parseNumber(pickFirst(cover, ["height"]));

  return {
    coverUrl,
    coverWidth,
    coverHeight,
    coverAspectBucket: aspectBucket(coverWidth, coverHeight),
  };
}

export function normalizeProfileRecord(item) {
  const profile =
    item?.profileData && typeof item.profileData === "object"
      ? item.profileData
      : item;
  const basicInfo =
    profile?.basicInfo && typeof profile.basicInfo === "object"
      ? profile.basicInfo
      : profile;
  const interactions = Array.isArray(profile?.interactions)
    ? profile.interactions
    : [];
  const follows = interactions.find((entry) => entry?.type === "follows");
  const fans = interactions.find((entry) => entry?.type === "fans");
  const interaction = interactions.find(
    (entry) => entry?.type === "interaction",
  );
  return {
    platform: "xiaohongshu",
    recordType: "profile",
    profileId:
      cleanString(pickFirst(item, ["userId", "userid", "id"])) ||
      cleanString(
        item?.profileUrl?.match?.(/\/user\/profile\/([^/?#]+)/)?.[1] ?? null,
      ),
    nickname: cleanString(
      pickFirst(basicInfo, ["nickName", "nickname", "nick_name", "name"]),
    ),
    redId: cleanString(pickFirst(basicInfo, ["redId", "red_id"])),
    description: cleanString(
      pickFirst(basicInfo, ["desc", "description", "bio"]),
    ),
    followersCount:
      parseNumber(
        pickFirst(basicInfo, ["fans", "followers", "followersCount", "fansCount"]) ??
          fans?.count,
      ) || 0,
    followingCount:
      parseNumber(
        pickFirst(
          basicInfo,
          ["follows", "following", "followingCount"],
        ) ?? follows?.count,
      ) || 0,
    likesAndCollectionsCount:
      parseNumber(
        pickFirst(basicInfo, ["likesAndCollections", "likes", "likesCount"]) ??
          interaction?.count,
      ) || 0,
    location: cleanString(
      pickFirst(basicInfo, ["ipLocation", "location", "city"]),
    ),
    age: parseNumber(pickFirst(basicInfo, ["age"])),
    tags: uniqueStrings(toArray(pickFirst(profile, ["tags", "userTags"])).map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }
      return entry?.name || entry?.tag || null;
    })),
    avatarUrl: cleanString(
      pickFirst(basicInfo, ["avatar", "avatarUrl", "image", "images", "imageb"]),
    ),
    profileUrl: cleanString(pickFirst(item, ["profileUrl", "url"])),
    rawAccountType: cleanString(pickFirst(profile, ["type", "accountType"])),
    raw: item
  };
}

export function normalizePostRecord(item) {
  const post = item?.postData && typeof item.postData === "object" ? item.postData : item;
  const record = item?.item && typeof item.item === "object" ? item.item : post;
  const card =
    record?.note_card && typeof record.note_card === "object" ? record.note_card : post;
  const author =
    card?.user && typeof card.user === "object"
      ? card.user
      : post?.user && typeof post.user === "object"
        ? post.user
        : item.user && typeof item.user === "object"
          ? item.user
          : item.author;
  const interact =
    card?.interact_info && typeof card.interact_info === "object"
      ? card.interact_info
      : card?.interactInfo && typeof card.interactInfo === "object"
        ? card.interactInfo
        : post?.interact_info && typeof post.interact_info === "object"
          ? post.interact_info
          : post?.interactInfo && typeof post.interactInfo === "object"
            ? post.interactInfo
            : item.interactInfo && typeof item.interactInfo === "object"
              ? item.interactInfo
              : item;
  const mediaCarrier =
    card !== post
      ? {
          ...card,
          cover: card.cover || post.cover,
          imageList: card.image_list || card.imageList || post.image_list || post.imageList
        }
      : {
          ...post,
          imageList: post.image_list || post.imageList
        };
  const cover = normalizeCover(post?.cover || card?.cover);
  return {
    platform: "xiaohongshu",
    recordType: "post",
    contentType:
      cleanString(pickFirst(card, ["type", "contentType"])) ||
      cleanString(pickFirst(post, ["type", "contentType"])) ||
      (pickFirst(post, ["video", "videoUrl"]) ? "video" : "note"),
    postId: cleanString(
      pickFirst(card, ["note_id", "noteId", "postId", "id"]) ??
      pickFirst(post, ["note_id", "noteId", "postId", "id"])
    ),
    title: cleanString(
      pickFirst(card, ["display_title", "displayTitle", "title", "post_title"]) ??
      pickFirst(post, ["display_title", "displayTitle", "title", "post_title"])
    ),
    description: cleanString(
      pickFirst(card, ["desc", "description", "text", "content"]) ??
      pickFirst(post, ["desc", "description", "text", "content"])
    ),
    authorId: cleanString(pickFirst(author || item, ["userId", "authorId", "author_id"])),
    authorNickname: cleanString(
      pickFirst(author || item, [
        "nickName",
        "nickname",
        "nick_name",
        "author_name",
        "authorNickname"
      ])
    ),
    authorProfileUrl:
      cleanString(pickFirst(author || item, ["profileUrl", "author_profile_url"])) ||
      cleanString(item.profileUrl),
    likeCount:
      parseNumber(
        pickFirst(interact, [
          "liked_count",
          "likes",
          "likeCount",
          "post_likes"
        ])
      ) || 0,
    commentCount:
      parseNumber(
        pickFirst(interact, ["comment_count", "comments", "commentCount"])
      ) || 0,
    shareCount:
      parseNumber(
        pickFirst(interact, ["share_count", "shares", "shareCount"])
      ) || 0,
    collectCount: parseNumber(
      pickFirst(interact, [
        "collected_count",
        "collects",
        "collectCount",
        "favorites"
      ])
    ),
    viewCount: parseNumber(pickFirst(interact, ["views", "viewCount"])),
    publishedAt: toIsoDate(
      pickFirst(card, ["time", "publishTime", "publishedAt", "createTime"]) ??
      pickFirst(post, ["time", "publishTime", "publishedAt", "createTime"]) ??
      item.scrapedAt
    ),
    postUrl:
      cleanString(pickFirst(card, ["url", "post_url", "postUrl", "postUrl"])) ||
      cleanString(pickFirst(post, ["url", "post_url", "postUrl"])) ||
      cleanString(item.link),
    ...cover,
    hashtags: normalizeHashtags(card !== post ? { ...item, ...card } : post),
    media: normalizeMedia(mediaCarrier),
    raw: item
  };
}

export function normalizeCommentRecord(item) {
  const comment =
    item?.comment && typeof item.comment === "object"
      ? item.comment
      : item;
  const owner =
    comment?.user_info && typeof comment.user_info === "object"
      ? comment.user_info
      : comment?.user && typeof comment.user === "object"
        ? comment.user
        : item.user && typeof item.user === "object"
          ? item.user
          : item.author;
  return {
    platform: "xiaohongshu",
    recordType: "comment",
    commentId: cleanString(pickFirst(comment, ["commentId", "id"])),
    postId: cleanString(pickFirst(comment, ["noteId", "postId", "note_id"])),
    postUrl: cleanString(pickFirst(item, ["postUrl", "url"])),
    ownerId: cleanString(pickFirst(owner || item, ["userId", "ownerId"])),
    ownerNickname: cleanString(
      pickFirst(owner || item, ["nickName", "nickname", "nick_name", "name"]),
    ),
    text: cleanString(pickFirst(comment, ["content", "text", "comment"])),
    likeCount:
      parseNumber(pickFirst(comment, ["likeCount", "likes", "like_count"])) || 0,
    replyCount:
      parseNumber(
        pickFirst(comment, ["replyCount", "subCommentCount", "sub_comment_count"]),
      ) || 0,
    location: cleanString(pickFirst(comment, ["ipLocation", "location", "ip_location"])),
    publishedAt: toIsoDate(
      pickFirst(comment, ["time", "publishTime", "publishedAt", "create_time", "createTime"]),
    ),
    raw: item
  };
}

export function normalizeProductRecord(item) {
  const priceInfo = item.priceInfo && typeof item.priceInfo === "object" ? item.priceInfo : null;
  const expectedPrice = priceInfo?.expectedPrice || null;
  const minorPrice = priceInfo?.minorPrice || null;
  return {
    platform: "xiaohongshu",
    recordType: "product",
    productId: cleanString(pickFirst(item, ["productId", "id"])),
    ownerProfileId: cleanString(pickFirst(item, ["sellerId", "userId", "ownerId"])),
    ownerNickname: cleanString(pickFirst(item, ["nickName", "nickname", "ownerNickname"])),
    ownerProfileUrl: cleanString(pickFirst(item, ["profileUrl", "ownerProfileUrl"])),
    title: cleanString(pickFirst(item, ["cardTitle", "title", "name"])),
    description: cleanString(pickFirst(item, ["desc", "description"])),
    category: cleanString(pickFirst(item, ["category", "categoryName"])),
    brand: cleanString(pickFirst(item, ["brand", "brandName"])),
    price: parseNumber(
      pickFirst(item, ["price", "minPrice", "salePrice"]) ??
      expectedPrice?.price ??
      minorPrice?.price
    ),
    priceText: cleanString(pickFirst(item, ["priceText", "displayPrice"])),
    salesText: cleanString(pickFirst(item, ["sales", "salesText"])),
    productUrl: cleanString(pickFirst(item, ["url", "productUrl", "link", "rnlink", "originRnlink"])),
    coverUrl: cleanString(pickFirst(item, ["cover", "coverUrl", "image"])),
    isAvailable: pickFirst(item, ["isAvailable", "available", "buyable", "purchasable"]) ?? null,
    stockStatus: parseNumber(pickFirst(item, ["stockStatus", "stock_status"])),
    onShelfTime: toIsoDate(pickFirst(item, ["onShelfTime", "on_shelf_time"])),
    hasVideo: item.hasVideo ?? null,
    priceTag: cleanString(expectedPrice?.priceTag),
    raw: item
  };
}

export function normalizeDownloadRecord(item) {
  return {
    platform: "xiaohongshu",
    recordType: "download",
    postId: cleanString(pickFirst(item, ["noteId", "postId"])),
    postUrl: cleanString(pickFirst(item, ["url", "postUrl"])),
    title: cleanString(pickFirst(item, ["title"])),
    description: cleanString(pickFirst(item, ["desc", "description"])),
    videoUrl: cleanString(pickFirst(item?.video || item, ["masterUrl", "videoUrl", "url"])),
    imageUrls: uniqueStrings(
      toArray(item.imageList).map((entry) => (typeof entry === "string" ? entry : entry?.url))
    ),
    thumbnailUrl: cleanString(pickFirst(item?.video || item, ["thumbnail", "cover", "coverUrl"])),
    authorNickname: cleanString(pickFirst(item?.user || item, ["nickName", "nickname"])),
    raw: item
  };
}

export function normalizeDataset(dataset, options = {}) {
  const sourceId = cleanString(options.sourceId || dataset.sourceId) || null;
  const datasetType = detectDatasetType(sourceId, options.datasetType || dataset.datasetType);
  const items = Array.isArray(dataset.items) ? dataset.items : [];

  const normalizers = {
    search: normalizePostRecord,
    profiles: normalizeProfileRecord,
    posts: normalizePostRecord,
    comments: normalizeCommentRecord,
    products: normalizeProductRecord,
    downloads: normalizeDownloadRecord,
    "feed-scan": normalizePostRecord
  };

  const normalizeItem = normalizers[datasetType] || ((item) => item);
  const normalizedItems = items.map(normalizeItem);

  return {
    schemaVersion: SCHEMA_VERSION,
    platform: "xiaohongshu",
    datasetType,
    sourceId,
    fetchedAt: dataset.fetchedAt || new Date().toISOString(),
    input: dataset.input || null,
    inputPath: options.inputPath || null,
    itemCount: normalizedItems.length,
    items: normalizedItems
  };
}

export function summarizeByKey(items, key) {
  const map = new Map();
  for (const item of items) {
    const value = cleanString(item?.[key]);
    if (!value) {
      continue;
    }
    if (!map.has(value)) {
      map.set(value, []);
    }
    map.get(value).push(item);
  }
  return map;
}

export function average(numbers) {
  const values = numbers.filter((value) => Number.isFinite(value));
  if (!values.length) {
    return null;
  }
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3));
}
