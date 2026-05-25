#!/usr/bin/env node
import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from '../_postplus_shared/00-core/shared-runtime/scripts/lib/local_skill_cli.mjs';

export function buildCreativeQaRecord(input = {}) {
  const qaReport = buildQaReport(input);
  const feedbackHandoff = buildFeedbackHandoff(input, qaReport);

  return feedbackHandoff ? { qaReport, feedbackHandoff } : { qaReport };
}

function readRequiredString(input, fieldName) {
  const value = input[fieldName];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`creative-qa requires ${fieldName}.`);
  }

  return value.trim();
}

function readOptionalString(input, fieldName, fallback = null) {
  const value = input[fieldName];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readRequiredStringArray(input, fieldName) {
  const value = input[fieldName];
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`creative-qa requires non-empty ${fieldName}.`);
  }

  const strings = value.filter(
    (item) => typeof item === 'string' && item.trim(),
  );
  if (strings.length === 0) {
    throw new Error(`creative-qa requires non-empty ${fieldName}.`);
  }

  return strings;
}

function readOptionalStringArray(input, fieldName) {
  const value = input[fieldName];
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string' && item.trim())
    : [];
}

function buildQaReport(input) {
  const verdict = readRequiredString(input, 'verdict');
  if (!['approved', 'revise', 'reject'].includes(verdict)) {
    throw new Error('creative-qa verdict must be approved, revise, or reject.');
  }
  const requiresIssueReasons = verdict !== 'approved';

  return {
    qaReportId: readRequiredString(input, 'qaReportId'),
    targetObjectType: readRequiredString(input, 'targetObjectType'),
    targetObjectId: readRequiredString(input, 'targetObjectId'),
    targetVersion: readRequiredString(input, 'targetVersion'),
    campaignId: readOptionalString(input, 'campaignId'),
    personaId: readOptionalString(input, 'personaId'),
    conceptId: readOptionalString(input, 'conceptId'),
    reviewer: readRequiredString(input, 'reviewer'),
    reviewedAt: readRequiredString(input, 'reviewedAt'),
    verdict,
    goodReasons: readRequiredStringArray(input, 'goodReasons'),
    badReasons: requiresIssueReasons
      ? readRequiredStringArray(input, 'badReasons')
      : readOptionalStringArray(input, 'badReasons'),
    issueCategories: requiresIssueReasons
      ? readRequiredStringArray(input, 'issueCategories')
      : readOptionalStringArray(input, 'issueCategories'),
    blameStage: readOptionalStringArray(input, 'blameStage'),
    scores:
      input.scores && typeof input.scores === 'object' ? input.scores : {},
    proposedAction: readRequiredString(input, 'proposedAction'),
    status: readOptionalString(input, 'status', 'final'),
  };
}

function buildFeedbackHandoff(input, qaReport) {
  const feedbackText = readOptionalString(input, 'feedbackText');
  if (!feedbackText) {
    return null;
  }

  return {
    feedbackId:
      readOptionalString(input, 'feedbackId') ??
      `feedback-${qaReport.qaReportId}`,
    qaReportId: qaReport.qaReportId,
    targetObjectType: qaReport.targetObjectType,
    targetObjectId: qaReport.targetObjectId,
    feedbackCategory: readOptionalString(
      input,
      'feedbackCategory',
      'dependency_feedback',
    ),
    feedbackText,
    dependencyImpact: readOptionalStringArray(input, 'dependencyImpact'),
    rerunTarget: readRequiredString(input, 'rerunTarget'),
  };
}

function usage() {
  console.error(
    'Usage: node build_creative_qa_record.mjs --input <input.json> [--output <qa-record.json>]',
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    process.exitCode = 0;
    return;
  }

  if (!args.input) {
    usage();
    process.exitCode = 1;
    return;
  }

  const input = readJson(args.input);
  const payload = buildCreativeQaRecord(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
