#!/usr/bin/env node
import path from 'node:path';

import {
  DEFAULT_LANGUAGE,
  DEFAULT_PROVIDER,
  buildRequestPaths,
  createReviewStub,
  downloadFile,
  fetchJson,
  inferAudioExtension,
  nowIso,
  parseArgs,
  readHostedJson,
  readJson,
  unwrapProviderResult,
  writeJson,
} from './_shared.mjs';

const DEFAULT_MODEL = 'voice-qwen3-design';

function usage() {
  console.error('Usage: node design_voice.mjs --request <request.json>');
}

function normalizeRequest(input) {
  if (!input?.jobId) throw new Error('request.jobId is required.');
  if (!input?.text) throw new Error('request.text is required.');
  if (!input?.voiceDescription)
    throw new Error('request.voiceDescription is required.');
  if (!input?.localOutputDir)
    throw new Error('request.localOutputDir is required.');
  return {
    jobId: input.jobId,
    campaignId: input.campaignId || null,
    personaId: input.personaId || null,
    voiceProfileId: input.voiceProfileId || null,
    provider: input.provider || DEFAULT_PROVIDER,
    model: input.model || DEFAULT_MODEL,
    mode: input.mode || 'voice_design',
    text: input.text,
    voiceDescription: input.voiceDescription,
    language: input.language || DEFAULT_LANGUAGE,
    localOutputDir: input.localOutputDir,
    sourceBasis: Array.isArray(input.sourceBasis) ? input.sourceBasis : [],
  };
}

function buildProviderBody(request) {
  return {
    text: request.text,
    voice_description: request.voiceDescription,
    language: request.language,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.request) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const request = normalizeRequest(readHostedJson(args.request));
  const paths = buildRequestPaths(request.localOutputDir);
  writeJson(paths.requestPath, request);

  const endpoint = 'voice-qwen3-design';
  const { data: submitData } = await fetchJson(endpoint, {
    method: 'POST',
    body: JSON.stringify(buildProviderBody(request)),
  });

  const finalData = submitData;
  const result = unwrapProviderResult(finalData);

  writeJson(paths.responsePath, finalData);

  const outputs = Array.isArray(result?.outputs) ? result.outputs : [];
  const firstOutput = outputs[0] || null;
  const ext = firstOutput ? inferAudioExtension(firstOutput, 'wav') : 'wav';
  const audioPath = path.join(paths.audioDir, `take-001.${ext}`);
  if (firstOutput) {
    await downloadFile(firstOutput, audioPath);
  }

  const manifest = {
    jobId: request.jobId,
    campaignId: request.campaignId,
    personaId: request.personaId,
    voiceProfileId: request.voiceProfileId,
    provider: request.provider,
    model: request.model,
    mode: request.mode,
    requestPath: paths.requestPath,
    responsePath: paths.responsePath,
    manifestPath: paths.manifestPath,
    audioPath: firstOutput ? audioPath : null,
    outputUrls: outputs,
    generationHandle: result?.id || null,
    providerStatus: result?.status || null,
    providerUrls: result?.urls || null,
    createdAt: nowIso(),
    sourceBasis: request.sourceBasis,
    reviewStatus: 'pending_review',
  };

  writeJson(paths.manifestPath, manifest);
  writeJson(paths.reviewPath, createReviewStub());
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
