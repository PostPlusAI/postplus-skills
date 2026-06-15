---
name: audio-transcription
description: Transcribe local or remote audio into durable text and timestamp artifacts using hosted Whisper models. Use this when the job is speech-to-text from audio files and you need request/response persistence, optional timestamps, and subtitle-ready outputs.
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
  and is async. A submit writes request, response, manifest, generation handle,
  provider status, provider URLs, and downloaded outputs if already completed.
- A higher-quality default model and a faster, cheaper variant are available;
  prefer the default when subtitle quality matters and use the cheaper variant
  for an explicit rough pass. The generated example below shows the default
  endpoint key.

## Source And Path
- Supply the media duration so the hosted boundary can price and preflight the
  request; a missing duration fast-fails before any provider spend.
- Request timestamps when the output will feed subtitles or edit decisions.
- Start with one source file before larger batches.
- Keep internal requests, responses, manifests, normalized transcripts, and
  downloaded artifacts under `.postplus/audio-transcription`; keep final
  user-facing transcript exports outside `.postplus`.

## Handoff
- If status is pending, return the manifest path, `generationHandle`,
  not keep the conversation open just to poll.
- When completed, hand off downloaded artifacts and `normalizedTranscriptPath`
  to `subtitle-packager` if SRT/ASS is needed.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill audio-transcription`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus media schema --json` only when you need the full endpoint, flag,
  and enum contract or are repairing an unknown request shape.
- Run the hosted transcription job with the generated command below; do not call
  provider APIs directly.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media transcribe transcription \
  --audio <audio> \
  --duration-seconds <duration-seconds> \
  --output <result.json>
```
<!-- END GENERATED EXECUTION EXAMPLE -->

- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
