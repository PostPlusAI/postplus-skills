#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const LONG_VIDEO_SECONDS = 300;
export const LONG_VIDEO_MAX_SELECTED_FRAMES = 60;

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

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

function writeJson(filePath, value) {
  const absolutePath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
}

function parsePositiveNumber(value, fieldName) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new Error(`${fieldName} must be a positive number.`);
  }
  return numberValue;
}

function cleanString(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value).trim();
  return text ? text : null;
}

export function planFrameExtraction(input) {
  const durationSeconds = Math.ceil(
    parsePositiveNumber(
      input?.durationSeconds ?? input?.duration,
      'durationSeconds',
    ),
  );
  const requestedFrameBudget =
    input?.maxSelectedFrames ??
    input?.frameBudget ??
    input?.requestedFrameCount ??
    null;
  const parsedFrameBudget =
    requestedFrameBudget === null || requestedFrameBudget === undefined
      ? null
      : Math.ceil(parsePositiveNumber(requestedFrameBudget, 'frameBudget'));
  const requestedScope =
    cleanString(input?.scope) ?? cleanString(input?.requestedScope) ?? null;
  const isLongVideo = durationSeconds > LONG_VIDEO_SECONDS;

  if (!isLongVideo) {
    return {
      durationSeconds,
      isLongVideo: false,
      maximumSelectedFrames: parsedFrameBudget,
      requiresBoundedFirstPass: false,
      scope: requestedScope ?? 'requested-scope',
      userMessage: null,
    };
  }

  const maximumSelectedFrames = Math.min(
    parsedFrameBudget ?? LONG_VIDEO_MAX_SELECTED_FRAMES,
    LONG_VIDEO_MAX_SELECTED_FRAMES,
  );

  return {
    durationSeconds,
    isLongVideo: true,
    maximumSelectedFrames,
    requiresBoundedFirstPass: true,
    scope: requestedScope ?? 'bounded-first-pass',
    userMessage:
      'This video is longer than 5 minutes, so I will extract a limited number of key frames based on the target range to avoid generating thousands of unusable images.',
  };
}

function usage() {
  console.error(
    'Usage: node plan_frame_extraction.mjs --input <request.json> [--output <plan.json>]',
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) {
    usage();
    process.exitCode = 1;
    return;
  }

  const plan = planFrameExtraction(readJson(args.input));
  if (args.output) {
    writeJson(args.output, plan);
    return;
  }
  console.log(JSON.stringify(plan, null, 2));
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
