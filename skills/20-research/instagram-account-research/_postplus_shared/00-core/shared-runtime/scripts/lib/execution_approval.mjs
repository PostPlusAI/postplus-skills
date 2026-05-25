import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function sortJson(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sortJson(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, sortJson(child)]),
  );
}

export function stableJsonStringify(value) {
  return JSON.stringify(sortJson(value));
}

export function buildApprovalDigest(value) {
  return crypto
    .createHash("sha256")
    .update(stableJsonStringify(value))
    .digest("hex");
}

export function readApprovalFile(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
}

export function buildApprovalRequest({ action, payload, summary }) {
  return {
    action,
    approved: false,
    payloadSha256: buildApprovalDigest(payload),
    requestedAt: new Date().toISOString(),
    summary,
  };
}

export function assertExecutionApproval({
  approvalPath,
  action,
  payload,
}) {
  if (!approvalPath) {
    throw new Error(`Execution approval is required for ${action}. Provide --approval-file.`);
  }

  const approval = readApprovalFile(approvalPath);
  const payloadSha256 = buildApprovalDigest(payload);

  if (approval.action !== action) {
    throw new Error(
      `Approval action mismatch for ${action}. Found ${JSON.stringify(approval.action)}.`,
    );
  }

  if (approval.approved !== true) {
    throw new Error(`Approval file for ${action} is not approved.`);
  }

  if (approval.payloadSha256 !== payloadSha256) {
    throw new Error(
      `Approval payload digest mismatch for ${action}. Regenerate approval for the exact artifact being executed.`,
    );
  }

  if (typeof approval.approvedAt !== "string" || !approval.approvedAt.trim()) {
    throw new Error(`Approval file for ${action} must include approvedAt.`);
  }

  if (typeof approval.approvedBy !== "string" || !approval.approvedBy.trim()) {
    throw new Error(`Approval file for ${action} must include approvedBy.`);
  }

  return approval;
}

export function flagEnabled(value) {
  return value === true || value === "true";
}
