#!/usr/bin/env node

import { runCollectionActor } from "../../shared-collection/scripts/collection_actor_run.mjs";

runCollectionActor(process.argv.slice(2), {
  commandName: "skills/x-tools/scripts/run_x_actor.mjs",
  skillName: "x-tools",
  actionName: "run_x_actor",
}).catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
