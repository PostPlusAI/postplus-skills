#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { chunkNormalizedTranscript } from "./_chunking.mjs";

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

function usage() {
  console.error("Usage: node render_ass_from_normalized.mjs --input <normalized-transcript.json> --output <subtitles.ass> [--profile <profile.json>] [--chunk-mode basic]");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
}

function ensureDir(targetPath) {
  fs.mkdirSync(path.resolve(targetPath), { recursive: true });
}

function writeText(filePath, text) {
  ensureDir(path.dirname(path.resolve(filePath)));
  fs.writeFileSync(path.resolve(filePath), text);
}

function assTime(seconds) {
  const totalCs = Math.max(0, Math.round(Number(seconds || 0) * 100));
  const hours = Math.floor(totalCs / 360000);
  const minutes = Math.floor((totalCs % 360000) / 6000);
  const secs = Math.floor((totalCs % 6000) / 100);
  const centis = totalCs % 100;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function escapeAssText(text) {
  return String(text || "")
    .replace(/\\/gu, "\\\\")
    .replace(/\{/gu, "\\{")
    .replace(/\}/gu, "\\}");
}

function normalizeInputText(text) {
  return String(text || "")
    .replace(/\r\n/gu, "\n")
    .replace(/\\N/gu, "\n")
    .replace(/\\\n/gu, "\n");
}

function wrapText(text, { maxLines = 2, maxCharsPerLine = 16 } = {}) {
  const normalized = normalizeInputText(text);

  if (normalized.includes("\n")) {
    return normalized
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, maxLines)
      .join("\\N");
  }

  const words = normalized.trim().split(/\s+/u).filter(Boolean);
  if (words.length === 0) {
    return "";
  }

  const lines = [];
  let current = [];
  let currentLength = 0;

  for (const word of words) {
    const nextLength = current.length === 0 ? word.length : currentLength + 1 + word.length;
    if (current.length > 0 && nextLength > maxCharsPerLine && lines.length < maxLines - 1) {
      lines.push(current.join(" "));
      current = [word];
      currentLength = word.length;
      continue;
    }
    current.push(word);
    currentLength = nextLength;
  }

  if (current.length > 0) {
    lines.push(current.join(" "));
  }

  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines - 1);
    kept.push(lines.slice(maxLines - 1).join(" "));
    return kept.join("\\N");
  }

  return lines.join("\\N");
}

function applyHighlights(text, highlight = {}) {
  const raw = normalizeInputText(text);
  if (!highlight.enabled || !Array.isArray(highlight.keywords) || highlight.keywords.length === 0) {
    return escapeAssText(raw);
  }

  const color = highlight.primaryColour || "&H0058D7FF";
  const keywords = highlight.keywords
    .map((keyword) => String(keyword || "").trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (keywords.length === 0) {
    return escapeAssText(raw);
  }

  const pattern = new RegExp(`\\b(${keywords.map(escapeRegExp).join("|")})\\b`, "giu");
  let lastIndex = 0;
  let result = "";

  for (const match of raw.matchAll(pattern)) {
    const index = match.index ?? 0;
    result += escapeAssText(raw.slice(lastIndex, index));
    result += `{\\c${color}}${escapeAssText(match[0])}{\\c}`;
    lastIndex = index + match[0].length;
  }
  result += escapeAssText(raw.slice(lastIndex));
  return result;
}

function stylizeText(text, { layout, highlight }) {
  const wrapped = wrapText(text, {
    maxLines: Number(layout.maxLines || 2),
    maxCharsPerLine: Number(layout.maxCharsPerLine || 16)
  });

  return wrapped
    .split("\\N")
    .map((line) => applyHighlights(line, highlight))
    .join("\\N");
}

function buildAss(payload, profile) {
  const script = profile.script || {};
  const style = profile.style || {};
  const highlight = profile.highlight || {};
  const layout = profile.layout || {};
  const styleName = style.name || "Default";
  const segments = Array.isArray(payload.segments) ? payload.segments : [];

  const scriptInfo = [
    "[Script Info]",
    "ScriptType: v4.00+",
    `PlayResX: ${script.playResX || 704}`,
    `PlayResY: ${script.playResY || 1280}`,
    `WrapStyle: ${script.wrapStyle ?? 2}`,
    `ScaledBorderAndShadow: ${script.scaledBorderAndShadow || "yes"}`,
    ""
  ];

  const styles = [
    "[V4+ Styles]",
    "Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding",
    `Style: ${[
      styleName,
      style.fontname || "Helvetica",
      style.fontsize ?? 40,
      style.primaryColour || "&H00FFFFFF",
      style.secondaryColour || "&H000000FF",
      style.outlineColour || "&H00111111",
      style.backColour || "&H00000000",
      style.bold ?? 1,
      style.italic ?? 0,
      style.underline ?? 0,
      style.strikeOut ?? 0,
      style.scaleX ?? 100,
      style.scaleY ?? 100,
      style.spacing ?? 0,
      style.angle ?? 0,
      style.borderStyle ?? 1,
      style.outline ?? 2,
      style.shadow ?? 0,
      style.alignment ?? 2,
      style.marginL ?? 48,
      style.marginR ?? 48,
      style.marginV ?? 96,
      style.encoding ?? 1
    ].join(",")}`,
    ""
  ];

  const events = [
    "[Events]",
    "Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text",
    ...segments.map((segment) =>
      [
        "Dialogue: 0",
        assTime(segment.start),
        assTime(segment.end),
        styleName,
        "",
        "0",
        "0",
        "0",
        "",
        stylizeText(segment.text, {
          layout: {
            maxLines: Number(layout.maxLines || payload?.chunking?.maxLines || 2),
            maxCharsPerLine: Number(layout.maxCharsPerLine || payload?.chunking?.maxCharsPerLine || 16)
          },
          highlight
        })
      ].join(",")
    ),
    ""
  ];

  return [...scriptInfo, ...styles, ...events].join("\n");
}

function resolvePayloadForRender(payload, args) {
  const shouldRechunk = args.rechunk === true || args.rechunk === "true";
  const alreadyChunked = payload?.chunking?.mode && Array.isArray(payload?.segments);

  if (alreadyChunked && !shouldRechunk) {
    return payload;
  }

  return chunkNormalizedTranscript(payload, {
    chunkMode: args["chunk-mode"] || "basic",
    maxCharsPerChunk: args["max-chars-per-chunk"],
    maxWordsPerChunk: args["max-words-per-chunk"],
    minDuration: args["min-duration"]
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.output) {
    usage();
    process.exitCode = 1;
    return;
  }

  const profilePath = args.profile
    ? path.resolve(args.profile)
    : path.resolve("skills/40-creative/subtitle-packager/profiles/basic.json");
  const payload = readJson(args.input);
  const profile = readJson(profilePath);
  const chunkedPayload = resolvePayloadForRender(payload, args);

  writeText(args.output, buildAss(chunkedPayload, profile));
  console.log(JSON.stringify({
    output: path.resolve(args.output),
    profile: profile.profileId || "basic",
    chunkMode: chunkedPayload.chunking?.mode || "basic",
    segmentCount: Array.isArray(chunkedPayload.segments) ? chunkedPayload.segments.length : 0
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
