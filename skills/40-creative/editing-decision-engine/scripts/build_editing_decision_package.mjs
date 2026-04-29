#!/usr/bin/env node
import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from '../_postplus_shared/00-core/shared-runtime/scripts/lib/local_skill_cli.mjs';

export function buildEditingDecisionPackage(input = {}) {
  const beats = requireNonEmptyArray(input.beats, 'beats');
  const assetInventory = normalizeAssetInventory(
    input.assetInventory ?? input.brollAssets ?? [],
  );
  const editBrief = buildEditBrief(input);
  const beatMap = beats.map(normalizeBeat);
  const decisionTimeline = beatMap.map((beat, index) =>
    buildEditDecision({ beat, index, assetInventory }),
  );
  const riskLog = normalizeRiskLog(input.risks, { assetInventory });

  return {
    editBrief,
    beatMap,
    assetInventory,
    decisionTimeline,
    riskLog,
  };
}

function requireNonEmptyArray(value, fieldName) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`editing-decision-engine requires non-empty ${fieldName}.`);
  }

  return value;
}

function readString(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readStringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string' && item.trim())
    : [];
}

function buildEditBrief(input) {
  const editThesis = readString(input.editThesis);
  if (!editThesis) {
    throw new Error('editing-decision-engine requires editThesis.');
  }

  return {
    videoId: readString(input.videoId, 'unnamed-video'),
    editThesis,
    mode: readString(input.mode, 'proof-led'),
    targetLength: readString(input.targetLength, 'short-form'),
    referenceBasis: readStringArray(input.referenceBasis),
    groundingStatus: {
      hasTranscript: true,
      hasARollContext: Boolean(input.aRollContext),
      hasBRollInventory: Array.isArray(
        input.assetInventory ?? input.brollAssets,
      ),
    },
  };
}

function normalizeBeat(beat, index) {
  const spokenText = readString(beat.spokenText ?? beat.text);
  if (!spokenText) {
    throw new Error(
      `editing-decision-engine beat ${index + 1} requires spokenText or text.`,
    );
  }

  return {
    beatId: readString(
      beat.beatId ?? beat.id,
      `b${String(index + 1).padStart(2, '0')}`,
    ),
    start: readString(beat.start, null),
    end: readString(beat.end, null),
    spokenText,
    role: readString(beat.role, index === 0 ? 'hook' : 'proof'),
    intent: readString(beat.intent, spokenText),
    proofNeed: readString(beat.proofNeed, index === 0 ? 'medium' : 'high'),
    visualDemand: readString(
      beat.visualDemand,
      index === 0 ? 'medium' : 'high',
    ),
    notes: readString(beat.notes, ''),
  };
}

function normalizeAssetInventory(value) {
  if (!Array.isArray(value)) {
    throw new Error(
      'editing-decision-engine assetInventory must be an array when provided.',
    );
  }

  return value.map((asset, index) => ({
    assetId: readString(asset.assetId ?? asset.id, `broll-${index + 1}`),
    path: readString(asset.path, ''),
    literalContent: readString(asset.literalContent ?? asset.description, ''),
    proofClaim: readString(asset.proofClaim, ''),
    bestRoles: readStringArray(asset.bestRoles),
    strength: readString(asset.strength, 'support'),
    idealDuration: readString(asset.idealDuration, '1.0s-3.0s'),
    repetitionRisk: readString(asset.repetitionRisk, 'unknown'),
    notes: readString(asset.notes, ''),
  }));
}

function buildEditDecision({ beat, index, assetInventory }) {
  const selectedAsset = assetInventory[index - 1] ?? assetInventory[0] ?? null;
  const shouldUseBroll = Boolean(selectedAsset) && beat.proofNeed !== 'low';

  return {
    decisionId: `d${String(index + 1).padStart(2, '0')}`,
    beatId: beat.beatId,
    timeline: beat.start && beat.end ? `${beat.start}-${beat.end}` : null,
    spokenText: beat.spokenText,
    editIntention: beat.intent,
    aRollTreatment: shouldUseBroll
      ? 'cut away after the claim is clear'
      : 'stay on A-roll',
    bRollAssetIds:
      selectedAsset && shouldUseBroll ? [selectedAsset.assetId] : [],
    bRollUse: selectedAsset && shouldUseBroll ? 'primary-proof' : 'none',
    subtitleNote: 'keep subtitle compact and aligned to the spoken beat',
    paceNote:
      index === 0
        ? 'hold long enough to establish the hook'
        : 'cut on meaning shift',
    transitionNote: shouldUseBroll
      ? 'hard cut into proof action'
      : 'light punch-in only',
    fallback: selectedAsset
      ? 'if this proof shot is weak, stay on A-roll and use subtitle emphasis'
      : 'asset missing; do not invent B-roll precision',
  };
}

function normalizeRiskLog(risks, { assetInventory }) {
  const normalizedRisks = Array.isArray(risks)
    ? risks.map((risk) =>
        typeof risk === 'string'
          ? {
              risk,
              impact: 'medium',
              mitigation: 'review before edit lock',
            }
          : {
              risk: readString(risk.risk, 'unspecified edit risk'),
              impact: readString(risk.impact, 'medium'),
              mitigation: readString(
                risk.mitigation,
                'review before edit lock',
              ),
            },
      )
    : [];

  if (assetInventory.length === 0) {
    normalizedRisks.push({
      risk: 'B-roll inventory is missing, so proof cutaways are provisional.',
      impact: 'high',
      mitigation: 'add a real B-roll inventory before timeline lock',
    });
  }

  return normalizedRisks;
}

function usage() {
  console.error(
    'Usage: node build_editing_decision_package.mjs [--input <input.json>] [--output <decision-package.json>]',
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    process.exitCode = 0;
    return;
  }

  const input = args.input ? readJson(args.input) : {};
  const payload = buildEditingDecisionPackage(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
