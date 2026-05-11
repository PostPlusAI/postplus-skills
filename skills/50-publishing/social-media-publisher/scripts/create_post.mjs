#!/usr/bin/env node

import {
  assertAllowedIntegrationIds,
  isDirectRun,
  parseArgs,
  socialPublishingJson,
  readCustomerConfig,
  readHostedJson,
  requireArg,
  summarizeCreateResult,
  toSocialPublishingCreatePayload,
  writeJson
} from "./lib/social_publishing_common.mjs";
import {
  assertExecutionApproval,
  buildApprovalRequest,
  flagEnabled,
} from "../_postplus_shared/00-core/shared-runtime/scripts/lib/execution_approval.mjs";

export async function main(argv = process.argv.slice(2), io = console) {
  const args = parseArgs(argv);
  const requestPath = requireArg(args, "request");
  const customerConfigPath = requireArg(args, "customer-config");
  const output = requireArg(args, "output");
  const execute = flagEnabled(args.execute);

  const request = readHostedJson(requestPath);
  const customerConfig = readCustomerConfig(customerConfigPath);
  const integrationIds = request.posts.map((post) => String(post.integrationId));
  assertAllowedIntegrationIds(customerConfig, integrationIds);

  const payload = toSocialPublishingCreatePayload(request);
  const approvalPayload = {
    customerConfigPath,
    payload,
    requestPath,
  };

  if (!execute) {
    const envelope = {
      requestedAt: new Date().toISOString(),
      requestPath,
      customerConfigPath,
      payload,
      result: null,
      executed: false,
      summary: summarizeCreateResult([]),
      approvalRequest: buildApprovalRequest({
        action: "social-media-publisher.create-post",
        payload: approvalPayload,
        summary: {
          integrationIds,
          type: payload.type,
        },
      }),
    };

    writeJson(output, envelope);
    io.log(JSON.stringify(envelope, null, 2));
    return;
  }

  assertExecutionApproval({
    approvalPath: args["approval-file"],
    action: "social-media-publisher.create-post",
    payload: approvalPayload,
  });

  const result = await socialPublishingJson(
    "/posts",
    {
      method: "POST",
      body: payload
    },
    { args }
  );

  const envelope = {
    requestedAt: new Date().toISOString(),
    requestPath,
    customerConfigPath,
    payload,
    executed: true,
    result,
    summary: summarizeCreateResult(result)
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
