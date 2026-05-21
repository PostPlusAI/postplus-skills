---
name: seedance-submitter
description: Use when preparing, submitting, polling, or debugging Seedance 2.0 video generation jobs from product images, storyboard images, UGC scripts, voiceover copy, or promptPlan request JSON. Use for splitting scripts into render segments, uploading references, creating request JSON, submitting jobs through the PostPlus Cloud service, polling predictions, and handing off local render paths.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Seedance Submitter

Use this skill for Seedance 2.0 generative video jobs routed through the PostPlus Cloud service.

Follow shared public skill rules in:

- `postplus-shared` public skill rules

## Workflow

1. Lock inputs: product image paths, storyboard image path, script, provider
   duration bucket, target edit duration, output root, and whether the user
   wants submit or only JSON.
2. Read [references/current-rules.md](references/current-rules.md).
3. If creating request JSON, read [references/request-json.md](references/request-json.md).
4. Upload local reference images before submission and replace local paths with uploaded URLs.
5. Put timecoded action and spoken lines together in `promptPlan.storyboardTimeline`.
6. Put voice style, BGM, SFX, subtitle, and watermark constraints in `promptPlan.audio`.
7. Validate every Seedance request before submission:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/validate_seedance_request_contract.mjs \
  --input <request.seed.json>
```

8. Submit with `skills/40-creative/video-batch-runner/scripts/generate_video_from_image_audio.mjs` using a `schemaVersion: 1` hosted execution envelope whose `input` is the Seedance request.
9. Poll with `skills/40-creative/video-batch-runner/scripts/poll_prediction.mjs` using the same hosted envelope shape until completed.
10. Report local `renders/render-001.mp4` paths and prediction ids.

If a segment render is still pending, do not block the user's conversation just
to poll. Tell the user the segment is running from a saved checkpoint and
continue independent segment QA, caption prep, or next-segment request review.

If the user says `sd2`, interpret it as Seedance 2.0 unless they explicitly specify another model.

## Target Edit Duration

`duration` is the provider bucket sent to Seedance. It must stay one of `5`,
`10`, or `15`.

For edit targets like `7.5s` or `11-12s`, use the next viable provider bucket
in `duration` and write the intended trim length to
`targetEditDurationSeconds`.

When `targetEditDurationSeconds < duration`, include:

- `timeline.activePerformanceEndSeconds`: latest time where new action or
  dialogue may happen
- `timeline.tailStrategy`: `natural_hold`, `natural_hold_for_trim`,
  `micro_expression`, `settle`, or `loopable_tail`

Example:

```json
{
  "duration": 10,
  "targetEditDurationSeconds": 7.5,
  "timeline": {
    "activePerformanceEndSeconds": 7.5,
    "tailStrategy": "natural_hold_for_trim"
  }
}
```

## Mandatory Split Rule

Seedance 2.0 supports only short generation windows.

If the target script or beat plan exceeds 15 seconds, splitting is mandatory.

Do not submit one oversized request and hope the model compresses it.

Create `segment-01`, `segment-02`, and later request records instead.

Tell the user:

- "Seedance 2.0 is only stable for short windows. I will first split this script into independent segments, submit, poll, and download each segment, then deliver every segment render path and prediction id."

Each segment must be:

- independently submit-ready
- independently downloadable
- semantically complete as a usable clip
- self-contained, with continuity targets restated inside that segment request
  when continuity matters

## When Splitting

- Split by voiceover meaning, natural pauses, and shot continuity.
- Do not mechanically split at `0:00-0:15 / 0:15-0:30` unless the script naturally fits.
- If one action crosses a segment boundary, restate the relevant character,
  product, scene, and action state inside the later segment request.
- Each segment must be a complete request that can be submitted, polled, and downloaded independently.
- Each segment should keep only its own dialogue and action scope.
- Final request text must not rely on `continue from the previous segment`,
  `same as previous`, `same character`, `content above`, or equivalent
  equivalent shorthand. The validator rejects these forms.

## Reference Binding Rule

When reference images or reference videos are present, bind them explicitly.

For one object identity, default to one image reference. For one voice identity,
default to one audio reference. Do not add many near-duplicate references by
default; that often makes video generation less stable.

Working handles such as `@storyboard`, `@product-front`, or `@ref-video-1` are acceptable in planning notes, but the final request must convert them into explicit reference bindings.

Do not say only `use the attached references`.

Say what each reference controls, such as:

- product identity, shape, color, or material
- shot order
- camera motion
- continuation from the prior segment

For final Seedance prompts, prefer explicit bindings such as `[image 1]`, `[image 2]`, and `[video 1]` plus role descriptions.

## PostPlus Cloud Rule

- Keep request files, raw provider responses, and polling state under `<work-folder>/.postplus/seedance-submitter/` when they are internal execution state.
- Keep only final user-facing renders outside `.postplus/`.
- If the PostPlus Cloud service is unavailable, unauthorized, or returns a stable network error, stop immediately instead of switching to ad hoc shell glue.
- If request validation fails, stop before calling the PostPlus Cloud service. Do
  not submit an oversized or memory-dependent Seedance request.

## Debugging

If generation stalls, misses dialogue, or produces malformed request JSON, read [references/troubleshooting.md](references/troubleshooting.md).
