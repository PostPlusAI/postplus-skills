import path from 'node:path';

import {
  buildRequestPaths,
  createHostedMediaGenerationFailedError,
  createReviewStub,
  downloadFile,
  fetchJson,
  inferAudioExtension,
  isHostedMediaGenerationFailedResult,
  nowIso,
  parseArgs,
  readHostedMediaGenerationFailure,
  readHostedJson,
  readJson,
  unwrapProviderResult,
  writeJson,
} from './_shared.mjs';

function inferResultUrl(responsePayload) {
  const result = unwrapProviderResult(responsePayload);
  if (typeof result?.urls?.get === 'string' && result.urls.get.length > 0) {
    return result.urls.get;
  }
  if (typeof result?.id === 'string' && result.id.length > 0) {
    return result.id;
  }
  throw new Error('Could not infer result URL from response.');
}

function buildManifest({
  audioPath = null,
  defaultMode,
  defaultModel,
  paths,
  priorManifest = null,
  request,
  responsePayload,
}) {
  const result = unwrapProviderResult(responsePayload);
  return {
    jobId: request.jobId,
    campaignId: request.campaignId || null,
    personaId: request.personaId || null,
    voiceProfileId: request.voiceProfileId || null,
    voiceIdentityId: request.voiceIdentityId || null,
    provider: request.provider || 'hosted-media',
    model: request.model || defaultModel,
    mode: request.mode || defaultMode,
    requestPath: paths.requestPath,
    responsePath: paths.responsePath,
    manifestPath: paths.manifestPath,
    audioPath: audioPath || priorManifest?.audioPath || null,
    outputUrls: Array.isArray(result?.outputs) ? result.outputs : [],
    generationHandle: result?.id || priorManifest?.generationHandle || null,
    providerStatus: result?.status || priorManifest?.providerStatus || null,
    providerUrls: result?.urls || priorManifest?.providerUrls || null,
    referenceAudioUrl:
      priorManifest?.referenceAudioUrl || request.referenceAudioUrl || null,
    uploadRecord: priorManifest?.uploadRecord || null,
    createdAt: priorManifest?.createdAt || nowIso(),
    updatedAt: nowIso(),
    sourceBasis: Array.isArray(request.sourceBasis) ? request.sourceBasis : [],
    reviewStatus: priorManifest?.reviewStatus || 'pending_review',
    error: readHostedMediaGenerationFailure(result),
  };
}

async function maybeDownloadFirstOutput(resultPayload, paths) {
  const result = unwrapProviderResult(resultPayload);
  const outputs = Array.isArray(result?.outputs) ? result.outputs : [];
  const firstOutput = outputs[0] || null;
  if (!firstOutput) return null;
  const ext = inferAudioExtension(firstOutput, 'wav');
  const audioPath = path.join(paths.audioDir, `take-001.${ext}`);
  await downloadFile(firstOutput, audioPath);
  return audioPath;
}

export async function pollVoiceGeneration({
  argv = process.argv.slice(2),
  defaultMode,
  defaultModel,
  failureLabel,
  usage,
}) {
  const args = parseArgs(argv);
  if (args.help || !args.request) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const request = readHostedJson(args.request);
  const paths = buildRequestPaths(request.localOutputDir);
  const responsePayload = args.response
    ? readJson(args.response)
    : args['result-url']
      ? null
      : readJson(paths.responsePath);
  const priorManifest = (() => {
    try {
      return readJson(paths.manifestPath);
    } catch {
      return null;
    }
  })();

  const resultUrl = args['result-url'] || inferResultUrl(responsePayload);
  const { data } = await fetchJson(resultUrl);

  writeJson(paths.responsePath, data);

  const result = unwrapProviderResult(data);
  const audioPath =
    result?.status === 'completed'
      ? await maybeDownloadFirstOutput(data, paths)
      : priorManifest?.audioPath || null;

  const manifest = buildManifest({
    audioPath,
    defaultMode,
    defaultModel,
    paths,
    priorManifest,
    request,
    responsePayload: data,
  });
  writeJson(paths.requestPath, request);
  writeJson(paths.manifestPath, manifest);
  writeJson(paths.reviewPath, createReviewStub());

  if (isHostedMediaGenerationFailedResult(result)) {
    throw createHostedMediaGenerationFailedError(result, {
      label: failureLabel,
    });
  }
  console.log(JSON.stringify(manifest, null, 2));
}
