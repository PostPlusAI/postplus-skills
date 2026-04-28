#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { parseArgs, readJson, writeJson } from "./_shared.mjs";

function usage() {
  console.error(
    "Usage: node seed_talking_head_batch.mjs --persona-registry <registry.json> --image-manifest <manifest.json> --voices-dir <voices-dir> --output-dir <videos-dir> [--prompt <prompt>] [--resolution 720p]"
  );
}

function listVoiceManifestPaths(voicesDir) {
  return fs
    .readdirSync(path.resolve(voicesDir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(path.resolve(voicesDir), entry.name, "manifest.json"))
    .filter((manifestPath) => fs.existsSync(manifestPath))
    .sort();
}

function inferConceptIdFromJobId(jobId) {
  const match = jobId.match(/^(.+)-voice-clone-c-v\d+$/);
  if (!match) return null;
  return match[1].toUpperCase().replace(/-/g, "_");
}

function inferRenderJobId(jobId) {
  const match = jobId.match(/^(.+)-voice-clone-c-v(\d+)$/);
  return match ? `${match[1]}-render-c-v${match[2]}` : `${jobId}-render`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args["persona-registry"] || !args["image-manifest"] || !args["voices-dir"] || !args["output-dir"]) {
    usage();
    process.exitCode = 1;
    return;
  }

  const personaRegistry = readJson(args["persona-registry"]);
  const imageManifest = readJson(args["image-manifest"]);
  const voiceManifestPaths = listVoiceManifestPaths(args["voices-dir"]);

  const imageAsset = imageManifest?.assets?.[0];
  if (!imageAsset?.remoteUrl) {
    throw new Error("image manifest must contain assets[0].remoteUrl.");
  }

  const defaultPrompt =
    args.prompt ||
    "natural direct-to-camera talking head, subtle head motion, realistic office productivity creator, believable tiktok ugc, not polished ad";
  const resolution = args.resolution || "720p";
  const outputDir = path.resolve(args["output-dir"]);

  for (const voiceManifestPath of voiceManifestPaths) {
    const voiceManifest = readJson(voiceManifestPath);
    if (voiceManifest?.providerStatus !== "completed") {
      continue;
    }
    const audioUrl = voiceManifest?.outputUrls?.[0];
    if (!audioUrl) {
      continue;
    }

    const renderJobId = inferRenderJobId(voiceManifest.jobId);
    const conceptId = inferConceptIdFromJobId(voiceManifest.jobId);
    const renderDir = path.join(outputDir, renderJobId);
    const requestSeedPath = path.join(renderDir, "request.seed.json");

    const payload = {
      jobId: renderJobId,
      campaignId: voiceManifest.campaignId,
      personaId: personaRegistry.personaId,
      conceptId,
      scriptId: conceptId ? `${conceptId}-audio-v1` : voiceManifest.jobId,
      voiceTakeId: voiceManifest.jobId,
      imageAssetId: imageAsset.assetId || "img-001",
      assetPurpose: "talking_head",
      provider: "hosted",
      model: "hosted/video/talking-head",
      image: imageAsset.remoteUrl,
      audio: audioUrl,
      maskImage: null,
      prompt: defaultPrompt,
      resolution,
      seed: -1,
      localOutputDir: path.relative(process.cwd(), renderDir),
      sourceBasis: [
        args["persona-registry"],
        args["image-manifest"],
        path.relative(process.cwd(), voiceManifestPath)
      ],
      mustKeep: [
        personaRegistry.displayName,
        "direct-to-camera realism",
        "voice and image persona continuity"
      ],
      canVary: [
        "small natural head movement",
        "blink frequency",
        "micro facial motion"
      ],
      feedback: [],
      upstreamRefs: {
        image: args["image-manifest"],
        audio: path.relative(process.cwd(), voiceManifestPath)
      }
    };

    writeJson(requestSeedPath, payload);
    console.log(requestSeedPath);
  }
}

main();
