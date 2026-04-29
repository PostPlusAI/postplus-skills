#!/usr/bin/env node

import { runCollectionActor } from "../_postplus_shared/00-core/shared-collection/scripts/collection_actor_run.mjs";

runCollectionActor(process.argv.slice(2), {
  commandName: "skills/20-research/instagram-tools/scripts/run_instagram_actor.mjs",
  skillName: "instagram-tools",
  actionName: "run_instagram_actor",
}).catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
