# Request JSON

Use this shape for Seedance 2.0 request records on the released shell.

## Required Top-Level Fields

- `jobId`
- `provider`
- `model`
- `localOutputDir`

Model-specific required fields:

- `video-seedance-2-text` / `video-seedance-2-text-turbo`: `prompt` or
  `promptPlan`
- `video-seedance-2-image` / `video-seedance-2-image-turbo`: `prompt` or
  `promptPlan`, plus `image`

Recommended context fields:

- `campaignId`
- `personaId`
- `conceptId`
- `scriptId`
- `assetPurpose`
- `resolution`
- `ratio`
- `duration`
- `enableWebSearch`
- `sourceBasis`
- `feedback`

## Defaults

```json
{
  "provider": "hosted-media",
  "model": "video-seedance-2-text",
  "resolution": "720p",
  "ratio": "9:16",
  "duration": 15,
  "enableWebSearch": false
}
```

## PromptPlan Fields

```json
{
  "promptPlan": {
    "subject": "",
    "action": "",
    "scene": "",
    "style": "",
    "camera": "",
    "dialogue": "",
    "audio": "",
    "mustKeep": [],
    "mustAvoid": [
      "字幕",
      "屏幕文字",
      "水印"
    ],
    "referenceMap": []
  }
}
```

## Dialogue Rule

The exact voiceover must be inside `promptPlan.dialogue`.

Bad:

```json
{
  "promptPlan": {
    "audio": "Use the supplied voiceover."
  },
  "feedback": [
    "0:00-0:03 exact spoken line..."
  ]
}
```

Good:

```json
{
  "promptPlan": {
    "dialogue": "0:00-0:03 exact spoken line. 0:03-0:07 exact spoken line.",
    "audio": "English female UGC voiceover. No subtitles. No screen text. No watermark."
  }
}
```

## Reference Images

For text-to-video reference conditioning, use uploaded URLs, not local paths:

```json
{
  "referenceImages": [
    "https://...",
    "https://..."
  ]
}
```

For image-to-video models, use top-level `image` for the required first frame:

```json
{
  "image": "https://..."
}
```

Use `sourceBasis` to preserve original local paths:

```json
{
  "sourceBasis": [
    "/absolute/path/to/storyboard.jpg",
    "/absolute/path/to/product.png"
  ]
}
```

## Submission Commands

Upload images with:

```bash
node skills/40-creative/image-batch-runner/scripts/upload_media.mjs --request path/to/upload-request.json
```

Submit video with:

```bash
node skills/40-creative/video-batch-runner/scripts/generate_video_from_image_audio.mjs --request path/to/request.seed.json
```

Poll with:

```bash
node skills/40-creative/video-batch-runner/scripts/poll_prediction.mjs --request path/to/request.json
```
