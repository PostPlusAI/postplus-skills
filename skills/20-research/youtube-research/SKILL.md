---
name: youtube-research
description: Research YouTube channels, subscriber counts, audience comment samples, and public videos using hosted collection capability. Use this when the user wants YouTube account research or public video metrics.
---

# YouTube Research

Follow shared release-shell rules in:

- `postplus-shared` release-shell rules

Use this skill when the request is about YouTube channels, audience proxies, or public videos.

This skill is for:

- collecting channel metadata and subscriber counts
- collecting audience comment samples from a specific video
- collecting one or more public YouTube video URLs
- discovering a small YouTube video set from a broad query
- normalizing YouTube video metrics into local artifacts
- writing local raw payloads, normalized datasets, and short markdown summaries

This skill is not for:

- LinkedIn collection
- Facebook collection
- TikTok, Instagram, or X workflows
- publishing, deleting, or scheduling posts
- promising a subscriber list that YouTube does not expose publicly

## Hosted Capability Boundary

This skill depends on host-managed collection capability for the corresponding collection paths.

In the product shell:

- do not probe or print provider secrets
- do not ask the user to export them inside chat
- if a collection path returns a stable capability/network hard error, stop
  immediately instead of trying alternate shell commands

## Default Collection Paths

Use these hosted collection paths by default:

- channel metadata and subscriber counts
  - use for channel metadata and subscriber counts
  - tested input shape:
    - `channels = ["@Google"]`
    - `maxVideosPerChannel = 0`
    - `includeChannelInfo = true`
    - `includeVideos = false`
  - current observed output fields include:
    - `channelId`
    - `channelName`
    - `channelHandle`
    - `subscriberCount`
    - `totalVideos`
    - `avatarUrl`
    - `bannerUrl`
- audience comments collection
  - use for audience proxy research from comments on a specific video or Shorts URL
  - tested input shape:
    - `startUrls = ["https://www.youtube.com/watch?v=<video-id>"]`
    - `sort`
    - `maxItems`
  - current observed output fields include:
    - `id`
    - `text`
    - `likeCount`
    - `replyCount`
    - `publishedTime`
    - `author`

Use comments as an audience proxy when subscriber identities are not public.

## Failure Posture

- fail if the request includes non-YouTube platforms
- fail if no YouTube public URLs can be discovered
- fail if hosted content collection returns malformed items without stable URL or id fields
- fail if the channel collection cannot resolve the channel handle or URL
- keep raw responses for debugging

## Recommended Workflow

1. For channel research, start with the hosted channel collection path.
2. For audience research, collect a small comments sample from representative videos with the hosted comments collection path.
3. For broad public video discovery, use the hosted content collection scripts below.

Do not present comment authors as a full subscriber list.

## Release-Shell Execution Contract

- keep collection briefs, raw datasets, normalized outputs, and summary caches
  under `<work-folder>/.postplus/youtube-research/`
- keep only final user-facing summaries or shortlist exports outside
  `.postplus/`
- compile a small channel, comment, or public-video brief before the expensive
  collection step
- start with a bounded first pass:
  - one channel batch
  - one comments batch
  - one public video plan

## Public Video Implementation

Read before implementation:

- `skills/20-research/youtube-research/references/normalized-schema.md`

Use these entrypoints:

- `skills/20-research/youtube-research/scripts/run_youtube_video_collection.mjs`

## Hosted Collection Note

Use the shared hosted collection runner for actor calls:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/00-core/shared-collection/scripts/collection_actor_run.mjs`
