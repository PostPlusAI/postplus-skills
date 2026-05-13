#!/usr/bin/env node

import path from "node:path";

import { normalizeRawPayloads } from "./normalize_public_posts.mjs";
import { renderSummary } from "./render_collection_summary.mjs";
import {
  publicContentSnapshotStatus,
  ensureDir,
  isPublicContentPendingResult,
  isDirectRun,
  parseArgs,
  readJson,
  requireArg,
  summarizePlatformItems,
  writeJson,
  writeText
} from "./lib/public_content_common.mjs";

function readJsonIfExists(filePath, fallback = null) {
  try {
    return readJson(filePath);
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

function summarizeReadyResult(sourceId, result) {
  return {
    sourceId,
    ...summarizePlatformItems(
      (Array.isArray(result) ? result : []).map((item) => ({
        metrics: {
          likes: item.likes ?? item.num_likes ?? item.digg_count ?? null,
          comments:
            item.comments ?? item.num_comments ?? item.comment_count ?? null,
          shares: item.shares ?? item.num_shares ?? item.share_count ?? null,
          views: item.views ?? item.play_count ?? null
        }
      }))
    )
  };
}

function summarizePending(sourceId, result, fallbackSnapshotId) {
  return {
    sourceId,
    status: "pending",
    runHandle: result.runHandle || fallbackSnapshotId,
    snapshotId: result.snapshotId || result.runHandle || fallbackSnapshotId
  };
}

export async function main(
  argv = process.argv.slice(2),
  io = console
) {
  const args = parseArgs(argv);
  const reportPath = path.resolve(requireArg(args, "collection-report"));
  const report = readJson(reportPath);
  const outputDir = path.resolve(args["output-dir"] || report.outputDir || path.dirname(reportPath));
  const rawDir = path.join(outputDir, "raw");
  const normalizedDir = path.join(outputDir, "normalized");
  const analysisDir = path.join(outputDir, "analysis");
  const currentSummary =
    report.summary && typeof report.summary === "object" ? report.summary : {};
  const raw = {};
  const nextSummary = {};

  ensureDir(rawDir);
  ensureDir(normalizedDir);
  ensureDir(analysisDir);

  for (const [platform, item] of Object.entries(currentSummary)) {
    const sourceId = item?.sourceId || null;
    const snapshotId = item?.snapshotId || item?.runHandle || null;
    const rawPath = path.join(rawDir, `${platform}.json`);

    if (item?.status !== "pending" || !snapshotId) {
      raw[platform] = readJsonIfExists(rawPath, []);
      nextSummary[platform] = item;
      continue;
    }

    const result = await publicContentSnapshotStatus({ snapshotId });
    raw[platform] = result;
    writeJson(rawPath, result);
    nextSummary[platform] = isPublicContentPendingResult(result)
      ? summarizePending(sourceId, result, snapshotId)
      : summarizeReadyResult(sourceId, result);
  }

  for (const platform of ["linkedin", "youtube", "facebook"]) {
    if (!Object.hasOwn(raw, platform)) {
      raw[platform] = readJsonIfExists(path.join(rawDir, `${platform}.json`), []);
    }
  }

  const normalizedItems = normalizeRawPayloads(raw);
  const normalized = {
    itemCount: normalizedItems.length,
    items: normalizedItems
  };
  const pendingPlatforms = Object.entries(nextSummary)
    .filter(([, value]) => value?.status === "pending")
    .map(([platform]) => platform);
  const nextReport = {
    requestedAt: report.requestedAt || new Date().toISOString(),
    checkedAt: new Date().toISOString(),
    outputDir,
    pendingPlatforms,
    summary: nextSummary
  };

  writeJson(path.join(outputDir, "collection-report.json"), nextReport);
  writeJson(path.join(normalizedDir, "posts.json"), normalized);
  writeText(path.join(analysisDir, "summary.md"), renderSummary(normalized));

  io.log(
    JSON.stringify(
      {
        outputDir,
        itemCount: normalized.itemCount,
        pending: pendingPlatforms.length,
        pendingPlatforms,
        summary: nextSummary
      },
      null,
      2
    )
  );
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
