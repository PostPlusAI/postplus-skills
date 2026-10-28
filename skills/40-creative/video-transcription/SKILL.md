---
name: video-transcription
description: Transcribe speech in local or remote videos with timestamps. Convert existing timed transcripts locally into SRT or ASS; use media-analysis for visual understanding.
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

If a timed transcript already exists and only subtitle output is requested,
skip transcription and read the local subtitle conversion reference.

## Do Not Use When
- The task needs new creative generation or visual analysis rather than speech or subtitles.
- Required inputs are missing and guessing would change the result.

## Execution Boundary
- Hosted video transcription runs through the public `postplus media transcribe`
  verb and is async. The generated example below shows the endpoint key.
- Pass a local path, HTTPS URL, existing PostPlus media reference, or data URI
  directly to `--video`. The CLI validates and prepares local media before the
  single hosted submit.
- Request timestamps by default when results drive subtitles or edit decisions.
- Hosted video transcription is async. Submit records the run handle, current
  status, and transcript artifacts when available. Inspect the returned format;
  do not assume a fixed normalized transcript schema.

## Source And Path
- Before submit, derive `durationSeconds` from the source video or URL and pass
  it through the endpoint's duration flag for request validation.
- Start with one source file before larger batches.
- Keep internal requests, responses, normalized transcripts, and downloaded
  artifacts under `.postplus/video-transcription`; keep final user-facing
  transcript exports outside `.postplus`.

## Handoff
- If status is pending, preserve the result path and follow the CLI-returned
  action or resume command for the same operation. Do not submit another job.
  Stop and report when the CLI wait/recovery boundary is reached.
- When SRT/ASS is requested, use the actual timed transcript and read
  [local subtitle conversion](references/subtitles.md). Convert locally without
  another hosted request; do not invent a CLI export command.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill video-transcription`.

- Use `postplus media schema --json` only when you need the full endpoint, flag,
  and enum contract or are repairing an unknown request shape.
- Run the hosted transcription job with the generated command below; do not use
  another execution interface.
- Pass the source directly through `--video`; do not pre-upload it or construct
  a manual request object.
- Requested tasks use existing PostPlus credits after the current price and balance are checked.
  Estimate-only requests do not execute. Stop on insufficient credits; do not
  recharge, buy a subscription, or repeat an uncertain paid operation.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media transcribe transcription-video \
  --video ./reference.mp4 \
  --duration-seconds 1 \
  --wait \
  --output ./result.json
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Use existing PostPlus credits for requested work within existing authorization; estimate-only requests do not execute. Do not recharge, buy subscriptions, publish or change external advertising spend without applicable authorization. An initial reservation is not a final price or a hard cost cap. If a required hard final-cost limit cannot be enforced, do not execute; explain that limit.
Correct definite pre-submission field or format errors without changing the requested intent, mode or output constraints. After submission or an unknown outcome, resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
Keep raw results, operation identifiers and recovery commands in execution records. In ordinary chat, give the result, meaningful limitations, known cost and any necessary user decision; do not narrate uploads, polling, internal identifiers or JSON. When asked how media was made, provide the actual model, submitted prompt in the user language and references actually submitted with their roles.
<!-- END GENERATED EXECUTION EXAMPLE -->
