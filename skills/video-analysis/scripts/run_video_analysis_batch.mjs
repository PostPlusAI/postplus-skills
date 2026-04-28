#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  formatCliError,
} from "../../shared-runtime/scripts/lib/network_runtime.mjs";
import { runHostedProviderOperation } from "../../shared-runtime/scripts/lib/hosted_provider_bridge.mjs";

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

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
  fs.writeFileSync(path.resolve(filePath), JSON.stringify(value, null, 2));
}

function formatSeconds(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
}

function detectVideoDurationSeconds(filePath) {
  const result = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "json",
      filePath,
    ],
    {
      encoding: "utf8",
    },
  );

  if (result.status !== 0 || !result.stdout.trim()) {
    return null;
  }

  try {
    const payload = JSON.parse(result.stdout);
    const durationSeconds = Number(payload?.format?.duration);
    return Number.isFinite(durationSeconds) && durationSeconds > 0
      ? Math.ceil(durationSeconds)
      : null;
  } catch {
    return null;
  }
}

function normalizeTimeline(shots) {
  if (!Array.isArray(shots)) return "";
  return shots
    .map((shot) => {
      const start = shot.startTime || "";
      const end = shot.endTime || "";
      const audio = String(shot.audio || "").replace(/\s+/g, " ").trim();
      return `${start}-${end}: ${audio}`;
    })
    .filter(Boolean)
    .join(" || ");
}

function buildPrompt(sourceUrl) {
  return [
    "Analyze this short-form social video.",
    "Return strict JSON only.",
    "All explanatory fields must be in Simplified Chinese except exact spoken lines, which should stay in the video's original language.",
    "Focus on educational/explainer content structure, hook, CTA, and why the video works.",
    `Source URL: ${sourceUrl}`,
    "Required JSON fields:",
    "{",
    '  "summaryZh": string,',
    '  "hookZh": string,',
    '  "contentPromiseZh": string,',
    '  "structureTypeZh": string,',
    '  "visualStyleZh": string,',
    '  "ctaZh": string,',
    '  "whyItWorksZh": string[],',
    '  "openingLineExact": string,',
    '  "closingLineApprox": string,',
    '  "spokenAudioFlowZh": string,',
    '  "shots": [{"startTime":"MM:SS","endTime":"MM:SS","durationSeconds":number,"visual":"中文","audio":"原语言"}],',
    '  "uncertaintiesZh": string[]',
    "}",
    "Rules:",
    "- Keep shots to 4-8 segments unless the pacing genuinely requires more.",
    "- openingLineExact should capture the true opening spoken line as closely as possible.",
    "- closingLineApprox can be approximate if the ending is partially obscured.",
    "- whyItWorksZh should be 3-5 concrete points, not generic praise.",
  ].join("\n");
}

function buildEstimatedUsage({ prompt, videoSeconds }) {
  const promptTokens = Math.max(
    512,
    Math.ceil(prompt.length / 4) + Math.ceil(videoSeconds * 300),
  );
  const completionTokens = 1200;

  return {
    completionTokens,
    promptTokens,
    totalTokens: promptTokens + completionTokens,
    videoSeconds,
  };
}

function toGeminiPayload({ prompt, mimeType, base64Data }) {
  return {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  };
}

function extractTextResponse(payload) {
  return (
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || ""
  );
}

async function analyzeOne({ item, model, outputDir }) {
  const fileBuffer = fs.readFileSync(item.filePath);
  const base64Data = fileBuffer.toString("base64");
  const prompt = buildPrompt(item.sourceUrl);
  const estimatedVideoSeconds =
    detectVideoDurationSeconds(item.filePath) ??
    (typeof item.durationSeconds === "number" && Number.isFinite(item.durationSeconds)
      ? Math.ceil(item.durationSeconds)
      : 60);
  const payload = toGeminiPayload({
    prompt,
    mimeType: "video/mp4",
    base64Data,
  });

  const startedAt = new Date().toISOString();
  const raw = await runHostedProviderOperation({
    estimatedUsage: buildEstimatedUsage({
      prompt,
      videoSeconds: estimatedVideoSeconds,
    }),
    family: "llm",
    operation: "google-generate-content",
    model,
    payload,
  });
  const text = extractTextResponse(raw);
  if (!text) {
    throw new Error("Gemini returned no text content.");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(`Gemini returned non-JSON text: ${text.slice(0, 500)}`);
  }

  const shots = Array.isArray(parsed.shots) ? parsed.shots : [];
  const normalized = {
    sourceId: item.sourceId,
    sourceUrl: item.sourceUrl,
    videoFilePath: item.filePath,
    model,
    summaryZh: parsed.summaryZh || "",
    hookZh: parsed.hookZh || "",
    contentPromiseZh: parsed.contentPromiseZh || "",
    structureTypeZh: parsed.structureTypeZh || "",
    visualStyleZh: parsed.visualStyleZh || "",
    ctaZh: parsed.ctaZh || "",
    whyItWorksZh: Array.isArray(parsed.whyItWorksZh) ? parsed.whyItWorksZh : [],
    openingLineExact: parsed.openingLineExact || "",
    closingLineApprox: parsed.closingLineApprox || "",
    spokenAudioFlowZh: parsed.spokenAudioFlowZh || "",
    shotTimelineZh: normalizeTimeline(
      shots.map((shot) => ({
        ...shot,
        startTime: shot.startTime || formatSeconds(shot.startTimeSeconds),
        endTime: shot.endTime || formatSeconds(shot.endTimeSeconds),
      }))
    ),
    shots,
    uncertaintiesZh: Array.isArray(parsed.uncertaintiesZh) ? parsed.uncertaintiesZh : [],
    rawText: text,
  };

  const outputPath = path.join(path.resolve(outputDir), `${item.sourceId}.json`);
  writeJson(outputPath, {
    source: {
      sourceId: item.sourceId,
      sourceUrl: item.sourceUrl,
      videoFilePath: item.filePath,
    },
    gemini: {
      model,
      inputMode: "inline",
      analyzedAt: startedAt,
    },
    result: normalized,
    raw,
  });

  return { sourceId: item.sourceId, outputPath, normalized };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args["download-report"] || !args["output-dir"]) {
    console.error(
      "Usage: node run_video_analysis_batch.mjs --download-report <report.json> --output-dir <dir> [--model gemini-3.1-pro-preview] [--concurrency 1]"
    );
    process.exitCode = 1;
    return;
  }

  const report = readJson(args["download-report"]);
  const items = (report.results || []).filter((item) => item.success && item.filePath);
  const outputDir = path.resolve(args["output-dir"]);
  const model = args.model || "gemini-3.1-pro-preview";
  const concurrency = Math.max(1, Number(args.concurrency || 1));
  fs.mkdirSync(outputDir, { recursive: true });

  const queue = [...items];
  const successes = [];
  const failures = [];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      try {
        const result = await analyzeOne({ item, model, outputDir });
        successes.push(result);
        console.log(`Analyzed ${item.sourceId}`);
      } catch (error) {
        failures.push({
          sourceId: item.sourceId,
          sourceUrl: item.sourceUrl,
          filePath: item.filePath,
          error: error instanceof Error ? error.message : String(error),
        });
        console.error(`Failed ${item.sourceId}: ${failures[failures.length - 1].error}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  writeJson(path.join(outputDir, "_batch-summary.json"), {
    itemCount: items.length,
    successCount: successes.length,
    failureCount: failures.length,
    successes: successes.map((item) => ({
      sourceId: item.sourceId,
      outputPath: item.outputPath,
    })),
    failures,
  });
}

main().catch((error) => {
  console.error(formatCliError(error));
  process.exitCode = 1;
});
