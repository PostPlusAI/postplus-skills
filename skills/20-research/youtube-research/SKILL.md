---
name: youtube-research
description: Research public YouTube channels, video metrics, and comment samples; obtain downloadable video records when requested. Use for content and audience evidence.
metadata:
  postplus:
    familyId: platform-research
    familyName: LinkedIn, Facebook, and YouTube
---

# YouTube Research

Use this skill for public YouTube channel summaries, audience comment samples,
downloadable video records, and public video metrics through PostPlus.


## Before Collection Boundary

The released collection does not expose subscriber identities. Use channel
metadata and comments as public proxies, and do not present comment authors as
the subscriber base.

## Research Routes

Use `youtube-videos` for public video records, `youtube-channel-summary` for
channel facts, `youtube-comments` for audience language, and
`youtube-video-download` only when downloadable records are explicitly needed.
PostPlus handles execution details.

## Evidence Quality

1. Check channel facts, video records, and comments against the question; comment authors are not the subscriber population.
2. If a completed pass misses, refine the channel/video source or supported query rather than treating snippets as comments.
3. Allow at most two changed follow-up passes after successful but insufficient results, within approved scope and budget; do not repeat an identical request or hide a failed/pending operation.
4. Stop when sufficient, at the bound, or when another pass would not help. Report useful evidence and uncertainty; preserve raw results and source links.

Public video metrics are snapshots; preserve source URLs and dates, and do not infer subscriber identities.
Full machine fields belong to `postplus research schema --route <route> --json`;
consult it only when required for processing, not before every request.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research run youtube-videos \
  --url "https://example.com/source" \
  --wait \
  --output ./result.json
```

```bash
postplus research run youtube-channel-summary \
  --channel "@example" \
  --wait \
  --output ./result.json
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Wait for explicit user approval when requested; an action does not authorize spending, publishing, or overwriting.
Resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
<!-- END GENERATED EXECUTION EXAMPLE -->

## Default Workflow

1. For channel research, collect a channel summary.
2. For audience research, collect a small comments sample.
3. For broad public video discovery, compile a small public-video plan and
   run the `youtube-videos` route.
4. If a run is pending, preserve its result file and resume with
   `postplus research run --resume-from <result.json>`.
5. Keep observation separate from inference, especially for audience claims.


While a run is pending, tell the user the research is continuing from a saved
checkpoint and continue independent brief or source-review work.

## Output

Return channel metadata, public video records, comment-sample findings, source
URLs, metric fields that were present, and clear notes about unavailable
subscriber identities.

## Failure Modes

- Stop if the request includes non-YouTube platforms.
- Stop if no public YouTube URL, channel, or query can be used.
- Stop if PostPlus cannot resolve the channel handle or URL.
- Stop on PostPlus service, auth, DNS, proxy, network, or malformed-output
  hard errors.
- Do not promise private audience identities or logged-in analytics.

## Handoff

Benchmark findings can feed `benchmark-to-brief`, `media-analysis`, or broader
cross-platform synthesis.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill youtube-research`.

- Inspect a route with `postplus research run <route> --help` only when needed.
- Run `postplus research run <route> --<url/channel flags> --limit <n> --wait
  --output <result.json>`.
- Use only the semantic flags shown by the selected route.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, obtain user approval for its scope and cost before running `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
