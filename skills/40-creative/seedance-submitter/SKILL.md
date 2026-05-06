---
name: seedance-submitter
description: Use when preparing, submitting, polling, or debugging Seedance 2.0 video generation jobs from product images, storyboard images, UGC scripts, voiceover copy, or promptPlan request JSON. Use for splitting scripts into render segments, uploading references, creating request JSON, submitting jobs through the hosted capability, polling predictions, and handing off local render paths.
---

# Seedance Submitter

Use this skill for Seedance 2.0 generative video jobs routed through the hosted capability.

Follow shared release-shell rules in:

- `postplus-shared` release-shell rules

## Workflow

1. Lock inputs: product image paths, storyboard image path, script, target duration, output root, and whether the user wants submit or only JSON.
2. Read [references/current-rules.md](references/current-rules.md).
3. If creating request JSON, read [references/request-json.md](references/request-json.md).
4. Upload local reference images before submission and replace local paths with uploaded URLs.
5. Put exact spoken copy in `promptPlan.dialogue`.
6. Put voice style, BGM, SFX, subtitle, and watermark constraints in `promptPlan.audio`.
7. Validate every Seedance request before submission:

```bash
node skills/40-creative/seedance-submitter/scripts/validate_seedance_request_contract.mjs \
  --input <request.seed.json>
```

8. Submit with `skills/40-creative/video-batch-runner/scripts/generate_video_from_image_audio.mjs`.
9. Poll with `skills/40-creative/video-batch-runner/scripts/poll_prediction.mjs` until completed.
10. Report local `renders/render-001.mp4` paths and prediction ids.

If the user says `sd2`, interpret it as Seedance 2.0 unless they explicitly specify another model.

## Mandatory Split Rule

Seedance 2.0 supports only short generation windows.

If the target script or beat plan exceeds 15 seconds, splitting is mandatory.

Do not submit one oversized request and hope the model compresses it.

Create `segment-01`, `segment-02`, and later request records instead.

Tell the user:

- "Seedance 2.0 只能稳定处理短窗口。我会先把这条脚本拆成独立 segment，逐段提交、轮询、下载；最后交付每段 render 路径和 prediction id。"

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
  `same as previous`, `same character`, `contract above`, `延续上一段`, or
  equivalent shorthand. The validator rejects these forms.

## Reference Binding Rule

When reference images or reference videos are present, bind them explicitly.

Working handles such as `@storyboard`, `@product-front`, or `@ref-video-1` are acceptable in planning notes, but the final request must convert them into explicit reference bindings.

Do not say only `use the attached references`.

Say what each reference controls, such as:

- product identity, shape, color, or material
- shot order
- camera motion
- continuation from the prior segment

For final Seedance prompts, prefer explicit bindings such as `[图1]`, `[图2]`, and `[视频1]` plus role descriptions.

## Hosted Boundary Rule

- Keep request files, raw provider responses, and polling state under `<work-folder>/.postplus/seedance-submitter/` when they are internal execution state.
- Keep only final user-facing renders outside `.postplus/`.
- If the hosted capability is unavailable, unauthorized, or returns a stable network error, stop immediately instead of switching to ad hoc shell glue.
- If request validation fails, stop before calling the hosted capability. Do
  not submit an oversized or memory-dependent Seedance request.

## Debugging

If generation stalls, misses dialogue, or produces malformed request JSON, read [references/troubleshooting.md](references/troubleshooting.md).
