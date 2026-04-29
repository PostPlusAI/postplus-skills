---
name: audio-transcription
description: Transcribe local or remote audio into durable text and timestamp artifacts using hosted Whisper models. Use this when the job is speech-to-text from audio files and you need request/response persistence, optional timestamps, and subtitle-ready outputs.
---

# Audio Transcription

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

Use this skill when the input is audio and the main job is:

- transcript generation
- subtitle-ready timing
- rough speech search
- multilingual audio transcription

This skill is not for video semantic understanding.

## Provider

First-version provider direction:

- hosted transcription capability
- `openai-whisper`
- `openai-whisper-turbo`

Use `openai-whisper` by default when subtitle quality matters.

Use `openai-whisper-turbo` when:

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

## Default Workflow

1. Normalize the transcription request.
2. Submit to hosted Whisper capability.
3. Save raw request and response locally.
4. Poll if the job is asynchronous.
5. Save downloaded transcript artifacts locally.
6. Hand off to `subtitle-packager` if SRT/VTT is needed.

## Scripts

- `scripts/transcribe_audio.mjs`
- `scripts/poll_transcription.mjs`

## Read These References

- `references/tool-contracts.md`

## Release-Shell Execution Contract

- keep transcription requests, provider responses, manifests, and downloaded
  transcript artifacts under `<work-folder>/.postplus/audio-transcription/`
- keep only final user-facing transcript exports outside `.postplus/`
- start with a bounded first pass, usually one source file before larger
  batches
- if hosted transcription capability is unavailable, unauthorized, or returns a
  stable network error, stop immediately instead of switching to ad hoc shell
  glue
