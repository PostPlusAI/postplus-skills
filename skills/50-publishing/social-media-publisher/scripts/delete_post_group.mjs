#!/usr/bin/env node

import {
  isDirectRun,
  parseArgs,
  postizJson,
  requireArg,
  writeJson
} from "./lib/postiz_common.mjs";

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  const group = requireArg(args, "group");
  const output = args.output;

  const payload = await postizJson(`/posts/group/${group}`, { method: "DELETE" }, { args });

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
