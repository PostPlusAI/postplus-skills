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
postplus research run youtube-channel-summary \
  --channel "@example" \
  --wait \
  --output ./result.json
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Use existing PostPlus credits for requested work within existing authorization; estimate-only requests do not execute. Do not recharge, buy subscriptions, publish or change external advertising spend without applicable authorization. An initial reservation is not a final price or a hard cost cap. If a required hard final-cost limit cannot be enforced, do not execute; explain that limit.
Correct definite pre-submission field or format errors without changing the requested intent, mode or output constraints. After submission or an unknown outcome, resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
Keep raw results, operation identifiers and recovery commands in execution records. In ordinary chat, give the result, meaningful limitations, known cost and any necessary user decision; do not narrate uploads, polling, internal identifiers or JSON. When asked how media was made, provide the actual model, submitted prompt in the user language and references actually submitted with their roles.
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

## Read Video Records

Read `youtube-videos` records from `output.items[]`: `id`, `url`, `title`, `text` (description), `date`, `viewCount`, `likes`, `commentsCount`, `channelName`, `channelUrl`, `channelUsername`, `numberOfSubscribers`, and `thumbnailUrl`. Fields are optional: mark absent metrics unavailable, never zero.

`duration` is a time string (`HH:MM:SS`), not a numeric seconds field. Existing captions appear in `subtitles[]` with `srt`, `language`, and `type`; preserve their timestamps and language. Missing subtitles mean no captions were obtained. Do not substitute the description for a transcript or imply new speech transcription occurred.

`hashtags` are not the complete video tags. `isPaidContent` means paid access, not sponsorship. Sponsorship is unavailable; absent verification is unknown. Do not interpret channel age restrictions as verified video age restrictions. Download URLs and quality are not provided by this metadata route; use the separate download route only when requested.

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
- Requested tasks use existing PostPlus credits after the current price and balance are checked.
  Estimate-only requests do not execute. Stop on insufficient credits; do not
  recharge, buy a subscription, or repeat an uncertain paid operation.
