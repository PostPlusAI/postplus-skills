#!/usr/bin/env node

import path from "node:path";

import {
  isDirectRun,
  parseArgs,
  readJson,
  requireArg,
  scoreEngagement,
  toNumber,
  writeJson
} from "./lib/public_content_common.mjs";

export function normalizeLinkedinItem(item) {
  return {
    platform: "linkedin",
    url: item.url || null,
    postId: item.id || item.post_id || null,
    author: item.user_id || null,
    authorUrl: item.use_url || null,
    publishedAt: item.date_posted || null,
    title: item.headline || item.title || null,
    text: item.post_text || item.original_post_text || null,
    media: {
      images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
      videos: Array.isArray(item.videos) ? item.videos.filter(Boolean) : []
    },
    metrics: {
      likes: toNumber(item.num_likes),
      comments: toNumber(item.num_comments),
      shares: toNumber(item.num_shares),
      views: toNumber(item.views)
    },
    source: {
      provider: "public-content",
      collectedAt: item.timestamp || null,
      rawPlatform: "linkedin"
    }
  };
}

export function normalizeYoutubeItem(item) {
  return {
    platform: "youtube",
    url: item.url || null,
    postId: item.video_id || item.shortcode || null,
    author: item.handle_name || item.youtuber || null,
    authorUrl: item.channel_url || null,
    publishedAt: item.date_posted || null,
    title: item.title || null,
    text: item.description || null,
    media: {
      images: item.preview_image ? [item.preview_image] : [],
      videos: item.video_url ? [item.video_url] : []
    },
    metrics: {
      likes: toNumber(item.likes),
      comments: toNumber(item.num_comments),
      shares: toNumber(item.shares),
      views: toNumber(item.views)
    },
    source: {
      provider: "public-content",
      collectedAt: item.timestamp || null,
      rawPlatform: "youtube"
    }
  };
}

export function normalizeFacebookItem(item) {
  const attachments = Array.isArray(item.attachments) ? item.attachments : [];
  const imageUrls = [];
  const videoUrls = [];

  if (item.post_image) imageUrls.push(item.post_image);
  if (item.header_image) imageUrls.push(item.header_image);

  for (const attachment of attachments) {
    if (attachment.url) imageUrls.push(attachment.url);
    if (attachment.thumbnail_url) imageUrls.push(attachment.thumbnail_url);
    if (attachment.video_url) videoUrls.push(attachment.video_url);
  }

  return {
    platform: "facebook",
    url: item.url || item.post_url || null,
    postId: item.post_id || item.shortcode || null,
    author: item.page_name || item.user_username_raw || item.profile_handle || null,
    authorUrl: item.page_url || item.user_url || null,
    publishedAt: item.date_posted || null,
    title: null,
    text: item.content || null,
    media: {
      images: Array.from(new Set(imageUrls.filter(Boolean))),
      videos: Array.from(new Set(videoUrls.filter(Boolean)))
    },
    metrics: {
      likes: toNumber(item.likes ?? item.num_likes ?? item?.num_likes_type?.num),
      comments: toNumber(item.num_comments),
      shares: toNumber(item.num_shares),
      views: toNumber(item.video_view_count ?? item.play_count)
    },
    source: {
      provider: "public-content",
      collectedAt: item.timestamp || null,
      rawPlatform: "facebook"
    }
  };
}

export function normalizeRawPayloads(rawByPlatform) {
  const normalized = [];
  for (const item of readRawPlatformItems(rawByPlatform, "linkedin")) {
    normalized.push(normalizeLinkedinItem(item));
  }
  for (const item of readRawPlatformItems(rawByPlatform, "youtube")) {
    normalized.push(normalizeYoutubeItem(item));
  }
  for (const item of readRawPlatformItems(rawByPlatform, "facebook")) {
    normalized.push(normalizeFacebookItem(item));
  }
  const deduped = [];
  const seen = new Set();
  for (const item of normalized) {
    if (!item.url || !item.postId) continue;
    const key = `${item.platform}:${item.postId}:${item.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  return deduped
    .map((item) => ({
      ...item,
      engagementScore: scoreEngagement(item.metrics)
    }))
    .sort((left, right) => right.engagementScore - left.engagementScore);
}

function readRawPlatformItems(rawByPlatform, platform) {
  const value = rawByPlatform?.[platform];
  return Array.isArray(value) ? value : [];
}

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  const rawDir = requireArg(args, "raw-dir");
  const output = requireArg(args, "output");

  const rawByPlatform = {};
  for (const platform of ["linkedin", "youtube", "facebook"]) {
    const filePath = path.join(rawDir, `${platform}.json`);
    try {
      rawByPlatform[platform] = readJson(filePath);
    } catch {
      rawByPlatform[platform] = [];
    }
  }

  const normalized = normalizeRawPayloads(rawByPlatform);
  writeJson(output, {
    itemCount: normalized.length,
    items: normalized
  });
  io.log(JSON.stringify({ output: path.resolve(output), itemCount: normalized.length }, null, 2));
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
