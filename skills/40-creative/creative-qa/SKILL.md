---
name: creative-qa
description: Record human-in-the-loop quality judgments for generated images, voice takes, and videos in short-form production. Use this when a person has reviewed an asset and you need structured verdicts, reasons, issue categories, and rerun guidance without turning subjective approval into untracked chat history.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Creative QA

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill after a human has actually reviewed an asset.

This skill is for:

- recording human judgments about generated assets
- preserving why something was approved, revised, or rejected
- pointing feedback back to the stage that should change
- turning review notes into structured data for later analysis

This skill is not for autonomous AI approval.

## Core Idea

The first version should assume:

- humans decide quality
- AI may help summarize or prefill observations
- only human-confirmed feedback becomes the durable QA record

If there is no human feedback yet, there may be no QA record yet. That is acceptable.

## Human Rule

Do not invent a final verdict on behalf of a human reviewer.

Allowed:

- turn human notes into structured fields
- normalize categories
- suggest likely blame stages

Not allowed:

- silently approving an asset
- replacing a human verdict with an AI guess

## Objects

### 1. QA Report

One review record tied to one asset version.

Should include:

- `qaReportId`
- `targetObjectType`
- `targetObjectId`
- `targetVersion`
- `reviewer`
- `verdict`
- `goodReasons`
- `badReasons`
- `issueCategories`
- `blameStage`
- `proposedAction`

### 2. Feedback Record

An optional follow-up object that can be consumed by rerun workflows.

Should include:

- `feedbackId`
- `qaReportId`
- `feedbackCategory`
- `feedbackText`
- `dependencyImpact`
- `rerunTarget`

`rerunTarget` must point to the original skill that should rerun, such as
`image-batch-runner`, `voice-batch-runner`, `video-batch-runner`, or
`subtitle-packager`. Do not use vague stage labels such as `voice` or `render`
as the durable rerun target.

## Scope

This skill should support human review records for:

- `image`
- `voice_take`
- `video_render`
- `final_export`

## Local Persistence Convention

Store QA next to the asset being reviewed.

In the released PostPlus runtime:

- keep draft QA notes or intermediate review payloads under
  `<work-folder>/.postplus/creative-qa/`
- keep the final confirmed QA record next to the reviewed asset or final
  deliverable

One possible project-local layout is:

```text
<work-folder>/.postplus/creative-qa/video-render/
  qa-v1.json
```

or:

```text
reviews/voice-take-1.review.json
```

The key requirement is stable linkage back to the reviewed object.

## Review Categories

Common issue categories:

- `lip_sync`
- `persona_drift`
- `audio_style`
- `audio_pacing`
- `hook_weak`
- `ad_like`
- `ugc_native_feel`
- `visual_realism`
- `subtitle_accuracy`
- `mixed`

Common blame stages:

- `image`
- `script`
- `voice`
- `render`
- `subtitle`
- `mixed`

## Output Rule

The QA layer should answer:

- what was reviewed
- who reviewed it
- what they decided
- why they decided it
- what should happen next

Read [`references/qa-schema.md`](references/qa-schema.md) when creating or updating these files.

## Executable ABI

Use the local script only after a human reviewer has supplied a verdict and
reasons. It packages confirmed review data; it does not infer approval or
rejection.

Command:

```bash
node scripts/build_creative_qa_record.mjs --input <input.json> --output <qa-record.json>
```

`--input` is required. The input JSON must include:

- `qaReportId`
- `targetObjectType`
- `targetObjectId`
- `targetVersion`
- `reviewer`
- `reviewedAt`
- `verdict`: `approved`, `revise`, or `reject`
- `goodReasons`: non-empty array
- `proposedAction`

When `verdict` is `revise` or `reject`, the input must also include:

- `badReasons`: non-empty array
- `issueCategories`: non-empty array

For `approved`, `badReasons` and `issueCategories` may be empty arrays.

If `feedbackText` is provided, the input must also include `rerunTarget`, and
`rerunTarget` must name the rerunnable skill rather than a vague stage label.
