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
- Released endpoint keys are `transcription-whisper` and
  `transcription-whisper-turbo` through hosted `media-file` and
  `media-generation`.
- Default to `transcription-whisper` when subtitle quality matters. Use turbo
  only for an explicit cheaper rough pass or when timestamps are not primary.
- Hosted transcription is async. Submit writes request, response, manifest,
  generation handle, provider status, provider URLs, and downloaded outputs if
  already completed.

## Source And Path
- Include `durationSeconds` in the hosted capability request input for billing/preflight.
- Use `enableTimestamps` when output will feed subtitles or edit decisions.
- Start with one source file before larger batches.
- Keep internal requests, responses, manifests, normalized transcripts, and
  downloaded artifacts under `.postplus/audio-transcription`; keep final
  user-facing transcript exports outside `.postplus`.

## Handoff
- If status is pending, return the manifest path, `generationHandle`,
  not keep the conversation open just to poll.
- When completed, hand off downloaded artifacts and `normalizedTranscriptPath`
  to `subtitle-packager` if SRT/ASS is needed.

## Fail Fast
- Missing hosted capability request, audio input, `durationSeconds`, output path, auth,
  hosted capability, provider status URL, or stable provider/network access.
- Do not switch to ad hoc STT providers or fake timing when hosted transcription
  is unavailable.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill audio-transcription`.
- Request schema: `postplus media schema --json`; add `--endpoint <endpoint-key>` for media-generation examples.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
