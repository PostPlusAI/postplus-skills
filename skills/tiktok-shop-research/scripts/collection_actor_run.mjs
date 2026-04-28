#!/usr/bin/env node

import { runCollectionActor } from "../../shared-collection/scripts/collection_actor_run.mjs";

runCollectionActor(process.argv.slice(2), {
  commandName: "skills/tiktok-shop-research/scripts/collection_actor_run.mjs",
  skillName: "tiktok-shop-research",
  actionName: "collection_actor_run",
}).catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
