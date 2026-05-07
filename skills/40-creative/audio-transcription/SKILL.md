---
name: audio-transcription
description: Transcribe local or remote audio into durable text and timestamp artifacts using hosted Whisper models. Use this when the job is speech-to-text from audio files and you need request/response persistence, optional timestamps, and subtitle-ready outputs.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Audio Transcription

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when the input is audio and the main job is:

- transcript generation
- subtitle-ready timing
- rough speech search
- multilingual audio transcription

This skill is not for video semantic understanding.

## Hosted Endpoint

First-version hosted transcription endpoints:

- hosted transcription capability
- `transcription-whisper`
- `transcription-whisper-turbo`

Use `transcription-whisper` by default when subtitle quality matters.

Use `transcription-whisper-turbo` when:

- the user wants a cheaper rough pass
- timestamps are not the primary requirement

## Output Contract

Persist:

- `request.json`
- `response.json`
- `manifest.json`
- downloaded provider outputs under `outputs/`

Do not rely on the provider dashboard as the durable record.

## Poll Behavior

Hosted transcription is asynchronous. The script polls the prediction result URL until
status is `completed` or `failed`. Default poll window: **150 attempts × 2 s = 5 minutes**.

Short audio clips typically complete in under 30 s. If a job exceeds 5 minutes, retry
rather than increasing the timeout further.

Before submission, the script logs a polling preflight line from
`durationSeconds`. Audio at or above 300 seconds is marked as possibly exceeding
the current polling window. That warning is informational, not a hidden fallback:
the script still uses the same 5-minute poll contract and fails on timeout.

## Default Workflow

1. Normalize the transcription request.
2. Log the 5-minute polling preflight from `durationSeconds`.
3. Submit to hosted Whisper capability.
4. Save raw request and response locally.
5. Poll if the job is asynchronous.
6. Save downloaded transcript artifacts locally.
7. Hand off to `subtitle-packager` if SRT/VTT is needed.

## Scripts

- `scripts/transcribe_audio.mjs`
- `scripts/poll_transcription.mjs`

## Read These References

- `references/tool-contracts.md`

## Public Skill Execution Contract

- keep transcription requests, provider responses, manifests, and downloaded
  transcript artifacts under `<work-folder>/.postplus/audio-transcription/`
- keep only final user-facing transcript exports outside `.postplus/`
- start with a bounded first pass, usually one source file before larger
  batches
- if hosted transcription capability is unavailable, unauthorized, or returns a
  stable network error, stop immediately instead of switching to ad hoc shell
  glue
