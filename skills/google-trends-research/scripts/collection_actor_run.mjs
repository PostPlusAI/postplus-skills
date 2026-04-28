#!/usr/bin/env node

import { runCollectionActor } from "../_postplus_shared/shared-collection/scripts/collection_actor_run.mjs";

runCollectionActor(process.argv.slice(2), {
  commandName: "skills/google-trends-research/scripts/collection_actor_run.mjs",
  skillName: "google-trends-research",
  actionName: "collection_actor_run",
}).catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
