#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { formatCliError } from '../_postplus_shared/00-core/shared-runtime/scripts/lib/network_runtime.mjs';

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith('--')) {
      continue;
    }
    const key = current.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

function ensureDir(targetPath) {
  fs.mkdirSync(path.resolve(targetPath), { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

function writeJson(filePath, payload) {
  ensureDir(path.dirname(path.resolve(filePath)));
  fs.writeFileSync(
    path.resolve(filePath),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
}

function nowIso() {
  return new Date().toISOString();
}

function usage() {
  console.error(
    'Usage: node run_match_broll_plan.mjs --chunks <chunked-basic.json> --catalog <broll-catalog.json> [--output <broll-plan.json>]',
  );
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function asSet(values) {
  return new Set(
    Array.isArray(values)
      ? values.map((value) => String(value).toLowerCase())
      : [],
  );
}

function inferBeatRoleAndVisualNeed(text) {
  const lowered = String(text || '').toLowerCase();

  const rules = [
    {
      beatRole: 'workflow-friction-proof',
      visualNeed: 'process-proof',
      keywords: [
        'digging through notes',
        'typing with one hand',
        'start digging',
        'one hand',
        'notes',
      ],
    },
    {
      beatRole: 'hands-free-product-proof',
      visualNeed: 'hands-free-proof',
      keywords: [
        'phone down',
        'keep the phone down',
        'glasses stay on',
        'talk through the update',
        'hands free',
      ],
    },
    {
      beatRole: 'recap-proof',
      visualNeed: 'recap-proof',
      keywords: [
        'capture the recap',
        'recap',
        'next question',
        'conversation moving',
      ],
    },
    {
      beatRole: 'travel-payoff',
      visualNeed: 'travel-payoff',
      keywords: [
        'now i can board',
        'team already briefed',
        'already briefed',
        'ready to board',
      ],
    },
    {
      beatRole: 'tool-discovery',
      visualNeed: 'ui-demo',
      keywords: [
        'google',
        'search',
        'homepage',
        'found this tool',
        'product reveal',
        'website proof',
      ],
    },
    {
      beatRole: 'workflow-problem',
      visualNeed: 'comparison',
      keywords: [
        'leave gmail',
        'another ai tool',
        'come back',
        'extra tab',
        'separate ai project',
        'paste the thread',
      ],
    },
    {
      beatRole: 'product-proof',
      visualNeed: 'proof',
      keywords: [
        'reply box',
        'draft',
        'response',
        'tone',
        'shorten',
        'clean up',
        'warmer',
        'shortcut',
      ],
    },
    {
      beatRole: 'workflow-proof',
      visualNeed: 'workflow-bridge',
      keywords: ['workflow', 'thread', 'reply', 'inbox', 'email', 'gmail'],
    },
    {
      beatRole: 'pain-point',
      visualNeed: 'keyword-emphasis',
      keywords: ['issue', 'annoying', 'hard', 'worse', 'bigger'],
    },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => lowered.includes(keyword))) {
      return {
        beatRole: rule.beatRole,
        visualNeed: rule.visualNeed,
      };
    }
  }

  return {
    beatRole: 'narrative-bridge',
    visualNeed: 'stay-on-face',
  };
}

function shouldUseBrollForNeed(visualNeed, text) {
  if (visualNeed === 'stay-on-face') {
    return false;
  }
  if (visualNeed === 'keyword-emphasis') {
    return /\b(inbox|workflow|reply|tab|gmail)\b/i.test(text);
  }
  return true;
}

function inferCoverageStyle(visualNeed) {
  const mapping = {
    'ui-demo': 'picture-in-picture',
    proof: 'picture-in-picture',
    'process-proof': 'picture-in-picture',
    'hands-free-proof': 'picture-in-picture',
    'recap-proof': 'picture-in-picture',
    'travel-payoff': 'picture-in-picture',
    'workflow-bridge': 'overlay-support',
    comparison: 'overlay-support',
    'transition-cover': 'overlay-support',
    'keyword-emphasis': 'stay-on-face',
    'stay-on-face': 'stay-on-face',
  };
  return mapping[visualNeed] || 'stay-on-face';
}

function inferMotionHint(visualNeed) {
  const mapping = {
    'ui-demo': 'gentle-push-in',
    proof: 'hold-clean',
    'process-proof': 'gentle-push-in',
    'hands-free-proof': 'hold-clean',
    'recap-proof': 'hold-clean',
    'travel-payoff': 'soft-fade',
    'workflow-bridge': 'soft-slide',
    comparison: 'quick-cut-contrast',
    'transition-cover': 'soft-fade',
    'keyword-emphasis': 'keyword-pop',
  };
  return mapping[visualNeed] || 'none';
}

function inferKeywordOverlay(text) {
  const keywords = [
    'gmail',
    'workflow',
    'reply',
    'response',
    'draft',
    'thread',
    'inbox',
    'tab',
    'tone',
    'phone',
    'glasses',
    'notes',
    'recap',
    'board',
    'briefed',
  ];
  const lowered = text.toLowerCase();
  return keywords.filter((keyword) => lowered.includes(keyword));
}

function inferDesiredRoles(visualNeed) {
  const mapping = {
    'ui-demo': ['ui-demo', 'proof'],
    proof: ['proof', 'ui-demo'],
    'process-proof': ['proof', 'workflow-bridge'],
    'hands-free-proof': ['proof', 'workflow-bridge'],
    'recap-proof': ['proof'],
    'travel-payoff': ['transition-cover', 'proof', 'cta-support'],
    'workflow-bridge': ['workflow-bridge', 'proof'],
    comparison: ['workflow-bridge', 'proof', 'transition-cover'],
    'transition-cover': ['transition-cover', 'ui-demo'],
    'keyword-emphasis': ['proof', 'workflow-bridge'],
  };
  return mapping[visualNeed] || [];
}

function scoreAssetForBeat(beat, asset) {
  const beatText = String(beat.text || '').toLowerCase();
  const beatTokens = new Set(tokenize(beat.text));
  const assetTags = asSet(asset.semanticTags);
  const assetRoles = asSet(asset.supportRoles);
  const desiredRoles = inferDesiredRoles(beat.visualNeed);

  let score = 0;
  const reasons = [];

  for (const desiredRole of desiredRoles) {
    if (assetRoles.has(desiredRole)) {
      score += 0.28;
      reasons.push(`supports ${desiredRole}`);
    }
  }

  const lexicalRules = [
    ['gmail', ['gmail', 'email', 'inbox']],
    ['product', ['shortcut', 'in-app']],
    ['workflow', ['workflow', 'thread', 'tab']],
    ['reply', ['reply', 'response', 'draft']],
    ['search', ['google', 'search', 'homepage']],
    ['rewrite', ['rewrite', 'tone', 'shorten', 'clean']],
    [
      'deadline',
      ['digging through notes', 'typing with one hand', 'one hand', 'notes'],
    ],
    [
      'laptop-notes',
      ['digging through notes', 'typing with one hand', 'notes', 'laptop'],
    ],
    ['phone-down', ['phone down', 'keep the phone down', 'phone']],
    [
      'wearable-product',
      ['glasses stay on', 'glasses', 'hands free', 'talk through the update'],
    ],
    ['recap', ['recap', 'next question', 'conversation moving']],
    ['boarding', ['board', 'boarding', 'team already briefed', 'briefed']],
    ['payoff', ['now i can board', 'team already briefed', 'already briefed']],
    ['travel-doc', ['board', 'boarding', 'passport', 'gate', 'briefed']],
    ['airport', ['airport', 'layover', 'gate', 'board', 'boarding']],
    [
      'chatgpt',
      [
        'another ai tool',
        'ai tool',
        'paste',
        'come back',
        'separate ai project',
      ],
    ],
  ];

  for (const [assetTag, beatKeywords] of lexicalRules) {
    if (
      assetTags.has(assetTag) &&
      beatKeywords.some((keyword) => beatText.includes(keyword))
    ) {
      score += 0.18;
      reasons.push(`matches ${assetTag} concept`);
    }
  }

  if (beat.visualNeed === 'comparison' && assetTags.has('comparison')) {
    score += 0.16;
    reasons.push('supports old-vs-new workflow contrast');
  }

  if (beat.visualNeed === 'ui-demo' && assetTags.has('ui-demo')) {
    score += 0.16;
    reasons.push('gives direct UI proof');
  }

  if (beat.visualNeed === 'proof' && assetTags.has('product')) {
    score += 0.14;
    reasons.push('shows in-product proof');
  }

  if (
    beat.visualNeed === 'process-proof' &&
    (assetTags.has('deadline') || assetTags.has('laptop-notes'))
  ) {
    score += 0.22;
    reasons.push('shows work-friction proof surface');
  }

  if (
    beat.visualNeed === 'hands-free-proof' &&
    (assetTags.has('phone-down') || assetTags.has('wearable-product'))
  ) {
    score += 0.22;
    reasons.push('supports phone-down hands-free proof');
  }

  if (beat.visualNeed === 'recap-proof' && assetTags.has('recap')) {
    score += 0.22;
    reasons.push('shows recap proof surface');
  }

  if (
    beat.visualNeed === 'travel-payoff' &&
    (assetTags.has('boarding') ||
      assetTags.has('travel-doc') ||
      assetTags.has('airport') ||
      assetTags.has('payoff'))
  ) {
    score += assetTags.has('payoff') ? 0.34 : 0.22;
    reasons.push('supports boarding payoff');
  }

  if (beat.visualNeed === 'travel-payoff' && !assetTags.has('payoff')) {
    score = Math.min(score, 0.82);
    reasons.push('not the dedicated payoff asset');
  }

  if (beat.visualNeed === 'hands-free-proof' && !assetTags.has('phone-down')) {
    score = Math.min(score, 0.82);
    reasons.push('does not directly show phone-down proof');
  }

  if (beat.visualNeed === 'comparison' && assetTags.has('chatgpt')) {
    score += 0.14;
    reasons.push('shows extra-tool detour');
  }

  if (
    beat.visualNeed === 'comparison' &&
    /(leave gmail|another ai tool|come back|paste the thread|extra tab|separate ai project)/i.test(
      beat.text || '',
    ) &&
    (assetTags.has('comparison') || assetTags.has('chatgpt'))
  ) {
    score += 0.18;
    reasons.push('fits off-platform workflow detour');
  }

  if (
    asset.visualRisks?.includes('small text') &&
    beat.visualNeed !== 'ui-demo'
  ) {
    score -= 0.05;
  }

  if (asset.visualRisks?.includes('landscape crop risk for 9:16')) {
    score -= 0.04;
  }

  if (beatTokens.has('google') && assetTags.has('google')) {
    score += 0.12;
  }
  if (beatTokens.has('thread') && assetTags.has('workflow')) {
    score += 0.08;
  }

  return {
    score: Number(Math.min(Math.max(score, 0), 1).toFixed(3)),
    reasons,
  };
}

function buildCandidate(asset, scoreResult) {
  return {
    assetId: asset.assetId,
    score: scoreResult.score,
    reason:
      scoreResult.reasons.length > 0
        ? scoreResult.reasons.join('; ')
        : 'weak heuristic match',
    supportRole:
      Array.isArray(asset.supportRoles) && asset.supportRoles.length > 0
        ? asset.supportRoles[0]
        : null,
    suggestedRange:
      Array.isArray(asset.usableRanges) && asset.usableRanges.length > 0
        ? asset.usableRanges[0]
        : null,
  };
}

function selectCandidates(beat, catalog) {
  const scored = catalog.assets
    .map((asset) => {
      const scoreResult = scoreAssetForBeat(beat, asset);
      return {
        asset,
        scoreResult,
      };
    })
    .filter((entry) => entry.scoreResult.score >= 0.18)
    .sort((left, right) => right.scoreResult.score - left.scoreResult.score)
    .slice(0, 3)
    .map((entry) => buildCandidate(entry.asset, entry.scoreResult));

  return scored;
}

function buildFallback(beat, candidates) {
  if (candidates.length === 0) {
    return 'stay on A-roll with keyword emphasis';
  }
  if (beat.visualNeed === 'keyword-emphasis') {
    return 'stay on A-roll unless the selected B-roll clearly improves the point';
  }
  return 'use top candidate only if it improves clarity over staying on face';
}

function buildPlan({ chunksPath, catalogPath, outputPath }) {
  const chunkPayload = readJson(chunksPath);
  const catalog = readJson(catalogPath);
  const beats = Array.isArray(chunkPayload.segments)
    ? chunkPayload.segments
    : [];

  const planBeats = beats.map((beat, index) => {
    const roleAndNeed = inferBeatRoleAndVisualNeed(beat.text);
    const shouldUseBroll = shouldUseBrollForNeed(
      roleAndNeed.visualNeed,
      beat.text,
    );
    const candidates = shouldUseBroll
      ? selectCandidates({ ...beat, ...roleAndNeed }, catalog)
      : [];

    return {
      beatId: beat.id || `beat-${String(index + 1).padStart(3, '0')}`,
      start: beat.start,
      end: beat.end,
      spokenText: beat.text,
      beatRole: roleAndNeed.beatRole,
      visualNeed: roleAndNeed.visualNeed,
      shouldUseBroll,
      coverageStyle: inferCoverageStyle(roleAndNeed.visualNeed),
      keywordOverlay: inferKeywordOverlay(beat.text),
      motionHint: inferMotionHint(roleAndNeed.visualNeed),
      candidates,
      fallback: buildFallback(roleAndNeed, candidates),
    };
  });

  return {
    schemaVersion: 'broll-plan/v1',
    planId:
      slugify(`${chunkPayload.jobId || 'video'}-broll-plan`) || 'broll-plan',
    sourceTranscriptPath: chunkPayload.meta?.normalizedTranscriptPath || null,
    sourceChunkPath: path.resolve(chunksPath),
    sourceCatalogPath: path.resolve(catalogPath),
    beats: planBeats,
    meta: {
      createdAt: nowIso(),
      generator:
        'skills/40-creative/b-roll-family/broll-match-engine/scripts/run_match_broll_plan.mjs',
      outputPath: path.resolve(outputPath),
      chunkCount: planBeats.length,
      matchedBeatCount: planBeats.filter((beat) => beat.candidates.length > 0)
        .length,
    },
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.chunks || !args.catalog) {
    usage();
    process.exitCode = 1;
    return;
  }

  const chunksPath = path.resolve(args.chunks);
  const catalogPath = path.resolve(args.catalog);
  const outputPath = path.resolve(
    args.output || path.join(path.dirname(chunksPath), 'broll-plan.json'),
  );

  const plan = buildPlan({
    chunksPath,
    catalogPath,
    outputPath,
  });

  writeJson(outputPath, plan);
  console.log(
    JSON.stringify(
      {
        outputPath,
        beatCount: plan.meta.chunkCount,
        matchedBeatCount: plan.meta.matchedBeatCount,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(formatCliError(error));
  process.exitCode = 1;
});
