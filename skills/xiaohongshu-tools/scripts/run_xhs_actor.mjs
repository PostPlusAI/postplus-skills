#!/usr/bin/env node

import { runCollectionActor } from "../_postplus_shared/shared-collection/scripts/collection_actor_run.mjs";

runCollectionActor(process.argv.slice(2), {
  commandName: "skills/xiaohongshu-tools/scripts/run_xhs_actor.mjs",
  skillName: "xiaohongshu-tools",
  actionName: "run_xhs_actor",
}).catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
