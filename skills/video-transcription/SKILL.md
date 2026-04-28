---
name: video-transcription
description: Transcribe video files directly into timed transcripts and subtitle-ready artifacts using hosted Whisper video-to-text. Use this when the input is a video and the goal is speech extraction, caption generation, or edit-prep timing.
---

# Video Transcription

Follow shared release-shell rules in:

- `skills/shared-release-shell-rules.md`

Use this skill when the input is video and the main problem is:

- spoken transcript extraction
- subtitle timing
- edit-prep timestamps
- multilingual caption generation

This skill is not a substitute for semantic video analysis.

## Provider

First-version provider:

- hosted transcription capability
- `openai-whisper-with-video`

Use `enableTimestamps=true` by default when the result will drive subtitles or edit decisions.

## Poll Behavior

Hosted video transcription is asynchronous. The script polls the prediction result URL
until status is `completed` or `failed`. Default poll window: **150 attempts × 2 s = 5 minutes**.

Real speech video typically completes within 30–60 s. Silent or very short videos may
complete in under 10 s. If a job exceeds 5 minutes, the hosted provider is likely overloaded — retry
rather than increasing the timeout further.

## Output Contract

Persist:

- `request.json`
- `response.json`
- `manifest.json`
- provider output artifacts under `outputs/`

## Scripts

- `scripts/transcribe_video.mjs`

Polling support is shared with:

- `skills/audio-transcription/scripts/poll_transcription.mjs`

## Read These References

- `references/tool-contracts.md`
- `references/normalized-transcript-schema.md`

## Release-Shell Execution Contract

- keep transcription requests, provider responses, normalized transcripts, and
  downloaded subtitle artifacts under
  `<work-folder>/.postplus/video-transcription/`
- keep only final user-facing transcript exports outside `.postplus/`
- start with a bounded first pass, usually one source file before larger
  batches
- if hosted transcription capability is unavailable, unauthorized, or returns a
  stable network error, stop immediately instead of switching to ad hoc shell
  glue
