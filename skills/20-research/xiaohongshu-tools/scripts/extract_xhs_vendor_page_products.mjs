#!/usr/bin/env node

import path from "node:path";
import {
  parseArgs,
  writeJson
} from "./lib/xhs_common.mjs";
import fs from "node:fs";

function usage() {
  console.error(
    "Usage: node extract_xhs_vendor_page_products.mjs --input <vendor-page.html> --seller-id <seller-id> [--output <raw-products.json>]"
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input || !args["seller-id"]) {
    usage();
    process.exitCode = args.help ? 0 : 1;
    return;
  }

  const html = fs.readFileSync(path.resolve(args.input), "utf8");
  const sellerId = args["seller-id"];
  const pattern = new RegExp(`\\{"id":"[^"]+","sellerId":"${sellerId}".*?"trackId":"[^"]+"\\}`, "g");
  const matches = html.match(pattern) || [];

  const items = matches.map((raw) => {
    const normalized = raw.replace(/\\u002F/g, "/");
    return JSON.parse(normalized);
  });

  const payload = {
    sourceId: null,
    sourceType: "live-vendor-page",
    sellerId,
    fetchedAt: new Date().toISOString(),
    input: {
      htmlPath: path.resolve(args.input)
    },
    itemCount: items.length,
    items
  };

  if (args.output) {
    writeJson(args.output, payload);
    console.log(`Saved ${items.length} extracted products to ${path.resolve(args.output)}`);
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

main();
