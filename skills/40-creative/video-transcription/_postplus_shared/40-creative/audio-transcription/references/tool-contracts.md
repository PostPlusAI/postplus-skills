# Audio Transcription Tool Contract

## Request Shape

```json
{
  "jobId": "audio-stt-001",
  "provider": "hosted",
  "model": "hosted/stt/whisper",
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
- Use `openai-whisper-turbo` only for rough or cost-sensitive first-pass jobs.
