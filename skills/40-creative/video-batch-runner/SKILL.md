---
name: video-batch-runner
description: Generate and manage InfiniteTalk and Seedance 2.0 video renders for short-form production. Use this when approved upstream assets or prompt plans already exist and you need local render manifests, downloaded video files, and replaceable routes for talking-head or Seedance generation without losing continuity across concepts and personas.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Video Batch Runner

## Use When
- Approved image, script, voice, or prompt-plan inputs already exist and the next step is a hosted talking-head, Seedance, or reference-motion render.
- The output must preserve a local render manifest, source basis, hosted handles,
  output URLs, downloaded video files when the host can fetch them, and a
  pollable checkpoint.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.
- Task class, hook logic, storyboard, or reference policy is still unresolved.
  Use `video-generation` and `video-request-architect` first.

## Execution Boundary
- This runner validates and executes normalized video requests. It must not make
  creative strategy, task-classification, or reference-policy decisions.
- Default to the highest practical render quality for realism-sensitive human video; step down only for an explicit cheap draft, latency test, or provider limit, and persist the choice.
- Default creative format is short-form vertical `9:16`; use
  `creativeFormat: "instagram_meta_ads"` or explicit `aspectRatio: "3:4"` when
  the target is Instagram Meta Ads.
- Released endpoint keys and their option enums (resolution, aspect ratio,
  duration bounds) are discovered from `postplus media schema --json`; they are
  not hard-coded here.
- Released provider is `hosted-media` only. Direct provider routes, ad hoc
  structured motion-control fields, and unbound media roles are not released.
- `video-kling-v2-6-pro-motion-control` is only reference-motion transfer with
  a reference image plus reference motion video.
- Image-to-video inputs and reference motion video must be remote HTTP(S) media
  URLs or persistent `postplus-media://` references.

## Source And Route
- Source from the active project/client manifests first. Do not reuse another
  client directory as the default source basis.
- Required for all routes: hosted capability request, `jobId`, `assetPurpose`,
  `sourceBasis`, `localOutputDir`, `provider: "hosted-media"`, and `model`.
- Talking head requires approved `image`, approved `audio`, and script/concept
  source. Seedance requires intentional `final_prompt` or `prompt_summary` plus
  `promptPlan.prompt_storyline`, and required media for the selected mode.
- `promptPlan.camera`, `promptPlan.shotType`, and `promptPlan.motion` constrain
  prompt text only; do not map them to provider-native trajectory fields.

## Request Boundary
- Submit with the selected endpoint's CLI flags (discover them from
  `postplus media schema --json` or the per-endpoint `--help`); the CLI runner
  mints the operation identifiers and billing dimensions. Media flags accept a
  remote HTTPS URL or a persistent `postplus-media://` reference from
  `postplus media-file upload` (`output.mediaReference`, never expires).
- Poll a pending render with `postplus media poll --handle <output.data.id>`
  (the handle is returned by the create request); do not keep polling in the
  conversation.
- Keep internal requests/responses under `.postplus` when they are not final
  handoff artifacts; keep final renders/manifests in the active render folder.

## Seedance Prompt Boundary
- Prefer `prompt_summary` plus `promptPlan.prompt_storyline` over a dense
  paragraph. Each segment should carry subject, storyline, scene/style, camera
  language, sound intent, continuity constraints, and explicit `[image 1]` /
  `[audio 1]` / `[video 1]` bindings as applicable.
- Do not use deprecated `promptPlan.storyboardTimeline`; use
  `promptPlan.prompt_storyline`.
- Choose duration by spoken density. Use a shorter supported bucket or rewrite
  the segment instead of padding silent holds.

## Review And Handoff
- Before submission, verify approved upstream assets, route/mode, media roles,
  concrete prompt source, source basis, asset purpose, and local output path.
- After generation, keep `review_pending` until human QA checks lip sync,
  persona continuity, audio/image match, native feel, and ad-like drift.
- If pending, return `manifestPath`, the `output.data.id` handle, and the poll
  command `postplus media poll --handle <output.data.id>` immediately. Do not
  keep thinking or polling in the conversation.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- This skill owns the `postplus media create <endpoint>` command for its
  kling 3.0, InfiniteTalk, and Kling 2.6 reference-motion endpoints.
  Seedance renders go through the shared `postplus media create
  video-seedance-2-*` command owned by `seedance-submitter`; route Seedance
  there instead of duplicating its request shape here.
- Readiness diagnostics: `postplus doctor --skill video-batch-runner`.
- Poll a pending render: `postplus media poll --handle <output.data.id>`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus media schema --json` only when constructing or repairing an unknown request shape.
- Run the hosted submit with the generated command below; do not call provider APIs directly.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media create video-kling-v3-0-pro-text \
  --prompt <prompt> \
  --output <result.json>
```
<!-- END GENERATED EXECUTION EXAMPLE -->

- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
