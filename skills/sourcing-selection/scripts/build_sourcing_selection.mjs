#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/shared-runtime/scripts/lib/local_skill_cli.mjs";

export function buildSourcingSelection(input = {}) {
  return {
    decision: input.decision || "investigate_further",
    demandSignals:
      Array.isArray(input.demandSignals) && input.demandSignals.length > 0
        ? input.demandSignals
        : ["Amazon reviews stable", "TikTok language fit visible"],
    rationale:
      Array.isArray(input.rationale) && input.rationale.length > 0
        ? input.rationale
        : [
            "supply-side price structure is workable",
            "channel demand signals are present but not conclusive",
          ],
    supplySignals:
      Array.isArray(input.supplySignals) && input.supplySignals.length > 0
        ? input.supplySignals
        : ["MOQ acceptable", "multiple supplier options"],
  };
}

function usage() {
  console.error(
    "Usage: node build_sourcing_selection.mjs [--input <input.json>] [--output <decision.json>]",
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    usage();
    process.exitCode = 0;
    return;
  }

  const input = args.input ? readJson(args.input) : {};
  const payload = buildSourcingSelection(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
