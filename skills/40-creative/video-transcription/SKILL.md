---
name: video-transcription
description: Transcribe video files directly into timed transcripts and subtitle-ready artifacts using hosted Whisper video-to-text. Use this when the input is a video and the goal is speech extraction, caption generation, or edit-prep timing.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Video Transcription

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when the input is video and the main problem is:

- spoken transcript extraction
- subtitle timing
- edit-prep timestamps
- multilingual caption generation

This skill is not a substitute for semantic video analysis.

## Hosted Endpoint

First-version hosted transcription endpoint:

- hosted transcription capability
- `transcription-whisper-with-video`

Use `enableTimestamps=true` by default when the result will drive subtitles or edit decisions.

## Poll Behavior

Hosted video transcription is asynchronous. `transcribe_video.mjs` submits the
job, persists the provider response, and returns a stable `generationHandle`
plus `providerUrls.get` when the provider is still processing. It does not
block locally until the provider finishes.

Use `audio-transcription/scripts/poll_transcription.mjs` with the same request
file to resume the provider status check. Repeat polling until status is
`completed` or `failed`; completed runs write the normalized transcript and
downloaded artifacts. Failed runs preserve the provider error in
`manifest.json` and exit non-zero with the provider message and user action.

Do not block the user's conversation while the provider is still processing.
Tell the user the transcription is running from the saved checkpoint, then
continue any independent edit planning, subtitle planning, or downstream prep.
Poll again when the transcript is needed or when the user asks to wait.

## Preflight Boundary

Before submission:

- read or derive `durationSeconds` from the source video
- include `durationSeconds` in the request JSON
- run one source file first before larger batches

## Output Contract

Persist:

- `request.json`
- `response.json`
- `manifest.json`
- provider output artifacts under `outputs/`

## Scripts

- `scripts/transcribe_video.mjs`

Polling support is shared with:

- `audio-transcription` polling support

## Read These References

- `references/tool-contracts.md`
- `references/normalized-transcript-schema.md`

## Public Skill Execution Contract

- keep transcription requests, provider responses, normalized transcripts, and
  downloaded subtitle artifacts under
  `<work-folder>/.postplus/video-transcription/`
- keep only final user-facing transcript exports outside `.postplus/`
- pass `scripts/transcribe_video.mjs` a `schemaVersion: 1` hosted execution
  envelope whose `input` field is the video transcription request
- start with a bounded first pass, usually one source file before larger
  batches
- if hosted transcription capability is unavailable, unauthorized, or returns a
  stable network error, stop immediately instead of switching to ad hoc shell
  glue
