#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

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
  console.error("Usage: node text_to_srt.mjs --input <notes.md> --output <draft.srt> [--chars-per-second 4.5] [--min-duration 1.2] [--max-duration 6]");
}

function readText(filePath) {
  return fs.readFileSync(path.resolve(filePath), "utf8");
}

function ensureDir(targetPath) {
  fs.mkdirSync(path.resolve(targetPath), { recursive: true });
}

function writeText(filePath, text) {
  ensureDir(path.dirname(path.resolve(filePath)));
  fs.writeFileSync(path.resolve(filePath), text);
}

function pad(value, size = 2) {
  return String(value).padStart(size, "0");
}

function formatSrtTime(seconds) {
  const totalMs = Math.max(0, Math.round(Number(seconds || 0) * 1000));
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(ms, 3)}`;
}

function cleanMarkdownLine(line) {
  return line
    .replace(/^\s{0,3}#{1,6}\s+/u, "")
    .replace(/^\s*[-*+]\s+/u, "")
    .replace(/^\s*\d+[.)、]\s+/u, "")
    .replace(/`+/gu, "")
    .replace(/\*\*/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function splitLongLine(line, maxChars = 28) {
  if (line.length <= maxChars) {
    return [line];
  }

  const parts = [];
  let rest = line;
  while (rest.length > maxChars) {
    let cutIndex = rest.lastIndexOf(" ", maxChars);
    if (cutIndex < Math.floor(maxChars * 0.5)) {
      cutIndex = maxChars;
    }
    parts.push(rest.slice(0, cutIndex).trim());
    rest = rest.slice(cutIndex).trim();
  }
  if (rest) {
    parts.push(rest);
  }
  return parts.filter(Boolean);
}

function textToSegments(text, options = {}) {
  const charsPerSecond = Number(options.charsPerSecond || 4.5);
  const minDuration = Number(options.minDuration || 1.2);
  const maxDuration = Number(options.maxDuration || 6);
  const gap = Number(options.gap || 0.12);

  const lines = text
    .split(/\r?\n/u)
    .map(cleanMarkdownLine)
    .filter(Boolean)
    .flatMap((line) => splitLongLine(line, Number(options.maxChars || 28)));

  let cursor = 0;
  return lines.map((line) => {
    const duration = Math.min(maxDuration, Math.max(minDuration, line.length / charsPerSecond));
    const segment = {
      start: cursor,
      end: cursor + duration,
      text: line
    };
    cursor = segment.end + gap;
    return segment;
  });
}

function buildSrt(segments) {
  return `${segments.map((segment, index) => {
    return [
      String(index + 1),
      `${formatSrtTime(segment.start)} --> ${formatSrtTime(segment.end)}`,
      segment.text,
      ""
    ].join("\n");
  }).join("\n")}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.output) {
    usage();
    process.exitCode = 1;
    return;
  }

  const text = readText(args.input);
  const segments = textToSegments(text, args);
  if (segments.length === 0) {
    throw new Error("No usable lines found in input text.");
  }

  writeText(args.output, buildSrt(segments));
  console.log(JSON.stringify({
    input: path.resolve(args.input),
    output: path.resolve(args.output),
    segmentCount: segments.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
