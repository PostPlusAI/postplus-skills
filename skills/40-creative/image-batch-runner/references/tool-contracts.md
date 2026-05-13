# Image Tool Contracts

> All `assetId`, `jobId`, `campaignId`, `personaId`, path values, and
> filenames in the examples below are structural placeholders. They illustrate
> the expected shape; no real customer or campaign data appears here.

This file defines the normalized tool-layer contracts for image generation.

The goal is to keep upstream workflow stable even if the provider or exact curl payload changes.

The normalized request objects below are domain payloads. Hosted image scripts
do not execute these objects directly. The executable file passed to `--request`
must wrap the relevant normalized request in the hosted execution envelope:

```json
{
  "schemaVersion": 1,
  "input": {
    "...": "normalized image request"
  }
}
```

## 1. `generate_image`

Purpose:

- create new image candidates from a fact-grounded prompt pack

Normalized request shape:

```json
{
  "assetId": "example-co-th-001-persona-a",
  "runId": "image-run-001",
  "jobId": "example-co-2026-03-th-001-persona-a",
  "campaignId": "example-co-2026-03-persona-test",
  "personaId": "example-persona-a-v1",
  "conceptId": "EXAMPLE-TH-001",
  "assetPurpose": "persona_candidate",
  "provider": "hosted-media",
  "model": "image-nano-banana-2-text",
  "mode": "text-to-image",
  "creativeFormat": "short_form_vertical",
  "targetAspectRatio": "9:16",
  "prompt": "young male knowledge worker, casual authority, home office desk, direct-to-camera tiktok ugc",
  "negativePrompt": "studio ad lighting, luxury office, influencer glam, keynote speaker",
  "aspectRatio": "9:16",
  "resolution": "1080x1920",
  "outputFormat": "png",
  "localAssetDir": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/assets/example-co-th-001-persona-a",
  "sourceBasis": [
    "customers/<customer-id>/reports/example-persona-spec-practical-work-friend-male-v1-2026-03-13.md"
  ],
  "mustKeep": [
    "young male knowledge worker",
    "casual dark top",
    "home office desk",
    "tiktok native realism"
  ],
  "canVary": [
    "glasses on/off",
    "hoodie vs knit sweater",
    "microphone visible or subtle"
  ]
}
```

Executable request file:

```json
{
  "schemaVersion": 1,
  "input": {
    "assetId": "example-co-th-001-persona-a",
    "runId": "image-run-001",
    "jobId": "example-co-2026-03-th-001-persona-a",
    "provider": "hosted-media",
    "model": "image-nano-banana-2-text",
    "mode": "text-to-image",
    "prompt": "young male knowledge worker, casual authority, home office desk, direct-to-camera tiktok ugc",
    "localAssetDir": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/assets/example-co-th-001-persona-a"
  }
}
```

Normalized response shape:

```json
{
  "assetId": "example-co-th-001-persona-a",
  "runId": "image-run-001",
  "jobId": "example-co-2026-03-th-001-persona-a",
  "provider": "hosted-media",
  "model": "image-nano-banana-2-text",
  "mode": "text-to-image",
  "creativeFormat": "short_form_vertical",
  "targetAspectRatio": "9:16",
  "requestPath": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/assets/example-co-th-001-persona-a/runs/image/image-run-001/request.json",
  "responsePath": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/assets/example-co-th-001-persona-a/runs/image/image-run-001/response.json",
  "assets": [
    {
      "assetId": "img-001",
      "localPath": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/assets/example-co-th-001-persona-a/images/candidates/img-001.png",
      "assetRelativePath": "images/candidates/img-001.png",
      "remoteUrl": null,
      "mimeType": "image/png",
      "promptHash": "sha256:...",
      "sourceBasis": [
        "customers/<customer-id>/reports/example-persona-spec-practical-work-friend-male-v1-2026-03-13.md"
      ]
    }
  ]
}
```

Hosted execution mapping:

- The CLI skill calls the PostPlus Cloud PostPlus Cloud image service endpoint.
- The server selects the underlying provider and model.
- Request body minimum: `{ "prompt": "..." }`
- Response fields to preserve raw:
  - `id`
  - `model`
  - `status`
  - `outputs`
  - `urls`
  - `created_at`
  - `has_nsfw_contents`

Recommended normalized request defaults:

```json
{
  "enableSyncMode": false,
  "enableBase64Output": false,
  "enableWebSearch": false,
  "outputFormat": "png",
  "creativeFormat": "short_form_vertical",
  "aspectRatio": "9:16",
  "resolution": "1k"
}
```

Instagram Meta Ads creative format override:

```json
{
  "creativeFormat": "instagram_meta_ads",
  "aspectRatio": "3:4"
}
```

High-resolution additions when needed:

```json
{
  "size": "1440*2560"
}
```

For sequential generation:

```json
{
  "maxImages": 4
}
```

## 2. `upload_media`

Purpose:

- turn a local image file into a provider-accessible URL for downstream edit jobs

Normalized request shape:

```json
{
  "assetId": "example-co-th-001-persona-a",
  "runId": "upload-run-001",
  "jobId": "example-co-2026-03-th-001-upload-a",
  "provider": "hosted-media",
  "localFilePath": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/assets/example-co-th-001-persona-a/images/approved/base.png",
  "localAssetDir": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/assets/example-co-th-001-persona-a"
}
```

This object is the executable envelope's `input` value.

Normalized response shape:

```json
{
  "assetId": "example-co-th-001-persona-a",
  "runId": "upload-run-001",
  "jobId": "example-co-2026-03-th-001-upload-a",
  "provider": "hosted-media",
  "requestPath": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/assets/example-co-th-001-persona-a/runs/upload/upload-run-001/request.json",
  "responsePath": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/assets/example-co-th-001-persona-a/runs/upload/upload-run-001/response.json",
  "uploadedUrl": "https://...",
  "sourceLocalFilePath": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/assets/example-co-th-001-persona-a/images/approved/base.png",
  "sourceAssetRelativePath": "images/approved/base.png"
}
```

Hosted execution mapping:

- The CLI skill calls the PostPlus Cloud hosted media upload endpoint.
- The server handles the upload and returns a durable download URL.
- Response field to extract: `data.download_url`

## 3. `edit_image`

Purpose:

- refine an approved or shortlisted image without throwing away identity consistency

Normalized request shape:

```json
{
  "assetId": "example-co-th-001-persona-a",
  "runId": "image-run-002",
  "jobId": "example-co-2026-03-th-001-edit-a",
  "campaignId": "example-co-2026-03-persona-test",
  "personaId": "example-persona-a-v1",
  "conceptId": "EXAMPLE-TH-001",
  "assetPurpose": "edit_fix",
  "provider": "hosted-media",
  "model": "image-nano-banana-2-edit",
  "mode": "edit",
  "prompt": "keep the same person, reduce studio feel, make the desk setup more natural and home-office-like",
  "inputUrls": [
    "https://..."
  ],
  "localAssetDir": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/assets/example-co-th-001-persona-a",
  "feedback": [
    "background too polished",
    "microphone too prominent"
  ],
  "sourceBasis": [
    "customers/<customer-id>/reports/example-persona-spec-practical-work-friend-male-v1-2026-03-13.md"
  ]
}
```

This object is the executable envelope's `input` value.

Normalized response shape:

```json
{
  "assetId": "example-co-th-001-persona-a",
  "runId": "image-run-002",
  "jobId": "example-co-2026-03-th-001-edit-a",
  "provider": "hosted-media",
  "model": "image-nano-banana-2-edit",
  "mode": "edit",
  "requestPath": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/assets/example-co-th-001-persona-a/runs/image/image-run-002/request.json",
  "responsePath": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/assets/example-co-th-001-persona-a/runs/image/image-run-002/response.json",
  "assets": [
    {
      "assetId": "img-001",
      "localPath": "customers/<customer-id>/campaigns/example-co-2026-03-persona-test/assets/example-co-th-001-persona-a/images/candidates/img-001.png",
      "assetRelativePath": "images/candidates/img-001.png",
      "remoteUrl": null,
      "mimeType": "image/png"
    }
  ]
}
```

Hosted execution mapping:

- The CLI skill calls the PostPlus Cloud hosted image edit capability endpoint.
- The server selects the underlying provider and model.
- local files must be uploaded with `upload_media` first; pass the returned
  `uploadedUrl` into `inputUrls`
- Request body minimum: `{ "images": ["https://..."], "prompt": "..." }`
- Response fields to preserve raw:
  - `id`
  - `model`
  - `status`
  - `outputs`
  - `urls`
  - `created_at`
  - `has_nsfw_contents`

Recommended normalized request defaults:

```json
{
  "enableSyncMode": false,
  "enableBase64Output": false,
  "enableWebSearch": false,
  "outputFormat": "png",
  "creativeFormat": "short_form_vertical",
  "aspectRatio": "9:16",
  "resolution": "1k"
}
```

For multi-image edit:

```json
{
  "maxImages": 4
}
```

## 4. Raw Curl Persistence

Even when the eventual adapter is scripted, persist these files per run:

- `runs/<media-type>/<run-id>/request.json`
- `runs/<media-type>/<run-id>/response.json`
- `runs/<media-type>/<run-id>/manifest.json`
- shared media outputs under `images/`

This makes reruns and debugging cheap.

## 5. Local-First Output Rule

The workflow should treat local files as the durable asset layer.

Provider-hosted URLs are useful but not durable enough to be the only output reference.

## 6. Async Note

High-quality image jobs may return a prediction record before final outputs are ready.

Preferred behavior:

- submit with normalized `request.json`
- persist raw `response.json` even when `outputs` is empty
- poll later using the provider `urls.get`
- only download outputs once `status` becomes `completed`
