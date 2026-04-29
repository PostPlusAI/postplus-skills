#!/usr/bin/env node

import {
  SOURCE_IDS,
  classifyPlatformFromUrl,
  formatSupportedPlatforms,
  isDirectRun,
  normalizeSupportedPlatforms,
  parseArgs,
  readJson,
  requireArg,
  writeJson
} from "./lib/public_content_common.mjs";
import {
  canonicalizeFacebookUrl,
  classifyFacebookCollectionTarget
} from "./lib/facebook_urls.mjs";

export function buildCollectionPlan(brief, options = {}) {
  const allowedPlatforms = normalizeSupportedPlatforms(options.supportedPlatforms);
  const DEFAULT_FACEBOOK_PROFILE_POST_LIMIT = 3;
  const urls = Array.isArray(brief.urls) ? brief.urls : [];
  if (urls.length === 0) {
    throw new Error(
      `Public content workflow requires explicit ${formatSupportedPlatforms(allowedPlatforms)} public URLs`
    );
  }

  const items = [];
  for (const url of urls) {
    const platform = classifyPlatformFromUrl(url);
    if (!platform) {
      throw new Error(`Unsupported URL for Public content v1: ${url}`);
    }
    if (!allowedPlatforms.includes(platform)) {
      throw new Error(
        `This Public content workflow only supports: ${formatSupportedPlatforms(allowedPlatforms)}`
      );
    }
    if (platform === "linkedin") {
      items.push({
        platform,
        sourceId: SOURCE_IDS.linkedinPosts,
        url,
        input: { url }
      });
      continue;
    }
    if (platform === "youtube") {
      items.push({
        platform,
        sourceId: SOURCE_IDS.youtubeVideos,
        url,
        input: { url }
      });
      continue;
    }
    if (platform === "facebook") {
      const canonicalUrl = canonicalizeFacebookUrl(url);
      const target = classifyFacebookCollectionTarget(canonicalUrl);
      const sourceId =
        target === "group"
          ? SOURCE_IDS.facebookGroupPosts
          : target === "post"
            ? SOURCE_IDS.facebookPostByUrl
            : SOURCE_IDS.facebookProfilePosts;
      items.push({
        platform,
        sourceId,
        url: canonicalUrl,
        target,
        input:
          target === "post"
            ? { url: canonicalUrl }
            : {
                url: canonicalUrl,
                num_of_posts: Math.max(
                  1,
                  Math.min(
                    Number(brief.resultCount || DEFAULT_FACEBOOK_PROFILE_POST_LIMIT),
                    DEFAULT_FACEBOOK_PROFILE_POST_LIMIT
                  )
                ),
              }
      });
      continue;
    }
  }

  return {
    requestedAt: new Date().toISOString(),
    requestText: brief.requestText || "",
    itemCount: items.length,
    items
  };
}

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  const briefPath = requireArg(args, "brief");
  const output = requireArg(args, "output");
  const brief = readJson(briefPath);
  const plan = buildCollectionPlan(brief, {
    supportedPlatforms: brief.platforms
  });
  writeJson(output, plan);
  io.log(JSON.stringify(plan, null, 2));
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
