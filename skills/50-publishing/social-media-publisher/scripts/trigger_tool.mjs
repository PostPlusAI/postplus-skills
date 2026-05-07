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
  const integrationId = requireArg(args, "integration-id");
  const methodName = requireArg(args, "method");
  const output = args.output;
  const data = args.data ? JSON.parse(args.data) : {};

  const payload = await socialPublishingJson(
    `/integration-trigger/${integrationId}`,
    {
      method: "POST",
      body: {
        methodName,
        data
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
