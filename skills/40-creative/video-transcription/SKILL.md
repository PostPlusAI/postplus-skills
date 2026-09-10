---
name: video-transcription
description: Transcribe local or remote videos into timed transcripts and subtitle-ready artifacts through PostPlus. Use this when the input is a video and the goal is speech extraction, caption generation, or edit-prep timing.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Video Transcription

## Use When
- The input is a video file and the goal is speech extraction, timed transcript,
  caption generation, multilingual transcript, or edit-prep timestamps.
- Use `media-analysis` instead when the user needs semantic visual analysis.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Execution Boundary
- Hosted video transcription runs through the public `postplus media transcribe`
  verb and is async. The generated example below shows the endpoint key.
- Pass a local path, HTTPS URL, existing PostPlus media reference, or data URI
  directly to `--video`. The CLI validates and prepares local media before the
  single hosted submit.
- Request timestamps by default when results drive subtitles or edit decisions.
- Hosted video transcription is async. Submit records the run handle, current
  status, normalized transcript path, and completed artifacts when available.

## Source And Path
- Before submit, derive `durationSeconds` from the source video or URL and pass
  it through the endpoint's duration flag for request validation.
- Start with one source file before larger batches.
- Keep internal requests, responses, normalized transcripts, and downloaded
  artifacts under `.postplus/video-transcription`; keep final user-facing
  transcript exports outside `.postplus`.

## Handoff
- If status is pending, return the manifest path, the `output.data.id` generation
  handle, and the poll command `postplus media poll --handle <output.data.id>`
  (waits in-command up to 45s per invocation; rerun while pending). Do not keep
  the conversation open just to poll.
- When completed, hand off `normalizedTranscriptPath`, downloaded artifacts, and
  final transcript paths to `subtitle-packager` if SRT/ASS is needed.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command still fails after any bounded recovery allowed by the executing PostPlus skill, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, alternate execution paths, or unpublished tools.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill video-transcription`.
- If an owned CLI or script command still fails after any bounded recovery allowed by the executing PostPlus skill, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, alternate execution paths, or unpublished tools.
- Use `postplus media schema --json` only when you need the full endpoint, flag,
  and enum contract or are repairing an unknown request shape.
- Run the hosted transcription job with the generated command below; do not use
  another execution interface.
- Pass the source directly through `--video`; do not pre-upload it or construct
  a manual request object.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media transcribe transcription-video \
  --video ./reference.mp4 \
  --duration-seconds 1 \
  --wait \
  --output ./result.json
```

**Bounded recovery:** Current PostPlus CLIs handle a compatible update and retry the command once when no agent-session restart is required. If an older CLI only reports that an update is required, run `postplus update` and retry once under the same condition. For a missing or invalid CLI session, run `postplus auth login` yourself; it opens the browser by default. Immediately share its exact URL as a clickable link for the user to **Connect**, then retry the original command once only after the CLI confirms success. Never ask the user to run the command or enter/compare a code, approve the connection for them, or automatically restart a cancelled/expired login. For a local usage rejection before remote work starts, use that command's `--help` to make one unambiguous correction from existing user input and retry once.

If PostPlus returns `postplus_cli_balance_required` with an `open_url` user action, give the user its exact label and URL and stop for account action. Do not invent a checkout link, claim whether provider work or charging occurred, or blindly resubmit after payment; continue from the command's documented status or checkpoint once the user confirms credits are available.

Otherwise stop and report the exact error. Never expose login polling secrets, resubmit an operation when remote work may have started, change user intent, bypass approval, switch providers, rewrite payloads, or make a second recovery attempt. After success, briefly say that PostPlus updated, using only the official update details PostPlus reported.
<!-- END GENERATED EXECUTION EXAMPLE -->
