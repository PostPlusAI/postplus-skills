---
name: seedance-submitter
description: Use when preparing, submitting, polling, or debugging Seedance 2.0 video generation jobs from product images, storyboard images, UGC scripts, voiceover copy, or promptPlan request JSON. Use for splitting scripts into render segments, uploading references, creating request JSON, submitting jobs through the hosted capability, polling predictions, and handing off local render paths.
---

# Seedance Submitter

Use this skill for Seedance 2.0 generative video jobs routed through the hosted capability.

Follow shared release-shell rules in:

- `skills/shared-release-shell-rules.md`

## Workflow

1. Lock inputs: product image paths, storyboard image path, script, target duration, output root, and whether the user wants submit or only JSON.
2. Read [references/current-rules.md](references/current-rules.md).
3. If creating request JSON, read [references/request-json.md](references/request-json.md).
4. Upload local reference images before submission and replace local paths with uploaded URLs.
5. Put exact spoken copy in `promptPlan.dialogue`.
6. Put voice style, BGM, SFX, subtitle, and watermark constraints in `promptPlan.audio`.
7. Submit with `skills/video-batch-runner/scripts/generate_video_from_image_audio.mjs`.
8. Poll with `skills/video-batch-runner/scripts/poll_prediction.mjs` until completed.
9. Report local `renders/render-001.mp4` paths and prediction ids.

## When Splitting

- Split by voiceover meaning, natural pauses, and shot continuity.
- Do not mechanically split at `0:00-0:15 / 0:15-0:30` unless the script naturally fits.
- If one grid crosses a segment boundary, the later segment must explicitly say it continues the prior action.
- Each segment must be a complete request that can be submitted, polled, and downloaded independently.

## Hosted Boundary Rule

- Keep request files, raw provider responses, and polling state under `<work-folder>/.postplus/seedance-submitter/` when they are internal execution state.
- Keep only final user-facing renders outside `.postplus/`.
- If the hosted capability is unavailable, unauthorized, or returns a stable network error, stop immediately instead of switching to ad hoc shell glue.

## Debugging

If generation stalls, misses dialogue, or produces malformed request JSON, read [references/troubleshooting.md](references/troubleshooting.md).
