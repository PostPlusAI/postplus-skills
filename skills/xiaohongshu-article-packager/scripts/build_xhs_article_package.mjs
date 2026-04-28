#!/usr/bin/env node

import {
  isMainModule,
  parseArgs,
  printOrWriteJson,
  readJson,
} from "../../shared-runtime/scripts/lib/local_skill_cli.mjs";

export function buildXhsArticlePackage(input = {}) {
  return {
    files:
      Array.isArray(input.files) && input.files.length > 0
        ? input.files
        : [
            "01-outline.md",
            "02-titles.md",
            "03-pages.md",
            "05-layout-brief.md",
          ],
    layoutBrief: input.layoutBrief || "source-preserving page layout",
    pageCount: Number.isFinite(input.pageCount) ? input.pageCount : 6,
  };
}

function usage() {
  console.error(
    "Usage: node build_xhs_article_package.mjs [--input <input.json>] [--output <package.json>]",
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
  const payload = buildXhsArticlePackage(input);
  printOrWriteJson(args.output, payload);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
