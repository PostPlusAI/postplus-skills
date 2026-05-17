#!/usr/bin/env node

import { formatCliError } from "../_postplus_shared/00-core/shared-runtime/scripts/lib/network_runtime.mjs";
import {
  createGenerationAttempt,
  finalizeAttemptManifest,
  isNotSubmittedGenerationError,
  recordAttemptMaterializationError,
  recordAttemptNotSubmitted,
  recordAttemptSubmissionResponse,
} from "./attempt_state.mjs";
import {
  buildAssetPaths,
  createImageManifestBase,
  fetchJson,
  finalizeImageRun,
  getHostedImageModelConfig,
  inferSeedreamSize,
  materializeCompletedImageOutputs,
  normalizeGenerationInput,
  parseArgs,
  readHostedJson,
  unwrapProviderResult,
  writeJson,
} from "./_shared.mjs";

function usage() {
  console.error(
    "Usage: node edit_image.mjs --request <request.json> [--new-attempt]",
  );
}

function normalizeEditRequest(input) {
  const base = normalizeGenerationInput(input, "edit");
  const inputUrls = Array.isArray(input.inputUrls) ? input.inputUrls : [];
  const inputImages = Array.isArray(input.inputImages) ? input.inputImages : [];
  const resolvedUrls = [...inputUrls, ...inputImages].filter(Boolean);
  if (!resolvedUrls.length) {
    throw new Error(
      "request.inputUrls is required. Run upload_media first if you only have local files.",
    );
  }
  const nonUrl = resolvedUrls.find(
    (entry) => typeof entry === "string" && !/^https?:\/\//.test(entry),
  );
  if (nonUrl) {
    throw new Error(
      `edit_image expects uploaded image URLs. Invalid entry: ${nonUrl}`,
    );
  }
  return {
    ...base,
    inputUrls: resolvedUrls,
  };
}

function buildProviderBody(request) {
  const modelConfig = getHostedImageModelConfig(request.model, "edit");
  if (modelConfig.modelGroup === "seedream") {
    const body = {
      images: request.inputUrls,
      prompt: request.prompt,
      size: inferSeedreamSize(request),
      output_format: request.outputFormat,
      enable_sync_mode: request.enableSyncMode,
      enable_base64_output: request.enableBase64Output,
    };
    if (Number.isInteger(request.maxImages)) {
      body.max_images = request.maxImages;
    }
    return {
      endpointKey: modelConfig.endpointKey,
      body,
    };
  }

  if (modelConfig.modelGroup === "gpt-image-2") {
    return {
      endpointKey: modelConfig.endpointKey,
      body: {
        images: request.inputUrls,
        prompt: request.prompt,
        aspect_ratio: request.aspectRatio,
        resolution: request.resolution,
        quality: request.quality || "medium",
        enable_sync_mode: request.enableSyncMode,
        enable_base64_output: request.enableBase64Output,
      },
    };
  }

  return {
    endpointKey: modelConfig.endpointKey,
    body: {
      images: request.inputUrls,
      prompt: request.prompt,
      aspect_ratio: request.aspectRatio,
      resolution: modelConfig.fixedResolution || request.resolution,
      ...(modelConfig.supportsWebSearch
        ? { enable_web_search: request.enableWebSearch }
        : {}),
      output_format: request.outputFormat,
      enable_sync_mode: request.enableSyncMode,
      enable_base64_output: request.enableBase64Output,
    },
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.request) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const input = readHostedJson(args.request);
  const request = normalizeEditRequest(input);
  const paths = buildAssetPaths(request.localAssetDir, request.runId, "image");
  let attempt = createGenerationAttempt(request, paths, {
    allowNewAttempt: args["new-attempt"] === true,
    operation: "edit",
  });
  writeJson(paths.requestPath, request);

  const providerRequest = buildProviderBody(request);
  let hostedResponse;
  try {
    hostedResponse = await fetchJson(providerRequest.endpointKey, {
      method: "POST",
      body: JSON.stringify(providerRequest.body),
    });
  } catch (error) {
    if (isNotSubmittedGenerationError(error)) {
      throw recordAttemptNotSubmitted(paths, attempt, error);
    }
    throw error;
  }

  attempt = recordAttemptSubmissionResponse(paths, attempt, hostedResponse);
  const data = hostedResponse.data;
  const manifest = createImageManifestBase(request, paths);
  const result = unwrapProviderResult(data);
  manifest.generationHandle = result?.id || null;
  manifest.providerStatus = result?.status || null;
  manifest.providerUrls = result?.urls || null;
  manifest.mediaType = "image";

  if (result?.status === "completed") {
    try {
      await materializeCompletedImageOutputs(
        request,
        result,
        manifest,
        paths,
        "edit",
      );
    } catch (error) {
      recordAttemptMaterializationError(paths, attempt, error, manifest);
      throw error;
    }
  }

  const finalized = finalizeAttemptManifest(paths, attempt, manifest);
  finalizeImageRun(request, paths, finalized.manifest);
  console.log(JSON.stringify(finalized.manifest, null, 2));
}

main().catch((error) => {
  console.error(formatCliError(error));
  process.exitCode = 1;
});
