---
name: youtube-research
description: Research YouTube channel summaries, audience comment samples, downloadable video records, and public videos using PostPlus Cloud collection service. Use this when the user wants YouTube account research or public video metrics.
metadata:
  postplus:
    familyId: platform-research
    familyName: LinkedIn, Facebook, and YouTube
---

# YouTube Research

Use this skill for public YouTube channel summaries, audience comment samples,
downloadable video records, and public video metrics through PostPlus hosted
collection.

Apply shared rulebook and user-guidance rules from `postplus-shared`.

## Before Collection Boundary

The released collection does not expose subscriber identities. Use channel
metadata and comments as public proxies, and do not present comment authors as
the subscriber base.

## Collection Route

YouTube research runs through two hosted routes:

- Public video search/retrieval scrapes the public-video source. The `--request`
  file is a JSON array of input records (one record per channel handle or video
  URL).
- Channel summary, audience comments, and downloadable video records collect a
  hosted collection. The `--request` file is the collection input object
  directly.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research scrape youtube-videos --request request.json --output result.json
```

```bash
postplus research collect youtube-channel-summary --request request.json --output result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->

## Default Workflow

1. For channel research, collect a channel summary.
2. For audience research, collect a small comments sample.
3. For broad public video discovery, compile a small public-video plan and
   scrape the public-video source.
4. If a hosted run is pending, preserve `collection-report.json` and resume with
   the emitted poll command.
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

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill youtube-research`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus research schema --json` only when constructing or repairing an unknown request shape.
- Public video scrape: `postplus research scrape youtube-videos --request <input-array.json> --output <result.json>` (request = a JSON array of input records).
- Hosted collection: `postplus research collect <collectionKey> --request <input.json> --output <result.json>` (input = the collection parameters; channel summary, comments, or video download).
- Resume a pending public video scrape: `postplus research scrape --run-handle <runHandle> --output <result.json>`.
- Resume a pending hosted collection: `postplus research collect --run-handle <runHandle> --output <result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
