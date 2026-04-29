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

function ensureDir(targetPath) {
  fs.mkdirSync(path.resolve(targetPath), { recursive: true });
}

function writeJson(filePath, payload) {
  ensureDir(path.dirname(path.resolve(filePath)));
  fs.writeFileSync(path.resolve(filePath), `${JSON.stringify(payload, null, 2)}\n`);
}

function nowIso() {
  return new Date().toISOString();
}

function usage() {
  console.error(
    "Usage: node run_package_edit_enhancements.mjs --broll-plan <broll-plan.json> [--output <edit-enhancement-package.json>] [--aspect-ratio 9:16] [--style-profile basic]"
  );
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function topCandidate(beat) {
  if (!Array.isArray(beat.candidates) || beat.candidates.length === 0) {
    return null;
  }
  return beat.candidates[0];
}

function isStrongCandidate(candidate) {
  return Number(candidate?.score || 0) >= 0.72;
}

function isMediumCandidate(candidate) {
  return Number(candidate?.score || 0) >= 0.5;
}

function classifyAttentionOwner(beat, candidate) {
  if (!beat.shouldUseBroll || !candidate) {
    if (Array.isArray(beat.keywordOverlay) && beat.keywordOverlay.length > 0) {
      return "subtitle-keyword";
    }
    return "a-roll-face";
  }

  if (isStrongCandidate(candidate) && ["proof", "ui-demo", "comparison"].includes(beat.visualNeed)) {
    return "b-roll-proof";
  }

  if (isMediumCandidate(candidate) && ["workflow-bridge", "transition-cover"].includes(beat.visualNeed)) {
    return "transition-motion";
  }

  if (Array.isArray(beat.keywordOverlay) && beat.keywordOverlay.length > 0) {
    return "subtitle-keyword";
  }

  return "a-roll-face";
}

function inferARollAction(attentionOwner, beat) {
  if (attentionOwner === "b-roll-proof") {
    return "cut-away";
  }
  if (attentionOwner === "transition-motion" && beat.coverageStyle !== "stay-on-face") {
    return "picture-in-picture";
  }
  if (attentionOwner === "subtitle-keyword") {
    return "punch-in";
  }
  return "stay-on-face";
}

function inferBrollAction(attentionOwner, beat, candidate) {
  if (!candidate || attentionOwner === "a-roll-face" || attentionOwner === "subtitle-keyword") {
    return {
      mode: "none",
      assetId: null,
      range: null,
      confidence: "none",
      reason: "B-roll would not improve this beat enough"
    };
  }

  const confidence = isStrongCandidate(candidate) ? "high" : isMediumCandidate(candidate) ? "medium" : "low";
  const mode = attentionOwner === "b-roll-proof" ? beat.coverageStyle || "full-cutaway" : "overlay-support";

  return {
    mode,
    assetId: candidate.assetId,
    range: candidate.suggestedRange || null,
    confidence,
    reason: candidate.reason || "top ranked B-roll candidate"
  };
}

function inferKeywordEmphasis(beat, attentionOwner) {
  const keywords = Array.isArray(beat.keywordOverlay) ? beat.keywordOverlay : [];
  if (keywords.length === 0) {
    return {
      mode: "none",
      keywords: [],
      intensity: "none"
    };
  }

  if (attentionOwner === "subtitle-keyword") {
    return {
      mode: "inline-pop",
      keywords,
      intensity: "medium"
    };
  }

  if (attentionOwner === "b-roll-proof") {
    return {
      mode: "subtitle-highlight",
      keywords,
      intensity: "subtle"
    };
  }

  return {
    mode: "subtitle-highlight",
    keywords,
    intensity: "subtle"
  };
}

function inferMicroMotion(beat, attentionOwner) {
  if (attentionOwner === "a-roll-face") {
    return {
      preset: "none",
      intensity: "none",
      reason: "face performance should stay clean"
    };
  }

  const preset = beat.motionHint && beat.motionHint !== "none" ? beat.motionHint : "hold-clean";
  const intensity = attentionOwner === "b-roll-proof" ? "subtle" : "medium";

  return {
    preset,
    intensity,
    reason: "derived from B-roll visual need and pacing role"
  };
}

function inferSubtitleTreatment(attentionOwner, beat) {
  if (attentionOwner === "b-roll-proof" && ["ui-demo", "proof"].includes(beat.visualNeed)) {
    return {
      mode: "lift-up",
      reason: "avoid covering proof or UI area"
    };
  }
  if (attentionOwner === "transition-motion") {
    return {
      mode: "reduce-density",
      reason: "let motion reset breathe"
    };
  }
  if (attentionOwner === "subtitle-keyword") {
    return {
      mode: "keyword-highlight",
      reason: "keyword carries the emphasis"
    };
  }
  return {
    mode: "normal",
    reason: "no special subtitle treatment needed"
  };
}

function buildEditorNote(beat, attentionOwner, candidate) {
  if (!candidate) {
    return "Stay on A-roll unless manual review finds stronger proof footage.";
  }
  if (attentionOwner === "b-roll-proof") {
    return "Use the selected B-roll only if the crop is readable at target aspect ratio.";
  }
  if (attentionOwner === "transition-motion") {
    return "Keep the B-roll light; it should support pacing, not replace the face.";
  }
  return "Prioritize performance and subtitle emphasis over cutaway.";
}

function enhanceBeat(beat) {
  const candidate = topCandidate(beat);
  const attentionOwner = classifyAttentionOwner(beat, candidate);

  return {
    beatId: beat.beatId,
    start: beat.start,
    end: beat.end,
    spokenText: beat.spokenText,
    sourceBeatRole: beat.beatRole,
    sourceVisualNeed: beat.visualNeed,
    attentionOwner,
    aRollAction: inferARollAction(attentionOwner, beat),
    brollAction: inferBrollAction(attentionOwner, beat, candidate),
    keywordEmphasis: inferKeywordEmphasis(beat, attentionOwner),
    microMotion: inferMicroMotion(beat, attentionOwner),
    subtitleTreatment: inferSubtitleTreatment(attentionOwner, beat),
    editorNote: buildEditorNote(beat, attentionOwner, candidate)
  };
}

function buildPackage({ brollPlanPath, outputPath, aspectRatio, styleProfile }) {
  const brollPlan = readJson(brollPlanPath);
  const beats = Array.isArray(brollPlan.beats) ? brollPlan.beats.map(enhanceBeat) : [];

  return {
    schemaVersion: "edit-enhancement-package/v1",
    packageId: slugify(`${brollPlan.planId || "broll-plan"}-enhancement`) || "edit-enhancement-package",
    sourceBrollPlanPath: path.resolve(brollPlanPath),
    sourceChunkPath: brollPlan.sourceChunkPath || null,
    target: {
      platform: "short-video",
      aspectRatio,
      styleProfile
    },
    beats,
    meta: {
      createdAt: nowIso(),
      generator: "skills/40-creative/b-roll-family/edit-enhancement-packager/scripts/run_package_edit_enhancements.mjs",
      outputPath: path.resolve(outputPath),
      beatCount: beats.length,
      attentionOwnerCounts: beats.reduce((accumulator, beat) => {
        accumulator[beat.attentionOwner] = (accumulator[beat.attentionOwner] || 0) + 1;
        return accumulator;
      }, {})
    }
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args["broll-plan"]) {
    usage();
    process.exitCode = 1;
    return;
  }

  const brollPlanPath = path.resolve(args["broll-plan"]);
  const outputPath = path.resolve(
    args.output || path.join(path.dirname(brollPlanPath), "edit-enhancement-package.json")
  );
  const aspectRatio = args["aspect-ratio"] || "9:16";
  const styleProfile = args["style-profile"] || "basic";

  const editPackage = buildPackage({
    brollPlanPath,
    outputPath,
    aspectRatio,
    styleProfile
  });

  writeJson(outputPath, editPackage);
  console.log(
    JSON.stringify(
      {
        outputPath,
        beatCount: editPackage.meta.beatCount,
        attentionOwnerCounts: editPackage.meta.attentionOwnerCounts
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
