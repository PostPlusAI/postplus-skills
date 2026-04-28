#!/usr/bin/env node
import { randomUUID } from 'node:crypto';

import { runHostedApifyActor } from '../_postplus_shared/shared-collection/scripts/lib/hosted_apify_bridge.mjs';
import { formatCliError } from '../_postplus_shared/shared-runtime/scripts/lib/network_runtime.mjs';
import {
  normalizeDataset,
  parseArgs,
  readJson,
  writeJson,
} from './lib/tiktok_common.mjs';

function usage() {
  console.error(
    'Usage: node collect_top_video_comments.mjs --input <dataset.json> --output <comments.json> [--actor clockworks/tiktok-comments-scraper] [--top 8] [--max-comments 40]',
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input || !args.output) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const actorId = args.actor || 'clockworks/tiktok-comments-scraper';
  const topCount = Number(args.top || 8);
  const maxComments = Number(args['max-comments'] || 40);
  const raw = readJson(args.input);
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

  const input = actorId.includes('apidojo/')
    ? {
        startUrls: topVideos.map((video) => ({ url: video.url })),
        maxItems: maxComments,
      }
    : {
        postUrls: topVideos.map((video) => video.url),
        maxItems: maxComments,
      };

  const outputPath = args.output;
  const tempOutput = `${outputPath}.raw.json`;
  const hostedPayload = await runHostedApifyActor({
    actorId,
    input,
    operationId: `skill-apify:${randomUUID()}`,
    skillName: 'tiktok-research',
  });
  writeJson(tempOutput, hostedPayload);

  const normalized = normalizeDataset(readJson(tempOutput), {
    actorId,
    datasetType: 'comments',
    inputPath: tempOutput,
  });
  normalized.sourceVideos = topVideos;
  writeJson(outputPath, normalized);
  console.log(`Saved ${normalized.itemCount} comments to ${outputPath}`);
}

main().catch((error) => {
  console.error(formatCliError(error));
  process.exitCode = 1;
});
