#!/usr/bin/env node
import path from 'node:path';

import { formatCliError } from '../../../00-core/shared-runtime/scripts/lib/network_runtime.mjs';
import {
  buildRequestPaths,
  createRenderManifestBase,
  createHostedMediaGenerationFailedError,
  fetchJson,
  getProviderApiConfig,
  isHostedMediaGenerationFailedResult,
  maybeDownloadOutputs,
  normalizeRenderInput,
  parseArgs,
  readHostedMediaGenerationFailure,
  readHostedJson,
  readJson,
  toProviderPayload,
  unwrapProviderResult,
  writeJson,
} from './_shared.mjs';

function usage() {
  console.error(
    'Usage: node generate_video_from_image_audio.mjs --request <request.json>',
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.request) {
    usage();
    process.exitCode = 1;
    return;
  }

  const input = readHostedJson(args.request);
  const request = normalizeRenderInput(input);
  const paths = buildRequestPaths(request.localOutputDir);
  const providerConfig = getProviderApiConfig(request);
  const executionEnvelopePath = path.resolve(args.request);

  writeJson(paths.requestPath, request);

  const { data: rawResult } = await fetchJson(providerConfig.submitUrl, {
    method: 'POST',
    body: JSON.stringify(await toProviderPayload(request, { paths })),
  });

  writeJson(paths.responsePath, rawResult);

  const result = unwrapProviderResult(rawResult);

  const manifest = createRenderManifestBase(request, paths, {
    executionEnvelopePath,
  });
  manifest.generationHandle = result?.id || null;
  manifest.providerTaskId = null;
  manifest.providerStatus = result?.status || null;
  manifest.providerUrls = result?.urls || null;
  manifest.hasNsfwContents = Array.isArray(result?.has_nsfw_contents)
    ? result.has_nsfw_contents
    : [];
  manifest.returnLastFrame = request.returnLastFrame;
  manifest.generateAudio = request.generateAudio;
  manifest.serviceTier = request.serviceTier;
  manifest.watermark = request.watermark;
  manifest.error = readHostedMediaGenerationFailure(result);

  await maybeDownloadOutputs(result, manifest, paths);

  writeJson(paths.manifestPath, manifest);
  if (isHostedMediaGenerationFailedResult(result)) {
    throw createHostedMediaGenerationFailedError(result, {
      label: 'Video generation',
    });
  }
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(formatCliError(error));
  process.exitCode = 1;
});
