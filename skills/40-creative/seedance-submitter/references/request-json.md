# Request JSON

Use this shape for Seedance 2.0 request records on the public skill surface.

## Required Top-Level Fields

- `jobId`
- `provider`
- `model`
- `localOutputDir`

Model-specific required fields:

- `video-seedance-2-text` / `video-seedance-2-text-turbo`: `prompt_summary`,
  plus `promptPlan.prompt_storyline`, unless `final_prompt` is intentionally
  supplied
- `video-seedance-2-image` / `video-seedance-2-image-turbo`: `prompt_summary`,
  plus `promptPlan.prompt_storyline`, unless `final_prompt` is intentionally
  supplied, plus `image`

Recommended context fields:

- `campaignId`
- `personaId`
- `conceptId`
- `scriptId`
- `assetPurpose`
- `resolution`
- `ratio`
- `duration`
- `targetEditDurationSeconds`
- `timeline`
- `prompt_summary`
- `final_prompt`
- `enableWebSearch`
- `sourceBasis`
- `feedback`
- `segmentContract`
- `continuityPolicy`
- `continuityReport`

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

## Provider Duration And Target Edit Duration

`duration` is the provider duration bucket sent to PostPlus Cloud and Seedance.
It must stay one of `5`, `10`, or `15`.

`targetEditDurationSeconds` is the intended final creative length after edit
trim. It may be fractional and may be shorter than `duration`, but it must not
be longer than `duration`.

When the target edit duration is shorter than the provider bucket, include a
`timeline` block:

```json
{
  "duration": 10,
  "targetEditDurationSeconds": 7.5,
  "timeline": {
    "activePerformanceEndSeconds": 7.5,
    "tailStrategy": "natural_hold_for_trim"
  },
  "prompt_summary": "Creator completes one active demonstration.",
  "promptPlan": {
    "prompt_storyline": [
      {
        "shot": "shot 1",
        "time": "0-7.5s",
        "visual": "complete the active demonstration.",
        "dialogue": "spoken line here"
      },
      {
        "shot": "shot 2",
        "time": "7.5-10s",
        "visual": "natural hold for trim; subtle breathing only, no new action.",
        "timelineRole": "tail"
      }
    ]
  }
}
```

Allowed `timeline.tailStrategy` values:

- `natural_hold`
- `natural_hold_for_trim`
- `micro_expression`
- `settle`
- `loopable_tail`

The validator rejects target edit durations longer than the provider duration.
When `targetEditDurationSeconds < duration`, the validator requires
`timeline.activePerformanceEndSeconds` and `timeline.tailStrategy`.

## PromptPlan Fields

```json
{
  "promptPlan": {
    "subject": "",
    "prompt_storyline": [
      {
        "shot": "shot 1",
        "time": "0.0-2.5s",
        "visual": "visible action here",
        "dialogue": "spoken line here"
      },
      {
        "shot": "shot 2",
        "time": "2.5-5.0s",
        "visual": "next visible action here",
        "dialogue": "next spoken line here"
      }
    ],
    "scene": "",
    "style": "",
    "camera": "",
    "audio": "",
    "mustKeep": [],
    "mustAvoid": [
      "subtitles",
      "on-screen text",
      "watermark"
    ],
    "referenceMap": []
  }
}
```

## Segment Contract

For any request that belongs to a source script above 15 seconds, include a
`segmentContract` copied from `video-request-architect`.

```json
{
  "duration": 15,
  "totalDurationSeconds": 26,
  "segmentContract": {
    "segmentId": "segment-01",
    "targetDurationSeconds": 15,
    "standalonePayoff": "Fix is introduced with proof.",
    "continuityTargetsToRestate": [
      "creator identity",
      "red product box"
    ],
    "dialogueScope": "Now watch the fix. This is why it saves time.",
    "actionScope": "Creator opens the product and shows proof."
  }
}
```

Before submission, validate the request:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/validate_seedance_request_contract.mjs \
  --input path/to/request.seed.json
```

## Continuity Policy

Use `continuityPolicy` when the request claims cross-segment consistency for
character, voice, product, or environment.

The main purpose is not to make the provider remember previous segments. The
purpose is to make the request explicit about what continuity is being claimed
and what evidence actually supports that claim in this one request.

Suggested shape:

```json
{
  "continuityPolicy": {
    "character": {
      "target": "same electronics shop owner",
      "targetType": "character",
      "evidenceMode": "image-bound",
      "requiredRefs": [
        "persona-front"
      ]
    },
    "voice": {
      "target": "same owner voice",
      "targetType": "voice",
      "evidenceMode": "audio-bound",
      "requiredRefs": [
        "voice-take-v1"
      ]
    },
    "product": {
      "target": "same Qmove app and brand identity",
      "targetType": "product",
      "evidenceMode": "image-bound",
      "requiredRefs": [
        "logo-ref",
        "app-ui-ref"
      ]
    },
    "environment": {
      "target": "same cramped electronics shop",
      "targetType": "environment",
      "evidenceMode": "image-bound",
      "requiredRefs": [
        "shop-env-ref"
      ]
    }
  }
}
```

Expected `evidenceMode` values:

- `text-only`
- `image-bound`
- `audio-bound`
- `multimodal-bound`

Use `text-only` only when you are being honest that the request is constrained
by description alone.

## Continuity Report

The validator now returns a `continuityReport` block.

Interpret it conservatively:

- `text-only`: do not say the continuity is locked
- `image-bound`: visual continuity has real support
- `audio-bound`: voice continuity has real support
- `multimodal-bound`: stronger continuity support across image and audio

If the report contains warnings, user-facing copy should prefer wording such as:

- `已约束，未锁定`
- `建议补一张人物图`
- `建议补一个 voice take`

Do not say `same owner locked` or equivalent when the report is only
`text-only`.

## Storyboard Timeline Rule

The exact voiceover must live inside `promptPlan.prompt_storyline`, on the
same timeline as the visible action.

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
    "prompt_storyline": [
      {
        "shot": "shot 1",
        "time": "0:00-0:03",
        "visual": "visible action here",
        "dialogue": "exact spoken line."
      },
      {
        "shot": "shot 2",
        "time": "0:03-0:07",
        "visual": "next visible action here",
        "dialogue": "exact spoken line."
      }
    ],
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

The request examples in this reference are Seedance domain payloads. The hosted
scripts below require a `schemaVersion: 1` execution envelope and read the
Seedance request from `input`.

Upload images with:

```bash
node ${CLAUDE_SKILL_DIR}/../image-batch-runner/scripts/upload_media.mjs --request path/to/upload-request.json
```

Submit video with:

```bash
node ${CLAUDE_SKILL_DIR}/../video-batch-runner/scripts/generate_video_from_image_audio.mjs --request path/to/request.seed.json
```

Poll with:

```bash
node ${CLAUDE_SKILL_DIR}/../video-batch-runner/scripts/poll_prediction.mjs --request path/to/request.json
```
