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

Hosted transcription is asynchronous. `transcribe_audio.mjs` submits the job,
persists the provider response, and returns a stable `generationHandle` plus
`providerUrls.get` when the provider is still processing. It does not block
locally until the provider finishes.

Use `poll_transcription.mjs` with the same request file to resume the provider
status check. Repeat polling until status is `completed` or `failed`; completed
runs download transcript artifacts into `outputs/`. Failed runs preserve the
provider error in `manifest.json` and exit non-zero with the provider message
and user action.

Do not block the user's conversation while the provider is still processing.
Tell the user the transcription is running from the saved checkpoint, then
continue any independent cleanup, subtitle planning, or downstream prep. Poll
again when the transcript is needed or when the user asks to wait.

## Default Workflow

1. Normalize the transcription request.
2. Log the async submission contract from `durationSeconds`.
3. Submit to hosted Whisper capability.
4. Save raw request and response locally.
5. If the manifest is still pending, run `poll_transcription.mjs` with the same request.
6. Save downloaded transcript artifacts locally when the provider completes.
7. Hand off to `subtitle-packager` if SRT/VTT is needed.

## Scripts

- `scripts/transcribe_audio.mjs`
- `scripts/poll_transcription.mjs`

These scripts are hosted media entrypoints. The file passed to `--request`
must be a hosted execution envelope:

```json
{
  "schemaVersion": 1,
  "input": {
    "...": "normalized transcription request"
  }
}
```

The normalized transcription request is the envelope's `input` value. Bare
normalized request JSON is not an executable script input.

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
