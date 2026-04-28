#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { formatCliError } from "../_postplus_shared/shared-runtime/scripts/lib/network_runtime.mjs";

import {
  isDirectRun,
  parseArgs,
  postizUploadFile,
  requireArg,
  writeJson
} from "./lib/postiz_common.mjs";

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  const input = requireArg(args, "input");
  const output = args.output;
  const absoluteInput = path.resolve(input);

  if (!fs.existsSync(absoluteInput)) {
    throw new Error(`Upload file input does not exist: ${absoluteInput}`);
  }

  const payload = await postizUploadFile(absoluteInput, { args });

  if (output) {
    writeJson(output, payload);
  }

  io.log(JSON.stringify(payload, null, 2));
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(formatCliError(error));
    process.exit(1);
  });
}
