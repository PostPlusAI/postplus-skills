#!/usr/bin/env node

import {
  isDirectRun,
  parseArgs,
  socialPublishingJson,
  requireArg,
  writeJson
} from "./lib/social_publishing_common.mjs";

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  const postId = requireArg(args, "post-id");
  const releaseId = requireArg(args, "release-id");
  const output = args.output;

  const payload = await socialPublishingJson(
    `/posts/${postId}/release-id`,
    {
      method: "PUT",
      body: {
        releaseId
      }
    },
    { args }
  );

  if (output) {
    writeJson(output, payload);
  }

  io.log(JSON.stringify(payload, null, 2));
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
