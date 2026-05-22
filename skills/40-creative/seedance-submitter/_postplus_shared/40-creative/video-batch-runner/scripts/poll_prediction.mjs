#!/usr/bin/env node
import path from 'node:path';

import { formatCliError } from '../../../00-core/shared-runtime/scripts/lib/network_runtime.mjs';
import {
  buildRequestPaths,
  createRenderManifestBase,
  createHostedMediaGenerationFailedError,
  fetchJson,
  isHostedMediaGenerationFailedResult,
  maybeDownloadOutputs,
  parseArgs,
  readHostedMediaGenerationFailure,
  readHostedJson,
  readJson,
  unwrapProviderResult,
  writeJson,
} from './_shared.mjs';

function usage() {
  console.error(
    'Usage: node poll_prediction.mjs --request <request.json> [--response <response.json>] [--result-url <url-or-handle>]',
  );
}

function inferResultUrl(request, responsePayload) {
  const payload = unwrapProviderResult(responsePayload);
  if (typeof payload?.urls?.get === 'string' && payload.urls.get.length > 0) {
    return payload.urls.get;
  }
  if (payload?.id && request?.provider === 'hosted-media') {
    return payload.id;
  }
  throw new Error('Could not infer result URL from request/response.');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.request) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const request = readHostedJson(args.request);
  if (request.provider !== 'hosted-media') {
    throw new Error(
      `unsupported_video_provider: ${request.provider}. Released video-batch-runner only supports provider "hosted-media".`,
    );
  }
  const executionEnvelopePath = path.resolve(args.request);
  const priorResponse = args.response
    ? readJson(args.response)
    : readJson(buildRequestPaths(request.localOutputDir).responsePath);

  const paths = buildRequestPaths(request.localOutputDir);
  const resultUrl =
    args['result-url'] || inferResultUrl(request, priorResponse);

  const { data: rawResult } = await fetchJson(resultUrl);

  writeJson(paths.responsePath, rawResult);

  const result = unwrapProviderResult(rawResult);

  const manifest = createRenderManifestBase(request, paths, {
    executionEnvelopePath,
  });
  manifest.generationHandle = result?.id || priorResponse?.id || null;
  manifest.providerTaskId = null;
  manifest.providerStatus = result?.status || null;
  manifest.providerUrls = result?.urls || priorResponse?.urls || null;
  manifest.hasNsfwContents = Array.isArray(result?.has_nsfw_contents)
    ? result.has_nsfw_contents
    : [];
  manifest.returnLastFrame = request.returnLastFrame;
  manifest.generateAudio = request.generateAudio;
  manifest.serviceTier = result?.service_tier || request.serviceTier || null;
  manifest.watermark = request.watermark;
  manifest.usage = result?.usage || null;
  manifest.error = readHostedMediaGenerationFailure(result);

  await maybeDownloadOutputs(result, manifest, paths);

  writeJson(paths.manifestPath, manifest);
  if (isHostedMediaGenerationFailedResult(result)) {
    throw createHostedMediaGenerationFailedError(result, {
      label: 'Video generation polling',
    });
  }
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(formatCliError(error));
  process.exitCode = 1;
});
