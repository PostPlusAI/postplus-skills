#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { formatCliError } from '../_postplus_shared/00-core/shared-runtime/scripts/lib/network_runtime.mjs';
import { chunkNormalizedTranscript } from './_chunking.mjs';

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

function usage() {
  console.error(
    'Usage: node chunk_normalized_transcript.mjs --input <normalized-transcript.json> --output <chunked.json> [--chunk-mode basic]',
  );
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

function ensureDir(targetPath) {
  fs.mkdirSync(path.resolve(targetPath), { recursive: true });
}

function writeJson(filePath, payload) {
  ensureDir(path.dirname(path.resolve(filePath)));
  fs.writeFileSync(
    path.resolve(filePath),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.output) {
    usage();
    process.exitCode = 1;
    return;
  }

  const payload = readJson(args.input);
  const chunked = chunkNormalizedTranscript(payload, {
    chunkMode: args['chunk-mode'] || 'basic',
    maxCharsPerChunk: args['max-chars-per-chunk'],
    maxWordsPerChunk: args['max-words-per-chunk'],
    minDuration: args['min-duration'],
  });

  writeJson(args.output, chunked);
  console.log(
    JSON.stringify(
      {
        output: path.resolve(args.output),
        sourceSegmentCount: Array.isArray(payload.segments)
          ? payload.segments.length
          : 0,
        chunkedSegmentCount: Array.isArray(chunked.segments)
          ? chunked.segments.length
          : 0,
        chunkMode: chunked.chunking?.mode || 'basic',
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
