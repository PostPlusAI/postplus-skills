#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { maybeRegisterCampaignReport } from "../_postplus_shared/scripts/lib/campaign-report-manifest.mjs";

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
  const timeline = Array.isArray(parsed?.timeline) ? parsed.timeline : [];
  return JSON.stringify(
    {
      promptVersion: parsed?.promptVersion || "",
      spokenAudioFlow: timeline
        .map((item) => item.spokenLine)
        .filter(Boolean)
        .join(" "),
      timeline: timeline.map((item) => ({
        index: item.index ?? "",
        startTime: item.startTime || "",
        endTime: item.endTime || "",
        durationSeconds: item.durationSeconds ?? "",
        spokenLine: item.spokenLine || "",
        spokenMeaning: item.spokenMeaning || "",
        visual: item.visual || "",
        subjectAction: item.subjectAction || "",
        camera: item.camera || "",
        edit: item.edit || "",
        caption: item.caption || "",
        audioPacing: item.audioPacing || ""
      }))
    },
    null,
    0
  );
}

function flattenAnalysis(analysis, filePath) {
  const parsed = analysis?.result || null;
  const timeline = Array.isArray(parsed?.timeline) ? parsed.timeline : [];
  const firstItem = timeline[0] || null;
  const lastItem = timeline.length > 0 ? timeline[timeline.length - 1] : null;
  return {
    downloadAvailable: analysis?.source?.videoFilePath ? "true" : "",
    analysisStatus: timeline.length ? "success" : analysis ? "present_unparsed" : "missing",
    videoHook: "",
    videoSummary: "",
    videoStructureType: "",
    videoVisualStyle: "",
    videoCreatorType: "",
    videoProtagonist: "",
    videoShotCount: timeline.length ? String(timeline.length) : "0",
    videoOpeningLineExact: firstItem?.spokenLine || "",
    videoClosingLineApprox: lastItem?.spokenLine || "",
    videoShotTimeline: timeline
      .map((item) => {
        const range = `${item.startTime || "?"}-${item.endTime || "?"}`;
        const spokenLine = item.spokenLine ? ` | ${item.spokenLine}` : "";
        const edit = item.edit ? ` | edit: ${item.edit}` : "";
        return `${range}: ${item.visual || ""}${spokenLine}${edit}`;
      })
      .join(" || "),
    videoSpokenAudioFlow: timeline
      .map((item) => item.spokenLine)
      .filter(Boolean)
      .join(" "),
    videoWhyItWorks: "",
    videoAdaptationIdeas: "",
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
