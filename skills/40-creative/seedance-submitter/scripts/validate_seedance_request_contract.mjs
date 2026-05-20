#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/local_skill_cli.mjs";

export const SEEDANCE_DURATION_VALUES_SECONDS = [5, 10, 15];
export const SEEDANCE_DURATION_LIMIT_SECONDS = 15;
export const CONTINUITY_BINDING_LEVELS = [
  "text-only",
  "image-bound",
  "audio-bound",
  "multimodal-bound",
];
export const SEEDANCE_TAIL_STRATEGY_VALUES = [
  "natural_hold",
  "natural_hold_for_trim",
  "micro_expression",
  "settle",
  "loopable_tail",
];

const SHORTHAND_PATTERNS = [
  /continue from (the )?(previous|prior) segment/iu,
  /same as (the )?(previous|prior)/iu,
  /same character/iu,
  /same content above/iu,
  /content above/iu,
  /延续上一段/u,
  /同上一段/u,
  /和上一段一样/u,
];
const TAIL_TIMELINE_ROLES = new Set([
  "tail",
  "hold",
  ...SEEDANCE_TAIL_STRATEGY_VALUES,
]);
const TAIL_TEXT_PATTERNS = [
  /\btail\b/iu,
  /\bhold\b/iu,
  /\bnatural hold\b/iu,
  /\bmicro[- ]expression\b/iu,
  /\bsettle\b/iu,
  /\bloopable\b/iu,
  /\btrim(?:ming)?\b/iu,
];
const TIME_RANGE_PATTERN =
  /^(\d+(?::\d{1,2}(?:\.\d+)?|\.\d+)?)\s*(?:-|–|—|to)\s*(\d+(?::\d{1,2}(?:\.\d+)?|\.\d+)?)\s*s?\b/iu;
const TIMELINE_EPSILON_SECONDS = 0.000001;

function isSeedanceModel(model) {
  return typeof model === "string" && model.startsWith("video-seedance-2-");
}

function toFiniteSeconds(value, fieldName) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(
      `${fieldName}_invalid: ${fieldName} must be a positive number of seconds.`,
    );
  }
  return seconds;
}

function parseTimelineTimestamp(value) {
  const text = String(value ?? "").trim().replace(/s$/iu, "");
  if (!text) {
    return null;
  }

  const mmss = text.match(/^(\d+):(\d{1,2}(?:\.\d+)?)$/u);
  if (mmss) {
    return Number(mmss[1]) * 60 + Number(mmss[2]);
  }

  const seconds = Number(text);
  return Number.isFinite(seconds) ? seconds : null;
}

function parseTimelineRangeText(value) {
  const match = String(value ?? "").trim().match(TIME_RANGE_PATTERN);
  if (!match) {
    return null;
  }

  const startSeconds = parseTimelineTimestamp(match[1]);
  const endSeconds = parseTimelineTimestamp(match[2]);
  if (!Number.isFinite(startSeconds) || !Number.isFinite(endSeconds)) {
    return null;
  }

  return {
    startSeconds,
    endSeconds,
  };
}

function timelineEntryText(entry) {
  if (typeof entry === "string") {
    return entry.trim();
  }
  if (!entry || typeof entry !== "object") {
    return "";
  }

  return [
    entry.time,
    entry.action,
    entry.visual,
    entry.dialogue,
    entry.spokenLine,
    entry.text,
    entry.notes,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join(" ");
}

function readTimelineEntryRange(entry) {
  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    const startSeconds = Number(entry.startSeconds ?? entry.start);
    const endSeconds = Number(entry.endSeconds ?? entry.end);
    if (Number.isFinite(startSeconds) && Number.isFinite(endSeconds)) {
      return {
        startSeconds,
        endSeconds,
      };
    }
    if (typeof entry.time === "string") {
      return parseTimelineRangeText(entry.time);
    }
  }

  return parseTimelineRangeText(timelineEntryText(entry));
}

function isTailTimelineEntry(entry) {
  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    const role = toTrimmedString(
      entry.timelineRole || entry.role || entry.kind || entry.type,
    ).toLowerCase();
    if (TAIL_TIMELINE_ROLES.has(role)) {
      return true;
    }
  }

  const text = timelineEntryText(entry);
  return TAIL_TEXT_PATTERNS.some((pattern) => pattern.test(text));
}

function collectPromptText(request) {
  const promptPlan = request.promptPlan || {};
  return [
    request.prompt,
    promptPlan.subject,
    typeof promptPlan.storyboardTimeline === "string"
      ? promptPlan.storyboardTimeline
      : Array.isArray(promptPlan.storyboardTimeline)
        ? promptPlan.storyboardTimeline
            .map((entry) =>
              typeof entry === "string"
                ? entry
                : entry && typeof entry === "object"
                  ? [
                      entry.time,
                      entry.action,
                      entry.visual,
                      entry.dialogue,
                    ]
                      .filter(Boolean)
                      .join(" ")
                  : "",
            )
            .filter(Boolean)
            .join("\n")
        : "",
    promptPlan.scene,
    promptPlan.style,
    promptPlan.camera,
    promptPlan.audio,
    Array.isArray(promptPlan.mustKeep) ? promptPlan.mustKeep.join("\n") : "",
    Array.isArray(promptPlan.referenceMap) ? promptPlan.referenceMap.join("\n") : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function assertNoDeprecatedPromptPlanFields(request, label) {
  const promptPlan = request.promptPlan || {};
  const deprecated = [];
  if (typeof promptPlan.action === "string" && promptPlan.action.trim()) {
    deprecated.push("promptPlan.action");
  }
  if (typeof promptPlan.dialogue === "string" && promptPlan.dialogue.trim()) {
    deprecated.push("promptPlan.dialogue");
  }
  if (deprecated.length > 0) {
    throw new Error(
      `seedance_prompt_plan_deprecated: ${label} uses ${deprecated.join(", ")}. Move timecoded action and spoken lines into promptPlan.storyboardTimeline.`,
    );
  }
}

function assertNoCrossSegmentShorthand(request, label) {
  const text = collectPromptText(request);
  const matched = SHORTHAND_PATTERNS.find((pattern) => pattern.test(text));
  if (matched) {
    throw new Error(
      `seedance_cross_segment_shorthand: ${label} uses "${matched.source}". Restate continuity inside this request instead of relying on previous-segment memory.`,
    );
  }
}

function toTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function stringList(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  return values
    .map((value) => {
      if (typeof value === "string") {
        return value.trim();
      }
      if (value && typeof value === "object") {
        const candidate =
          value.url || value.image || value.video || value.audio || value.refId || "";
        return typeof candidate === "string" ? candidate.trim() : "";
      }
      return "";
    })
    .filter(Boolean);
}

function normalizeContinuityEntry(key, value, request) {
  const entry = value && typeof value === "object" ? value : {};
  const requestedEvidenceMode = toTrimmedString(entry.evidenceMode) || "text-only";
  const requiredRefs = stringList(entry.requiredRefs);
  const promptPlan = request.promptPlan || {};
  const hasImageEvidence = Boolean(request.image) || stringList(request.referenceImages).length > 0;
  const hasAudioEvidence =
    Boolean(request.audio) ||
    stringList(request.referenceAudios).length > 0 ||
    Boolean(request.voiceTakeId) ||
    Boolean(request.upstreamRefs?.audio);
  let actualBindingLevel = "text-only";
  if (hasImageEvidence && hasAudioEvidence) {
    actualBindingLevel = "multimodal-bound";
  } else if (hasImageEvidence) {
    actualBindingLevel = "image-bound";
  } else if (hasAudioEvidence) {
    actualBindingLevel = "audio-bound";
  }

  const warnings = [];
  if (
    requestedEvidenceMode !== "text-only" &&
    !CONTINUITY_BINDING_LEVELS.includes(requestedEvidenceMode)
  ) {
    warnings.push(
      `${key}: unknown evidenceMode "${requestedEvidenceMode}". Expected one of ${CONTINUITY_BINDING_LEVELS.join(", ")}.`,
    );
  }
  if (requiredRefs.length === 0 && requestedEvidenceMode !== "text-only") {
    warnings.push(`${key}: continuity wants bound evidence but requiredRefs is empty.`);
  }

  const target = toTrimmedString(entry.target) || key;
  const subjectText = collectPromptText(request);
  const targetType = toTrimmedString(entry.targetType || key);
  const mentionsTarget = target.length > 0 && subjectText.toLowerCase().includes(target.toLowerCase());
  const expectedImageBound = new Set(["character", "persona", "product", "environment", "background", "scene"]);
  const expectedAudioBound = new Set(["voice", "audio"]);

  if (expectedImageBound.has(targetType) && actualBindingLevel === "text-only") {
    warnings.push(
      `${key}: ${target} is currently text-only. Add referenceImages or image before calling it locked.`,
    );
  }
  if (expectedAudioBound.has(targetType) && !["audio-bound", "multimodal-bound"].includes(actualBindingLevel)) {
    warnings.push(
      `${key}: ${target} has no audio-bound evidence. Add referenceAudios, audio, voiceTakeId, or upstreamRefs.audio.`,
    );
  }
  if (!mentionsTarget && promptPlan && requestedEvidenceMode !== "text-only") {
    warnings.push(`${key}: target is not clearly restated in prompt text for this segment.`);
  }

  return {
    target,
    targetType,
    requestedEvidenceMode,
    requiredRefs,
    actualBindingLevel,
    status:
      requestedEvidenceMode === "text-only" || requestedEvidenceMode === actualBindingLevel
        ? "pass"
        : actualBindingLevel === "multimodal-bound" &&
            ["image-bound", "audio-bound"].includes(requestedEvidenceMode)
          ? "pass"
          : "warning",
    warnings,
  };
}

function buildContinuityReport(request) {
  const policy = request.continuityPolicy;
  if (!policy || typeof policy !== "object") {
    return {
      hasPolicy: false,
      overall: "not-requested",
      entries: {},
      warnings: [],
    };
  }

  const entries = Object.fromEntries(
    Object.entries(policy).map(([key, value]) => [key, normalizeContinuityEntry(key, value, request)]),
  );
  const warnings = Object.values(entries).flatMap((entry) => entry.warnings);
  const actualLevels = new Set(Object.values(entries).map((entry) => entry.actualBindingLevel));
  let overall = "text-only";
  if (actualLevels.has("multimodal-bound")) {
    overall = "multimodal-bound";
  } else if (actualLevels.has("image-bound") && actualLevels.has("audio-bound")) {
    overall = "partial-multimodal";
  } else if (actualLevels.has("image-bound")) {
    overall = "image-bound";
  } else if (actualLevels.has("audio-bound")) {
    overall = "audio-bound";
  }
  if (warnings.length > 0) {
    overall = overall === "not-requested" ? "warning" : `${overall}-with-warnings`;
  }

  return {
    hasPolicy: true,
    overall,
    entries,
    warnings,
  };
}

function validateSegmentContract(request, durationSeconds, label) {
  assertNoDeprecatedPromptPlanFields(request, label);

  const contract = request.segmentContract;
  const totalDurationSeconds = Number(contract?.totalDurationSeconds ?? request.totalDurationSeconds ?? durationSeconds);

  if (totalDurationSeconds <= SEEDANCE_DURATION_LIMIT_SECONDS) {
    return;
  }

  if (!contract || typeof contract !== "object") {
    throw new Error(
      `seedance_segment_contract_missing: ${label} belongs to a script above ${SEEDANCE_DURATION_LIMIT_SECONDS}s and must include segmentContract.`,
    );
  }

  const requiredStringFields = [
    "segmentId",
    "standalonePayoff",
    "dialogueScope",
    "actionScope",
  ];
  for (const fieldName of requiredStringFields) {
    if (typeof contract[fieldName] !== "string" || !contract[fieldName].trim()) {
      throw new Error(`seedance_segment_contract_incomplete: ${label}.segmentContract.${fieldName} is required.`);
    }
  }

  const targetDurationSeconds = toFiniteSeconds(
    contract.targetDurationSeconds ?? durationSeconds,
    `${label}.segmentContract.targetDurationSeconds`,
  );
  if (targetDurationSeconds > SEEDANCE_DURATION_LIMIT_SECONDS) {
    throw new Error(
      `seedance_segment_window_exceeded: ${label}.segmentContract.targetDurationSeconds is ${targetDurationSeconds}s, above the ${SEEDANCE_DURATION_LIMIT_SECONDS}s limit.`,
    );
  }

  if (!Array.isArray(contract.continuityTargetsToRestate)) {
    throw new Error(
      `seedance_segment_contract_incomplete: ${label}.segmentContract.continuityTargetsToRestate must be an array.`,
    );
  }
}

function validateStoryboardTimelineAgainstTarget(
  request,
  targetEditDurationSeconds,
  label,
) {
  const rawTimeline = request.promptPlan?.storyboardTimeline;
  const timeline = Array.isArray(rawTimeline)
    ? rawTimeline
    : typeof rawTimeline === "string"
      ? [rawTimeline]
      : [];
  if (timeline.length === 0) {
    return;
  }

  timeline.forEach((entry, index) => {
    const range = readTimelineEntryRange(entry);
    if (
      !range ||
      range.endSeconds <= targetEditDurationSeconds + TIMELINE_EPSILON_SECONDS
    ) {
      return;
    }
    if (isTailTimelineEntry(entry)) {
      return;
    }

    throw new Error(
      `seedance_target_edit_timeline_overrun: ${label}.promptPlan.storyboardTimeline[${index}] ends at ${range.endSeconds}s after targetEditDurationSeconds ${targetEditDurationSeconds}s and is not marked as tail/hold.`,
    );
  });
}

function validateTargetEditContract(request, durationSeconds, label) {
  const targetEditDurationRaw =
    request.targetEditDurationSeconds ?? request.target_edit_duration_seconds;
  if (targetEditDurationRaw == null) {
    return null;
  }

  const targetEditDurationSeconds = toFiniteSeconds(
    targetEditDurationRaw,
    `${label}.targetEditDurationSeconds`,
  );
  if (targetEditDurationSeconds > durationSeconds) {
    throw new Error(
      `seedance_target_edit_duration_exceeds_provider: ${label}.targetEditDurationSeconds is ${targetEditDurationSeconds}s, above provider duration ${durationSeconds}s.`,
    );
  }

  const timeline =
    request.timeline && typeof request.timeline === "object"
      ? request.timeline
      : {};
  const activePerformanceEndRaw =
    timeline.activePerformanceEndSeconds ??
    timeline.active_performance_end_seconds ??
    request.activePerformanceEndSeconds ??
    request.active_performance_end_seconds;
  const tailStrategyRaw =
    timeline.tailStrategy ??
    timeline.tail_strategy ??
    request.tailStrategy ??
    request.tail_strategy;

  const activePerformanceEndSeconds =
    activePerformanceEndRaw == null
      ? null
      : toFiniteSeconds(
          activePerformanceEndRaw,
          `${label}.timeline.activePerformanceEndSeconds`,
        );
  if (
    activePerformanceEndSeconds != null &&
    activePerformanceEndSeconds > targetEditDurationSeconds
  ) {
    throw new Error(
      `seedance_active_performance_after_target: ${label}.timeline.activePerformanceEndSeconds is ${activePerformanceEndSeconds}s, above targetEditDurationSeconds ${targetEditDurationSeconds}s.`,
    );
  }

  const tailStrategy =
    tailStrategyRaw == null ? null : String(tailStrategyRaw).trim();
  if (tailStrategy && !SEEDANCE_TAIL_STRATEGY_VALUES.includes(tailStrategy)) {
    throw new Error(
      `seedance_tail_strategy_unsupported: ${label}.timeline.tailStrategy must be one of ${SEEDANCE_TAIL_STRATEGY_VALUES.join(", ")}.`,
    );
  }

  if (targetEditDurationSeconds < durationSeconds) {
    if (activePerformanceEndSeconds == null) {
      throw new Error(
        `seedance_active_performance_end_required: ${label}.timeline.activePerformanceEndSeconds is required when targetEditDurationSeconds is shorter than duration.`,
      );
    }
    if (!tailStrategy) {
      throw new Error(
        `seedance_tail_strategy_required: ${label}.timeline.tailStrategy is required when targetEditDurationSeconds is shorter than duration.`,
      );
    }
  }

  validateStoryboardTimelineAgainstTarget(
    request,
    targetEditDurationSeconds,
    label,
  );

  return {
    targetEditDurationSeconds,
    timeline: {
      activePerformanceEndSeconds,
      tailStrategy,
    },
  };
}

export function validateSeedanceRequestContract(request, label = "request") {
  if (!request || typeof request !== "object") {
    throw new Error(`${label}_invalid: request must be an object.`);
  }

  if (!isSeedanceModel(request.model)) {
    return {
      checked: false,
      reason: "not_seedance_2_model",
    };
  }

  const durationSeconds = toFiniteSeconds(request.duration, `${label}.duration`);
  if (!SEEDANCE_DURATION_VALUES_SECONDS.includes(durationSeconds)) {
    throw new Error(
      `seedance_duration_unsupported: ${label}.duration must be one of ${SEEDANCE_DURATION_VALUES_SECONDS.join(", ")} seconds.`,
    );
  }
  if (durationSeconds > SEEDANCE_DURATION_LIMIT_SECONDS) {
    throw new Error(
      `seedance_duration_too_long: ${label}.duration is ${durationSeconds}s, above the ${SEEDANCE_DURATION_LIMIT_SECONDS}s Seedance limit.`,
    );
  }

  assertNoCrossSegmentShorthand(request, label);
  validateSegmentContract(request, durationSeconds, label);
  const targetEditContract = validateTargetEditContract(
    request,
    durationSeconds,
    label,
  );
  const continuityReport = buildContinuityReport(request);

  const report = {
    checked: true,
    durationSeconds,
    providerDurationSeconds: durationSeconds,
    model: request.model,
    continuityReport,
  };

  if (targetEditContract) {
    report.targetEditDurationSeconds =
      targetEditContract.targetEditDurationSeconds;
    report.timeline = targetEditContract.timeline;
  }

  return report;
}

export function validateSeedanceRequestFile(payload) {
  const requests = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.requests)
      ? payload.requests
      : Array.isArray(payload?.segments)
        ? payload.segments.map((segment) => segment.request ?? segment)
        : [payload];

  return {
    requestCount: requests.length,
    results: requests.map((request, index) =>
      validateSeedanceRequestContract(request, `request_${index + 1}`),
    ),
  };
}

function usage() {
  console.error(
    "Usage: node validate_seedance_request_contract.mjs --input <request.json> [--output <report.json>]",
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const payload = readJson(args.input);
  const report = validateSeedanceRequestFile(payload);
  printOrWriteJson(args.output, report);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
