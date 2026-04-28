import fs from "node:fs";
import path from "node:path";

export const SCHEMA_VERSION = "1.0.0";

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith("--")) {
      continue;
    }
    const key = current.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
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

  const multiplier =
    raw.endsWith("k") ? 1_000 :
    raw.endsWith("m") ? 1_000_000 :
    raw.endsWith("b") ? 1_000_000_000 :
    1;

  const numericPart = raw.replace(/[^0-9.+-]/g, "");
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

function pickFirst(item, keys) {
  for (const key of keys) {
    const value = key
      .split(".")
      .reduce((current, segment) => current?.[segment], item);
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
    const match = text.match(/\b[A-Z]{3}\b/);
    if (match) {
      return match[0];
    }
    if (text.includes("$")) {
      return "USD";
    }
  }
  return null;
}

function normalizeImageUrls(item) {
  const urls = [
    ...toArray(item.imageUrls),
    ...toArray(item.images),
    ...toArray(item.image),
    ...toArray(item.productImages),
    ...toArray(item.productImageUrls)
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

function normalizeBreadcrumbs(item) {
  const source = pickFirst(item, ["breadcrumbs", "categoryPath", "categories"]);
  return toArray(source)
    .map((entry) => {
      if (typeof entry === "string") {
        return cleanString(entry);
      }
      if (entry && typeof entry.name === "string") {
        return cleanString(entry.name);
      }
      if (entry && typeof entry.text === "string") {
        return cleanString(entry.text);
      }
      return null;
    })
    .filter(Boolean);
}

function normalizeTags(item) {
  const source = pickFirst(item, ["tags", "keywords", "labels"]);
  return toArray(source)
    .map((entry) => {
      if (typeof entry === "string") {
        return cleanString(entry);
      }
      if (entry && typeof entry.name === "string") {
        return cleanString(entry.name);
      }
      return null;
    })
    .filter(Boolean);
}

function normalizeStructuredList(value) {
  return toArray(value)
    .map((entry) => {
      if (entry && typeof entry === "object") {
        return entry;
      }
      if (typeof entry === "string") {
        return { value: cleanString(entry) };
      }
      return null;
    })
    .filter(Boolean);
}

export function normalizeItem(item, options = {}) {
  const actorId = cleanString(options.actorId);
  const sourceUrl = cleanString(
    pickFirst(item, [
      "sourceUrl",
      "url",
      "productUrl",
      "product_url",
      "productLink",
      "link",
      "__sourceUrl"
    ])
  );
  const scrapedAt = cleanString(
    pickFirst(item, ["scrapedAt", "fetchedAt", "lastUpdatedAt", "timestamp"])
  );

  const price = parseMoney(
    pickFirst(item, ["currentPrice", "price", "salePrice", "priceValue"])
  );
  const originalPrice = parseMoney(
    pickFirst(item, ["originalPrice", "listPrice", "compareAtPrice"])
  );
  const priceMin = parseMoney(
    pickFirst(item, ["priceMin", "minPrice", "minSalePrice"])
  );
  const priceMax = parseMoney(
    pickFirst(item, ["priceMax", "maxPrice", "maxSalePrice"])
  );

  const imageUrls = normalizeImageUrls(item);
  const breadcrumbs = normalizeBreadcrumbs(item);

  return {
    source: {
      actorId,
      sourceUrl,
      scrapedAt
    },
    identity: {
      productId: cleanString(
        pickFirst(item, ["productId", "product_id", "id", "itemId", "offerId"])
      ),
      title: cleanString(
        pickFirst(item, ["title", "product_name", "name", "productTitle", "__sampleLabel"])
      ),
      productUrl: cleanString(
        pickFirst(item, ["productUrl", "product_url", "url", "productLink", "link"])
      ),
      brand: cleanString(pickFirst(item, ["brand", "brandName", "specification.0.value"])),
      shopId: cleanString(
        pickFirst(item, ["shopId", "sellerId", "storeId", "seller.seller_id"])
      ),
      shopName: cleanString(
        pickFirst(item, [
          "shopName",
          "sellerName",
          "storeName",
          "shop",
          "seller.seller_name"
        ])
      ),
      shopUrl: cleanString(
        pickFirst(item, ["shopUrl", "storeUrl", "sellerUrl", "seller.seller_link"])
      )
    },
    pricing: {
      currency: cleanString(
        pickFirst(item, ["currency", "currencyCode"]) ||
          deriveCurrency(
            pickFirst(item, ["priceText", "priceLabel", "displayPrice"]),
            pickFirst(item, ["currentPrice", "price", "salePrice"])
          )
      ),
      currentPrice: price,
      originalPrice,
      priceMin,
      priceMax
    },
    proof: {
      orders: parseNumber(
        pickFirst(item, [
          "orders",
          "orderCount",
          "soldCount",
          "salesCount",
          "sale_cnt",
          "sale_30d_cnt"
        ])
      ),
      ratingAverage: parseNumber(
        pickFirst(item, [
          "ratingAverage",
          "rating",
          "avgRating",
          "score",
          "labels.rating"
        ])
      ),
      ratingCount: parseNumber(
        pickFirst(item, ["ratingCount", "ratingsCount", "totalRatings"])
      ),
      reviewCount: parseNumber(
        pickFirst(item, [
          "reviewCount",
          "review_count",
          "reviewsCount",
          "commentCount",
          "totalReviews"
        ])
      )
    },
    merchandising: {
      category: cleanString(
        pickFirst(item, ["category", "categoryName", "categories"]) || breadcrumbs.at(-1)
      ),
      breadcrumbs,
      tags: normalizeTags(item),
      description: cleanString(
        pickFirst(item, ["description", "productDescription", "summary"])
      )
    },
    media: {
      primaryImageUrl: imageUrls[0] || null,
      imageUrls
    },
    variants: normalizeStructuredList(pickFirst(item, ["variants", "skus", "options"])),
    specs: normalizeStructuredList(
      pickFirst(item, ["specs", "attributes", "properties", "details"])
    ),
    raw: item
  };
}

export function normalizeDataset(input, options = {}) {
  const payload = Array.isArray(input) ? { items: input } : input;
  const actorId = cleanString(payload.actorId || options.actorId);
  const items = toArray(payload.items || payload);
  const normalizedItems = items.map((item) => normalizeItem(item, { actorId }));

  return {
    schemaVersion: SCHEMA_VERSION,
    normalizedAt: new Date().toISOString(),
    source: {
      actorId,
      fetchedAt: cleanString(payload.fetchedAt),
      inputPath: cleanString(options.inputPath),
      sourceDatasetPath: cleanString(options.inputPath)
    },
    itemCount: normalizedItems.length,
    items: normalizedItems
  };
}

export function readDatasetForAnalysis(filePath, explicitActorId = null) {
  const input = readJson(filePath);
  if (input && input.schemaVersion === SCHEMA_VERSION && Array.isArray(input.items)) {
    return input;
  }
  return normalizeDataset(input, {
    actorId: explicitActorId,
    inputPath: filePath
  });
}
