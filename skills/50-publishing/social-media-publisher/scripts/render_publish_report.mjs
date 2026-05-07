#!/usr/bin/env node

import { maybeRegisterCampaignReport } from "../_postplus_shared/scripts/lib/campaign-report-manifest.mjs";
import {
  isDirectRun,
  parseArgs,
  readJson,
  requireArg,
  writeText
} from "./lib/social_publishing_common.mjs";

function formatPostLines(resultEnvelope) {
  const posts = Array.isArray(resultEnvelope?.result) ? resultEnvelope.result : [];
  if (!posts.length) {
    return "- No posts returned by social publishing service.";
  }

  return posts
    .map((post) => {
      const parts = [
        `- Post ${post.postId ?? "unknown"}`,
        post.integration ? `integration: ${post.integration}` : null
      ].filter(Boolean);
      return parts.join(" | ");
    })
    .join("\n");
}

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  const requestPath = requireArg(args, "request");
  const resultPath = requireArg(args, "result");
  const output = requireArg(args, "output");

  const request = readJson(requestPath);
  const resultEnvelope = readJson(resultPath);

  const integrationIds = request.posts.map((post) => String(post.integrationId)).join(", ");
  const report = `# Social Media Publish Summary

## Status

- Type: ${request.type}
- Date: ${request.date}
- Integrations: ${integrationIds}
- Created posts: ${resultEnvelope.summary?.created ?? 0}
- Post IDs: ${(resultEnvelope.summary?.postIds ?? []).join(", ") || "unknown"}

## Request Files

- Request: ${requestPath}
- Result: ${resultPath}

## Posts

${formatPostLines(resultEnvelope)}
`;

  writeText(output, report);
  maybeRegisterCampaignReport(output, { label: "Social Media Publish Summary" });
  io.log(output);
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
