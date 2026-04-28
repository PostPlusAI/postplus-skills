#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../../shared-runtime/scripts/lib/local_skill_cli.mjs";

export function buildXhsNoteDraft(input = {}) {
  return {
    angle: input.angle || "professional memo",
    hook: input.hook || "Most teams are fixing the wrong problem first.",
    mode: input.mode || "structure-and-clarify",
    sections:
      Array.isArray(input.sections) && input.sections.length > 0
        ? input.sections
        : [
            "opening judgment",
            "lived proof",
            "practical breakdown",
            "closing judgment",
          ],
  };
}

function usage() {
  console.error(
    "Usage: node build_xhs_note_draft.mjs [--input <input.json>] [--output <note.json>]",
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
  const payload = buildXhsNoteDraft(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
