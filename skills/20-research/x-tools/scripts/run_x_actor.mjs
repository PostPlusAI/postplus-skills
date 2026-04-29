#!/usr/bin/env node

import { runCollectionActor } from "../_postplus_shared/00-core/shared-collection/scripts/collection_actor_run.mjs";

runCollectionActor(process.argv.slice(2), {
  commandName: "skills/20-research/x-tools/scripts/run_x_actor.mjs",
  skillName: "x-tools",
  actionName: "run_x_actor",
}).catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
