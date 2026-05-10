#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import {
  createSkillBoundary,
  logSkillEvent,
} from '../../shared-runtime/scripts/lib/skill_runtime.mjs';
import {
  readHostedSkillExecutionEnvelope,
  normalizeQuoteConfirmationToken,
} from '../../shared-runtime/scripts/lib/hosted_execution_protocol.mjs';
import {
  isHostedCollectionPendingResult,
  runHostedCollection,
} from './lib/hosted_collection_bridge.mjs';

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
    `Usage: node ${commandName} --collection-key <collection-key> --input <input.json> [--output <output.json>] [--skill-name <skill-id>] [--hosted-operation-id <operation-id>] [--quote-confirmation-token <token>]\n       node ${commandName} --run-handle <handle> [--output <output.json>] [--skill-name <skill-id>]`,
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

function shellQuote(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=@-]+$/.test(text)) {
    return text;
  }

  return `'${text.replaceAll("'", "'\\''")}'`;
}

function buildResumeCommand({ commandName, outputPath, runHandle }) {
  const parts = ['node', commandName, '--run-handle', runHandle];

  if (outputPath) {
    parts.push('--output', path.resolve(outputPath));
  }

  return parts.map(shellQuote).join(' ');
}

function buildQuoteConfirmationRetryCommand({
  collectionKey,
  commandName,
  inputPath,
  operationId,
  outputPath,
  skillName,
}) {
  const parts = [
    'node',
    commandName,
    '--collection-key',
    collectionKey,
    '--input',
    path.resolve(inputPath),
  ];

  if (outputPath) {
    parts.push('--output', path.resolve(outputPath));
  }

  if (skillName) {
    parts.push('--skill-name', skillName);
  }

  parts.push('--hosted-operation-id', operationId);
  parts.push(
    '--quote-confirmation-token',
    '<token-from-postplus-quote-confirm-json>',
  );

  return parts.map(shellQuote).join(' ');
}

function attachPendingArtifact(payload, { commandName, outputPath }) {
  if (!isHostedCollectionPendingResult(payload)) {
    return payload;
  }

  const pending = {
    ...payload,
    resumeCommand:
      payload.resumeCommand ||
      buildResumeCommand({
        commandName,
        outputPath,
        runHandle: payload.runHandle,
      }),
  };

  if (outputPath) {
    pending.artifactPath = path.resolve(outputPath);
  }

  return pending;
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
  const runHandle =
    typeof args['run-handle'] === 'string' && args['run-handle'].trim().length > 0
      ? args['run-handle'].trim()
      : null;
  const isResume = runHandle !== null;

  if (
    args.help ||
    (!isResume && (!args['collection-key'] || !args.input)) ||
    (isResume && (args['collection-key'] || args.input))
  ) {
    usage(commandName);
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const collectionKey = args['collection-key']
    ? String(args['collection-key']).trim()
    : null;

  let input = null;
  let envelopeQuoteConfirmationToken = null;
  let envelopeOperationId = null;
  if (!isResume) {
    try {
      const envelope = readHostedSkillExecutionEnvelope(readJson(args.input));
      input = envelope.input;
      envelopeQuoteConfirmationToken = envelope.quoteConfirmationToken;
      envelopeOperationId = envelope.operationId;
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
  }

  const quoteConfirmationToken =
    normalizeQuoteConfirmationToken(args['quote-confirmation-token']) ??
    envelopeQuoteConfirmationToken;
  const operationId =
    !isResume && typeof args['hosted-operation-id'] === 'string'
      ? args['hosted-operation-id'].trim()
      : !isResume && envelopeOperationId
        ? envelopeOperationId
        : !isResume
          ? `skill-collection:${boundary.runId}`
          : undefined;

  logSkillEvent(boundary, {
    eventType: 'script_started',
    phase: 'executing',
    status: 'started',
    collectionKey,
    inputPath: args.input ? path.resolve(args.input) : null,
    outputPath: args.output ? path.resolve(args.output) : null,
    runHandle,
    commandName,
  });

  try {
    const payload = await runHostedCollection({
      collectionKey,
      input,
      operationId,
      quoteConfirmationToken,
      retryCommand:
        !isResume && collectionKey && args.input
          ? buildQuoteConfirmationRetryCommand({
              collectionKey,
              commandName,
              inputPath: args.input,
              operationId,
              outputPath: args.output,
              skillName: boundary.skillName,
            })
          : undefined,
      runHandle,
      skillName: boundary.skillName,
    });
    const outputPayload = attachPendingArtifact(payload, {
      commandName,
      outputPath: args.output,
    });

    if (args.output) {
      writeJson(args.output, outputPayload);
      logSkillEvent(boundary, {
        eventType: 'artifact_written',
        phase: 'output',
        status: isHostedCollectionPendingResult(outputPayload)
          ? 'pending'
          : 'completed',
        collectionKey,
        outputPath: path.resolve(args.output),
        itemCount: outputPayload.itemCount,
        runHandle: outputPayload.runHandle ?? null,
      });
      if (isHostedCollectionPendingResult(outputPayload)) {
        console.log(`Saved pending collection state to ${path.resolve(args.output)}`);
        console.log(`Resume with: ${outputPayload.resumeCommand}`);
      } else {
        console.log(
          `Saved ${outputPayload.itemCount} items to ${path.resolve(args.output)}`,
        );
      }
      return;
    }

    console.log(JSON.stringify(outputPayload, null, 2));
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
