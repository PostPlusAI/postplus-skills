---
name: facebook-research
description: Research public Facebook page, group, and post content using PostPlus Cloud collection service. Use this when the user wants Facebook public post research, public content metrics, or source-grounded summaries.
metadata:
  postplus:
    familyId: platform-research
    familyName: LinkedIn, Facebook, and YouTube
---

# Facebook Research

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when the request is about Facebook account or content research.

This skill is for:

- collecting one or more public Facebook page, group, or direct post URLs
- discovering a small Facebook post set from a broad query
- normalizing Facebook post metrics into local artifacts
- writing local raw payloads, normalized datasets, and short markdown summaries

This skill is not for:

- LinkedIn collection
- YouTube collection
- TikTok, Instagram, or X workflows
- publishing, deleting, or scheduling posts
- follower or following collection; that path is not exposed on the released
  PostPlus public skill surface

## Before Collection Boundary

Before running collection, confirm the task can be answered from public
Facebook page, group, or post content. If the user's goal requires follower,
following, private audience, or exhaustive audience data, stop and ask for a
different source of truth before collecting.

## PostPlus Cloud Boundary

This skill depends on host-managed collection capability for the corresponding source keys.

In the PostPlus runtime:

- do not probe or print host-managed service secrets
- do not ask the user to export them inside chat
- if a source key returns a stable capability/network hard error, stop
  immediately instead of trying alternate shell commands

## Default Collection Path

Use hosted public-content collection by default:

- page/profile URL -> recent public posts
- public group URL -> recent public posts
- direct public post URL -> one post
- broad query -> small discovered public post set, then public content collection

## Supported Facebook Targets

- public page/profile URL -> recent posts through hosted content collection
- public group URL -> recent posts
- direct public post URL -> one post

## Failure Posture

- fail if the request includes non-Facebook platforms
- fail if no Facebook public URLs can be discovered
- fail if hosted content collection returns malformed items without stable URL or id fields
- keep raw responses for debugging

## Recommended Workflow

1. If the user wants content research, use the hosted content collection scripts below.
2. If the user wants account audience research, explain that follower/following
   collection is not released and ask for a public content or user-provided
   audience data source instead.
3. If the user wants both public content and audience context, collect public
   post evidence first and keep audience claims separate from collected facts.

Do not treat public Facebook post evidence as a guaranteed audience export.

## Public Skill Execution Contract

- keep collection briefs, raw datasets, normalized outputs, and summary caches
  under `<work-folder>/.postplus/facebook-research/`
- keep only final user-facing summaries or shortlist exports outside
  `.postplus/`
- compile a small page, post, or discovery brief before the expensive
  collection step
- start with a bounded first pass:
  - one page or profile
  - one public post plan
  - one summary pass

## Public Post Implementation

Read before implementation:

- `${CLAUDE_SKILL_DIR}/references/normalized-schema.md`

Use these entrypoints:

- `${CLAUDE_SKILL_DIR}/scripts/run_facebook_post_collection.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/poll_facebook_post_collection.mjs`

If `run_facebook_post_collection.mjs` returns `pending > 0`, keep the emitted
`collection-report.json` and resume with `poll_facebook_post_collection.mjs
--collection-report <path>`. Repeat the poll command until `pending` is `0`;
do not replace it with local blocking waits.

While the collection is pending, do not block the user's conversation just to
poll. Tell the user the public collection is running from a saved checkpoint and
continue independent brief structure, source review, or next-step planning.

## Hosted Collection Note

Use the installed public-content collection entrypoint for Facebook calls:

- `${CLAUDE_SKILL_DIR}/scripts/run_facebook_post_collection.mjs`

The entrypoint maps public Facebook URLs onto the released source keys
`facebook-profile-posts`, `facebook-group-posts`, and `facebook-post-by-url`.
Do not bypass it with repo-local shared runner paths from an installed skill.
