#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { maybeRegisterCampaignReport } from "../../../scripts/lib/campaign-report-manifest.mjs";

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

function csvEscape(value) {
  const stringValue = value === null || value === undefined ? "" : String(value);
  if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`;
  }
  return stringValue;
}

function toCsv(rows, headers) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  return lines.join("\n");
}

function readCsv(filePath) {
  const raw = fs.readFileSync(path.resolve(filePath), "utf8");
  const parsed = parseCsv(raw);
  const headers = parsed[0] || [];
  const rows = parsed.slice(1).map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index] ?? "";
    });
    return item;
  });
  return { headers, rows };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
}

function listJsonFiles(dirPath) {
  return fs
    .readdirSync(path.resolve(dirPath))
    .filter((name) => name.endsWith(".json") && !name.startsWith("_"))
    .map((name) => path.join(path.resolve(dirPath), name));
}

function buildScript(parsed) {
  const shots = Array.isArray(parsed?.shots) ? parsed.shots : [];
  return JSON.stringify(
    {
      openingLine: shots[0]?.audio || parsed?.hook || "",
      closingLine: shots.length > 0 ? shots[shots.length - 1]?.audio || "" : "",
      visualSummary: parsed?.summary || "",
      spokenAudioFlow: shots.map((shot) => shot.audio).filter(Boolean).join(" "),
      shots: shots.map((shot) => ({
        startTime: shot.startTime || "",
        endTime: shot.endTime || "",
        durationSeconds: shot.durationSeconds ?? "",
        visual: shot.visual || "",
        audio: shot.audio || ""
      }))
    },
    null,
    0
  );
}

function flattenAnalysis(analysis, filePath) {
  const parsed = analysis?.result?.parsed || null;
  const shots = Array.isArray(parsed?.shots) ? parsed.shots : [];
  return {
    downloadAvailable: analysis?.source?.videoFilePath ? "true" : "",
    analysisStatus: parsed ? "success" : analysis ? "present_unparsed" : "missing",
    videoHook: parsed?.hook || "",
    videoSummary: parsed?.summary || "",
    videoStructureType: parsed?.structureType || "",
    videoVisualStyle: parsed?.visualStyle || "",
    videoCreatorType: parsed?.creatorType || "",
    videoProtagonist: parsed?.protagonist || "",
    videoShotCount: shots.length ? String(shots.length) : "0",
    videoOpeningLineExact: shots[0]?.audio || parsed?.hook || "",
    videoClosingLineApprox: shots.length > 0 ? shots[shots.length - 1]?.audio || "" : "",
    videoShotTimeline: shots.map((shot) => `${shot.startTime || "?"}-${shot.endTime || "?"}: ${shot.audio || ""}`).join(" || "),
    videoSpokenAudioFlow: shots.map((shot) => shot.audio).filter(Boolean).join(" "),
    videoWhyItWorks: (parsed?.whyItWorks || []).join(" | "),
    videoAdaptationIdeas: (parsed?.adaptationIdeas || []).join(" | "),
    videoUncertainties: (parsed?.uncertainties || []).join(" | "),
    analysisModel: analysis?.gemini?.model || "",
    analysisInputMode: analysis?.gemini?.inputMode || "",
    analysisPath: filePath,
    script: parsed ? buildScript(parsed) : ""
  };
}

function clearMissingScriptFields(row) {
  return {
    ...row,
    downloadAvailable: "false",
    analysisStatus: "missing",
    videoOpeningLineExact: "",
    videoClosingLineApprox: "",
    videoShotTimeline: "",
    videoSpokenAudioFlow: "",
    analysisPath: "",
    script: ""
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.master || !args["analysis-dir"]) {
    console.error("Usage: node backfill_master_table_with_script.mjs --master <master.csv> --analysis-dir <dir> [--output <csv>]");
    process.exitCode = 1;
    return;
  }

  const output = path.resolve(args.output || args.master);
  const { headers: originalHeaders, rows } = readCsv(args.master);
  const extraHeaders = [
    "script",
    "videoOpeningLineExact",
    "videoClosingLineApprox",
    "videoShotTimeline",
    "videoSpokenAudioFlow"
  ];
  const headers = [...originalHeaders];
  for (const header of extraHeaders) {
    if (!headers.includes(header)) headers.push(header);
  }

  const analyses = listJsonFiles(args["analysis-dir"]);
  const bySourceId = new Map();
  for (const filePath of analyses) {
    const data = readJson(filePath);
    const sourceId = String(data?.source?.sourceId || "");
    if (!sourceId) continue;
    bySourceId.set(sourceId, flattenAnalysis(data, path.resolve(filePath)));
  }

  let updated = 0;
  const mergedRows = rows.map((row) => {
    const sourceId = String(row.sourceId || "");
    const analysis = bySourceId.get(sourceId);
    if (!analysis) {
      if (!String(row.script || "").trim()) {
        return clearMissingScriptFields(row);
      }
      return row;
    }
    updated += 1;
    return {
      ...row,
      ...analysis,
      isStrongBenchmark: row.isStrongBenchmark || ""
    };
  });

  fs.writeFileSync(output, toCsv(mergedRows, headers));
  maybeRegisterCampaignReport(output);
  console.log(JSON.stringify({ updatedRows: updated, output }, null, 2));
}

main();
