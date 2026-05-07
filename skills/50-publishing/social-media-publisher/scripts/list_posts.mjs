#!/usr/bin/env node

import {
  buildDateRange,
  isDirectRun,
  parseArgs,
  socialPublishingJson,
  writeJson
} from "./lib/social_publishing_common.mjs";

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  const output = args.output;
  const range = buildDateRange({
    startDate: args["start-date"],
    endDate: args["end-date"],
    days: args.days ? Number(args.days) : 30
  });

  const searchParams = new URLSearchParams({
    startDate: range.startDate,
    endDate: range.endDate
  });

  if (args.customer) {
    searchParams.set("customer", String(args.customer));
  }

  const payload = await socialPublishingJson(`/posts?${searchParams.toString()}`, {}, { args });

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
