---
name: social-media-publisher
description: Prepare social publishing requests and approval artifacts through the PostPlus platform-owned social publishing workspace.
metadata:
  postplus:
    familyId: workspace-publishing
    familyName: Workspace, Publishing, and Meta
---

# Social Media Publisher

Use this skill to create, update, list, delete, schedule, or publish social
posts through the PostPlus-managed social publishing workspace.

Apply shared rulebook, approval, and user-guidance rules from `postplus-shared`.

## Ownership And Auth Boundary

PostPlus holds the platform-owned social publishing workspace. End users do not
need separate publishing-service accounts and should not provide third-party
publishing-service credentials to the agent.

Channel onboarding uses the PostPlus invite-link path:

1. PostPlus Cloud creates an invite link for the target social platform.
2. The user authorizes their social account on the platform OAuth screen.
3. The resulting channel token lands in the PostPlus social publishing
   workspace.
4. PostPlus labels the channel with the user's PostPlus account id.

Scripts receive PostPlus-hosted request envelopes, not hidden server
credentials.

## Command

Run one operation per call. The operation is the subcommand:

`postplus publish <operation> --request <input.json> --output <result.json>`

`<input.json>` is the publishing `input` object for that operation. The CLI
mints the `operationId` and posts to the PostPlus social publishing workspace.

Side-effecting operations (create, schedule, publish, delete) can return a
quote-confirmation challenge before any spend. When that happens, run
`postplus quote confirm --json --challenge-file <challenge.json>` and retry the
same command with `--quote-confirmation-token <token>`.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus publish analytics --request request.json --output result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->

## Required Input

- A publishing `input` object matching the selected operation: workspace/account
  identity, integration id, content/media, and post or group ids as required.

## Default Workflow

1. Confirm the channel was onboarded through the invite-link flow.
2. List channels to confirm the exact integration id.
3. Build the publishing `input` for the operation and run the command.
4. Keep reviewable work in `draft` unless the user explicitly approves
   scheduling or publishing; live publish/schedule needs human approval and
   current channel evidence.

## User-Facing Blockers

Stop and explain when:

- no PostPlus auth/session is available,
- the channel was not onboarded through the invite-link flow,
- the integration id is missing or not an onboarded channel,
- required content, media, post id, or group id is missing,
- approval or quote confirmation is required,
- entitlement or current channel evidence is missing for a publish-like action,
- the hosted service returns a stable product error.

Do not expose server-side implementation names or ask for third-party publishing-service
credentials. Do not bypass quote confirmation or approval boundaries.

## Handoff

Return structured preview/result JSON, the approval or quote-confirmation
command when required, or the exact product error and next boundary.

## Public Command Boundary

- Choose the smallest matching operation from the user input and run it directly.
- Readiness diagnostics: `postplus doctor --skill social-media-publisher`.
- If an owned CLI command fails, report the exact error and stop. Do not bypass
  the failure with metadata-only answers, readiness probing, local payload
  rewrites, fallback providers, or unpublished tools.
- Use `postplus publish schema --json` only when constructing or repairing an
  unknown request shape.
- Approval boundaries stay explicit; do not execute irreversible publishing
  without human approval and current channel evidence.
