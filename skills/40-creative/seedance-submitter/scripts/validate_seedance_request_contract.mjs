#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/local_skill_cli.mjs";

export const SEEDANCE_DURATION_VALUES_SECONDS = [5, 10, 15];
export const SEEDANCE_DURATION_LIMIT_SECONDS = 15;

const SHORTHAND_PATTERNS = [
  /continue from (the )?(previous|prior) segment/iu,
  /same as (the )?(previous|prior)/iu,
  /same character/iu,
  /same contract above/iu,
  /contract above/iu,
  /延续上一段/u,
  /同上一段/u,
  /和上一段一样/u,
];

function isSeedanceModel(model) {
  return typeof model === "string" && model.startsWith("video-seedance-2-");
}

function toFiniteSeconds(value, fieldName) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(`${fieldName}_invalid: ${fieldName} must be a positive number of seconds.`);
  }
  return seconds;
}

function collectPromptText(request) {
  const promptPlan = request.promptPlan || {};
  return [
    request.prompt,
    promptPlan.subject,
    promptPlan.action,
    promptPlan.scene,
    promptPlan.style,
    promptPlan.camera,
    promptPlan.dialogue,
    promptPlan.audio,
    Array.isArray(promptPlan.mustKeep) ? promptPlan.mustKeep.join("\n") : "",
    Array.isArray(promptPlan.referenceMap) ? promptPlan.referenceMap.join("\n") : "",
  ]
    .filter(Boolean)
    .join("\n");
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

function validateSegmentContract(request, durationSeconds, label) {
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

  return {
    checked: true,
    durationSeconds,
    model: request.model,
  };
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
