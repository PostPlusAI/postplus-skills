#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const SUPPORTED_VIDEO_EXTS = new Set([".mp4", ".mov", ".m4v", ".webm"]);
const SUPPORTED_IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function parseArgs(argv) {
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

function ensureDir(targetPath) {
  fs.mkdirSync(path.resolve(targetPath), { recursive: true });
}

function writeJson(filePath, payload) {
  ensureDir(path.dirname(path.resolve(filePath)));
  fs.writeFileSync(path.resolve(filePath), `${JSON.stringify(payload, null, 2)}\n`);
}

function nowIso() {
  return new Date().toISOString();
}

function usage() {
  console.error(
    "Usage: node run_build_broll_catalog.mjs --input-dir <dir> --output <broll-catalog.json> [--catalog-id <id>]"
  );
}

function collectFiles(inputDir) {
  const results = [];
  const queue = [path.resolve(inputDir)];

  while (queue.length > 0) {
    const current = queue.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(absolutePath);
        continue;
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (SUPPORTED_VIDEO_EXTS.has(ext) || SUPPORTED_IMAGE_EXTS.has(ext)) {
        results.push(absolutePath);
      }
    }
  }

  return results.sort((left, right) => left.localeCompare(right));
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function safeNumber(value, fallback = null) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function roundSeconds(value) {
  if (!Number.isFinite(value)) {
    return null;
  }
  return Number(value.toFixed(3));
}

function ffprobeJson(filePath) {
  try {
    const stdout = execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_streams",
        "-show_format",
        path.resolve(filePath)
      ],
      { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
    );
    return JSON.parse(stdout);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(
        "local_dependency_missing: ffprobe is required for broll-catalog-builder. Follow the postplus-shared Local Dependency Bootstrap Rule, then rerun this script.",
      );
    }
    throw error;
  }
}

function inferMediaType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (SUPPORTED_VIDEO_EXTS.has(ext)) {
    return "video";
  }
  if (SUPPORTED_IMAGE_EXTS.has(ext)) {
    return "image";
  }
  return "unknown";
}

function inferPlatformFit(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return ["9:16", "16:9"];
  }
  const ratio = width / height;
  const portrait = 9 / 16;
  const landscape = 16 / 9;
  const square = 1;

  if (Math.abs(ratio - portrait) < 0.08) {
    return ["9:16"];
  }
  if (Math.abs(ratio - landscape) < 0.2) {
    return ["16:9"];
  }
  if (Math.abs(ratio - square) < 0.1) {
    return ["9:16", "16:9"];
  }
  return ratio < 1 ? ["9:16"] : ["16:9"];
}

function normalizeTokens(filePath) {
  return path
    .basename(filePath, path.extname(filePath))
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function buildKeywordHaystack(filePath, description) {
  return [
    path.basename(filePath, path.extname(filePath))
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .toLowerCase(),
    (description || "").toLowerCase()
  ]
    .filter(Boolean)
    .join(" ");
}

function readSidecarDescription(filePath) {
  const sidecarPath = path.join(
    path.dirname(filePath),
    `${path.basename(filePath, path.extname(filePath))}.md`
  );
  if (!fs.existsSync(sidecarPath)) {
    return null;
  }
  const text = fs.readFileSync(sidecarPath, "utf8").trim();
  if (!text) {
    return null;
  }

  const preferredSections = [];
  const sectionPatterns = [
    /Core content:\s*([\s\S]*?)(?:\n[A-Z][^\n]*:|\n## |\n# |\s*$)/i,
    /What this B-roll is good for:\s*([\s\S]*?)(?:\n[A-Z][^\n]*:|\n## |\n# |\s*$)/i,
    /Editor note:\s*([\s\S]*?)(?:\n[A-Z][^\n]*:|\n## |\n# |\s*$)/i
  ];

  for (const pattern of sectionPatterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      preferredSections.push(match[1].trim());
    }
  }

  const normalized = (preferredSections.length > 0 ? preferredSections.join(" ") : text)
    .split(/\n+/)
    .map((line) => line.replace(/^\s*[-*]\s*/u, "").trim())
    .filter(Boolean)
    .join(" ");

  return normalized.length > 800 ? normalized.slice(0, 800).trim() : normalized;
}

function inferSemanticTags(filePath, tokens, description) {
  const curated = new Set();
  const haystack = buildKeywordHaystack(filePath, description);
  const rawTokens = tokens
    .filter((token) => token.length >= 3 && token.length <= 18)
    .filter((token) => !["broll", "clip", "video", "mov", "mp4"].includes(token));

  const checks = [
    ["ui-demo", ["screen", "ui", "homepage", "app", "tab", "search", "shortcut"]],
    ["gmail", ["gmail", "email", "inbox"]],
    ["chatgpt", ["chatgpt", "chat gpt"]],
    ["workflow", ["workflow", "shortcut", "process"]],
    ["reply", ["reply", "respond", "response"]],
    ["rewrite", ["rewrite", "writing", "ask"]],
    ["search", ["search", "google"]],
    ["homepage", ["homepage", "landing"]],
    ["comparison", ["copy", "back", "switch"]],
    ["product", ["product", "tool"]]
  ];

  for (const [tag, keywords] of checks) {
    if (keywords.some((keyword) => haystack.includes(keyword))) {
      curated.add(tag);
    }
  }

  const optionalRaw = rawTokens.filter((token) =>
    ["google", "gmail", "search", "reply", "workflow", "shortcut", "homepage", "chatgpt"].includes(token)
  );

  return Array.from(new Set([...optionalRaw, ...curated]))
    .sort((left, right) => left.localeCompare(right));
}

function inferSupportRoles(tags) {
  const tagSet = new Set(tags);
  const roles = new Set();

  if (tagSet.has("ui-demo") || tagSet.has("homepage")) {
    roles.add("ui-demo");
  }
  if (tagSet.has("workflow") || tagSet.has("comparison")) {
    roles.add("workflow-bridge");
  }
  if (tagSet.has("gmail") || tagSet.has("reply") || tagSet.has("rewrite")) {
    roles.add("proof");
  }
  if (tagSet.has("search")) {
    roles.add("transition-cover");
  }

  if (roles.size === 0) {
    roles.add("pace-reset");
  }

  return Array.from(roles);
}

function inferEnergy(tags) {
  const tagSet = new Set(tags);
  if (tagSet.has("comparison") || tagSet.has("search")) {
    return "medium";
  }
  if (tagSet.has("ui-demo") || tagSet.has("workflow")) {
    return "low";
  }
  return "low";
}

function inferVisualRisks(tags, width, height) {
  const risks = new Set();
  const tagSet = new Set(tags);

  if (tagSet.has("ui-demo") || tagSet.has("homepage") || tagSet.has("search")) {
    risks.add("small text");
  }
  if (Number.isFinite(width) && Number.isFinite(height) && width > height) {
    risks.add("landscape crop risk for 9:16");
  }

  return Array.from(risks);
}

function inferLiteralDescription(filePath, description, tags) {
  if (description) {
    return description;
  }
  const base = path
    .basename(filePath, path.extname(filePath))
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!base) {
    return tags.join(" ");
  }
  return base;
}

function inferUsableRanges(durationSeconds, mediaType) {
  if (mediaType !== "video" || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return [];
  }

  if (durationSeconds <= 1.5) {
    return [
      {
        start: 0,
        end: roundSeconds(durationSeconds),
        reason: "full clip usable"
      }
    ];
  }

  const start = durationSeconds > 3 ? 0.2 : 0;
  const end = durationSeconds > 3 ? Math.max(durationSeconds - 0.2, start + 0.6) : durationSeconds;

  return [
    {
      start: roundSeconds(start),
      end: roundSeconds(end),
      reason: "default safe usable range"
    }
  ];
}

function buildAssetRecord(filePath, index) {
  const mediaType = inferMediaType(filePath);
  const probe = ffprobeJson(filePath);
  const videoStream = Array.isArray(probe.streams)
    ? probe.streams.find((stream) => stream.codec_type === "video") || probe.streams[0]
    : null;

  const width = safeNumber(videoStream?.width);
  const height = safeNumber(videoStream?.height);
  const duration =
    safeNumber(probe?.format?.duration) ??
    safeNumber(videoStream?.duration) ??
    null;
  const description = readSidecarDescription(filePath);
  const tokens = normalizeTokens(filePath);
  const semanticTags = inferSemanticTags(filePath, tokens, description);
  const supportRoles = inferSupportRoles(semanticTags);

  return {
    assetId: `broll-${String(index + 1).padStart(3, "0")}`,
    path: path.resolve(filePath),
    mediaType,
    duration: mediaType === "video" ? roundSeconds(duration ?? 0) : null,
    dimensions:
      Number.isFinite(width) && Number.isFinite(height)
        ? { width, height }
        : null,
    usableRanges: inferUsableRanges(duration, mediaType),
    literalDescription: inferLiteralDescription(filePath, description, semanticTags),
    semanticTags,
    supportRoles,
    energy: inferEnergy(semanticTags),
    platformFit: inferPlatformFit(width, height),
    visualRisks: inferVisualRisks(semanticTags, width, height),
    notes: description ? "derived from sidecar description and filename" : "derived from filename heuristics",
    sourceBasis: {
      fileName: path.basename(filePath),
      sidecarDescriptionPath: fs.existsSync(
        path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.md`)
      )
        ? path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}.md`)
        : null
    }
  };
}

function buildCatalog({ inputDir, outputPath, catalogId }) {
  const absoluteInputDir = path.resolve(inputDir);
  const files = collectFiles(absoluteInputDir);
  const assets = files.map((filePath, index) => buildAssetRecord(filePath, index));

  return {
    schemaVersion: "broll-catalog/v1",
    catalogId: catalogId || slugify(path.basename(absoluteInputDir)) || "broll-catalog",
    sourceRoot: absoluteInputDir,
    assetCount: assets.length,
    assets,
    meta: {
      createdAt: nowIso(),
      sourceType: "local-folder",
      outputPath: path.resolve(outputPath),
      generator: "skills/40-creative/b-roll-family/broll-catalog-builder/scripts/run_build_broll_catalog.mjs"
    }
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args["input-dir"]) {
    usage();
    process.exitCode = 1;
    return;
  }
  if (!args.output) {
    usage();
    process.exitCode = 1;
    return;
  }

  const inputDir = path.resolve(args["input-dir"]);
  const outputPath = path.resolve(args.output);

  if (!fs.existsSync(inputDir) || !fs.statSync(inputDir).isDirectory()) {
    throw new Error(`Input directory not found: ${inputDir}`);
  }

  const catalog = buildCatalog({
    inputDir,
    outputPath,
    catalogId: args["catalog-id"] || null
  });

  writeJson(outputPath, catalog);
  console.log(JSON.stringify({ outputPath, assetCount: catalog.assetCount }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
