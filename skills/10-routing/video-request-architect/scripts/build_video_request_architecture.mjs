#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/local_skill_cli.mjs";
import {
  buildCreativeOutputSpec,
  resolveCreativeFormat,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/creative_format.mjs";

export const SEEDANCE_SEGMENT_DURATION_LIMIT_SECONDS = 15;

function toFiniteSeconds(value, fieldName, options = {}) {
  const seconds = Number(value);
  const min = options.allowZero ? 0 : Number.MIN_VALUE;
  if (!Number.isFinite(seconds) || seconds < min) {
    throw new Error(
      `${fieldName}_invalid: ${fieldName} must be ${options.allowZero ? "a non-negative" : "a positive"} number of seconds.`,
    );
  }
  return seconds;
}

function normalizeBeat(beat, index) {
  const startSeconds = toFiniteSeconds(beat.startSeconds ?? beat.start, `beat_${index + 1}_startSeconds`, {
    allowZero: true,
  });
  const endSeconds = toFiniteSeconds(beat.endSeconds ?? beat.end, `beat_${index + 1}_endSeconds`);
  if (endSeconds <= startSeconds) {
    throw new Error(`beat_${index + 1}_time_range_invalid: endSeconds must be greater than startSeconds.`);
  }
  const durationSeconds = endSeconds - startSeconds;
  if (durationSeconds > SEEDANCE_SEGMENT_DURATION_LIMIT_SECONDS) {
    throw new Error(
      `seedance_segment_window_exceeded: beat ${index + 1} is ${durationSeconds}s, above the ${SEEDANCE_SEGMENT_DURATION_LIMIT_SECONDS}s Seedance segment limit. Split the beat before building provider requests.`,
    );
  }
  return {
    id: beat.id || `beat-${String(index + 1).padStart(2, "0")}`,
    startSeconds,
    endSeconds,
    durationSeconds,
    dialogue: beat.dialogue || beat.dialogueScope || "",
    action: beat.action || beat.actionScope || "",
    payoff: beat.payoff || beat.visiblePayoff || beat.standalonePayoff || "",
    referencesUsed: Array.isArray(beat.referencesUsed)
      ? beat.referencesUsed
      : Array.isArray(beat.referenceBindings)
        ? beat.referenceBindings
        : [],
  };
}

function normalizeTimedBeatSheet(input) {
  const beatSheet = input.beatSheet ?? input.timecodedBeatSheet;
  if (!Array.isArray(beatSheet) || beatSheet.length === 0) {
    throw new Error(
      "seedance_segment_plan_missing: scripts above 15s require a timecoded beatSheet before automatic segment planning.",
    );
  }

  const beats = beatSheet.map(normalizeBeat);
  for (let index = 1; index < beats.length; index += 1) {
    if (beats[index].startSeconds < beats[index - 1].endSeconds) {
      throw new Error("beat_sheet_order_invalid: beatSheet must be ordered and non-overlapping.");
    }
  }
  return beats;
}

function summarizeBeatField(beats, fieldName) {
  return beats
    .map((beat) => beat[fieldName])
    .filter(Boolean)
    .join(" ");
}

export function buildSeedanceSegmentContract(input = {}) {
  const targetDurationSeconds = toFiniteSeconds(
    input.targetDurationSeconds ?? input.duration ?? 8,
    "targetDurationSeconds",
  );
  const creativeFormat = resolveCreativeFormat(input);

  if (targetDurationSeconds <= SEEDANCE_SEGMENT_DURATION_LIMIT_SECONDS) {
    return {
      provider: "seedance-2",
      requiresSegmentation: false,
      totalDurationSeconds: targetDurationSeconds,
      segmentDurationLimitSeconds: SEEDANCE_SEGMENT_DURATION_LIMIT_SECONDS,
      targetAspectRatio: creativeFormat.aspectRatio,
      segments: [],
    };
  }

  const beats = normalizeTimedBeatSheet(input);
  const segments = [];
  let currentBeats = [];
  let currentStart = null;
  let currentEnd = null;

  for (const beat of beats) {
    if (currentBeats.length === 0) {
      currentBeats = [beat];
      currentStart = beat.startSeconds;
      currentEnd = beat.endSeconds;
      continue;
    }

    const candidateDuration = beat.endSeconds - currentStart;
    if (candidateDuration > SEEDANCE_SEGMENT_DURATION_LIMIT_SECONDS) {
      segments.push({ startSeconds: currentStart, endSeconds: currentEnd, beats: currentBeats });
      currentBeats = [beat];
      currentStart = beat.startSeconds;
      currentEnd = beat.endSeconds;
      continue;
    }

    currentBeats.push(beat);
    currentEnd = beat.endSeconds;
  }

  if (currentBeats.length > 0) {
    segments.push({ startSeconds: currentStart, endSeconds: currentEnd, beats: currentBeats });
  }

  return {
    provider: "seedance-2",
    requiresSegmentation: true,
    totalDurationSeconds: targetDurationSeconds,
    segmentDurationLimitSeconds: SEEDANCE_SEGMENT_DURATION_LIMIT_SECONDS,
    targetAspectRatio: creativeFormat.aspectRatio,
    segments: segments.map((segment, index) => ({
      segmentId: `segment-${String(index + 1).padStart(2, "0")}`,
      targetDurationSeconds: segment.endSeconds - segment.startSeconds,
      targetAspectRatio: creativeFormat.aspectRatio,
      segmentRole: index === 0 ? "opening" : index === segments.length - 1 ? "closing" : "middle",
      standalonePayoff:
        summarizeBeatField(segment.beats, "payoff") ||
        "One complete visual proof beat from the approved script.",
      continuityTargetsToRestate: Array.isArray(input.continuityTargets)
        ? input.continuityTargets
        : [],
      bridgeTargetForEditing:
        index < segments.length - 1
          ? `Cut from ${segment.beats.at(-1)?.id} into ${segments[index + 1]?.beats[0]?.id}.`
          : "Final usable clip endpoint.",
      dialogueScope: summarizeBeatField(segment.beats, "dialogue"),
      actionScope: summarizeBeatField(segment.beats, "action"),
      referencesUsed: [...new Set(segment.beats.flatMap((beat) => beat.referencesUsed))],
      beatIds: segment.beats.map((beat) => beat.id),
    })),
  };
}

export function buildVideoRequestArchitecture(input = {}) {
  const duration = input.duration || input.targetDurationSeconds || 8;
  const creativeFormat = resolveCreativeFormat(input);
  const segmentContract = buildSeedanceSegmentContract({
    ...input,
    ...(creativeFormat.id === "custom"
      ? {}
      : { creativeFormat: creativeFormat.id }),
    targetAspectRatio: creativeFormat.aspectRatio,
    targetDurationSeconds: duration,
  });

  return {
    cameraGrammar: input.cameraGrammar || "handheld UGC close-medium coverage",
    creativeFormat: {
      id: creativeFormat.id,
      label: creativeFormat.label,
      targetAspectRatio: creativeFormat.aspectRatio,
    },
    duration,
    hookLogic: input.hookLogic || "show the workflow pain before the fix",
    mainRisks: [
      "opening drift",
      "over-explaining before proof",
      "assuming cross-segment memory",
      "weak reference binding",
    ],
    productPolicy:
      input.productPolicy || "show product only when it proves the claim",
    referencePolicy:
      input.referencePolicy ||
      "treat user-provided persona, product, and audio references as binding unless explicitly marked inspiration-only; make each request self-contained",
    segmentType: input.segmentType || "hook",
    segmentContract,
    skeleton: {
      goal: input.goal || "hook replication",
      outputSpec: buildCreativeOutputSpec(creativeFormat),
      role: "director brief",
      targetAspectRatio: creativeFormat.aspectRatio,
      timecodedBeatSheet: true,
    },
    targetAspectRatio: creativeFormat.aspectRatio,
    viewerQuestion:
      input.viewerQuestion ||
      "Why is this workflow better than the old one?",
  };
}

function usage() {
  console.error(
    "Usage: node build_video_request_architecture.mjs [--input <brief.json>] [--output <request.json>]",
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    process.exitCode = 0;
    return;
  }

  const input = args.input ? readJson(args.input) : {};
  const payload = buildVideoRequestArchitecture(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
