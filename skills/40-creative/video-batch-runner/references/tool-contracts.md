# Video Tool Contracts

> All `jobId`, `campaignId`, `personaId`, path values, and filenames in the
> examples below are structural placeholders. They illustrate the expected
> shape; no real customer or campaign data appears here.

This file defines the normalized local contract for the video render adapters on the public skill surface.

The normalized request objects below are domain payloads. Hosted video scripts
do not execute these objects directly. The executable file passed to `--request`
must wrap the normalized request in the hosted execution envelope:

```json
{
  "schemaVersion": 1,
  "input": {
    "...": "normalized video request"
  }
}
```

## 1. `generate_video_from_image_audio`

Use when:

- an approved image exists
- an approved voice take exists
- the goal is a talking portrait or singing avatar render

### Normalized request shape

```json
{
  "jobId": "example-co-2026-03-render-001",
  "campaignId": "example-co-2026-03-persona-test",
  "personaId": "example-persona-d-v1",
  "conceptId": "gmail-reply-friction-v1",
  "scriptId": "script-gmail-reply-friction-v1",
  "voiceTakeId": "example-co-2026-03-voice-design-c-v1",
  "imageAssetId": "example-co-2026-03-persona-d-img-001",
  "assetPurpose": "talking_head",
  "provider": "hosted-media",
  "model": "video-infinitetalk",
  "image": "customers/<customer-id>/campaigns/<campaign-id>/images/.../approved/frame-001.png",
  "audio": "customers/<customer-id>/campaigns/<campaign-id>/voices/.../audio/take.wav",
  "maskImage": null,
  "prompt": "subtle natural head motion, realistic ugc talking head",
  "resolution": "720p",
  "seed": -1,
  "localOutputDir": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/videos/example-co-2026-03-render-001",
  "sourceBasis": [],
  "mustKeep": [],
  "canVary": [],
  "feedback": []
}
```

This object is the executable envelope's `input` value.

Hosted execution mapping:

- The CLI skill calls the PostPlus Cloud PostPlus Cloud video service endpoint.
- The server selects the underlying provider and model.
- Request body minimum: `{ "image": "...", "audio": "..." }`
- Response fields to preserve raw:
  - `id`
  - `model`
  - `outputs`
  - `status`
  - `urls`
  - `created_at`

## 2. `generate_video`

Use when:

- the goal is generative video from text, image, or multimodal reference inputs
- the job may be text-to-video, first-frame image-to-video, first+last-frame image-to-video, or multimodal reference video generation

### Normalized request shape

```json
{
  "jobId": "example-co-2026-04-seedance-001",
  "campaignId": "example-co-outreach-2026-04",
  "conceptId": "ugc-hook-v2",
  "assetPurpose": "ugc_variation",
  "provider": "hosted-media",
  "model": "video-seedance-2-text",
  "creativeFormat": "short_form_vertical",
  "targetAspectRatio": "9:16",
  "promptPlan": {
    "subject": "a realistic creator in front of a natural background",
    "storyboardTimeline": [
      "0.0-2.0s: the creator opens the product and brings it into frame. Dialogue: \"first spoken line.\"",
      "2.0-5.0s: the creator demonstrates it, then looks at camera. Dialogue: \"second spoken line.\""
    ],
    "scene": "clean home setting, natural light",
    "style": "real UGC, not a polished studio ad",
    "camera": "handheld close-up, subtle natural motion",
    "mustKeep": ["product label clearly visible", "action is continuous"],
    "mustAvoid": ["exaggerated distortion", "extra fingers", "heavy retouching"]
  },
  "images": [
    {
      "url": "https://example.com/first-frame.jpg",
      "role": "first_frame"
    }
  ],
  "resolution": "720p",
  "ratio": "9:16",
  "duration": 5,
  "seed": -1,
  "returnLastFrame": true,
  "generateAudio": true,
  "localOutputDir": "customers/<customer-id>/campaigns/<campaign-id>/videos/example-co-2026-04-seedance-001",
  "sourceBasis": [],
  "mustKeep": [],
  "canVary": [],
  "feedback": []
}
```

This object is the executable envelope's `input` value.

### Notes

- `request.content` can be passed directly when you need full control.
- If `request.content` is omitted, the adapter will synthesize it from:
  - `prompt` or `promptPlan`
  - `images[]`
  - `videos[]`
  - `audios[]`
  - `draftTaskId`
- `promptPlan.storyboardTimeline` is the canonical place for timecoded action and spoken lines.
- `promptPlan.referenceMap` is converted into `[image 1]...，[image 2]...` style prompt text to better match reference-image guidance.
- `promptPlan.camera`, `promptPlan.shotType`, and `promptPlan.motion` are prompt-planning text only.
- Camera trajectory, object trajectory, motion brush, and brush mask fields are not supported by the current runner and must fail before provider submission.
- For Instagram Meta Ads creative production, set
  `creativeFormat: "instagram_meta_ads"` or `aspectRatio: "3:4"` so the request
  carries the selected PostPlus creative format outside the prompt text.

## 3. `generate_video` reference-motion transfer

Use when:

- the goal is reference image plus reference motion video transfer
- the request can target `video-kling-v2-6-pro-motion-control`

### Normalized request shape

```json
{
  "jobId": "example-co-2026-04-kling-motion-001",
  "campaignId": "example-co-outreach-2026-04",
  "conceptId": "ugc-hook-v3",
  "assetPurpose": "reference_motion_transfer",
  "provider": "hosted-media",
  "model": "video-kling-v2-6-pro-motion-control",
  "image": "customers/<customer-id>/campaigns/<campaign-id>/images/subject.png",
  "motionVideo": "customers/<customer-id>/campaigns/<campaign-id>/videos/reference-motion.mp4",
  "characterOrientation": "image",
  "prompt": "preserve the subject identity and transfer the broad body motion",
  "keepOriginalSound": false,
  "localOutputDir": "customers/<customer-id>/campaigns/<campaign-id>/videos/example-co-2026-04-kling-motion-001",
  "sourceBasis": [],
  "mustKeep": [],
  "canVary": [],
  "feedback": []
}
```

This object is the executable envelope's `input` value.

Provider mapping:

- `image` maps to provider `image`.
- `motionVideo` maps to provider `video`.
- `characterOrientation` maps to provider `character_orientation`.
- `keepOriginalSound` maps to provider `keep_original_sound`.

This is not provider-native structured motion control. Do not add
`cameraTrajectory`, `objectTrajectory`, `motionBrush`, or brush-mask fields to
this contract until a real provider schema exists and the adapter maps those
fields directly.

### Normalized manifest shape

```json
{
  "jobId": "example-co-2026-03-render-001",
  "campaignId": "example-co-2026-03-persona-test",
  "personaId": "example-persona-d-v1",
  "conceptId": "gmail-reply-friction-v1",
  "scriptId": "script-gmail-reply-friction-v1",
  "voiceTakeId": "example-co-2026-03-voice-design-c-v1",
  "imageAssetId": "example-co-2026-03-persona-d-img-001",
  "assetPurpose": "talking_head",
  "provider": "hosted-media",
  "model": "video-infinitetalk",
  "executionEnvelopePath": "/abs/path/.postplus/video-batch-runner/example-co-2026-03-render-001/request.json",
  "pollRequestPath": "/abs/path/.postplus/video-batch-runner/example-co-2026-03-render-001/request.json",
  "pollCommand": "node /abs/path/scripts/poll_prediction.mjs --request /abs/path/.postplus/video-batch-runner/example-co-2026-03-render-001/request.json",
  "archivedRequestPath": "/abs/path/videos/example-co-2026-03-render-001/request.json",
  "responsePath": "/abs/path/videos/example-co-2026-03-render-001/response.json",
  "providerStatus": "completed",
  "createdAt": "2026-03-13T00:00:00.000Z",
  "sourceBasis": [],
  "upstreamRefs": {
    "image": "customers/<customer-id>/campaigns/<campaign-id>/images/.../manifest.json",
    "audio": "customers/<customer-id>/campaigns/<campaign-id>/voices/.../manifest.json"
  },
  "assets": [
    {
      "assetId": "example-co-2026-03-render-001-video-001",
      "localPath": "/abs/path/renders/render-001.mp4",
      "remoteUrl": "https://...",
      "mimeType": "video/mp4",
      "createdAt": "2026-03-13T00:00:00.000Z"
    }
  ],
  "feedback": []
}
```

## 4. `poll_prediction`

Use when:

- the provider returns a prediction ID and async status
- you need to refresh local response and manifest later

Expected inputs:

- `--request <execution-envelope-request.json>` is required. This must be the
  hosted execution envelope (`schemaVersion: 1` with `input`), not the archived
  normalized request under `videos/.../request.json`.
- `--response <response.json>` is optional; when omitted, the script reads the
  response from the request's output directory
- `--result-url <url>` is optional when the response does not include a pollable
  `urls.get` or hosted prediction id

Expected outputs:

- refreshed `response.json`
- refreshed `manifest.json`
- downloaded assets if status is `completed`

The CLI skill calls the PostPlus Cloud hosted polling endpoint.

The server maps to the underlying provider's async result API and returns a normalized status response.
