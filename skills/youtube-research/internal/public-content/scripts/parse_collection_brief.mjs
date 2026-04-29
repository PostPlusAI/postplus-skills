#!/usr/bin/env node

import {
  classifyPlatformFromUrl,
  clampRequestedCount,
  detectPlatforms,
  detectUnsupportedPlatforms,
  extractUrls,
  formatSupportedPlatforms,
  isDirectRun,
  normalizeSupportedPlatforms,
  parseArgs,
  parseRequestedCount,
  requireArg,
  writeJson
} from "./lib/public_content_common.mjs";

export function buildBrief({
  requestText = "",
  urls = [],
  platforms = [],
  resultCount = null,
  supportedPlatforms
}) {
  const allowedPlatforms = normalizeSupportedPlatforms(supportedPlatforms);
  const unsupportedPlatforms = detectUnsupportedPlatforms(requestText);
  if (unsupportedPlatforms.length > 0) {
    throw new Error(
      `Public content public content discovery does not support: ${unsupportedPlatforms.join(", ")}`
    );
  }

  const requestUrls = urls.length > 0 ? urls : extractUrls(requestText);
  const explicitPlatforms = platforms.length > 0 ? platforms : detectPlatforms(requestText);
  const inferredPlatforms = Array.from(
    new Set([
      ...explicitPlatforms,
      ...requestUrls.map((item) => classifyPlatformFromUrl(item)).filter(Boolean)
    ])
  );
  const disallowedPlatforms = inferredPlatforms.filter((item) => !allowedPlatforms.includes(item));
  if (disallowedPlatforms.length > 0) {
    throw new Error(
      `This Public content workflow only supports: ${formatSupportedPlatforms(allowedPlatforms)}`
    );
  }

  return {
    requestText: String(requestText || "").trim(),
    resultCount: clampRequestedCount(resultCount || parseRequestedCount(requestText, 10)),
    platforms: inferredPlatforms.length > 0 ? inferredPlatforms : allowedPlatforms,
    urls: requestUrls
  };
}

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  const requestText = args.request ? String(args.request) : "";
  const urls = args.urls ? String(args.urls).split(",").map((item) => item.trim()).filter(Boolean) : [];
  const platforms = args.platforms ? String(args.platforms).split(",").map((item) => item.trim()).filter(Boolean) : [];
  const output = requireArg(args, "output");

  const brief = buildBrief({
    requestText,
    urls,
    platforms,
    resultCount: args["result-count"] ? Number(args["result-count"]) : null
  });

  writeJson(output, brief);
  io.log(JSON.stringify(brief, null, 2));
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
