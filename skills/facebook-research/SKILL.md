---
name: facebook-research
description: Research Facebook pages, public follower or following surfaces, and public posts using hosted collection capability. Use this when the user wants Facebook account research, follower-surface sampling, or public post metrics.
---

# Facebook Research

Follow shared release-shell rules in:

- `skills/shared-release-shell-rules.md`

Use this skill when the request is about Facebook account or content research.

This skill is for:

- sampling public follower or following surfaces from a Facebook page or profile
- collecting public page or profile follow-graph items when Facebook exposes them
- collecting one or more public Facebook page, group, or direct post URLs
- discovering a small Facebook post set from a broad query
- normalizing Facebook post metrics into local artifacts
- writing local raw payloads, normalized datasets, and short markdown summaries

This skill is not for:

- LinkedIn collection
- YouTube collection
- TikTok, Instagram, or X workflows
- publishing, deleting, or scheduling posts
- guaranteeing a complete private follower list when Facebook does not expose it publicly

## Hosted Capability Boundary

This skill depends on host-managed collection capability for the corresponding collection paths.

In the product shell:

- do not probe or print provider secrets
- do not ask the user to export them inside chat
- if a collection path returns a stable capability/network hard error, stop
  immediately instead of trying alternate shell commands

## Default Collection Path

Use the hosted follower collection path by default:

- default collection mode: public follower or following items from a page or profile URL
  - use for public follower or following item collection from a page or profile URL
  - tested input shape:
    - `startUrls = [{ "url": "https://www.facebook.com/<page-or-profile>" }]`
    - `resultsLimit`
    - `followType = "follower"` or `followType = "following"`
  - current observed output fields include:
    - `facebookUrl`
    - `followType`
    - `title`
    - `url`
    - `subtitle_text`
    - `image`
  - this is the default hosted path for Facebook audience-surface research on the released shell

## Supported Facebook Targets

- public page/profile URL -> follower or following items through hosted collection
- public page/profile URL -> recent posts through hosted content collection
- public group URL -> recent posts
- direct public post URL -> one post

## Failure Posture

- fail if the request includes non-Facebook platforms
- fail if no Facebook public URLs can be discovered
- fail if hosted content collection returns malformed items without stable URL or id fields
- fail if hosted follower collection returns no publicly visible follower or following items
- keep raw responses for debugging

## Recommended Workflow

1. If the user wants account audience research, start with follower collection using the hosted collection capability.
2. If the user wants content research, use the hosted content collection scripts below.
3. If the user wants both, collect follower or following items first, then collect post evidence from the same page or profile.

Do not treat Facebook follower-surface results as a guaranteed full audience export.

## Release-Shell Execution Contract

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

- `skills/facebook-research/references/normalized-schema.md`

Use these entrypoints:

- `skills/facebook-research/scripts/run_facebook_post_collection.mjs`

## Hosted Collection Note

Use the shared hosted collection runner for actor calls:

- `skills/shared-collection/scripts/collection_actor_run.mjs`
