---
name: youtube-research
description: Research public YouTube channel summaries, audience comment samples, downloadable video records, and video metrics through PostPlus. Use when the user needs YouTube account, content, or audience evidence.
metadata:
  postplus:
    familyId: platform-research
    familyName: LinkedIn, Facebook, and YouTube
---

# YouTube Research

Use this skill for public YouTube channel summaries, audience comment samples,
downloadable video records, and public video metrics through PostPlus.

Apply shared rulebook and user-guidance rules from `postplus-shared`.
When a supported command completes but evidence is empty, sparse, noisy,
off-topic, or the wrong record type, apply the `postplus-shared` reference
`research-quality-recovery.md`; hard execution errors still fail fast.

## Before Collection Boundary

The released collection does not expose subscriber identities. Use channel
metadata and comments as public proxies, and do not present comment authors as
the subscriber base.

## Research Routes

Use `youtube-videos` for public video records, `youtube-channel-summary` for
channel facts, `youtube-comments` for audience language, and
`youtube-video-download` only when downloadable records are explicitly needed.
PostPlus handles execution details.

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
<!-- END GENERATED EXECUTION EXAMPLE -->

## Default Workflow

1. For channel research, collect a channel summary.
2. For audience research, collect a small comments sample.
3. For broad public video discovery, compile a small public-video plan and
   run the `youtube-videos` route.
4. If a run is pending, preserve its result file and resume with
   `postplus research run --resume-from <result.json>`.
5. Keep observation separate from inference, especially for audience claims.

Result record shapes for every research route are documented in the
`postplus-shared` reference `dataset-item-schemas.md`; consult it before
writing result-processing code, and probe a single record only to verify.

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

Benchmark findings can feed `benchmark-to-brief`, `video-analysis`, or broader
cross-platform synthesis.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill youtube-research`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, alternate services, or unpublished tools.
- Inspect a route with `postplus research run <route> --help` only when needed.
- Run `postplus research run <route> --<url/channel flags> --limit <n> --wait
  --output <result.json>`.
- Use only the semantic flags shown by the selected route.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
