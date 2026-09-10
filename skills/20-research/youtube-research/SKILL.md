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

**Bounded recovery:** Current PostPlus CLIs handle a compatible update and retry the command once when no agent-session restart is required. If an older CLI only reports that an update is required, run `postplus update` and retry once under the same condition. For a missing or invalid CLI session, run `postplus auth login` yourself; it opens the browser by default. Immediately share its exact URL as a clickable link for the user to **Connect**, then retry the original command once only after the CLI confirms success. Never ask the user to run the command or enter/compare a code, approve the connection for them, or automatically restart a cancelled/expired login. For a local usage rejection before remote work starts, use that command's `--help` to make one unambiguous correction from existing user input and retry once.

If PostPlus returns `postplus_cli_balance_required` with an `open_url` user action, give the user its exact label and URL and stop for account action. Do not invent a checkout link, claim whether provider work or charging occurred, or blindly resubmit after payment; continue from the command's documented status or checkpoint once the user confirms credits are available.

Otherwise stop and report the exact error. Never expose login polling secrets, resubmit an operation when remote work may have started, change user intent, bypass approval, switch providers, rewrite payloads, or make a second recovery attempt. After success, briefly say that PostPlus updated, using only the official update details PostPlus reported.
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

Benchmark findings can feed `benchmark-to-brief`, `media-analysis`, or broader
cross-platform synthesis.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill youtube-research`.
- If an owned CLI or script command still fails after any bounded recovery allowed by the executing PostPlus skill, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, alternate services, or unpublished tools.
- Inspect a route with `postplus research run <route> --help` only when needed.
- Run `postplus research run <route> --<url/channel flags> --limit <n> --wait
  --output <result.json>`.
- Use only the semantic flags shown by the selected route.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
