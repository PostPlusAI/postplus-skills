# Normalized Transcript Schema

This file defines the stable intermediate subtitle object produced by `video-transcription`.

Downstream subtitle and edit tooling should consume this object instead of provider-native response JSON.

## Contract

```json
{
  "schemaVersion": "subtitle-normalized/v1",
  "jobId": "video-stt-001",
  "source": {
    "mediaType": "video",
    "sourceVideoPath": "/absolute/path/to/source.mp4",
    "sourceAudioPath": null
  },
  "language": "auto",
  "transcriptText": "Full transcript text.",
  "segments": [
    {
      "id": "seg-001",
      "start": 0.0,
      "end": 4.8,
      "duration": 4.8,
      "text": "One timed subtitle segment.",
      "words": []
    }
  ],
  "words": [],
  "meta": {
    "provider": "hosted",
    "model": "openai-whisper-with-video",
    "task": "transcribe",
    "enableTimestamps": true,
    "createdAt": "2026-04-07T07:19:38.036Z",
    "requestPath": "/absolute/path/request.json",
    "responsePath": "/absolute/path/response.json",
    "manifestPath": "/absolute/path/manifest.json"
  }
}
```

## Required Top-Level Fields

- `schemaVersion`
- `jobId`
- `source`
- `language`
- `transcriptText`
- `segments`
- `words`
- `meta`

## `source`

- `mediaType`
  - `video`
  - `audio`
- `sourceVideoPath`
  - absolute local path when the source is a video
  - otherwise `null`
- `sourceAudioPath`
  - absolute local path when the source is an audio file
  - otherwise `null`

## `segments[]`

Each segment must include:

- `id`
- `start`
- `end`
- `duration`
- `text`
- `words`

Rules:

- `start`, `end`, and `duration` are numeric seconds
- timestamps should be rounded to 3 decimal places
- `end` must be strictly greater than `start`
- `duration` should equal `end - start` after rounding
- `text` must be trimmed and non-empty
- `words` may be an empty array in v1

## `words[]`

Word-level timing is optional in v1.

When available, each word object should include:

- `id`
- `start`
- `end`
- `duration`
- `text`

Rules:

- timestamps should be rounded to 3 decimal places
- `end` must be greater than or equal to `start`
- `text` must be trimmed and non-empty

## `meta`

- `provider`
- `model`
- `task`
- `enableTimestamps`
- `createdAt`
- `requestPath`
- `responsePath`
- `manifestPath`

## Downstream Rule

Downstream tools should treat `normalized-transcript.json` as the only stable subtitle timeline source.

Do not bind subtitle packaging to provider-native fields such as:

- `text_details`
- `timestamps`
- `output.segments`
- `data.outputs[0].text_details`
