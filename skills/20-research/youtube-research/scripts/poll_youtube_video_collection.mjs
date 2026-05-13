#!/usr/bin/env node

import { main as runMain } from "../internal/public-content/scripts/poll_public_content_collection.mjs";
import { isDirectRun } from "../internal/public-content/scripts/lib/public_content_common.mjs";

export async function main(argv = process.argv.slice(2), io = console) {
  return runMain(argv, io);
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
