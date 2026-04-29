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

function ensureNormalizedItems(input) {
  if (!input?.platform || !Array.isArray(input?.items)) {
    throw new Error("XHS media collector expects a normalized XHS dataset with items.");
  }
  return input.items;
}

function guessExtension(url, contentType) {
  const byType =
    typeof contentType === "string" && contentType.includes("/")
      ? contentType.split("/").pop().replace(/[^a-z0-9]/gi, "").toLowerCase()
      : null;
  if (byType) {
    if (byType === "jpeg") return "jpg";
    return byType;
  }

  const pathname = new URL(url).pathname;
  const rawExt = path.extname(pathname).replace(/^\./, "").toLowerCase();
  if (rawExt) {
    return rawExt;
  }
  return "bin";
}

function toFilenamePart(text) {
  return String(text || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "asset";
}

export function buildMediaManifest(input, options = {}) {
  const items = ensureNormalizedItems(input);
  const limit = parseNumber(options.limit) ?? items.length;
  const selected = items
    .filter((item) => cleanString(item.coverUrl))
    .slice(0, Math.max(0, limit));

  if (!selected.length) {
    throw new Error("No downloadable coverUrl values found in the input dataset.");
  }

  return {
    generatedAt: new Date().toISOString(),
    platform: "xiaohongshu",
    assetCount: selected.length,
    inputPath: cleanString(options.inputPath) || null,
    assets: selected.map((item) => {
      const noteId = cleanString(item.noteId) || toFilenamePart(item.noteUrl);
      return {
        assetId: `${noteId}-cover`,
        assetType: "image",
        assetRole: "cover",
        noteId,
        noteUrl: cleanString(item.noteUrl),
        profileUrl: cleanString(item.profileUrl),
        authorId: cleanString(item.authorId),
        authorName: cleanString(item.authorName),
        remoteUrl: cleanString(item.coverUrl),
        relativePath: `covers/${noteId}-cover.${guessExtension(item.coverUrl)}`,
        downloadStatus: "pending"
      };
    })
  };
}

export async function downloadAsset(asset, outputDir) {
  if (cleanString(asset.assetType) === "video") {
    throw new Error(`Video asset downloads are not validated for ${asset.assetId}.`);
  }
  const remoteUrl = cleanString(asset.remoteUrl);
  if (!remoteUrl) {
    throw new Error(`Asset ${asset.assetId} is missing remoteUrl.`);
  }

  const targetPath = path.resolve(outputDir, asset.relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const response = await fetch(remoteUrl);
  if (!response.ok) {
    throw new Error(`Download failed for ${asset.assetId}: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get("content-type");
  const currentExt = path.extname(targetPath).replace(/^\./, "").toLowerCase();
  const resolvedExt = currentExt === "bin" ? guessExtension(remoteUrl, contentType) : currentExt;
  const finalPath =
    resolvedExt !== currentExt
      ? targetPath.replace(/\.bin$/i, `.${resolvedExt}`)
      : targetPath;
  fs.writeFileSync(finalPath, buffer);
  return {
    ...asset,
    relativePath:
      resolvedExt !== currentExt
        ? asset.relativePath.replace(/\.bin$/i, `.${resolvedExt}`)
        : asset.relativePath,
    localPath: finalPath,
    httpStatus: response.status,
    byteSize: buffer.length,
    contentType,
    downloadStatus: "downloaded"
  };
}

export function verifyDownloadedManifest(manifest) {
  const assets = Array.isArray(manifest?.assets) ? manifest.assets : [];
  const results = assets.map((asset) => {
    const localPath = cleanString(asset.localPath);
    const exists = localPath ? fs.existsSync(localPath) : false;
    const byteSize = exists ? fs.statSync(localPath).size : 0;
    return {
      assetId: asset.assetId,
      localPath,
      exists,
      byteSize,
      ok: exists && byteSize > 0
    };
  });

  return {
    assetCount: assets.length,
    okCount: results.filter((result) => result.ok).length,
    failedCount: results.filter((result) => !result.ok).length,
    results
  };
}
