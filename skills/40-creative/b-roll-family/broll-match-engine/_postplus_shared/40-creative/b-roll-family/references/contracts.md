# Shared Contracts For B-roll Family

This document defines the first-version input and output contracts for the B-roll skill family.

These contracts are intentionally pragmatic.

They should be specific enough to support real planning, but not so rigid that the first implementation becomes brittle.

## 1. `broll-catalog.json`

The asset mother file for available B-roll.

```json
{
  "schemaVersion": "broll-catalog/v1",
  "catalogId": "example-co-week1-broll-001",
  "sourceRoot": "/abs/path/to/broll",
  "assets": [
    {
      "assetId": "broll-001",
      "path": "/abs/path/to/broll/ui-demo-01.mp4",
      "mediaType": "video",
      "duration": 4.2,
      "usableRanges": [
        { "start": 0.4, "end": 3.6, "reason": "clean UI interaction" }
      ],
      "literalDescription": "cursor opens gmail reply box and rewrites text",
      "semanticTags": ["ui-demo", "reply", "workflow", "gmail", "rewrite"],
      "supportRoles": ["proof", "ui-demo", "workflow-bridge"],
      "energy": "medium",
      "platformFit": ["9:16", "16:9"],
      "visualRisks": ["small text"],
      "notes": "best for reply workflow claim"
    }
  ],
  "meta": {
    "createdAt": "2026-04-08T00:00:00Z",
    "sourceType": "local-folder"
  }
}
```

### Required Fields

- `schemaVersion`
- `catalogId`
- `assets[]`
- `assets[].assetId`
- `assets[].path`
- `assets[].mediaType`
- `assets[].semanticTags`
- `assets[].supportRoles`

### Important Meaning

`semanticTags`

- what the asset is about in human language

`supportRoles`

- what edit job the asset can do

`usableRanges`

- the best subranges to cut from a longer clip

## 2. `broll-plan.json`

The match result between edit beats and B-roll candidates.

```json
{
  "schemaVersion": "broll-plan/v1",
  "planId": "example-co-week1-render-001-broll-plan",
  "sourceTranscriptPath": "/abs/path/normalized-transcript.json",
  "sourceChunkPath": "/abs/path/chunked-basic.json",
  "sourceCatalogPath": "/abs/path/broll-catalog.json",
  "beats": [
    {
      "beatId": "beat-003",
      "start": 5.918,
      "end": 8.164,
      "spokenText": "not even the writing it is the workflow around the writing",
      "beatRole": "problem-definition",
      "visualNeed": "workflow-bridge",
      "shouldUseBroll": true,
      "coverageStyle": "full-cutaway",
      "keywordOverlay": ["workflow"],
      "motionHint": "gentle-push-in",
      "candidates": [
        {
          "assetId": "broll-002",
          "score": 0.91,
          "reason": "shows surrounding workflow rather than text generation itself",
          "supportRole": "workflow-bridge",
          "suggestedRange": { "start": 0.8, "end": 2.7 }
        }
      ],
      "fallback": "stay on A-roll with keyword emphasis"
    }
  ],
  "meta": {
    "createdAt": "2026-04-08T00:00:00Z"
  }
}
```

### Required Fields

- `schemaVersion`
- `planId`
- `beats[]`
- `beats[].beatId`
- `beats[].spokenText`
- `beats[].visualNeed`
- `beats[].shouldUseBroll`
- `beats[].candidates`

### Important Meaning

`visualNeed`

- what the beat needs visually

`coverageStyle`

- how the B-roll should be used:
  - `full-cutaway`
  - `split-emphasis`
  - `picture-in-picture`
  - `overlay-support`
  - `stay-on-face`

`motionHint`

- a packaging hint, not a render instruction

## 3. Beat Input Contract

`broll-match-engine` should prefer these upstream inputs:

- normalized transcript
- chunked subtitle draft
- optional A-roll semantic analysis
- B-roll catalog

It should not depend on raw provider payloads.

## 4. Support Role Vocabulary

Use a small shared vocabulary:

- `proof`
- `ui-demo`
- `workflow-bridge`
- `pace-reset`
- `keyword-emphasis`
- `comparison`
- `transition-cover`
- `cta-support`

Do not invent ad hoc labels per run unless a real new category is needed.

## 5. Match Confidence

Each candidate should be explainable.

Use a score only as a convenience layer.

The real requirement is:

- why this beat needs support
- why this asset fits
- why it is primary or secondary

If the plan only gives numbers without reasons, it is not reviewable enough.

## 6. `edit-enhancement-package.json`

The packaging result after B-roll matching.

Detailed contract:

- `references/edit-enhancement-contract.md`

This file coordinates:

- A-roll stay-on-face logic
- B-roll usage mode
- keyword emphasis
- micro-motion hints
- subtitle treatment

It should consume `broll-plan.json` and should not rediscover B-roll assets from scratch.
