#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../_postplus_shared/shared-runtime/scripts/lib/local_skill_cli.mjs";

export function buildXhsCardNotesPackage(input = {}) {
  const pages =
    Array.isArray(input.pages) && input.pages.length > 0
      ? input.pages
      : [
          { pageRole: "cover", headline: "别再把这件事讲复杂了" },
          { pageRole: "body", headline: "先把最贵的错误说清楚" },
        ];

  return {
    cardCount: pages.length,
    coverCopy: pages[0]?.headline || null,
    pages,
  };
}

function usage() {
  console.error(
    "Usage: node build_xhs_card_notes_package.mjs [--input <input.json>] [--output <cards.json>]",
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
  const payload = buildXhsCardNotesPackage(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
