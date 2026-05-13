#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runCollectionActor } from "../_postplus_shared/00-core/shared-collection/scripts/collection_actor_run.mjs";
import { readHostedSkillExecutionInput } from "../_postplus_shared/00-core/shared-runtime/scripts/lib/hosted_execution_protocol.mjs";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith("--")) {
      continue;
    }
    const key = current.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

export function validateGoogleTrendsFastInput(input) {
  if (!input || typeof input !== "object") {
    return;
  }
  if (
    typeof input.keyword === "string" &&
    input.keyword.trim().length > 0 &&
    input.enableTrendingSearches !== false
  ) {
    throw new Error(
      "google-trends-fast keyword analysis requires enableTrendingSearches: false because the hosted actor ignores keyword fields when trending mode is enabled.",
    );
  }
}

function validateRequest(argv) {
  const args = parseArgs(argv);
  if (args["collection-key"] !== "google-trends-fast" || !args.input) {
    return;
  }
  const inputPath = path.resolve(String(args.input));
  const input = readHostedSkillExecutionInput(
    JSON.parse(fs.readFileSync(inputPath, "utf8")),
  );
  validateGoogleTrendsFastInput(input);
}

const isDirectRun =
  path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const argv = process.argv.slice(2);

  try {
    validateRequest(argv);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  runCollectionActor(argv, {
    commandName: "skills/20-research/google-trends-research/scripts/collection_actor_run.mjs",
    skillName: "google-trends-research",
    actionName: "collection_actor_run",
  }).catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
