#!/usr/bin/env node

import path from "node:path";
import { buildAccountActorInput, parseArgs, readJson, writeJson } from "./lib/account_common.mjs";

function usage() {
  console.error(
    "Usage: node build_xhs_account_actor_input.mjs --brief <brief.json> [--output <input.json>]"
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.brief) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const brief = readJson(args.brief);
  const input = buildAccountActorInput(brief);
  if (args.output) {
    writeJson(args.output, input);
    console.log(`Saved XHS account actor input to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify({
    briefPath: path.resolve(args.brief),
    brief,
    input
  }, null, 2));
}

main();
