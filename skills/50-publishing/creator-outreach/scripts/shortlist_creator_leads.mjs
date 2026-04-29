#!/usr/bin/env node

import {
  parseArgs,
  readJson,
  splitCsv,
  writeJson
} from "./lib/outreach_common.mjs";

function usage() {
  console.error(
    "Usage: node shortlist_creator_leads.mjs --input <scored-leads.json> [--recommendations strong_yes,maybe] [--min-score 40] [--platforms tiktok,instagram] [--require-email] [--top 25] [--output <shortlist.json>]"
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const payload = readJson(args.input);
  const minScore = Number(args["min-score"] || 40);
  const top = Number(args.top || 25);
  const platforms = splitCsv(args.platforms);
  const recommendations = splitCsv(args.recommendations || "strong_yes,maybe");
  const requireEmail = Boolean(args["require-email"]);

  const items = (payload.items || [])
    .filter((lead) => !recommendations.length || recommendations.includes(lead.recommendation))
    .filter((lead) => (lead.fitScore || 0) >= minScore)
    .filter((lead) => !platforms.length || platforms.includes(lead.platform))
    .filter((lead) => !requireEmail || Boolean(lead.contactEmail))
    .sort((left, right) => (right.fitScore || 0) - (left.fitScore || 0))
    .slice(0, top);

  const output = {
    generatedAt: new Date().toISOString(),
    sourceGeneratedAt: payload.scoredAt || payload.generatedAt || null,
    filters: {
      recommendations,
      minScore,
      top,
      platforms,
      requireEmail
    },
    itemCount: items.length,
    items
  };

  if (args.output) {
    writeJson(args.output, output);
    console.log(`Saved ${output.itemCount} shortlisted leads to ${args.output}`);
    return;
  }

  console.log(JSON.stringify(output, null, 2));
}

main();
