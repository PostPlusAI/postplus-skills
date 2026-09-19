---
name: audio-transcription
description: Transcribe local or remote audio into text and timestamps. Convert an existing timed transcript locally into SRT or ASS without another transcription job.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Audio Transcription

## Use When
- The input is audio and the main job is speech-to-text, subtitle-ready timing,
  rough speech search, multilingual transcription, or durable transcript
  artifacts.
- Use `video-transcription` for video inputs and `media-analysis` for semantic
  video understanding.

If a timed transcript already exists and only subtitle output is requested,
skip transcription and read the local subtitle conversion reference.

## Do Not Use When
- The task needs new creative generation or visual analysis rather than speech or subtitles.
- Required inputs are missing and guessing would change the result.

## Execution Boundary
- Hosted transcription runs through the public `postplus media transcribe` verb
  and is async. A submit records the run handle, current status, and completed
  artifacts when available.
- Pass a local path, HTTPS URL, existing PostPlus media reference, or data URI
  directly to `--audio`. The CLI validates and prepares local media before the
  single hosted submit.
- A higher-quality default model and a faster, cheaper variant are available;
  prefer the default when subtitle quality matters and use the cheaper variant
  for an explicit rough pass. The generated example below shows the default
  endpoint key.

## Source And Path
- Supply the media duration so PostPlus can validate the request before it runs;
  a missing duration fails before submission.
- Request timestamps when the output will feed subtitles or edit decisions.
- Start with one source file or audio URL before larger batches.
- Keep internal requests, responses, manifests, normalized transcripts, and
  downloaded artifacts under `.postplus/audio-transcription`; keep final
  user-facing transcript exports outside `.postplus`.

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
- Readiness diagnostics: `postplus doctor --skill audio-transcription`.

- Use `postplus media schema --json` only when you need the full endpoint, flag,
  and enum contract or are repairing an unknown request shape.
- Run the hosted transcription job with the generated command below; do not use
  another execution interface.
- Pass the source directly through `--audio`; do not pre-upload it or construct
  a manual request object.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media transcribe transcription \
  --audio ./reference.wav \
  --duration-seconds 1 \
  --wait \
  --output ./result.json
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Wait for explicit user approval when requested; an action does not authorize spending, publishing, or overwriting.
Resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
<!-- END GENERATED EXECUTION EXAMPLE -->

- If the CLI returns a quote-confirmation challenge, obtain user approval for its scope and cost before running `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
