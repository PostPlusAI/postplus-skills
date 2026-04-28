#!/usr/bin/env node

import path from "node:path";
import {
  cleanString,
  compileBriefToActorRequest,
  parseArgs,
  readJson,
  writeJson
} from "./lib/xhs_common.mjs";

function usage() {
  console.error(
    "Usage: node build_xhs_benchmark_actor_input.mjs --brief <brief.json> [--actor <actor-id>] [--output <input.json>]"
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
  const compiled = compileBriefToActorRequest(brief, {
    actorId: cleanString(args.actor)
  });

  const payload = {
    compiledAt: new Date().toISOString(),
    briefPath: path.resolve(args.brief),
    brief,
    ...compiled
  };

  if (args.output) {
    writeJson(args.output, compiled.input);
    console.log(`Saved XHS actor input to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
