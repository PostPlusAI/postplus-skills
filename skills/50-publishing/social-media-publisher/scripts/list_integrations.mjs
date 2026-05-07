#!/usr/bin/env node

import {
  isDirectRun,
  parseArgs,
  socialPublishingJson,
  writeJson
} from "./lib/social_publishing_common.mjs";

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  const provider = args.provider ? String(args.provider) : null;
  const includeDisabled = args["include-disabled"] === "true";
  const output = args.output;

  let integrations = await socialPublishingJson("/integrations", {}, { args });

  if (!includeDisabled) {
    integrations = integrations.filter((integration) => !integration.disabled);
  }

  if (provider) {
    integrations = integrations.filter(
      (integration) => integration.identifier === provider
    );
  }

  if (output) {
    writeJson(output, integrations);
  }

  io.log(JSON.stringify(integrations, null, 2));
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
