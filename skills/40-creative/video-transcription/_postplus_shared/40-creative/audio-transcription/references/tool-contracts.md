# Audio Transcription Tool Contract

## Request Shape

```json
{
  "jobId": "audio-stt-001",
  "provider": "hosted-media",
  "model": "transcription-whisper",
  "audio": "/absolute/or/public/audio.mp3",
  "language": "auto",
  "task": "transcribe",
  "prompt": "Use product names exactly as they appear in the script.",
  "enableTimestamps": true,
  "enableSyncMode": false,
  "durationSeconds": 42,
  "localOutputDir": "tmp/audio-stt-001"
}
```

## Persisted Files

- `request.json`
- `response.json`
- `manifest.json`
- `outputs/*`

## Notes

- `durationSeconds` is required. Use the source media duration rounded up to the
  nearest whole second; hosted transcription uses it for billing and rejects
  requests that omit it.
- `enableTimestamps=true` should be the default when the downstream goal is subtitles or edit prep.
- Use `transcription-whisper-turbo` only for rough or cost-sensitive first-pass jobs.
- The CLI script logs a pre-submission polling estimate. Inputs at or above 300
  seconds are flagged as possibly exceeding the current 5-minute polling window;
  timeout behavior is fail-fast, not an automatic fallback to a longer poller.
