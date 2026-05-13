# Audio Transcription Tool Contract

The normalized request object below is a domain payload. Hosted transcription
scripts do not execute it directly. The executable file passed to `--request`
must wrap the normalized request in the hosted execution envelope:

```json
{
  "schemaVersion": 1,
  "input": {
    "...": "normalized transcription request"
  }
}
```

## Normalized Request Shape

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

This object is the executable envelope's `input` value.

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
- The submit script returns the provider's current status and stable generation
  handle. Use `scripts/poll_transcription.mjs` with the same request file to
  resume until the provider returns `completed` or `failed`.
