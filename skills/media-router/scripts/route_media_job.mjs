#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith("--")) {
      continue;
    }
    const key = current.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
}

function usage() {
  console.error("Usage: node route_media_job.mjs --brief <brief.json>");
}

function inferNeedsTimestamps(brief) {
  if (typeof brief.needsTimestamps === "boolean") {
    return brief.needsTimestamps;
  }
  return ["subtitles", "beats", "broll-map", "edit-plan"].includes(brief.goal);
}

function choosePrimaryModel(brief) {
  if (brief.inputType === "audio") {
    if (brief.costMode === "cheap-first" && brief.quality === "rough") {
      return "wavespeed-ai/openai-whisper-turbo";
    }
    return "wavespeed-ai/openai-whisper";
  }

  if (brief.inputType === "video") {
    if (brief.costMode === "cheap-first" && brief.quality === "rough") {
      return "wavespeed-ai/openai-whisper-turbo";
    }
    return "wavespeed-ai/openai-whisper-with-video";
  }

  return null;
}

function routeBrief(brief) {
  const needsTimestamps = inferNeedsTimestamps(brief);
  const route = {
    jobId: brief.jobId || null,
    route: null,
    executionMode: brief.scale === "batch" ? "batch" : "single",
    why: [],
    primarySkill: null,
    supportingSkills: [],
    modelPlan: [],
    outputArtifacts: [],
    needsTimestamps
  };

  if (brief.inputType === "audio") {
    route.primarySkill = "audio-transcription";
    route.modelPlan.push({
      purpose: "speech-to-text",
      model: choosePrimaryModel(brief),
      enableTimestamps: needsTimestamps
    });
    route.outputArtifacts.push("transcript.json");
    route.why.push("Input is audio, so video understanding is unnecessary.");
  } else if (brief.inputType === "video") {
    route.primarySkill = "video-transcription";
    route.modelPlan.push({
      purpose: "video-to-text",
      model: choosePrimaryModel(brief),
      enableTimestamps: needsTimestamps
    });
    route.outputArtifacts.push("transcript.json");
    route.why.push("Input is video and speech extraction is required.");
  } else if (brief.inputType === "transcript") {
    route.primarySkill = "subtitle-packager";
    route.why.push("Transcript already exists, so packaging should happen before any re-transcription.");
  } else if (brief.inputType === "transcript+assets") {
    route.primarySkill = "editing-decision-engine";
    route.why.push("A transcript plus media assets means the main problem is edit planning, not transcription.");
  }

  if (brief.goal === "subtitles") {
    route.route = "subtitle-ready";
    if (!route.supportingSkills.includes("subtitle-packager")) {
      route.supportingSkills.push("subtitle-packager");
    }
    route.outputArtifacts.push("subtitles.srt", "subtitles.vtt");
    route.why.push("Subtitle files require timestamp-aware packaging.");
  } else if (brief.goal === "semantic-analysis") {
    route.route = "semantic-understanding";
    route.supportingSkills.push("video-analysis");
    route.outputArtifacts.push("video-analysis.json");
    route.why.push("Visual reasoning requires a semantic video-analysis pass.");
  } else if (brief.goal === "beats" || brief.goal === "broll-map" || brief.goal === "edit-plan") {
    route.route = "edit-prep";
    if (!route.supportingSkills.includes("video-analysis") && brief.inputType === "video") {
      route.supportingSkills.push("video-analysis");
    }
    if (!route.supportingSkills.includes("editing-decision-engine")) {
      route.supportingSkills.push("editing-decision-engine");
    }
    route.outputArtifacts.push("beat-map.json", "edit-plan.md");
    route.why.push("Edit-prep outputs need transcript timing plus downstream decision logic.");
  } else {
    route.route = "transcript-only";
    route.why.push("The requested output does not require extra semantic or edit-planning stages.");
  }

  if (needsTimestamps && !route.outputArtifacts.includes("timed-transcript.json")) {
    route.outputArtifacts.push("timed-transcript.json");
  }

  if (brief.scale === "batch") {
    route.why.push("Batch work should persist per-asset manifests and support retries.");
  }

  route.supportingSkills = [...new Set(route.supportingSkills)].filter(Boolean);
  route.outputArtifacts = [...new Set(route.outputArtifacts)];

  return route;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.brief) {
    usage();
    process.exitCode = 1;
    return;
  }

  const brief = readJson(args.brief);
  const route = routeBrief(brief);
  console.log(JSON.stringify(route, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
