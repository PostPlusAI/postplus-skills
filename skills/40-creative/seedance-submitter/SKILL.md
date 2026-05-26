---
name: seedance-submitter
description: Use when preparing, submitting, polling, or debugging Seedance 2.0 video generation jobs from product images, storyboard images, UGC scripts, voiceover copy, or promptPlan request JSON. Use for splitting scripts into render segments, uploading references, creating request JSON, submitting jobs through the PostPlus Cloud service, polling predictions, and handing off local render paths.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Seedance Submitter

## Use When
- Preparing, validating, submitting, polling, or debugging Seedance 2.0 jobs
  routed through PostPlus Cloud.
- Inputs can be product images, storyboard images, UGC scripts, voiceover copy,
  or existing Seedance request JSON.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Execution Boundary
- Interpret `sd2` as Seedance 2.0 unless the user names another model.
- Released endpoint keys are `video-seedance-2-image`,
  `video-seedance-2-image-turbo`, `video-seedance-2-text`, and
  `video-seedance-2-text-turbo`.
- `duration` is the provider bucket and must be `5`, `10`, or `15`. For edit
  targets like `7.5s`, use the next viable bucket in `duration` and set
  `targetEditDurationSeconds`.
- When `targetEditDurationSeconds < duration`, include
  `timeline.activePerformanceEndSeconds` and `timeline.tailStrategy`.
- If the target script or beat plan exceeds 15 seconds, split into independent
  submit-ready segments. Do not submit one oversized request.

## Source And Request
- Lock product/storyboard/reference media, script, duration bucket, target edit
  duration, output root, source basis, and whether the user wants submit or JSON
  only.
- Put timecoded action and spoken lines together in `promptPlan.prompt_storyline`.
  Put voice style, BGM, SFX, subtitle, and watermark constraints in
  `promptPlan.audio`.
- Bind references explicitly: say what `[image 1]`, `[image 2]`, `[audio 1]`,
  or `[video 1]` controls. Do not rely on `same as previous`, `content above`,
  or unbound local handles in final requests.
- Upload local reference images with the shared image-batch upload script before
  submission and pass uploaded URLs into the Seedance request.

## Review And Handoff
- Before submission, verify validation passed, every segment is self-contained,
  references are bound, required media exists, source basis is explicit, and the
  output path is durable.
- If a render is pending, return the segment id, manifest path,
  `pollRequestPath`/`pollCommand`, generation handle, and expected local
  `renders/` output path. Do not keep polling in the conversation.

## Fail Fast
- Missing validation, unsupported key, oversized segment, memory-dependent
  prompt, missing media binding, missing source basis/output path, unavailable
  hosted service, or archived/non-envelope request used for submit/poll.
- Do not invent fallback execution paths, private provider calls, or continuity
  shorthand to force submission.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill seedance-submitter`.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
