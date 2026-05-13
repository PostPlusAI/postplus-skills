---
name: social-media-publisher
description: Prepare and, after explicit approval, publish social posts through the PostPlus platform-owned social publishing workspace.
metadata:
  postplus:
    familyId: workspace-publishing
    familyName: Workspace, Publishing, and Meta
---

# Social Media Publisher

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when the user wants to operate social publishing through the PostPlus-managed social publishing workspace.

This skill is for:

- guiding users through the invite-link channel onboarding flow
- listing integrations available on the PostPlus social publishing workspace
- preparing a local publish request draft
- creating a social post draft or schedule only after explicit approval
- promoting an existing social post draft into the queue only after a second approval

## Ownership model

PostPlus holds one platform-owned social publishing workspace.
End users do **not** need separate publishing-service accounts.

Channel onboarding uses the PostPlus invite-link mechanism:

1. the product calls `GET /public/v1/social/{integration}` with the PostPlus
   social publishing service
2. PostPlus returns a social-platform OAuth URL (e.g. Instagram, TikTok)
3. the product delivers that URL to the end user (via UI or CLI)
4. the user clicks the link and authorizes their social account on the
   platform's own OAuth consent screen
5. the resulting channel token lands in the PostPlus social publishing workspace
6. the product labels the channel with the user's PostPlus account id via
   `PUT /integrations/:id/customer-name`

## Safe default

`create_post.mjs` defaults to preview mode.

Without `--execute`, it:

- validates the local request
- enforces the integration allowlist
- writes a local preview envelope
- emits an `approvalRequest`
- does not call the remote publishing service

Actual remote mutation requires:

- `--execute`
- `--approval-file <approved.json>`
- a channel that has been onboarded via the invite-link flow above

Use `change_post_status.mjs` to move a real social post draft from `draft` to
`schedule` after a second explicit approval.

## Authentication

Read `references/api-contract.md`.

Release workflow rules:

- PostPlus backend holds publishing credentials server-side; scripts never
  receive them directly
- all remote publishing calls are proxied through the PostPlus Cloud service
- do not ask users for third-party publishing-service credentials of any kind

## Default workflow

1. User requests channel onboarding via the product UI or CLI.
2. Product generates an invite link for the target platform.
3. User authorizes their social account via the platform OAuth screen.
4. Product labels the new channel integration with the user's account id.
5. List integrations to confirm the exact integration id for the user's channel.
6. Build the local request JSON as a `schemaVersion: 1` hosted execution
   envelope; place the social publishing request under `input`.
7. Run `create_post.mjs` without `--execute` to produce an approval artifact.
8. After approval, re-run `create_post.mjs --execute --approval-file ...`.
9. If the post should stay reviewable, keep it in `draft`.
10. Only after a second approval, run `change_post_status.mjs --status schedule`
    to queue it for publishing.

## Main scripts

- `scripts/list_integrations.mjs`
- `scripts/integration_settings.mjs`
- `scripts/trigger_tool.mjs`
- `scripts/upload_media_from_url.mjs`
- `scripts/upload_file.mjs`
- `scripts/create_post.mjs`
- `scripts/change_post_status.mjs`
- `scripts/list_posts.mjs`
- `scripts/delete_post.mjs`
- `scripts/delete_post_group.mjs`
- `scripts/get_missing_content.mjs`
- `scripts/update_release_id.mjs`
- `scripts/platform_analytics.mjs`
- `scripts/post_analytics.mjs`
- `scripts/list_notifications.mjs`
- `scripts/render_publish_report.mjs`

## Command examples

Prepare a publish request preview from a hosted envelope request file:

```bash
node skills/50-publishing/social-media-publisher/scripts/create_post.mjs \
  --request "<request.json>" \
  --customer-config "<social-publishing.config.json>" \
  --output "<create-post.preview.json>"
```

Execute the approved create from the same hosted envelope request file:

```bash
node skills/50-publishing/social-media-publisher/scripts/create_post.mjs \
  --request "<request.json>" \
  --customer-config "<social-publishing.config.json>" \
  --output "<create-post.result.json>" \
  --execute \
  --approval-file "<approval.json>"
```

Promote a draft into the publish queue:

```bash
node skills/50-publishing/social-media-publisher/scripts/change_post_status.mjs \
  --post-id "<post-id>" \
  --status schedule \
  --output "<status.result.json>" \
  --execute \
  --approval-file "<approval.json>"
```
