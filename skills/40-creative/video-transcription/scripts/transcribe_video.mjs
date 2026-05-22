#!/usr/bin/env node
import fs from 'node:fs';

import { formatCliError } from '../_postplus_shared/00-core/shared-runtime/scripts/lib/network_runtime.mjs';
import {
  buildNormalizedTranscript,
  buildRequestPaths,
  createManifestBase,
  createHostedMediaGenerationFailedError,
  downloadProviderOutputs,
  extractTranscriptData,
  fetchJson,
  isHostedMediaGenerationFailedResult,
  logTranscriptionAsyncPreflight,
  normalizeTranscriptionInput,
  parseArgs,
  readHostedMediaGenerationFailure,
  readHostedJson,
  toProviderPayload,
  unwrapProviderResult,
  writeJson,
} from '../_postplus_shared/40-creative/audio-transcription/scripts/_shared.mjs';

function usage() {
  console.error('Usage: node transcribe_video.mjs --request <request.json>');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.request) {
    usage();
    process.exitCode = 1;
    return;
  }

  const request = normalizeTranscriptionInput(
    readHostedJson(args.request),
    'video',
  );
  const paths = buildRequestPaths(request.localOutputDir);

  writeJson(paths.requestPath, request);
  logTranscriptionAsyncPreflight(request);

  const { data: rawResult } = await fetchJson(request.model, {
    method: 'POST',
    body: JSON.stringify(await toProviderPayload(request, { paths })),
  });

  writeJson(paths.responsePath, rawResult);

  const result = unwrapProviderResult(rawResult);
  const manifest = createManifestBase(request, paths);
  manifest.generationHandle = result?.id || null;
  manifest.providerStatus = result?.status || null;
  manifest.providerUrls = result?.urls || null;
  manifest.error = readHostedMediaGenerationFailure(result);
  manifest.mediaUploadRequestPath = fs.existsSync(paths.mediaUploadRequestPath)
    ? paths.mediaUploadRequestPath
    : null;
  manifest.mediaUploadResponsePath = fs.existsSync(
    paths.mediaUploadResponsePath,
  )
    ? paths.mediaUploadResponsePath
    : null;

  const transcriptData = extractTranscriptData(result);
  manifest.transcriptText = transcriptData.transcriptText;
  manifest.segmentCount = transcriptData.segments.length;
  manifest.wordCount = transcriptData.words.length;
  manifest.normalizedTranscriptPath = paths.normalizedTranscriptPath;

  if (result?.status === 'completed') {
    manifest.downloadedArtifacts = await downloadProviderOutputs(result, paths);
  }

  writeJson(paths.manifestPath, manifest);
  writeJson(
    paths.normalizedTranscriptPath,
    buildNormalizedTranscript({ request, manifest, paths, transcriptData }),
  );
  if (isHostedMediaGenerationFailedResult(result)) {
    throw createHostedMediaGenerationFailedError(result, {
      label: 'Video transcription',
    });
  }
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(formatCliError(error));
  process.exitCode = 1;
});
