#!/usr/bin/env node

import {
  isDirectRun,
  parseArgs,
  postizJson,
  requireArg,
  writeJson,
} from "./lib/postiz_common.mjs";
import {
  assertExecutionApproval,
  buildApprovalRequest,
  flagEnabled,
} from "../../shared-runtime/scripts/lib/execution_approval.mjs";

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  const postId = requireArg(args, "post-id");
  const status = requireArg(args, "status");
  const output = requireArg(args, "output");
  const execute = flagEnabled(args.execute);

  if (!["draft", "schedule"].includes(status)) {
    throw new Error(`Unsupported status ${status}. Use draft or schedule.`);
  }

  const approvalPayload = {
    postId,
    status,
  };

  if (!execute) {
    const envelope = {
      requestedAt: new Date().toISOString(),
      postId,
      status,
      executed: false,
      result: null,
      approvalRequest: buildApprovalRequest({
        action: "social-media-publisher.change-post-status",
        payload: approvalPayload,
        summary: {
          postId,
          status,
        },
      }),
    };
    writeJson(output, envelope);
    io.log(JSON.stringify(envelope, null, 2));
    return;
  }

  assertExecutionApproval({
    approvalPath: args["approval-file"],
    action: "social-media-publisher.change-post-status",
    payload: approvalPayload,
  });

  const result = await postizJson(`/posts/${postId}/status`, {
    method: "PUT",
    body: { status },
  });

  const envelope = {
    requestedAt: new Date().toISOString(),
    postId,
    status,
    executed: true,
    result,
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
