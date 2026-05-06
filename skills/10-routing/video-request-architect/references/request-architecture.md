# Request Architecture

This is the provider-agnostic method for turning prompt logic into a video request.

## Principle

Different models expose different fields.
The reusable part is the request architecture, not the endpoint.

Final provider requests must be self-contained.

If a production plan uses multiple generated segments, that continuity is for
your planning and editing workflow. Do not phrase the final provider request as
if the model has seen a prior segment or remembers previous instructions.

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

- what each reference is binding
- what is inspiration-only, if any
- what the model must not copy from non-binding references
- what references are intentionally excluded

This prevents mixed-reference drift.

Default binding rule:

- user-provided persona images bind character identity unless the user says
  otherwise
- user-provided product images bind product identity unless the user says
  otherwise
- user-provided audio references bind voice identity unless the user says
  otherwise

### 4. Output Spec

State:

- duration
- aspect ratio
- full-screen vs storyboard
- no text / no UI / watermark policy

If the target provider is Seedance 2.0 and the script exceeds 15 seconds, do not keep one long output spec.

Split it into multiple segment specs first.

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

## Segment Planning Rule

If one approved script is longer than a single provider-safe generation window, create a segment plan before writing provider fields.

For Seedance 2.0, treat 15 seconds as the hard ceiling for one generated segment.

Each segment should:

- stay within 15 seconds
- preserve one coherent action unit
- carry only its own dialogue and beat scope
- be usable as a standalone clip
- restate any needed continuity targets inside its own request so it can later
  connect cleanly to adjacent segments when stitched together

Useful planning fields:

```text
Segment id:
Target duration:
Segment purpose:
Continuity targets to restate:
Visible payoff:
Dialogue:
Action:
Reference bindings:
```

Do not solve an oversized script by compressing too many beats into one prompt.

## Reference Binding Rule

If a draft mentions references, make the role of each reference explicit before provider mapping.

Planning shorthand such as `@storyboard` or `@product-detail` is fine in working notes, but the final provider-ready request must convert those handles into explicit bindings.

Bad:

- `Use the attached references`

Better:

- `[图1] controls shot order and camera flow`
- `[图2] controls product color and texture`
- `[视频1] controls pacing and continuity targets that must be restated in this request`

For multi-segment work, each segment's final provider-ready payload must repeat
the full binding lines for every reference it uses.

Do not rely on `same as previous`, segment IDs, or earlier planning prose that
is not pasted into the current request.

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
Binding references:
Inspiration-only references:
Do not copy from inspiration-only references:
Intentionally excluded:

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
- long Seedance scripts are not split, so pacing and controllability collapse
- references are mentioned but not explicitly bound to roles
