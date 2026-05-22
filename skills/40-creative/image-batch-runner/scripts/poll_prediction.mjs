#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { formatCliError } from "../_postplus_shared/00-core/shared-runtime/scripts/lib/network_runtime.mjs";
import {
  finalizeAttemptManifest,
  isHostedGenerationHandleNotFoundError,
  readAttemptLatestResponse,
  recordAttemptHostedHandleNotFound,
  recordAttemptMaterializationError,
  recordAttemptStatusResponse,
  resolvePollAttempt,
} from "./attempt_state.mjs";
import {
  buildAssetPaths,
  createImageManifestBase,
  createHostedMediaGenerationFailedError,
  fetchJson,
  finalizeImageRun,
  isHostedMediaGenerationFailedResult,
  materializeCompletedImageOutputs,
  parseArgs,
  readHostedMediaGenerationFailure,
  readHostedJson,
  readJson,
  readJsonIfExists,
  unwrapProviderResult,
} from "./_shared.mjs";

function usage() {
  console.error(
    "Usage: node poll_prediction.mjs --request <request.json> [--response <response.json>] [--result-url <url>] [--attempt-id <attempt-id>]",
  );
}

function inferResultUrl(request, responsePayload) {
  const payload = unwrapProviderResult(responsePayload);
  if (typeof payload?.urls?.get === "string" && payload.urls.get.length > 0) {
    return payload.urls.get;
  }
  if (payload?.id && request?.provider === "hosted-media") {
    return payload.id;
  }
  throw new Error("Could not infer result URL from request/response.");
}

function normalizePollRequest(request) {
  return {
    ...request,
    assetId: request.assetId || request.jobId,
    runId: request.runId || request.jobId,
    localAssetDir: request.localAssetDir || request.localOutputDir,
  };
}

function isCompletedProviderResponse(responsePayload) {
  return unwrapProviderResult(responsePayload)?.status === "completed";
}

function resolveImageOperation(request) {
  return request.mode === "edit" ? "edit" : "text-to-image";
}

export async function runPollPrediction(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help || !args.request) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const rawRequest = readHostedJson(args.request);
  const request = normalizePollRequest(rawRequest);
  const paths = buildAssetPaths(request.localAssetDir, request.runId, "image");
  const fallbackResponse = args.response
    ? readJson(args.response)
    : readJsonIfExists(paths.responsePath);
  const attempt = resolvePollAttempt(request, paths, fallbackResponse, {
    attemptId:
      typeof args["attempt-id"] === "string" ? args["attempt-id"] : null,
  });
  const priorResponse = readAttemptLatestResponse(attempt, fallbackResponse);
  const shouldUseSavedCompletedResponse =
    isCompletedProviderResponse(priorResponse);

  let recordedAttempt = attempt;
  let rawResult = priorResponse;

  if (shouldUseSavedCompletedResponse) {
    recordedAttempt = recordAttemptStatusResponse(paths, attempt, {
      data: priorResponse,
    });
  } else {
    const resultUrl = args["result-url"] || inferResultUrl(request, priorResponse);
    let hostedResponse;
    try {
      hostedResponse = await fetchJson(resultUrl);
    } catch (error) {
      if (isHostedGenerationHandleNotFoundError(error)) {
        throw recordAttemptHostedHandleNotFound(
          paths,
          attempt,
          error,
          resultUrl,
        );
      }
      throw error;
    }
    recordedAttempt = recordAttemptStatusResponse(paths, attempt, hostedResponse);
    rawResult = hostedResponse.data;
  }

  const result = unwrapProviderResult(rawResult);
  const manifest = createImageManifestBase(request, paths);
  manifest.generationHandle = result?.id || null;
  manifest.providerStatus = result?.status || null;
  manifest.providerUrls = result?.urls || null;
  manifest.mediaType = "image";
  const providerFailure = readHostedMediaGenerationFailure(result);
  if (providerFailure) {
    manifest.error = providerFailure;
  }

  if (result?.status === "completed") {
    try {
      await materializeCompletedImageOutputs(
        request,
        result,
        manifest,
        paths,
        resolveImageOperation(request),
      );
    } catch (error) {
      recordAttemptMaterializationError(paths, recordedAttempt, error, manifest);
      throw error;
    }
  }

  const finalized = finalizeAttemptManifest(paths, recordedAttempt, manifest);
  finalizeImageRun(request, paths, finalized.manifest);
  if (isHostedMediaGenerationFailedResult(result)) {
    throw createHostedMediaGenerationFailedError(result, {
      label: "Image generation polling",
    });
  }
  console.log(JSON.stringify(finalized.manifest, null, 2));
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  runPollPrediction().catch((error) => {
    console.error(formatCliError(error));
    process.exitCode = 1;
  });
}
