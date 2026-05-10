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
    'Usage: node transcript_json_to_srt.mjs --input <normalized-transcript.json> --output <subtitles.srt> [--chunk-mode basic]',
  );
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

function ensureDir(targetPath) {
  fs.mkdirSync(path.resolve(targetPath), { recursive: true });
}

function writeText(filePath, text) {
  ensureDir(path.dirname(path.resolve(filePath)));
  fs.writeFileSync(path.resolve(filePath), text);
}

function pad(value, size = 2) {
  return String(value).padStart(size, '0');
}

function formatSrtTime(seconds) {
  const totalMs = Math.max(0, Math.round(Number(seconds || 0) * 1000));
  const hours = Math.floor(totalMs / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(ms, 3)}`;
}

function normalizeSegments(payload) {
  if (payload?.schemaVersion !== 'subtitle-normalized/v1') {
    throw new Error(
      'Input must be a normalized-transcript.json with schemaVersion subtitle-normalized/v1.',
    );
  }

  if (!Array.isArray(payload?.segments) || payload.segments.length === 0) {
    return [];
  }

  return payload.segments
    .map((segment) => ({
      start: Number(segment.start),
      end: Number(segment.end),
      text: String(segment.text ?? '').trim(),
    }))
    .filter(
      (segment) =>
        segment.text &&
        Number.isFinite(segment.start) &&
        Number.isFinite(segment.end) &&
        segment.end > segment.start,
    );
}

function buildSrt(segments) {
  return `${segments
    .map((segment, index) => {
      return [
        String(index + 1),
        `${formatSrtTime(segment.start)} --> ${formatSrtTime(segment.end)}`,
        segment.text,
        '',
      ].join('\n');
    })
    .join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.output) {
    usage();
    process.exitCode = 1;
    return;
  }

  const payload = readJson(args.input);
  const chunkedPayload = chunkNormalizedTranscript(payload, {
    chunkMode: args['chunk-mode'] || 'basic',
    maxCharsPerChunk: args['max-chars-per-chunk'],
    maxWordsPerChunk: args['max-words-per-chunk'],
    minDuration: args['min-duration'],
  });
  const segments = normalizeSegments(chunkedPayload);
  if (segments.length === 0) {
    throw new Error('No timed segments found in input JSON.');
  }

  writeText(args.output, buildSrt(segments));
  console.log(
    JSON.stringify(
      {
        output: path.resolve(args.output),
        segmentCount: segments.length,
        chunkMode: chunkedPayload.chunking?.mode || 'basic',
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
