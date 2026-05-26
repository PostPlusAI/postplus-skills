---
name: youtube-research
description: Research YouTube channel summaries, audience comment samples, downloadable video records, and public videos using PostPlus Cloud collection service. Use this when the user wants YouTube account research or public video metrics.
metadata:
  postplus:
    familyId: platform-research
    familyName: LinkedIn, Facebook, and YouTube
---

# Youtube Research

# YouTube Research

Use this skill for public YouTube channel summaries, audience comment samples,
downloadable video records, and public video metrics through PostPlus hosted
collection.

Apply shared rulebook and user-guidance rules from `postplus-shared`.

## Before Collection Boundary

YouTube subscriber identities are not exposed through the released collection
surface. Use channel metadata and comments as public proxies, and do not present
comment authors as the subscriber base.

## Collection Key Routing

Released hosted collection keys:

- `youtube-channel-summary`: channel metadata and subscriber counts.
- `youtube-comments`: audience proxy research from comments on a specific video
  or Shorts URL.
- `youtube-video-download`: hosted video record for explicit video URLs.
- `youtube-videos`: public-video collection through the installed public-video
  entrypoint.

## Default Workflow

1. For channel research, start with `youtube-channel-summary`.
2. For audience research, collect a small comments sample with
   `youtube-comments`.
3. For broad public video discovery, compile a small public-video plan and run
   the installed public-video collection entrypoint.
4. If the public-video run is pending, preserve `collection-report.json` and
   resume with the emitted poll command.
5. Keep observation separate from inference, especially for audience claims.

While collection is pending, tell the user the public collection is running
from a saved checkpoint and continue independent brief or source-review work.

## Output

Return channel metadata, public video records, comment-sample findings, source
URLs, metric fields that were present, and clear notes about unavailable
subscriber identities.

## Failure Modes

- Stop if the request includes non-YouTube platforms.
- Stop if no public YouTube URL, channel, or query can be used.
- Stop if hosted collection cannot resolve the channel handle or URL.
- Stop on hosted capability, auth, DNS, proxy, network, or malformed-output
  hard errors.
- Do not promise private audience identities or logged-in analytics.

## Handoff

Benchmark findings can feed `benchmark-to-brief`, `video-analysis`, or broader
cross-platform synthesis.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill youtube-research`.
- Input schema: `postplus research schema --collection-key youtube-channel-summary --json`.
- Hosted collection: `postplus research collect --skill youtube-research --collection-key youtube-channel-summary --input <hosted-envelope.json> --output <collection-result.json>`.
- Public video collection: `postplus research capability --request <hosted-capability-request.json> --output <collection-result.json>` with `public-content-collection` sourceKey `youtube-videos`.
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <collection-result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
