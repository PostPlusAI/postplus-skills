# Video Transcription Tool Contract

## Hosted Execution Envelope

`scripts/transcribe_video.mjs` requires a `schemaVersion: 1` hosted execution
envelope. The video transcription request shape below is the envelope's `input`
value; do not pass it as a bare `--request` file.

```json
{
  "schemaVersion": 1,
  "input": {
    "...": "video transcription request"
  }
}
```

## Request Shape

```json
{
  "jobId": "video-stt-001",
  "provider": "hosted-media",
  "model": "transcription-whisper-with-video",
  "video": "/absolute/or/public/video.mp4",
  "language": "auto",
  "task": "transcribe",
  "prompt": "Keep product names and platform names spelled exactly.",
  "enableTimestamps": true,
  "enableSyncMode": false,
  "durationSeconds": 42,
  "localOutputDir": "tmp/video-stt-001"
}
```

## Notes

- `durationSeconds` is required. Use the source media duration rounded up to the
  nearest whole second; hosted transcription uses it for billing and rejects
  requests that omit it.
- For subtitle or edit-prep jobs, `enableTimestamps=true` should be the default.
- Use `task=translate` only when the target output should be English text.
- Persist `normalized-transcript.json` as the stable intermediate timeline object for downstream subtitle packaging.
- The submit script returns the provider's current status and stable generation
  handle. Use `audio-transcription/scripts/poll_transcription.mjs` with the same
  request file to resume until the provider returns `completed` or `failed`.
