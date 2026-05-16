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
    "Usage: node update_release_id.mjs --post-id <post-id> --release-id <release-id> --output <release-id.json> [--execute --approval-file <approval.json>]"
  );
}

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  if (args.help) {
    usage();
    return;
  }
  const postId = requireArg(args, "post-id");
  const releaseId = requireArg(args, "release-id");
  const output = requireArg(args, "output");
  const execute = flagEnabled(args.execute);
  const approvalPayload = { postId, releaseId };

  if (!execute) {
    const envelope = {
      requestedAt: new Date().toISOString(),
      postId,
      releaseId,
      executed: false,
      result: null,
      approvalRequest: buildApprovalRequest({
        action: "social-media-publisher.update-release-id",
        payload: approvalPayload,
        summary: { postId, releaseId },
      }),
    };
    writeJson(output, envelope);
    io.log(JSON.stringify(envelope, null, 2));
    return;
  }

  assertExecutionApproval({
    approvalPath: args["approval-file"],
    action: "social-media-publisher.update-release-id",
    payload: approvalPayload,
  });

  const payload = await socialPublishingJson(
    `/posts/${postId}/release-id`,
    {
      method: "PUT",
      body: {
        releaseId
      }
    },
    { args }
  );

  const envelope = {
    requestedAt: new Date().toISOString(),
    postId,
    releaseId,
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
