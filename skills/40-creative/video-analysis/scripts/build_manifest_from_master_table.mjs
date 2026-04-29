#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith("--")) continue;
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

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === "\"" && next === "\"") {
        value += "\"";
        i += 1;
      } else if (char === "\"") {
        inQuotes = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(value);
      value = "";
      continue;
    }

    if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    if (char !== "\r") {
      value += char;
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function readCsv(filePath) {
  const raw = fs.readFileSync(path.resolve(filePath), "utf8");
  const parsed = parseCsv(raw);
  const headers = parsed[0] || [];
  return parsed.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index] ?? "";
    });
    return item;
  });
}

function shouldInclude(row, mode) {
  const status = String(row.analysisStatus || "").trim().toLowerCase();
  const hasSource = String(row.sourceId || "").trim() && String(row.sourceUrl || "").trim();

  if (!hasSource) return false;
  if (mode === "all") return true;
  if (mode === "missing-only") return status !== "success";
  if (mode === "missing-script-only") {
    const hasScript = String(row.script || "").trim().length > 0;
    const hasTimeline = String(row.videoShotTimeline || "").trim().length > 0;
    return !hasScript || !hasTimeline;
  }
  return true;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.master || !args.output) {
    console.error("Usage: node build_manifest_from_master_table.mjs --master <master.csv> --output <manifest.json> [--filter all|missing-only|missing-script-only]");
    process.exitCode = 1;
    return;
  }

  const rows = readCsv(args.master);
  const filterMode = args.filter || "missing-script-only";
  const items = rows
    .filter((row) => shouldInclude(row, filterMode))
    .map((row) => ({
      sourceId: String(row.sourceId).trim(),
      sourceUrl: String(row.sourceUrl).trim(),
      sourceMetadataPath: path.resolve(args.master),
      inputMode: "auto"
    }));

  const outputPath = path.resolve(args.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify({ itemCount: items.length, items }, null, 2));
  console.log(JSON.stringify({ filter: filterMode, itemCount: items.length, output: outputPath }, null, 2));
}

main();
