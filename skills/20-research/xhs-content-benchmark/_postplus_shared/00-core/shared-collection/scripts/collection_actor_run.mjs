#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import {
  createSkillBoundary,
  logSkillEvent,
} from '../../shared-runtime/scripts/lib/skill_runtime.mjs';
import { runHostedCollection } from './lib/hosted_collection_bridge.mjs';

export function parseArgs(argv) {
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

export function readJson(filePath) {
  const absolutePath = path.resolve(filePath);
  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

export function writeJson(filePath, value) {
  const absolutePath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, JSON.stringify(value, null, 2));
}

function usage(commandName = 'collection_actor_run.mjs') {
  console.error(
    `Usage: node ${commandName} --collection-key <collection-key> --input <input.json> [--output <output.json>] [--skill-name <skill-id>]`,
  );
}

function buildBoundary(input) {
  return createSkillBoundary({
    skillName: input.skillName ?? inferSkillName(input.commandName),
    actionName: input.actionName ?? inferActionName(input.commandName),
    provider: 'collection',
  });
}

function inferSkillName(commandName = 'collection_actor_run.mjs') {
  const parts = commandName.split('/').filter((segment) => segment.length > 0);
  const skillsIndex = parts.indexOf('skills');
  if (skillsIndex >= 0) {
    return parts[skillsIndex + 1] ?? 'unknown-skill';
  }
  return 'unknown-skill';
}

function inferActionName(commandName = 'collection_actor_run.mjs') {
  return path.basename(commandName, path.extname(commandName));
}

export async function runCollectionActor(argv, options = {}) {
  const args = parseArgs(argv);
  const commandName = options.commandName || 'collection_actor_run.mjs';
  const explicitSkillName =
    typeof args['skill-name'] === 'string' && args['skill-name'].trim().length > 0
      ? args['skill-name'].trim()
      : null;
  const boundary = buildBoundary({
    commandName,
    skillName: explicitSkillName ?? options.skillName,
    actionName: options.actionName,
  });

  if (args.help || !args['collection-key'] || !args.input) {
    usage(commandName);
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const collectionKey = String(args['collection-key']).trim();

  let input;
  try {
    input = readJson(args.input);
  } catch (error) {
    logSkillEvent(boundary, {
      eventType: 'script_failed',
      phase: 'input',
      status: 'failed',
      errorCode: 'invalid_input_json',
      errorMessage: error instanceof Error ? error.message : String(error),
      inputPath: path.resolve(args.input),
    });
    console.error(`Failed to read input JSON: ${path.resolve(args.input)}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  logSkillEvent(boundary, {
    eventType: 'script_started',
    phase: 'executing',
    status: 'started',
    collectionKey,
    inputPath: path.resolve(args.input),
    outputPath: args.output ? path.resolve(args.output) : null,
    commandName,
  });

  try {
    const payload = await runHostedCollection({
      collectionKey,
      input,
      operationId: `skill-collection:${boundary.runId}`,
      skillName: boundary.skillName,
    });

    if (args.output) {
      writeJson(args.output, payload);
      logSkillEvent(boundary, {
        eventType: 'artifact_written',
        phase: 'output',
        status: 'completed',
        collectionKey,
        outputPath: path.resolve(args.output),
        itemCount: payload.itemCount,
      });
      console.log(
        `Saved ${payload.itemCount} items to ${path.resolve(args.output)}`,
      );
      return;
    }

    console.log(JSON.stringify(payload, null, 2));
  } catch (error) {
    logSkillEvent(boundary, {
      eventType: 'script_failed',
      phase: 'executing',
      status: 'failed',
      collectionKey,
      errorCode:
        error && typeof error === 'object' && 'code' in error
          ? error.code
          : null,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

const isDirectRun = import.meta.url === new URL(process.argv[1], 'file:').href;

if (isDirectRun) {
  runCollectionActor(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
