#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  formatCliError,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/network_runtime.mjs";
import {
  HOSTED_CAPABILITY_JSON_PAYLOAD_BYTE_LIMIT,
  runHostedCapabilityRequest,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/postplus_cloud_client.mjs";
import { uploadHostedMediaFileReference } from "../_postplus_shared/00-core/shared-runtime/scripts/lib/hosted_media_generation_bridge.mjs";

const INLINE_VIDEO_ENVELOPE_OVERHEAD_BYTES = 64 * 1024;
export const INLINE_VIDEO_BYTE_LIMIT = Math.floor(
  ((HOSTED_CAPABILITY_JSON_PAYLOAD_BYTE_LIMIT -
    INLINE_VIDEO_ENVELOPE_OVERHEAD_BYTES) *
    3) /
    4,
);

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

function inferMimeTypeFromPath(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".mp4" || extension === ".m4v") return "video/mp4";
  if (extension === ".mov") return "video/quicktime";
  if (extension === ".webm") return "video/webm";
  throw new Error(
    `unsupported_video_format: ${path.basename(filePath)} is not a supported video-analysis format. Supported formats: .mp4, .m4v, .mov, .webm.`,
  );
}

export function selectVideoInputMode(fileSizeBytes) {
  if (!Number.isFinite(fileSizeBytes) || fileSizeBytes < 0) {
    throw new Error("video_file_size_invalid: file size must be a non-negative number.");
  }

  return fileSizeBytes <= INLINE_VIDEO_BYTE_LIMIT ? "inline" : "file_reference";
}

export function buildVideoInputBoundary(fileSizeBytes) {
  const inputMode = selectVideoInputMode(fileSizeBytes);
  return {
    fileSizeBytes,
    inlineByteLimit: INLINE_VIDEO_BYTE_LIMIT,
    inputMode,
    transferBoundary:
      inputMode === "inline"
        ? "inline_data inside hosted JSON payload guard"
        : "hosted file_reference via signed upload; no automatic compression or segmentation",
  };
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

  if (result.error?.code === "ENOENT") {
    throw new Error(
      "local_dependency_missing: ffprobe is required for video-analysis duration estimation. Follow the postplus-shared Local Dependency Bootstrap Rule, then rerun this script.",
    );
  }

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
    '  "summaryEn": string,',
    '  "hookEn": string,',
    '  "contentPromiseEn": string,',
    '  "structureTypeEn": string,',
    '  "visualStyleEn": string,',
    '  "ctaEn": string,',
    '  "whyItWorksEn": string[],',
    '  "openingLineExact": string,',
    '  "closingLineApprox": string,',
    '  "spokenAudioFlowEn": string,',
    '  "shots": [{"startTime":"MM:SS","endTime":"MM:SS","durationSeconds":number,"visual":"English","audio":"original language"}],',
    '  "uncertaintiesEn": string[]',
    "}",
    "Rules:",
    "- Keep shots to 4-8 segments unless the pacing genuinely requires more.",
    "- openingLineExact should capture the true opening spoken line as closely as possible.",
    "- closingLineApprox can be approximate if the ending is partially obscured.",
    "- whyItWorksEn should be 3-5 concrete points, not generic praise.",
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

export function toGeminiInlinePayload({ prompt, mimeType, base64Data }) {
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

export function toGeminiFileReferencePayload({ prompt, storageReference }) {
  return {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            file_reference: storageReference,
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

export async function analyzeOne({ item, model, outputDir, dependencies = {} }) {
  const absoluteFilePath = path.resolve(item.filePath);
  const stat = fs.statSync(absoluteFilePath);
  const mimeType = inferMimeTypeFromPath(item.filePath);
  const prompt = buildPrompt(item.sourceUrl);
  const estimatedVideoSeconds =
    (dependencies.detectVideoDurationSeconds ?? detectVideoDurationSeconds)(item.filePath) ??
    (typeof item.durationSeconds === "number" && Number.isFinite(item.durationSeconds)
      ? Math.ceil(item.durationSeconds)
      : 60);
  const inputBoundary = buildVideoInputBoundary(stat.size);
  const inputMode = inputBoundary.inputMode;
  console.log(
    `[video-analysis preflight] ${item.sourceId}: ${inputBoundary.fileSizeBytes} bytes -> ${inputBoundary.inputMode}; ${inputBoundary.transferBoundary}.`,
  );
  let storageReference = null;
  let payload;

  if (inputMode === "file_reference") {
    const uploadResult = await (
      dependencies.uploadHostedMediaFileReference ?? uploadHostedMediaFileReference
    )(absoluteFilePath, mimeType);

    if (!uploadResult?.storageReference) {
      throw new Error(
        `upload_failed: no storage reference returned for ${item.sourceId}`,
      );
    }

    storageReference = uploadResult.storageReference;
    payload = toGeminiFileReferencePayload({
      prompt,
      storageReference,
    });
  } else {
    const fileBuffer = fs.readFileSync(absoluteFilePath);
    const base64Data = fileBuffer.toString("base64");
    payload = toGeminiInlinePayload({
      prompt,
      mimeType,
      base64Data,
    });
  }

  const startedAt = new Date().toISOString();
  const raw = await (dependencies.runHostedCapabilityRequest ?? runHostedCapabilityRequest)({
    capability: "video-analysis",
    operation: "analyze",
    modelKey: "gemini-video-analysis",
    payload,
    estimatedUsage: buildEstimatedUsage({
      prompt,
      videoSeconds: estimatedVideoSeconds,
    }),
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
    summaryEn: parsed.summaryEn || "",
    hookEn: parsed.hookEn || "",
    contentPromiseEn: parsed.contentPromiseEn || "",
    structureTypeEn: parsed.structureTypeEn || "",
    visualStyleEn: parsed.visualStyleEn || "",
    ctaEn: parsed.ctaEn || "",
    whyItWorksEn: Array.isArray(parsed.whyItWorksEn) ? parsed.whyItWorksEn : [],
    openingLineExact: parsed.openingLineExact || "",
    closingLineApprox: parsed.closingLineApprox || "",
    spokenAudioFlowEn: parsed.spokenAudioFlowEn || "",
    shotTimelineEn: normalizeTimeline(
      shots.map((shot) => ({
        ...shot,
        startTime: shot.startTime || formatSeconds(shot.startTimeSeconds),
        endTime: shot.endTime || formatSeconds(shot.endTimeSeconds),
      }))
    ),
    shots,
    uncertaintiesEn: Array.isArray(parsed.uncertaintiesEn) ? parsed.uncertaintiesEn : [],
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
      inputMode,
      inlineByteLimit: INLINE_VIDEO_BYTE_LIMIT,
      inputBoundary,
      ...(storageReference ? { storageReference } : {}),
      analyzedAt: startedAt,
    },
    result: normalized,
    raw,
  });

  return { sourceId: item.sourceId, outputPath, normalized };
}

export function serializeBatchFailure(error) {
  const message = error instanceof Error ? error.message : String(error);

  if (!error || typeof error !== "object") {
    return {
      error: message,
      message,
    };
  }

  return {
    code:
      typeof error.productErrorCode === "string"
        ? error.productErrorCode
        : typeof error.code === "string"
          ? error.code
          : undefined,
    error: message,
    layer: typeof error.layer === "string" ? error.layer : undefined,
    message,
    operationId:
      typeof error.operationId === "string" ? error.operationId : undefined,
    providerDisplayName:
      typeof error.providerDisplayName === "string"
        ? error.providerDisplayName
        : undefined,
    status: typeof error.status === "number" ? error.status : undefined,
    userMessageRule:
      typeof error.userMessageRule === "string"
        ? error.userMessageRule
        : undefined,
  };
}

function buildBatchFailure({ item, error }) {
  return {
    sourceId: item.sourceId,
    sourceUrl: item.sourceUrl,
    filePath: item.filePath,
    ...serializeBatchFailure(error),
  };
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
        failures.push(buildBatchFailure({ item, error }));
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

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(formatCliError(error));
    process.exitCode = 1;
  });
}
