# Video Transcription Tool Contract

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
- The CLI script logs a pre-submission polling estimate. Inputs at or above 300
  seconds are flagged as possibly exceeding the current 5-minute polling window;
  timeout behavior is fail-fast, not an automatic fallback to a longer poller.
