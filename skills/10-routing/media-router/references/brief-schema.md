# Media Job Brief Schema

Use this shape when reasoning about media-routing decisions.

```json
{
  "jobId": "tt-cut-plan-001",
  "inputType": "video",
  "goal": "edit-plan",
  "quality": "edit-ready",
  "scale": "single",
  "costMode": "quality-first",
  "languages": ["th"],
  "needsTimestamps": true,
  "hasExistingTranscript": false,
  "hasExistingSubtitles": false,
  "hasBrollInventory": true,
  "hasAroll": true,
  "notes": "Need transcript plus B-roll cut points for a short talking-head video."
}
```

Field guidance:

- `inputType`
  - `audio`
  - `video`
  - `transcript`
  - `transcript+assets`
- `goal`
  - `transcript`
  - `subtitles`
  - `semantic-analysis`
  - `beats`
  - `broll-map`
  - `edit-plan`
- `quality`
  - `rough`
  - `subtitle-ready`
  - `edit-ready`
- `scale`
  - `single`
  - `batch`
- `costMode`
  - `cheap-first`
  - `quality-first`
