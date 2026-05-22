# Edit Enhancement Contract

This document defines `edit-enhancement-package.json`.

It sits after `broll-plan.json` and before any renderer, NLE export, or human editor pass.

## Purpose

`broll-plan.json` answers:

- what B-roll could support this beat

`edit-enhancement-package.json` answers:

- how should this beat be edited
- who owns attention
- what should happen to subtitles
- what keyword or motion cue should be used

## Contract

```json
{
  "schemaVersion": "edit-enhancement-package/v1",
  "packageId": "example-co-week1-render-001-enhancement",
  "sourceBrollPlanPath": "/abs/path/broll-plan.json",
  "sourceChunkPath": "/abs/path/chunked-basic.json",
  "target": {
    "platform": "short-video",
    "aspectRatio": "9:16",
    "styleProfile": "basic"
  },
  "beats": [
    {
      "beatId": "seg-005-c02",
      "start": 20.533,
      "end": 22.291,
      "spokenText": "in gmail and use the tool in the",
      "attentionOwner": "b-roll-proof",
      "aRollAction": "picture-in-picture",
      "brollAction": {
        "mode": "picture-in-picture",
        "assetId": "broll-003",
        "range": { "start": 0.2, "end": 2.4 },
        "confidence": "medium",
        "reason": "product proof should carry the moment",
        "placementPolicy": {
          "mode": "dynamic-protected-zone",
          "target": "picture-in-picture",
          "protectedZones": [
            "face",
            "worn-product",
            "primary-product-action",
            "truth-bearing-ui",
            "subtitle-safe-area"
          ],
          "candidateAnchors": [
            "lower-right",
            "lower-left",
            "middle-right",
            "middle-left",
            "upper-right",
            "upper-left"
          ],
          "selectionRule": "sample representative A-roll frames for the beat and choose the first anchor whose inset box does not overlap protected zones; stop for human placement review if no safe anchor exists",
          "allowFixedDefault": false
        }
      },
      "keywordEmphasis": {
        "mode": "subtitle-highlight",
        "keywords": ["product", "gmail"],
        "intensity": "medium"
      },
      "microMotion": {
        "preset": "gentle-push-in",
        "intensity": "subtle",
        "reason": "make UI proof feel active without distracting from subtitle"
      },
      "subtitleTreatment": {
        "mode": "lift-up",
        "reason": "avoid covering screen-recording UI"
      },
      "editorNote": "Use only if the product shortcut frame is readable in 9:16 crop."
    }
  ],
  "meta": {
    "createdAt": "2026-04-11T00:00:00Z"
  }
}
```

## Required Fields

- `schemaVersion`
- `packageId`
- `sourceBrollPlanPath`
- `beats[]`
- `beats[].beatId`
- `beats[].attentionOwner`
- `beats[].aRollAction`
- `beats[].brollAction`
- `beats[].keywordEmphasis`
- `beats[].microMotion`
- `beats[].subtitleTreatment`

## Attention Owner Vocabulary

Use one of:

- `a-roll-face`
- `b-roll-proof`
- `subtitle-keyword`
- `transition-motion`

Meaning:

- `a-roll-face`: face performance should carry trust or emotion
- `b-roll-proof`: B-roll should carry proof or explanation
- `subtitle-keyword`: text emphasis should carry the point
- `transition-motion`: motion exists mainly for pacing or reset

## A-roll Action Vocabulary

Use one of:

- `stay-on-face`
- `cut-away`
- `punch-in`
- `return-to-face`
- `picture-in-picture`

## B-roll Mode Vocabulary

Use one of:

- `none`
- `full-cutaway`
- `overlay-support`
- `picture-in-picture`
- `split-emphasis`

For talking-head proof beats, prefer `picture-in-picture`. The renderer or
human editor must choose the actual anchor from a placement policy after
checking representative A-roll frames. Do not treat any corner as a fixed
default.

## B-roll Placement Policy

`brollAction.placementPolicy` records how a renderer or editor should place
the inset.

Use `dynamic-protected-zone` when B-roll appears over A-roll. The policy must
name protected zones such as:

- `face`
- `worn-product`
- `primary-product-action`
- `truth-bearing-ui`
- `subtitle-safe-area`

If no candidate anchor avoids those zones, stop for human placement review.
Do not silently fall back to a fixed corner.

## Keyword Emphasis Modes

Use one of:

- `none`
- `subtitle-highlight`
- `keyword-card`
- `inline-pop`

Keep v1 conservative.

Do not use keyword cards on every beat.

## Micro-motion Presets

Use one of:

- `none`
- `keyword-pop`
- `gentle-push-in`
- `soft-slide`
- `quick-cut-contrast`
- `hold-clean`
- `soft-fade`

These are editor hints, not final animation code.

## Subtitle Treatment Modes

Use one of:

- `normal`
- `lift-up`
- `reduce-density`
- `keyword-highlight`
- `hold`

Use `lift-up` when B-roll UI is near the bottom.

Use `reduce-density` when proof footage needs more visual space.

## First-Version Decision Rules

Default to `a-roll-face` when:

- there is no strong B-roll candidate
- spoken line is connective or emotional
- B-roll would add noise rather than proof

Default to `b-roll-proof` when:

- candidate score is strong
- beat contains product proof, workflow contrast, or UI demo
- B-roll has a clear support role

Default to `subtitle-keyword` when:

- there is a key concept but weak B-roll
- the line is too short for a useful cutaway

Default to `transition-motion` when:

- the beat is a pacing bridge
- B-roll is decorative rather than proof
