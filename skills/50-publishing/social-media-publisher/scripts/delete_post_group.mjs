#!/usr/bin/env node

import {
  isDirectRun,
  parseArgs,
  socialPublishingJson,
  requireArg,
  writeJson
} from "./lib/social_publishing_common.mjs";
import {
  assertExecutionApproval,
  buildApprovalRequest,
  flagEnabled,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/execution_approval.mjs";

function usage() {
  console.error(
    "Usage: node delete_post_group.mjs --group <group-id> --output <delete-group.json> [--execute --approval-file <approval.json>]"
  );
}

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  if (args.help) {
    usage();
    return;
  }
  const group = requireArg(args, "group");
  const output = requireArg(args, "output");
  const execute = flagEnabled(args.execute);
  const approvalPayload = { group };

  if (!execute) {
    const envelope = {
      requestedAt: new Date().toISOString(),
      group,
      executed: false,
      result: null,
      approvalRequest: buildApprovalRequest({
        action: "social-media-publisher.delete-post-group",
        payload: approvalPayload,
        summary: { group },
      }),
    };
    writeJson(output, envelope);
    io.log(JSON.stringify(envelope, null, 2));
    return;
  }

  assertExecutionApproval({
    approvalPath: args["approval-file"],
    action: "social-media-publisher.delete-post-group",
    payload: approvalPayload,
  });

  const payload = await socialPublishingJson(`/posts/group/${group}`, { method: "DELETE" }, { args });

  const envelope = {
    requestedAt: new Date().toISOString(),
    group,
    executed: true,
    result: payload,
  };

  writeJson(output, envelope);
  io.log(JSON.stringify(envelope, null, 2));
}

if (isDirectRun(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
