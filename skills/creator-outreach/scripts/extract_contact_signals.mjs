#!/usr/bin/env node

import {
  cleanString,
  extractEmails,
  normalizeUrl,
  parseArgs,
  readJson,
  writeJson
} from "./lib/outreach_common.mjs";

function usage() {
  console.error(
    "Usage: node extract_contact_signals.mjs --input <leads.json> [--output <enriched-leads.json>]"
  );
}

function enrichLead(lead) {
  const bio = cleanString(lead.bio) || "";
  const website = normalizeUrl(lead.website);
  const emailsFromBio = extractEmails(bio);
  const signals = [];

  for (const email of emailsFromBio) {
    signals.push({
      type: "email",
      value: email,
      source: "bio"
    });
  }

  if (website) {
    signals.push({
      type: "website",
      value: website,
      source: "profile"
    });
  }

  const contactEmail = emailsFromBio[0] || null;
  const fitReasons = [...(lead.fitReasons || [])];
  let contactability = "no_public_contact";
  if (contactEmail) {
    fitReasons.push("public email found");
    contactability = "email";
  } else if (website) {
    fitReasons.push("public website found");
    contactability = "link_only";
  }

  return {
    ...lead,
    website,
    contactability,
    contactEmail,
    contactEmailSource: contactEmail ? "bio" : null,
    contactSignals: signals,
    outreachReady: Boolean(contactEmail || website),
    fitReasons
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const payload = readJson(args.input);
  const items = Array.isArray(payload.items) ? payload.items.map(enrichLead) : [];

  const output = {
    ...payload,
    enrichedAt: new Date().toISOString(),
    itemCount: items.length,
    items
  };

  if (args.output) {
    writeJson(args.output, output);
    console.log(`Saved ${output.itemCount} enriched leads to ${args.output}`);
    return;
  }

  console.log(JSON.stringify(output, null, 2));
}

main();
