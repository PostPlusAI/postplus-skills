#!/usr/bin/env node

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
import {
  runLocalDependencyCommandSync,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/local_dependencies.mjs";
import { uploadHostedMediaFileReference } from "../_postplus_shared/00-core/shared-runtime/scripts/lib/hosted_media_generation_bridge.mjs";
import { readDomainSkillExecutionInput } from "../_postplus_shared/00-core/shared-runtime/scripts/lib/hosted_execution_protocol.mjs";

export const VIDEO_ANALYSIS_JSON_PAYLOAD_BYTE_LIMIT =
  HOSTED_CAPABILITY_JSON_PAYLOAD_BYTE_LIMIT;
export const VIDEO_ANALYSIS_PROMPT_VERSION = "objective-timeline-v1";
export const VIDEO_ANALYSIS_PROVIDER_MODEL = "gemini-3.5-flash";
export const VIDEO_ANALYSIS_MODEL_KEY = "gemini-video-analysis";

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
  return readDomainSkillExecutionInput(
    JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8")),
  );
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

  return "file_reference";
}

export function buildVideoInputBoundary(fileSizeBytes) {
  const inputMode = selectVideoInputMode(fileSizeBytes);
  return {
    fileSizeBytes,
    jsonPayloadByteLimit: VIDEO_ANALYSIS_JSON_PAYLOAD_BYTE_LIMIT,
    inputMode,
    transferBoundary:
      "hosted file_reference via signed upload; media bytes are not embedded in the hosted JSON payload; no automatic compression or segmentation",
  };
}

function detectVideoDurationSeconds(filePath) {
  const result = runLocalDependencyCommandSync(
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
      missingMessage:
        "ffprobe is required for video-analysis duration estimation.",
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

function buildPrompt(sourceUrl) {
  return [
    "Analyze this short-form social video as an objective editing timeline.",
    "Return strict JSON only.",
    "All descriptive field values must be in Simplified Chinese.",
    "Exact or approximate spoken lines must stay in the video's original language.",
    "Only describe observable visual facts and audible content. Do not explain why the video works, do not give marketing advice, and do not provide production recommendations.",
    "Focus on each real shot or distinct visual beat: what is said, what is visible, what moves, how it is cut, how captions behave, and how the audio pace feels.",
    `Source URL: ${sourceUrl}`,
    "Required JSON fields:",
    "{",
    '  "timeline": [{"index":number,"startTime":"MM:SS","endTime":"MM:SS","durationSeconds":number,"spokenLine":"original language exact or approximate","spokenMeaning":"这段话客观在表达什么","visual":"画面里看到什么","subjectAction":"人物/手/产品/道具动作","camera":"景别、角度、运镜、构图","edit":"cut、jump cut、punch-in、画面切换、覆盖关系等","caption":"字幕内容、样式、位置、跟随节奏","audioPacing":"语速、停顿、重音、beat、音乐/音效"}],',
    '  "uncertainties": string[]',
    "}",
    "Rules:",
    "- Split by real camera cuts or clearly distinct visual beats. Do not force 4-8 segments.",
    "- Describe concrete visible action and audible pacing, not vague mood words.",
    "- Do not include any overview, recommendation, evaluation, adaptation, or production-advice fields.",
    "- spokenMeaning must be descriptive, not evaluative.",
    "- If speech, captions, edits, timing, or visual details are unclear, record the uncertainty instead of inventing details.",
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

function resolveVideoAnalysisModelKey(model) {
  if (model !== VIDEO_ANALYSIS_PROVIDER_MODEL) {
    throw new Error(
      `unsupported_video_analysis_model: ${model}. Supported model: ${VIDEO_ANALYSIS_PROVIDER_MODEL}.`,
    );
  }

  return VIDEO_ANALYSIS_MODEL_KEY;
}

export async function analyzeOne({ item, model, outputDir, dependencies = {} }) {
  const modelKey = resolveVideoAnalysisModelKey(model);
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

  const uploadResult = await (
    dependencies.uploadHostedMediaFileReference ?? uploadHostedMediaFileReference
  )(absoluteFilePath, mimeType);

  if (!uploadResult?.storageReference) {
    throw new Error(
      `upload_failed: no storage reference returned for ${item.sourceId}`,
    );
  }

  storageReference = uploadResult.storageReference;
  const payload = toGeminiFileReferencePayload({
    prompt,
    storageReference,
  });

  const startedAt = new Date().toISOString();
  const raw = await (dependencies.runHostedCapabilityRequest ?? runHostedCapabilityRequest)({
    capability: "video-analysis",
    operation: "analyze",
    modelKey,
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

  if (!Array.isArray(parsed.timeline) || parsed.timeline.length === 0) {
    throw new Error(
      `video_analysis_timeline_missing: Gemini response must include a non-empty timeline array for ${item.sourceId}.`,
    );
  }

  const timeline = parsed.timeline.map((item, index) => ({
    index:
      typeof item.index === "number" && Number.isFinite(item.index)
        ? item.index
        : index + 1,
    startTime: item.startTime || formatSeconds(item.startTimeSeconds),
    endTime: item.endTime || formatSeconds(item.endTimeSeconds),
    durationSeconds:
      typeof item.durationSeconds === "number" && Number.isFinite(item.durationSeconds)
        ? item.durationSeconds
        : null,
    spokenLine: item.spokenLine || "",
    spokenMeaning: item.spokenMeaning || "",
    visual: item.visual || "",
    subjectAction: item.subjectAction || "",
    camera: item.camera || "",
    edit: item.edit || "",
    caption: item.caption || "",
    audioPacing: item.audioPacing || "",
  }));
  const normalized = {
    sourceId: item.sourceId,
    sourceUrl: item.sourceUrl,
    videoFilePath: item.filePath,
    model,
    promptVersion: VIDEO_ANALYSIS_PROMPT_VERSION,
    timeline,
    uncertainties: Array.isArray(parsed.uncertainties) ? parsed.uncertainties : [],
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
      modelKey,
      inputMode,
      jsonPayloadByteLimit: VIDEO_ANALYSIS_JSON_PAYLOAD_BYTE_LIMIT,
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
      `Usage: node run_video_analysis_batch.mjs --download-report <report.json> --output-dir <dir> [--model ${VIDEO_ANALYSIS_PROVIDER_MODEL}] [--concurrency 1]`,
    );
    process.exitCode = 1;
    return;
  }

  const report = readJson(args["download-report"]);
  const items = (report.results || []).filter((item) => item.success && item.filePath);
  const outputDir = path.resolve(args["output-dir"]);
  const model = args.model || VIDEO_ANALYSIS_PROVIDER_MODEL;
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
