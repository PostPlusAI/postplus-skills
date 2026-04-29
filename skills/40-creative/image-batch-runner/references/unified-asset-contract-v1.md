# Unified Asset Contract v1

This document defines a workspace-level asset contract for image and video production.

The goal is to keep related media under one asset folder without losing:

- traceability
- rerun history
- provider debugging data
- human QA state

This contract is intended to replace the older assumption that one generation job should always map to one top-level media folder.

## Core Principle

A folder should represent one durable creative asset, not one provider call.

Examples:

- one talking-head concept
- one cover candidate family
- one approved persona source image plus its downstream edits and renders

Under this contract:

- one asset can have many image runs
- one asset can have many video runs
- all related files live under one asset root
- individual provider calls are recorded as run manifests, not as folder boundaries

## Recommended Layout

```text
customers/<customer-id>/campaigns/<campaign-id>/assets/<asset-id>/
  asset.json
  index.json
  inputs/
    brief.md
    references/
    requests/
      image-request.current.json
      video-request.current.json
  images/
    source/
    candidates/
    approved/
    rejected/
  audio/
    source/
    candidates/
    approved/
  videos/
    candidates/
    approved/
    rejected/
  runs/
    image/
      image-run-001/
        request.json
        response.json
        manifest.json
      image-run-002/
        request.json
        response.json
        manifest.json
    video/
      video-run-001/
        request.json
        response.json
        manifest.json
    upload/
      upload-run-001/
        request.json
        response.json
        manifest.json
  qa/
    review.md
    decisions.json
```

## Why This Shape Works

This layout separates three concerns:

1. durable asset identity
2. media files people actually browse and reuse
3. run-by-run audit records

That gives a cleaner browsing experience than:

- `images/<job-id>/...`
- `videos/<job-id>/...`

while still preserving the data needed for reruns and debugging.

## Folder Responsibilities

### `asset.json`

The stable identity card for the asset.

Suggested fields:

```json
{
  "assetId": "female-1-gmail-fixer-v1",
  "campaignId": "example-co-week1-audio-qa-2026-03",
  "customerId": "example-co",
  "personaId": "female-1-discovery-workflow-sharer",
  "conceptId": "BENCHMARK-7203831628173626670",
  "assetPurpose": "talking_head",
  "status": "review_pending",
  "heroImagePath": "images/approved/cover-001.png",
  "heroVideoPath": "videos/approved/render-001.mp4",
  "sourceBasis": [
    "customers/<customer-id>/campaigns/week1-audio-qa-2026-03/benchmark-analysis/female-1-cover-shortlist-2026-03-25.md"
  ],
  "createdAt": "2026-03-25T00:00:00.000Z",
  "updatedAt": "2026-03-25T00:00:00.000Z"
}
```

Rules:

- `asset.json` should be the main entrypoint for tools and humans
- it should point to current approved outputs
- it should not duplicate the full provider response

### `index.json`

The flattened inventory for fast browsing.

Suggested fields:

```json
{
  "assetId": "female-1-gmail-fixer-v1",
  "images": [
    {
      "path": "images/candidates/img-001.png",
      "kind": "candidate",
      "originRunId": "image-run-001"
    }
  ],
  "videos": [
    {
      "path": "videos/candidates/render-001.mp4",
      "kind": "candidate",
      "originRunId": "video-run-001"
    }
  ],
  "audio": [
    {
      "path": "audio/approved/take-001.wav",
      "kind": "approved",
      "originRunId": "voice-run-003"
    }
  ]
}
```

Rules:

- `index.json` is the browse layer
- it can be regenerated from run manifests if needed
- it should not be the only source of truth

## Run Manifest Contract

Every provider call should still persist a run-level manifest.

The difference from the old design is:

- run manifests live under `runs/`
- media files live under `images/`, `videos/`, `audio/`
- the top-level asset folder is stable across many runs

### Common Run Manifest Shape

```json
{
  "runId": "image-run-001",
  "assetId": "female-1-gmail-fixer-v1",
  "mediaType": "image",
  "provider": "hosted-media",
  "model": "image-nano-banana-2-edit",
  "mode": "edit",
  "createdAt": "2026-03-25T00:00:00.000Z",
  "requestPath": "runs/image/image-run-001/request.json",
  "responsePath": "runs/image/image-run-001/response.json",
  "inputs": {
    "imagePaths": [
      "images/source/base.png"
    ],
    "audioPaths": [],
    "referencePaths": [
      "inputs/references/benchmark-01.jpg"
    ]
  },
  "outputs": [
    {
      "path": "images/candidates/img-001.png",
      "role": "candidate",
      "mimeType": "image/png"
    }
  ],
  "derivedFrom": [],
  "predictionId": "abc123",
  "providerStatus": "completed"
}
```

### Rules for Run Manifests

- a run manifest must never be the only place where the asset identity is recorded
- outputs should reference shared media folders, not hidden job-private folders
- raw provider payloads should stay close to the run manifest
- one run can output multiple files

## Naming Rules

### Asset IDs

Use asset IDs for durable creative objects.

Good examples:

- `female-1-gmail-fixer-v1`
- `male-1-handheld-builder-cover-v2`
- `wkj-koubo-01-talking-head-v1`

Avoid:

- provider ids
- timestamps as the main asset identity
- opaque UUID-only folder names unless required by another system

### Run IDs

Use run IDs for attempts.

Good examples:

- `image-run-001`
- `image-run-002`
- `video-run-001`
- `upload-run-001`

This keeps reruns cheap and easy to reason about.

## Approval Rules

Do not treat all outputs equally.

Use media subfolders to reflect review state:

- `source/`
- `candidates/`
- `approved/`
- `rejected/`

Rules:

- human-approved files move or copy into `approved/`
- temporary or failed outputs should not become default references
- `asset.json` should point only to current approved hero outputs

## Redundancy Policy

Some redundancy is acceptable and useful.

Recommended:

- duplicate tiny metadata references in `asset.json` and run manifests
- keep raw `request.json` and `response.json` per run

Avoid:

- duplicating the same large binary into many folders without a reason
- storing the same provider response in both `asset.json` and run manifests
- making the browse index and run manifests carry conflicting truths

## Migration from the Current Layout

Current layout tends to look like:

```text
images/<job-id>/
videos/<job-id>/
voices/<voice-id>/
```

Target layout should instead look like:

```text
assets/<asset-id>/
  images/
  audio/
  videos/
  runs/
```

Practical migration rule:

1. choose a stable `assetId`
2. move candidate media into shared media subfolders
3. move each old job folder's metadata into `runs/<media-type>/<run-id>/`
4. update manifest paths so outputs point to `images/` or `videos/`
5. create `asset.json` and `index.json`

## Backward Compatibility Recommendation

Do not break existing workflows all at once.

Suggested transition plan:

1. keep existing `jobId` fields
2. add a new required `assetId` field
3. reinterpret `localOutputDir` as the asset root
4. add a `runId` field for each provider attempt
5. write new outputs into shared asset media folders
6. keep run metadata in `runs/`

This lets older scripts continue to work with smaller patches.

## Minimum Required Fields Going Forward

For any new image or video workflow, require:

- `assetId`
- `runId`
- `campaignId`
- `personaId` when applicable
- `conceptId` when applicable
- `assetPurpose`
- `localAssetDir`
- `sourceBasis`

Do not rely on `jobId` alone as the durable identity.

## Design Summary

The contract should be:

- asset-centric at the folder level
- run-centric at the audit level
- media-centric at the browsing level

That gives the best balance between:

- clean browsing
- low binary duplication
- strong traceability
- future scriptability
