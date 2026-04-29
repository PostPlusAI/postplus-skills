#!/usr/bin/env node

import {
  isDirectRun,
  parseArgs,
  postizJson,
  writeJson
} from "./lib/postiz_common.mjs";

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  const output = args.output;
  const page = args.page ? Number(args.page) : 0;
  if (!Number.isInteger(page) || page < 0) {
    throw new Error("Notifications page must be a non-negative integer.");
  }

  const searchParams = new URLSearchParams({
    page: String(page)
  });

  const payload = await postizJson(`/notifications?${searchParams.toString()}`, {}, { args });

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
