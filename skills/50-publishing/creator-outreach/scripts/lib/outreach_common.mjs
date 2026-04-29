import fs from "node:fs";
import path from "node:path";
import { maybeRegisterCampaignReport } from "../../_postplus_shared/scripts/lib/campaign-report-manifest.mjs";

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

export function cleanNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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

export function uniqueBy(values, getKey) {
  const deduped = [];
  const seen = new Set();
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }
    const key = getKey(value);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(value);
  }
  return deduped;
}

export function splitCsv(value) {
  return uniqueStrings(
    String(value || "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
  );
}

export function normalizeUrl(value) {
  const text = cleanString(value);
  if (!text) {
    return null;
  }
  if (/^https?:\/\//i.test(text)) {
    return text;
  }
  return `https://${text}`;
}

export function mergeTextList(...groups) {
  return uniqueStrings(groups.flatMap((group) => toArray(group)));
}

export function mergeObjects(...objects) {
  const merged = {};
  for (const current of objects) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      continue;
    }
    for (const [key, value] of Object.entries(current)) {
      if (value === null || value === undefined) {
        continue;
      }
      if (Array.isArray(value)) {
        const existing = Array.isArray(merged[key]) ? merged[key] : [];
        merged[key] = [...existing, ...value];
        continue;
      }
      if (typeof value === "object") {
        merged[key] = mergeObjects(merged[key], value);
        continue;
      }
      merged[key] = value;
    }
  }
  return merged;
}

export function pickPreferred(...values) {
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }
    if (typeof value === "string" && !cleanString(value)) {
      continue;
    }
    return value;
  }
  return null;
}

export function pickMeaningful(...values) {
  for (const value of values) {
    const text = cleanString(value);
    if (!text) {
      continue;
    }
    if (["unknown", "general"].includes(text.toLowerCase())) {
      continue;
    }
    return text;
  }
  return pickPreferred(...values);
}

export function extractEmails(text) {
  return uniqueStrings(
    Array.from(
      String(text || "").matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi),
      (match) => match[0]
    )
  );
}

export function inferAccountTypeFromBio(platform, bio) {
  const lower = safeLower(bio);
  if (!lower) return "general";
  if (lower.includes("ugc") || lower.includes("creator") || lower.includes("influencer")) return "creator";
  if (lower.includes("founder") || lower.includes("building")) return "founder";
  if (lower.includes("agency") || lower.includes("growth")) return "agency";
  if (platform === "x" && (lower.includes("writer") || lower.includes("operator"))) return "operator";
  if (platform === "tiktok" && lower.includes("shop")) return "commerce";
  return "general";
}

export function normalizeCreatorType(value, platform = null, bio = null) {
  const lower = safeLower(value);
  if (!lower) {
    const inferred = inferAccountTypeFromBio(platform, bio);
    return normalizeCreatorType(inferred);
  }
  if (lower.includes("individual") || lower === "creator" || lower === "ugc") return "individual_creator";
  if (lower.includes("founder") || lower.includes("operator")) return "individual_creator";
  if (lower.includes("educator") || lower.includes("consultant") || lower === "teacher") return "educator_consultant";
  if (lower.includes("brand") || lower.includes("store") || lower.includes("shop") || lower.includes("commerce")) {
    return "brand_product_account";
  }
  if (lower.includes("aggregator")) return "aggregator";
  if (lower.includes("media") || lower.includes("meme")) return "media_meme";
  if (lower.includes("agency")) return "aggregator";
  return "unknown";
}

export function topLevelItems(dataset) {
  return Array.isArray(dataset?.items) ? dataset.items : [];
}

export function average(numbers, precision = 6) {
  const values = numbers
    .map((value) => cleanNumber(value))
    .filter((value) => value !== null);
  if (!values.length) {
    return null;
  }
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(precision));
}

export function normalizeContactSignals(value) {
  const asList = [];
  if (Array.isArray(value)) {
    for (const signal of value) {
      if (!signal || typeof signal !== "object") {
        continue;
      }
      const type = cleanString(signal.type);
      const rawValue = type === "website" || type === "bioLink" ? normalizeUrl(signal.value) : cleanString(signal.value);
      if (!type || !rawValue) {
        continue;
      }
      asList.push({
        type,
        value: rawValue,
        source: cleanString(signal.source) || "imported"
      });
    }
    return uniqueBy(asList, (signal) => `${safeLower(signal.type)}:${safeLower(signal.value)}`);
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  for (const [type, raw] of Object.entries(value)) {
    const normalizedType = cleanString(type);
    if (!normalizedType) {
      continue;
    }
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const normalizedValue =
        normalizedType === "website" || normalizedType === "bioLink"
          ? normalizeUrl(raw.value)
          : cleanString(raw.value);
      if (!normalizedValue) {
        continue;
      }
      asList.push({
        type: normalizedType,
        value: normalizedValue,
        source: cleanString(raw.source) || "imported"
      });
      continue;
    }
    const normalizedValue =
      normalizedType === "website" || normalizedType === "bioLink"
        ? normalizeUrl(raw)
        : cleanString(raw);
    if (!normalizedValue) {
      continue;
    }
    asList.push({
      type: normalizedType,
      value: normalizedValue,
      source: "imported"
    });
  }

  return uniqueBy(asList, (signal) => `${safeLower(signal.type)}:${safeLower(signal.value)}`);
}

export function tokenizeKeywords(text) {
  return uniqueStrings(
    String(text || "")
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length >= 3)
  );
}

export function countKeywordMatches(text, keywords) {
  const haystack = safeLower(text);
  if (!haystack || !Array.isArray(keywords) || !keywords.length) {
    return 0;
  }
  let matches = 0;
  for (const keyword of keywords) {
    const normalized = safeLower(keyword);
    if (normalized && haystack.includes(normalized)) {
      matches += 1;
    }
  }
  return matches;
}

export function followerScore(followersCount) {
  const followers = Number(followersCount || 0);
  if (followers >= 1_000_000) return 35;
  if (followers >= 300_000) return 28;
  if (followers >= 100_000) return 22;
  if (followers >= 30_000) return 16;
  if (followers >= 10_000) return 10;
  if (followers >= 1_000) return 5;
  return 1;
}
