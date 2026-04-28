# Subtitle Output Shape

Expected normalized transcript input shape:

```json
{
  "schemaVersion": "subtitle-normalized/v1",
  "transcriptText": "Full text here.",
  "segments": [
    {
      "id": "seg-001",
      "start": 0.4,
      "end": 2.8,
      "duration": 2.4,
      "text": "This is one subtitle line.",
      "words": []
    }
  ],
  "words": []
}
```

Minimum requirements for SRT export:

- `schemaVersion = subtitle-normalized/v1`
- `segments[].start`
- `segments[].end`
- `segments[].text`

Optional chunking metadata:

```json
{
  "chunking": {
    "mode": "basic",
    "maxCharsPerChunk": 42,
    "maxWordsPerChunk": 12,
    "minDuration": 0.8
  }
}
```
