---
name: audio-transcription
description: Transcribe local or remote audio into durable text and timestamp artifacts through PostPlus. Use this when the job is speech-to-text from audio files and you need request/response persistence, optional timestamps, and subtitle-ready outputs.
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
- Use `video-transcription` for video inputs and `video-analysis` for semantic
  video understanding.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
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
- If status is pending, return the manifest path, the `output.data.id` generation
  handle, and the poll command `postplus media poll --handle <output.data.id>`
  (waits in-command up to 45s per invocation; rerun while pending). Do not keep
  the conversation open just to poll.
- When completed, hand off downloaded artifacts and `normalizedTranscriptPath`
  to `subtitle-packager` if SRT/ASS is needed.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, alternate execution paths, or unpublished tools.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill audio-transcription`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, alternate execution paths, or unpublished tools.
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
<!-- END GENERATED EXECUTION EXAMPLE -->

- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
