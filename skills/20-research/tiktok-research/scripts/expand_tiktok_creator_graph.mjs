#!/usr/bin/env node
import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { runHostedCollection } from '../_postplus_shared/00-core/shared-collection/scripts/lib/hosted_collection_bridge.mjs';
import { formatCliError } from '../_postplus_shared/00-core/shared-runtime/scripts/lib/network_runtime.mjs';
import {
  normalizeDataset,
  parseArgs,
  readJson,
  writeJson,
} from './lib/tiktok_common.mjs';

function usage() {
  console.error(
    'Usage: node expand_tiktok_creator_graph.mjs --input <normalized-videos.json> --output <raw.json> [--collection-key tiktok-related-videos] [--top 10] [--results-per-seed 6]',
  );
}

function scoreVideo(item) {
  return (
    Number(item.viewCount || 0) +
    Number(item.likeCount || 0) * 4 +
    Number(item.commentCount || 0) * 8 +
    Number(item.shareCount || 0) * 10 +
    Number(item.saveCount || 0) * 6
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input || !args.output) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const collectionKey = args['collection-key'] || 'tiktok-related-videos';
  const sourceId = 'clockworks/tiktok-scraper';
  const top = Number(args.top || 10);
  const resultsPerSeed = Number(args['results-per-seed'] || 6);

  const inputDataset = readJson(args.input);
  const dataset =
    inputDataset?.platform === 'tiktok'
      ? inputDataset
      : normalizeDataset(inputDataset, { inputPath: path.resolve(args.input) });

  const seedVideos = dataset.items
    .filter((item) => item.recordType === 'video' && item.videoUrl)
    .sort((left, right) => scoreVideo(right) - scoreVideo(left))
    .slice(0, top);

  if (!seedVideos.length) {
    writeJson(args.output, {
      sourceId,
      fetchedAt: new Date().toISOString(),
      input: {
        postURLs: [],
        scrapeRelatedVideos: true,
        resultsPerPage: resultsPerSeed,
      },
      itemCount: 0,
      items: [],
    });
    console.log(`Saved 0 items to ${path.resolve(args.output)}`);
    return;
  }

  const actorInput = {
    postURLs: seedVideos.map((item) => item.videoUrl),
    scrapeRelatedVideos: true,
    resultsPerPage: resultsPerSeed,
    shouldDownloadVideos: false,
  };

  const hostedPayload = await runHostedCollection({
    collectionKey,
    input: actorInput,
    operationId: `skill-collection:${randomUUID()}`,
    skillName: 'tiktok-research',
  });
  writeJson(args.output, {
    ...hostedPayload,
    seedVideos: seedVideos.map((item) => ({
      videoId: item.videoId,
      videoUrl: item.videoUrl,
      authorUsername: item.authorUsername,
      score: scoreVideo(item),
    })),
  });
  console.log(
    `Saved ${hostedPayload.itemCount} items to ${path.resolve(args.output)}`,
  );
}

main().catch((error) => {
  console.error(formatCliError(error));
  process.exitCode = 1;
});
