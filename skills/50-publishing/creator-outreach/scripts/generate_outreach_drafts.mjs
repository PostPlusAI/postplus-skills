#!/usr/bin/env node

import {
  cleanString,
  parseArgs,
  readJson,
  writeJson
} from "./lib/outreach_common.mjs";

function usage() {
  console.error(
    "Usage: node generate_outreach_drafts.mjs --leads <enriched-leads.json> --brief <brand-brief.json> [--output <drafts.json>]"
  );
}

function buildSubject(lead, brief) {
  return `${brief.brandName} x ${lead.displayName || lead.username}`;
}

function buildBody(lead, brief) {
  const name = lead.displayName || lead.username || "there";
  const niche = cleanString(brief.niche) || "your content";
  const offer = cleanString(brief.offer) || "a potential collaboration";
  const cta = cleanString(brief.cta) || "Would you be open to a quick chat?";
  const whyYou =
    cleanString(lead.suggestedAngle) ||
    cleanString(brief.whyYou) ||
    `your work around ${niche}`;
  const product = cleanString(brief.productName) || brief.brandName;

  return [
    `Hi ${name},`,
    "",
    `I'm reaching out from ${brief.brandName}. We've been following ${whyYou}, and there looks to be a strong fit with ${product}.`,
    "",
    `We'd love to explore ${offer}.`,
    "",
    cta,
    "",
    cleanString(brief.signature) || brief.brandName
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.leads || !args.brief) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const leadsPayload = readJson(args.leads);
  const brief = readJson(args.brief);
  const items = (leadsPayload.items || []).map((lead) => ({
    ...lead,
    draftSubject: buildSubject(lead, brief),
    draftBody: buildBody(lead, brief)
  }));

  const output = {
    generatedAt: new Date().toISOString(),
    brief,
    itemCount: items.length,
    items
  };

  if (args.output) {
    writeJson(args.output, output);
    console.log(`Saved ${output.itemCount} outreach drafts to ${args.output}`);
    return;
  }

  console.log(JSON.stringify(output, null, 2));
}

main();
