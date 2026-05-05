# Request Architecture

This is the provider-agnostic method for turning prompt logic into a video request.

## Principle

Different models expose different fields.
The reusable part is the request architecture, not the endpoint.

Use this order:

1. `goal`
2. `segmentLogic`
3. `referenceContract`
4. `outputSpec`
5. `lookAndTone`
6. `beatSheet`
7. `cameraGrammar`
8. `soundIntent`
9. `productPolicy`
10. `providerMapping`

## Block Rules

### 1. Goal

State the experiment or production goal in one sentence.

Examples:

- `test whether the model can preserve payoff-first hook rhythm`
- `test one proof-led 8-second benefit cut`

### 2. Segment Logic

Must include:

- segment type
- hook logic
- viewer question

This is the strategic core.

### 3. Reference Contract

Define:

- what the model may learn
- what it must not copy
- what references are intentionally excluded

This prevents mixed-reference drift.

### 4. Output Spec

State:

- duration
- aspect ratio
- full-screen vs storyboard
- no text / no UI / watermark policy

### 5. Look And Tone

Use realism constraints, not poetry.

Prefer:

- natural outdoor light
- handheld micro-shake
- slight exposure imperfections
- lived-in environment

Avoid:

- adjective-only stacks like `beautiful, premium, stunning, cinematic`

### 6. Beat Sheet

Write in time order.

Each beat should include:

- what is visible
- who is doing it
- what the camera is doing

Do not hide the action inside long scene prose.

### 7. Camera Grammar

State the dominant camera logic separately:

- selfie
- POV
- drone
- proof close-up
- follow shot
- locked creator frame

### 8. Sound Intent

Optional.
Use only when it helps the generation or later handoff.

Write as ambient intention, not soundtrack fantasy.

### 9. Product Policy

Always state:

- whether the product may appear in the first beat
- whether it is support, proof, or CTA
- whether product imagery is intentionally excluded from this test

### 10. Provider Mapping

Only at the end convert into fields like:

- `model`
- `duration`
- `aspect_ratio`
- `reference_images`
- `reference_videos`
- `reference_audios`
- `resolution`

## First-Pass Strategy

For early testing:

- reduce duration to the smallest useful length
- minimize reference count
- isolate one question per run
- avoid throwing in product images unless the product itself is the tested variable

This is how you preserve diagnosability.

## Universal Template

```text
[ROLE]
You are a top short-form visual director.

[GOAL]
...

[SEGMENT LOGIC]
Segment type:
Hook logic:
Viewer question:

[REFERENCE CONTRACT]
Learn from:
Do not copy:
Intentionally not using:

[OUTPUT SPEC]
...

[LOOK AND TONE]
...

[BEAT SHEET]
0:00-0:01:
0:01-0:02:
...

[CAMERA]
...

[SOUND INTENT]
...

[PRODUCT POLICY]
...
```

## Common Failure Modes

- hook request accidentally becomes a full ad
- storyboard language leaks into the final render format
- references teach identity instead of rhythm
- beat sheet is missing, so the model invents pacing
- product images overpower hook replication testing
