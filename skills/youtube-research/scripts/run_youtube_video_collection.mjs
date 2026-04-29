#!/usr/bin/env node

import { main as runMain } from "../internal/public-content/scripts/run_public_content_collection.mjs";
import { isDirectRun } from "../internal/public-content/scripts/lib/public_content_common.mjs";

const SUPPORTED_PLATFORMS = ["youtube"];

export async function main(argv = process.argv.slice(2), io = console, fetchImpl = globalThis.fetch) {
  return runMain(argv, io, fetchImpl, { supportedPlatforms: SUPPORTED_PLATFORMS });
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
