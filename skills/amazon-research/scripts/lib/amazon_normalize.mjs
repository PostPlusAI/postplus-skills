import fs from "node:fs";
import path from "node:path";
import { maybeRegisterCampaignReport } from "../../../../scripts/lib/campaign-report-manifest.mjs";

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

export function toArray(value) {
  if (Array.isArray(value)) {
    return value.filter((entry) => entry !== null && entry !== undefined);
  }
  if (value === null || value === undefined || value === "") {
    return [];
  }
  return [value];
}

export function cleanString(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value).trim();
  return text ? text : null;
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

  const normalizedRaw = raw
    .replace(/,/g, "")
    .replace(/\b(one)\b/g, "1")
    .replace(/\b(two)\b/g, "2")
    .replace(/\b(three)\b/g, "3")
    .replace(/\b(four)\b/g, "4")
    .replace(/\b(five)\b/g, "5");

  const multiplier =
    normalizedRaw.endsWith("k") ? 1_000 :
    normalizedRaw.endsWith("m") ? 1_000_000 :
    normalizedRaw.endsWith("b") ? 1_000_000_000 :
    1;

  const numericPart = normalizedRaw.replace(/[^0-9.+-]/g, "");
  if (!numericPart) {
    return null;
  }

  const parsed = Number(numericPart);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed * multiplier;
}

export function parseMoney(value) {
  return parseNumber(value);
}

function parseBoolean(value) {
  if (value === true || value === false) {
    return value;
  }
  const text = cleanString(value)?.toLowerCase();
  if (!text) {
    return null;
  }
  if (["true", "yes", "y", "verified"].includes(text)) {
    return true;
  }
  if (["false", "no", "n", "unverified"].includes(text)) {
    return false;
  }
  return null;
}

function pickFirst(item, keys) {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return null;
}

function deriveCurrency(...candidates) {
  for (const candidate of candidates) {
    const text = cleanString(candidate);
    if (!text) {
      continue;
    }
    const codeMatch = text.match(/\b[A-Z]{3}\b/);
    if (codeMatch) {
      return codeMatch[0];
    }
    if (text.includes("$")) {
      return "USD";
    }
    if (text.includes("£")) {
      return "GBP";
    }
    if (text.includes("€")) {
      return "EUR";
    }
  }
  return null;
}

function normalizeImageUrls(item) {
  const urls = [
    ...toArray(item.imageUrls),
    ...toArray(item.images),
    ...toArray(item.image),
    ...toArray(item.imageUrl),
    ...toArray(item.thumbnailImages)
  ]
    .map((entry) => {
      if (typeof entry === "string") {
        return cleanString(entry);
      }
      if (entry && typeof entry.url === "string") {
        return cleanString(entry.url);
      }
      if (entry && typeof entry.src === "string") {
        return cleanString(entry.src);
      }
      return null;
    })
    .filter(Boolean);

  return Array.from(new Set(urls));
}

function normalizeSpecs(item) {
  const pairs = [
    ...toArray(item.specs),
    ...toArray(item.specifications),
    ...toArray(item.attributes),
    ...toArray(item.features)
  ];

  return pairs
    .map((entry) => {
      if (entry && typeof entry === "object") {
        const key = cleanString(entry.name || entry.key || entry.label);
        const value = cleanString(entry.value || entry.text || entry.content);
        if (!key && !value) {
          return null;
        }
        return { key, value };
      }
      if (typeof entry === "string") {
        return { key: null, value: cleanString(entry) };
      }
      return null;
    })
    .filter(Boolean);
}

function normalizeProductItem(item, actorId) {
  const asin = cleanString(
    pickFirst(item, ["asin", "ASIN", "productAsin", "productId"])
  );
  const imageUrls = normalizeImageUrls(item);
  const priceText = pickFirst(item, ["priceText", "displayPrice", "price"]);
  const listPriceText = pickFirst(item, ["listPriceText", "originalPrice", "wasPrice"]);

  return {
    entityType: "product",
    source: {
      actorId,
      sourceUrl: cleanString(
        pickFirst(item, ["sourceUrl", "url", "productUrl", "link"])
      ),
      scrapedAt: cleanString(
        pickFirst(item, ["scrapedAt", "fetchedAt", "timestamp", "lastUpdated"])
      )
    },
    identity: {
      asin,
      parentAsin: cleanString(pickFirst(item, ["parentAsin", "parentASIN"])),
      title: cleanString(pickFirst(item, ["title", "name", "productTitle"])),
      productUrl: cleanString(
        pickFirst(item, ["productUrl", "url", "link", "canonicalUrl"])
      ),
      brand: cleanString(pickFirst(item, ["brand", "brandName", "manufacturer"]))
    },
    pricing: {
      currency: cleanString(
        pickFirst(item, ["currency", "currencyCode"]) ||
          deriveCurrency(priceText, listPriceText)
      ),
      currentPrice: parseMoney(
        pickFirst(item, ["currentPrice", "price", "salePrice", "priceValue"])
      ),
      originalPrice: parseMoney(
        pickFirst(item, ["originalPrice", "listPrice", "wasPrice"])
      ),
      discountPercent: parseNumber(
        pickFirst(item, ["discountPercent", "discount", "savingPercent"])
      )
    },
    proof: {
      ratingAverage: parseNumber(
        pickFirst(item, ["rating", "ratingAverage", "stars", "score"])
      ),
      reviewCount: parseNumber(
        pickFirst(item, ["reviewsCount", "reviewCount", "ratingsTotal", "totalReviews"])
      ),
      ratingCount: parseNumber(
        pickFirst(item, ["ratingCount", "ratingsCount", "totalRatings"])
      ),
      boughtPastMonth: parseNumber(
        pickFirst(item, ["boughtPastMonth", "boughtInPastMonth"])
      ),
      bestsellerRank: parseNumber(
        pickFirst(item, ["bestsellerRank", "bestSellerRank", "rank"])
      )
    },
    seller: {
      sellerName: cleanString(
        pickFirst(item, ["sellerName", "seller", "soldBy", "merchantName"])
      ),
      sellerUrl: cleanString(
        pickFirst(item, ["sellerUrl", "merchantUrl", "storeUrl"])
      ),
      fulfilledByAmazon: parseBoolean(
        pickFirst(item, ["fulfilledByAmazon", "isFulfilledByAmazon"])
      )
    },
    merchandising: {
      category: cleanString(
        pickFirst(item, ["category", "categoryName", "department"])
      ),
      badges: toArray(pickFirst(item, ["badges", "labels"]))
        .map((entry) => cleanString(entry?.name || entry))
        .filter(Boolean),
      description: cleanString(
        pickFirst(item, ["description", "shortDescription", "about"])
      )
    },
    review: {},
    specs: normalizeSpecs(item),
    media: {
      primaryImageUrl: imageUrls[0] || null,
      imageUrls
    },
    raw: item
  };
}

function normalizeReviewItem(item, actorId) {
  const title = cleanString(
    pickFirst(item, ["reviewTitle", "title", "headline"])
  );
  const body = cleanString(
    pickFirst(item, ["reviewText", "text", "content", "description", "body"])
  );

  return {
    entityType: "review",
    source: {
      actorId,
      sourceUrl: cleanString(
        pickFirst(item, ["sourceUrl", "url", "productUrl", "reviewUrl"])
      ),
      scrapedAt: cleanString(
        pickFirst(item, ["scrapedAt", "fetchedAt", "timestamp", "date"])
      )
    },
    identity: {
      asin: cleanString(pickFirst(item, ["asin", "ASIN", "productAsin"])),
      parentAsin: cleanString(pickFirst(item, ["parentAsin", "parentASIN"])),
      title: cleanString(pickFirst(item, ["productTitle", "title"])),
      productUrl: cleanString(pickFirst(item, ["productUrl", "url"])),
      brand: cleanString(pickFirst(item, ["brand", "brandName"]))
    },
    pricing: {},
    proof: {
      ratingAverage: parseNumber(
        pickFirst(item, ["rating", "stars", "score", "reviewRating"])
      ),
      helpfulVotes: parseNumber(
        pickFirst(item, ["helpfulVotes", "helpfulCount", "likes"])
      )
    },
    seller: {},
    merchandising: {},
    review: {
      reviewId: cleanString(pickFirst(item, ["reviewId", "id"])),
      reviewTitle: title,
      reviewText: body,
      reviewDate: cleanString(pickFirst(item, ["date", "reviewDate"])),
      reviewerName: cleanString(
        pickFirst(item, ["reviewerName", "author", "userName", "profileName"])
      ),
      reviewerProfileUrl: cleanString(
        pickFirst(item, ["reviewerProfileUrl", "profileUrl"])
      ),
      verifiedPurchase: parseBoolean(
        pickFirst(item, ["verifiedPurchase", "isVerifiedPurchase"])
      ),
      reviewImages: normalizeImageUrls(item)
    },
    specs: [],
    media: {
      primaryImageUrl: null,
      imageUrls: []
    },
    raw: item
  };
}

function detectEntityType(item, actorId) {
  const actor = cleanString(actorId)?.toLowerCase() || "";
  if (actor.includes("review")) {
    return "review";
  }

  const reviewSignals = [
    "reviewText",
    "reviewTitle",
    "reviewerName",
    "verifiedPurchase",
    "helpfulVotes"
  ];

  if (reviewSignals.some((key) => item?.[key] !== undefined)) {
    return "review";
  }

  return "product";
}

export function normalizeItem(item, options = {}) {
  const actorId = cleanString(options.actorId);
  const entityType = detectEntityType(item, actorId);
  if (entityType === "review") {
    return normalizeReviewItem(item, actorId);
  }
  return normalizeProductItem(item, actorId);
}

export function normalizeDataset(input, options = {}) {
  const actorId = cleanString(options.actorId || input?.actorId);
  const fetchedAt = cleanString(input?.fetchedAt);
  const items = toArray(input?.items).map((item) =>
    normalizeItem(item, { actorId })
  );

  return {
    schemaVersion: SCHEMA_VERSION,
    normalizedAt: new Date().toISOString(),
    source: {
      actorId,
      fetchedAt,
      inputPath: cleanString(options.inputPath) || null,
      sourceDatasetPath: cleanString(options.sourceDatasetPath) || null
    },
    itemCount: items.length,
    items
  };
}

export function readDatasetForAnalysis(filePath, actorId = null) {
  const input = readJson(filePath);
  if (Array.isArray(input?.items) && input?.schemaVersion) {
    return input;
  }
  return normalizeDataset(input, {
    actorId,
    sourceDatasetPath: path.resolve(filePath)
  });
}
