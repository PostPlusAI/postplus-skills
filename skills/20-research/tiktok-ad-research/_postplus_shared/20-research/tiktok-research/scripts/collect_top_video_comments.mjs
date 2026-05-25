#!/usr/bin/env node
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  isHostedCollectionPendingResult,
  runHostedCollection,
} from '../../../00-core/shared-collection/scripts/lib/hosted_collection_bridge.mjs';
import { formatCliError } from '../../../00-core/shared-runtime/scripts/lib/network_runtime.mjs';
import {
  normalizeDataset,
  parseArgs,
  readHostedJson,
  readJson,
  writeJson,
} from './lib/tiktok_common.mjs';

function usage() {
  console.error(
    'Usage: node collect_top_video_comments.mjs --input <dataset-envelope.json> --output <comments.json> [--collection-key tiktok-comments] [--top 8] [--comments-per-post 40]',
  );
}

function toScoredVideo(item) {
  return {
    url: item.videoUrl,
    views: Number(item.viewCount || 0),
    likes: Number(item.likeCount || 0),
    comments: Number(item.commentCount || 0),
    shares: Number(item.shareCount || 0),
    text: item.text || '',
  };
}

export function buildCommentCollectionInput(topVideos, commentsPerPost) {
  return {
    postURLs: topVideos.map((video) => video.url),
    commentsPerPost,
    maxRepliesPerComment: 0,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input || !args.output) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const collectionKey = args['collection-key'] || 'tiktok-comments';
  const sourceId = 'tiktok-comments';
  const topCount = Number(args.top || 8);
  const commentsPerPost = Number(
    args['comments-per-post'] || args['max-comments'] || 40,
  );
  const raw = readHostedJson(args.input);
  const dataset =
    raw?.platform === 'tiktok'
      ? raw
      : normalizeDataset(raw, { inputPath: args.input });
  const videos = dataset.items
    .filter((item) => item.recordType === 'video' && item.videoUrl)
    .map(toScoredVideo);
  const topVideos = [...videos]
    .sort(
      (left, right) => right.views + right.likes - (left.views + left.likes),
    )
    .slice(0, topCount);

  const input = buildCommentCollectionInput(topVideos, commentsPerPost);

  const outputPath = args.output;
  const tempOutput = `${outputPath}.raw.json`;
  const hostedPayload = await runHostedCollection({
    collectionKey,
    input,
    operationId: `skill-collection:${randomUUID()}`,
    skillName: 'tiktok-research',
  });
  writeJson(tempOutput, hostedPayload);

  if (isHostedCollectionPendingResult(hostedPayload)) {
    writeJson(outputPath, {
      ...hostedPayload,
      artifactPath: path.resolve(outputPath),
      sourceVideos: topVideos,
    });
    console.log(`Saved pending collection state to ${path.resolve(outputPath)}`);
    return;
  }

  const normalized = normalizeDataset(readJson(tempOutput), {
    sourceId,
    datasetType: 'comments',
    inputPath: tempOutput,
  });
  normalized.sourceVideos = topVideos;
  writeJson(outputPath, normalized);
  console.log(`Saved ${normalized.itemCount} comments to ${outputPath}`);
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error(formatCliError(error));
    process.exitCode = 1;
  });
}
