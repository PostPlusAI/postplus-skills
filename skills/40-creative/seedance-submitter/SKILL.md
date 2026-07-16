---
name: seedance-submitter
description: Use when preparing, submitting, polling, or debugging Seedance 2.0 video generation jobs from product images, storyboard images, UGC scripts, voiceover copy, or promptPlan request JSON. Use for splitting scripts into render segments, uploading references, composing submit flags, submitting jobs through the PostPlus Cloud service, polling predictions, and handing off local render paths.
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
- Task class, hook logic, storyboard, or reference policy is still unresolved.
  Use `video-generation` and `video-request-architect` first.

## Execution Boundary
- This runner validates, submits, and polls normalized Seedance requests. It must
  not make creative strategy, task-classification, or reference-policy decisions.
- Interpret `sd2` as Seedance 2.0 Mini (`video-seedance-2-mini-*`), the current
  default tier, unless the user names another model. The standard Seedance 2.0
  tier (`video-seedance-2-*`) stays available when explicitly requested.
- Released endpoint keys and their option enums (resolution, aspect ratio,
  duration bounds) are discovered from `postplus media schema --json`; they are
  not hard-coded here.
- Set `duration` within the endpoint's published bounds (see schema). For edit
  targets that fall between viable values, pick the nearest valid `duration` and
  set `targetEditDurationSeconds`.
- When `targetEditDurationSeconds < duration`, include
  `timeline.activePerformanceEndSeconds` and `timeline.tailStrategy`.
- If the target script or beat plan exceeds the endpoint's maximum duration,
  split into independent submit-ready segments. Do not submit one oversized
  request.

## Source And Request
- Lock product/storyboard/reference media, script, duration, target edit
  duration, output root, source basis, and whether the user wants submission or
  command preparation only.
- Put timecoded action and spoken lines together in `promptPlan.prompt_storyline`.
  Put voice style, BGM, SFX, subtitle, and watermark constraints in
  `promptPlan.audio`.
- `promptPlan.*`, `timeline.*`, and `targetEditDurationSeconds` are authoring
  vocabulary, not Seedance request fields. Submit with the endpoint's CLI flags
  from the flat provider contract discovered from `postplus media schema --json`
  (`--prompt`, `--image`, `--duration`, `--resolution`, `--aspect-ratio`,
  `--generate-audio`, and the repeatable `--reference-image` /
  `--reference-video` / `--reference-audio`); the CLI rejects any flag outside
  the selected endpoint's contract. Compose the storyline/audio plan and any
  `timeline.activePerformanceEndSeconds` / `timeline.tailStrategy` instruction
  into the single `--prompt` narrative, then map the supported render bucket to
  `--duration`; timeline authoring fields have no separate flags or request
  fields, and there is no request-JSON envelope to author.
- Bind references explicitly: say what `[image 1]`, `[image 2]`, `[audio 1]`,
  or `[video 1]` controls. Do not rely on `same as previous`, `content above`,
  or unbound local handles in final requests.
- Upload local reference media to hosted storage with
  `postplus media-file upload --skill seedance-submitter --input-file <file> --mime <mime> --output <upload.json>`,
  then pass `output.mediaReference` — a persistent `postplus-media://` reference
  that never expires — into the Seedance media flags (for example
  `--reference-image <output.mediaReference>`). The hosted boundary exchanges it
  for a fresh signed URL at provider send time, so upload once and reuse the
  same reference across later submissions. `output.data.download_url` is a
  signed URL that expires; prefer `output.mediaReference`.

## Review And Handoff
- Before submission, verify validation passed, every segment is self-contained,
  references are bound, required media exists, source basis is explicit, and the
  output path is durable.
- If a render is pending, return the segment id, manifest path, the
  `output.data.id` generation handle, the poll command
  `postplus media poll --handle <output.data.id>`, and expected local
  `renders/` output path. Do not keep polling in the conversation.
- Save a finished render to disk with
  `postplus media-file download --url <fresh-output-url> --output-file <renders/...>`
  (or `--reference <postplus-media://...>` for media that lives in hosted
  storage); provider output URLs are temporary, so download while fresh.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill seedance-submitter`.
- Poll a pending render: `postplus media poll --handle <output.data.id>`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus media schema --json` only when constructing or repairing an unknown request shape.
- Run the hosted submit with the generated command below; do not call provider APIs directly.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media create video-seedance-2-fast-image \
  --prompt <prompt> \
  --image <image> \
  --output <result.json>
```
<!-- END GENERATED EXECUTION EXAMPLE -->

- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
