#!/usr/bin/env node
import path from 'node:path';

import {
  nowIso,
  readJsonIfExists,
  unwrapProviderResult,
  writeJson,
} from './_shared.mjs';

export const ATTEMPT_INDEX_SCHEMA_VERSION = 1;
export const NOT_SUBMITTED_STATE = 'not_submitted';
export const HOSTED_GENERATION_HANDLE_NOT_FOUND_STATE =
  'hosted_generation_handle_not_found';
const EXISTING_SUBMITTED_ATTEMPT_ERROR_CODE =
  'image_batch_runner_submitted_attempt_exists';

function buildAttemptPaths(paths, attemptId) {
  const attemptDir = path.join(paths.attemptsDir, attemptId);
  return {
    attemptDir,
    attemptPath: path.join(attemptDir, 'attempt.json'),
    materializationErrorPath: path.join(attemptDir, 'materialization-error.json'),
    manifestPath: path.join(attemptDir, 'manifest.json'),
    requestPath: path.join(attemptDir, 'request.json'),
    statusErrorPath: path.join(attemptDir, 'status-error.json'),
    submissionErrorPath: path.join(attemptDir, 'submission-error.json'),
    submitResponsePath: path.join(attemptDir, 'submit-response.json'),
  };
}

export function readAttemptIndex(paths) {
  return readJsonIfExists(paths.attemptIndexPath);
}

function createIndex(request, paths) {
  return {
    schemaVersion: ATTEMPT_INDEX_SCHEMA_VERSION,
    assetId: request.assetId,
    runId: request.runId,
    mediaType: 'image',
    activeAttemptId: null,
    attemptsDir: paths.attemptsDir,
    attempts: [],
  };
}

function readIndex(request, paths) {
  return readAttemptIndex(paths) ?? createIndex(request, paths);
}

function nextSequence(index) {
  const sequences = (Array.isArray(index.attempts) ? index.attempts : [])
    .map((attempt) => Number(attempt.sequence))
    .filter((sequence) => Number.isSafeInteger(sequence) && sequence > 0);
  return sequences.length > 0 ? Math.max(...sequences) + 1 : 1;
}

function summarizeAttempt(attempt) {
  return {
    attemptId: attempt.attemptId,
    sequence: attempt.sequence,
    state: attempt.state,
    submitted: attempt.submitted === true,
    nextAction: attempt.nextAction,
    generationHandle: attempt.generationHandle ?? null,
    hostedOperationId: attempt.hostedOperationId ?? null,
    lastHostedOperationId: attempt.lastHostedOperationId ?? null,
    providerStatus: attempt.providerStatus ?? null,
    providerOutputUrls: Array.isArray(attempt.providerOutputUrls)
      ? attempt.providerOutputUrls
      : [],
    requestPath: attempt.requestPath,
    responsePath: attempt.responsePath ?? null,
    manifestPath: attempt.manifestPath,
    attemptPath: attempt.attemptPath,
    materializationError: attempt.materializationError ?? null,
    hostedStatusError: attempt.hostedStatusError ?? null,
    createdAt: attempt.createdAt,
    updatedAt: attempt.updatedAt,
  };
}

function persistAttempt(paths, index, attempt) {
  const nextAttempt = { ...attempt, updatedAt: nowIso() };
  const attempts = Array.isArray(index.attempts) ? [...index.attempts] : [];
  const summary = summarizeAttempt(nextAttempt);
  const existingIndex = attempts.findIndex(
    (entry) => entry.attemptId === nextAttempt.attemptId,
  );
  if (existingIndex >= 0) {
    attempts[existingIndex] = summary;
  } else {
    attempts.push(summary);
  }
  const nextIndex = {
    ...index,
    activeAttemptId:
      nextAttempt.submitted === true
        ? nextAttempt.attemptId
        : index.activeAttemptId ?? null,
    attempts,
    updatedAt: nowIso(),
  };
  writeJson(nextAttempt.attemptPath, nextAttempt);
  writeJson(paths.attemptIndexPath, nextIndex);
  return nextAttempt;
}

function latestSubmitted(index) {
  return (Array.isArray(index?.attempts) ? index.attempts : [])
    .filter((attempt) => attempt.submitted === true)
    .sort((left, right) => Number(right.sequence) - Number(left.sequence))[0];
}

function readAttempt(paths, attemptId) {
  return readJsonIfExists(buildAttemptPaths(paths, attemptId).attemptPath);
}

function outputUrls(result) {
  return Array.isArray(result?.outputs)
    ? result.outputs.filter(
        (output) => typeof output === 'string' && /^https?:\/\//.test(output),
      )
    : [];
}

function stateForResult(result) {
  const status =
    typeof result?.status === 'string' ? result.status.toLowerCase() : null;
  if (status === 'completed') {
    return outputUrls(result).length > 0
      ? { state: 'provider_completed', nextAction: 'resume materialization' }
      : {
          state: 'provider_completed_without_outputs',
          nextAction: 'review provider response',
        };
  }
  if (status === 'failed') {
    return { state: 'provider_failed', nextAction: 'review provider failure' };
  }
  return { state: 'submitted_processing', nextAction: 'poll existing attempt' };
}

function appendHistory(attempt, entry) {
  return [
    ...(Array.isArray(attempt.responseHistory) ? attempt.responseHistory : []),
    entry,
  ];
}

function serializeError(error) {
  return {
    code:
      typeof error?.code === 'string'
        ? error.code
        : typeof error?.productErrorCode === 'string'
          ? error.productErrorCode
          : null,
    productErrorCode:
      typeof error?.productErrorCode === 'string'
        ? error.productErrorCode
        : null,
    message: error instanceof Error ? error.message : String(error),
    operationId:
      typeof error?.operationId === 'string' ? error.operationId : null,
    status: typeof error?.status === 'number' ? error.status : null,
  };
}

function existingSubmittedAttemptError(attempt, paths) {
  const nextAction =
    attempt.nextAction ||
    (attempt.providerOutputUrls?.length
      ? 'resume materialization'
      : 'poll existing attempt');
  const message = [
    `Submitted image generation attempt already exists for runId ${path.basename(paths.runDir)}.`,
    `attemptId: ${attempt.attemptId}`,
    `state: ${attempt.state}`,
    attempt.generationHandle
      ? `generationHandle: ${attempt.generationHandle}`
      : null,
    `nextAction: ${nextAction}`,
    'Use poll_prediction.mjs for the existing attempt, or pass --new-attempt to create a separate paid generation attempt.',
  ]
    .filter(Boolean)
    .join('\n');
  const error = new Error(message);
  error.code = EXISTING_SUBMITTED_ATTEMPT_ERROR_CODE;
  error.productErrorCode = EXISTING_SUBMITTED_ATTEMPT_ERROR_CODE;
  error.status = 409;
  error.attemptId = attempt.attemptId;
  error.attemptIndexPath = paths.attemptIndexPath;
  error.nextAction = nextAction;
  return error;
}

export function createGenerationAttempt(request, paths, options = {}) {
  const index = readIndex(request, paths);
  const submittedAttempt = latestSubmitted(index);
  if (submittedAttempt && options.allowNewAttempt !== true) {
    throw existingSubmittedAttemptError(submittedAttempt, paths);
  }
  const sequence = nextSequence(index);
  const attemptId = `attempt-${String(sequence).padStart(3, '0')}`;
  const attemptPaths = buildAttemptPaths(paths, attemptId);
  const timestamp = nowIso();
  const attempt = {
    schemaVersion: ATTEMPT_INDEX_SCHEMA_VERSION,
    attemptId,
    sequence,
    state: 'submitting',
    submitted: false,
    nextAction: 'submit new attempt',
    assetId: request.assetId,
    runId: request.runId,
    operation: options.operation || request.mode || null,
    model: request.model,
    mode: request.mode,
    requestPath: attemptPaths.requestPath,
    responsePath: null,
    manifestPath: attemptPaths.manifestPath,
    attemptPath: attemptPaths.attemptPath,
    hostedOperationId: null,
    lastHostedOperationId: null,
    generationHandle: null,
    providerStatus: null,
    providerUrls: null,
    providerOutputUrls: [],
    responseHistory: [],
    materializationError: null,
    hostedStatusError: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  writeJson(attemptPaths.requestPath, request);
  return persistAttempt(paths, index, attempt);
}

export function isNotSubmittedGenerationError(error) {
  const code =
    typeof error?.productErrorCode === 'string'
      ? error.productErrorCode
      : typeof error?.code === 'string'
        ? error.code
        : null;
  return code === 'billing_balance_insufficient';
}

export function recordAttemptNotSubmitted(paths, attempt, error) {
  const attemptPaths = buildAttemptPaths(paths, attempt.attemptId);
  const serializedError = serializeError(error);
  writeJson(attemptPaths.submissionErrorPath, serializedError);
  const recorded = persistAttempt(paths, readIndex(attempt, paths), {
    ...attempt,
    state: NOT_SUBMITTED_STATE,
    submitted: false,
    nextAction: 'submit new attempt',
    submissionError: serializedError,
    responsePath: attemptPaths.submissionErrorPath,
  });
  const stateError = new Error(
    [
      'Image generation was not submitted.',
      `state: ${recorded.state}`,
      `attemptId: ${recorded.attemptId}`,
      `reason: ${serializedError.productErrorCode || serializedError.code || serializedError.message}`,
      `nextAction: ${recorded.nextAction}`,
    ].join('\n'),
  );
  stateError.code = NOT_SUBMITTED_STATE;
  stateError.productErrorCode =
    serializedError.productErrorCode || NOT_SUBMITTED_STATE;
  stateError.status = serializedError.status;
  stateError.attemptId = recorded.attemptId;
  stateError.attemptIndexPath = paths.attemptIndexPath;
  stateError.nextAction = recorded.nextAction;
  return stateError;
}

export function recordAttemptSubmissionResponse(paths, attempt, hostedResponse) {
  const attemptPaths = buildAttemptPaths(paths, attempt.attemptId);
  const data = hostedResponse?.data;
  const result = unwrapProviderResult(data);
  writeJson(attemptPaths.submitResponsePath, data);
  writeJson(paths.responsePath, data);
  return persistAttempt(paths, readIndex(attempt, paths), {
    ...attempt,
    ...stateForResult(result),
    submitted: true,
    hostedOperationId:
      typeof hostedResponse?.operationId === 'string'
        ? hostedResponse.operationId
        : attempt.hostedOperationId,
    lastHostedOperationId:
      typeof hostedResponse?.operationId === 'string'
        ? hostedResponse.operationId
        : attempt.lastHostedOperationId ?? null,
    generationHandle: result?.id || attempt.generationHandle || null,
    providerStatus: result?.status || null,
    providerUrls: result?.urls || null,
    providerOutputUrls: outputUrls(result),
    responsePath: attemptPaths.submitResponsePath,
    legacyResponsePath: paths.responsePath,
    responseHistory: appendHistory(attempt, {
      kind: 'submit',
      path: attemptPaths.submitResponsePath,
      recordedAt: nowIso(),
    }),
  });
}

export function importLegacySubmittedAttempt(request, paths, responsePayload) {
  const index = readIndex(request, paths);
  const submittedAttempt = latestSubmitted(index);
  if (submittedAttempt) {
    return readAttempt(paths, submittedAttempt.attemptId);
  }
  const sequence = nextSequence(index);
  const attemptId = `attempt-${String(sequence).padStart(3, '0')}`;
  const attemptPaths = buildAttemptPaths(paths, attemptId);
  const result = unwrapProviderResult(responsePayload);
  const timestamp = nowIso();
  const legacyResponsePath = path.join(attemptPaths.attemptDir, 'legacy-response.json');
  const attempt = {
    schemaVersion: ATTEMPT_INDEX_SCHEMA_VERSION,
    attemptId,
    sequence,
    ...stateForResult(result),
    submitted: true,
    assetId: request.assetId,
    runId: request.runId,
    operation: request.mode || null,
    model: request.model || null,
    mode: request.mode || null,
    requestPath: attemptPaths.requestPath,
    responsePath: legacyResponsePath,
    legacyResponsePath: paths.responsePath,
    manifestPath: attemptPaths.manifestPath,
    attemptPath: attemptPaths.attemptPath,
    hostedOperationId: null,
    lastHostedOperationId: null,
    generationHandle: result?.id || null,
    providerStatus: result?.status || null,
    providerUrls: result?.urls || null,
    providerOutputUrls: outputUrls(result),
    responseHistory: [
      {
        kind: 'legacy',
        path: legacyResponsePath,
        sourcePath: paths.responsePath,
        recordedAt: timestamp,
      },
    ],
    materializationError: null,
    hostedStatusError: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  writeJson(attemptPaths.requestPath, request);
  writeJson(legacyResponsePath, responsePayload);
  return persistAttempt(paths, index, attempt);
}

export function resolvePollAttempt(request, paths, priorResponse, options = {}) {
  const index = readIndex(request, paths);
  if (typeof options.attemptId === 'string' && options.attemptId.trim()) {
    const attempt = readAttempt(paths, options.attemptId.trim());
    if (!attempt) {
      throw new Error(`Image generation attempt not found: ${options.attemptId}`);
    }
    return attempt;
  }
  const submittedAttempt = latestSubmitted(index);
  if (submittedAttempt) {
    return readAttempt(paths, submittedAttempt.attemptId);
  }
  if (!priorResponse) {
    throw new Error(
      `No submitted image generation attempt exists for runId ${request.runId}. Submit with generate_image.mjs/edit_image.mjs before polling.`,
    );
  }
  return importLegacySubmittedAttempt(request, paths, priorResponse);
}

export function readAttemptLatestResponse(attempt, fallbackResponse = null) {
  return attempt?.responsePath
    ? readJsonIfExists(attempt.responsePath) ?? fallbackResponse
    : fallbackResponse;
}

export function recordAttemptStatusResponse(paths, attempt, hostedResponse) {
  const data = hostedResponse?.data;
  const result = unwrapProviderResult(data);
  const responseCount = Array.isArray(attempt.responseHistory)
    ? attempt.responseHistory.length + 1
    : 1;
  const responsePath = path.join(
    buildAttemptPaths(paths, attempt.attemptId).attemptDir,
    `poll-response-${String(responseCount).padStart(3, '0')}.json`,
  );
  writeJson(responsePath, data);
  writeJson(paths.responsePath, data);
  return persistAttempt(paths, readIndex(attempt, paths), {
    ...attempt,
    ...stateForResult(result),
    submitted: true,
    hostedOperationId:
      attempt.hostedOperationId ||
      (typeof hostedResponse?.operationId === 'string'
        ? hostedResponse.operationId
        : null),
    lastHostedOperationId:
      typeof hostedResponse?.operationId === 'string'
        ? hostedResponse.operationId
        : attempt.lastHostedOperationId ?? null,
    generationHandle: result?.id || attempt.generationHandle || null,
    providerStatus: result?.status || null,
    providerUrls: result?.urls || attempt.providerUrls || null,
    providerOutputUrls: outputUrls(result),
    responsePath,
    legacyResponsePath: paths.responsePath,
    responseHistory: appendHistory(attempt, {
      kind: 'poll',
      path: responsePath,
      recordedAt: nowIso(),
    }),
  });
}

export function recordAttemptMaterializationError(
  paths,
  attempt,
  error,
  manifest = null,
) {
  const attemptPaths = buildAttemptPaths(paths, attempt.attemptId);
  const serializedError = serializeError(error);
  writeJson(attemptPaths.materializationErrorPath, serializedError);
  if (manifest) {
    writeJson(attemptPaths.manifestPath, manifest);
  }
  return persistAttempt(paths, readIndex(attempt, paths), {
    ...attempt,
    state: 'materialization_failed',
    submitted: true,
    nextAction:
      Array.isArray(attempt.providerOutputUrls) &&
      attempt.providerOutputUrls.length > 0
        ? 'resume materialization'
        : 'poll existing attempt',
    materializationError: {
      ...serializedError,
      path: attemptPaths.materializationErrorPath,
    },
  });
}

export function isHostedGenerationHandleNotFoundError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /Media generation run was not found/i.test(message);
}

export function recordAttemptHostedHandleNotFound(
  paths,
  attempt,
  error,
  resultUrl,
) {
  const attemptPaths = buildAttemptPaths(paths, attempt.attemptId);
  const hostedStatusError = {
    ...serializeError(error),
    resultUrl,
    path: attemptPaths.statusErrorPath,
  };
  writeJson(attemptPaths.statusErrorPath, hostedStatusError);
  const recorded = persistAttempt(paths, readIndex(attempt, paths), {
    ...attempt,
    state: HOSTED_GENERATION_HANDLE_NOT_FOUND_STATE,
    submitted: true,
    nextAction: 'submit new attempt with --new-attempt',
    hostedStatusError,
  });
  const stateError = new Error(
    [
      'Hosted image generation handle was not found.',
      `state: ${recorded.state}`,
      `attemptId: ${recorded.attemptId}`,
      recorded.generationHandle
        ? `generationHandle: ${recorded.generationHandle}`
        : null,
      `responsePath: ${recorded.responsePath}`,
      `nextAction: ${recorded.nextAction}`,
    ]
      .filter(Boolean)
      .join('\n'),
  );
  stateError.code = HOSTED_GENERATION_HANDLE_NOT_FOUND_STATE;
  stateError.productErrorCode = HOSTED_GENERATION_HANDLE_NOT_FOUND_STATE;
  stateError.status = typeof error?.status === 'number' ? error.status : 404;
  stateError.attemptId = recorded.attemptId;
  stateError.attemptIndexPath = paths.attemptIndexPath;
  stateError.generationHandle = recorded.generationHandle;
  stateError.nextAction = recorded.nextAction;
  return stateError;
}

export function finalizeAttemptManifest(paths, attempt, manifest) {
  const attemptPaths = buildAttemptPaths(paths, attempt.attemptId);
  const nextManifest = {
    ...manifest,
    attemptId: attempt.attemptId,
    attemptState: manifest.assets.length > 0 ? 'materialized' : attempt.state,
    nextAction: manifest.assets.length > 0 ? 'done' : attempt.nextAction,
    hostedOperationId: attempt.hostedOperationId,
    lastHostedOperationId: attempt.lastHostedOperationId ?? null,
    attemptPath: attempt.attemptPath,
    attemptIndexPath: paths.attemptIndexPath,
    attemptManifestPath: attemptPaths.manifestPath,
    providerOutputUrls: attempt.providerOutputUrls,
    materializationError: attempt.materializationError,
  };
  writeJson(attemptPaths.manifestPath, nextManifest);
  const recorded = persistAttempt(paths, readIndex(attempt, paths), {
    ...attempt,
    state: nextManifest.attemptState,
    nextAction: nextManifest.nextAction,
    manifestPath: attemptPaths.manifestPath,
  });
  return { attempt: recorded, manifest: nextManifest };
}
