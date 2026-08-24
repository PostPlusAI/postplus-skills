---
name: seedance-submitter
description: Use when preparing, submitting, polling, or debugging Seedance 2.0 or 2.5 video generation jobs from prompts, opening/ending frames, multimodal references, storyboard images, UGC scripts, or voiceover copy. Use for selecting an unambiguous scene endpoint, uploading references, composing submit flags, submitting through PostPlus Cloud, polling predictions, and handing off local render paths.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Seedance Submitter

## Use When
- Preparing, validating, submitting, polling, or debugging Seedance 2.0/2.5 jobs through PostPlus Cloud.

## Do Not Use When
- Required inputs are missing and guessing would change the result.
- Task class, hook logic, storyboard, or reference policy is still unresolved.
  Use `video-generation` and `video-request-architect` first.

## Execution Boundary
- This runner validates, submits, and polls normalized Seedance requests. It must
  not make creative strategy, task-classification, or reference-policy decisions.
- Interpret `sd2` as Seedance 2.0 Mini (`video-seedance-2-mini-*`), the current
  default tier, unless the user names another model. Standard/fast remain
  available explicitly; use them when reference video/audio is required.
- Seedance 2.5 has four deliberately separate scene endpoints. Never convert one
  scene into another merely because an image is present:
  - `video-seedance-2-5-text`: prompt only; no media inputs.
  - `video-seedance-2-5-first-frame`: exactly one `--first-frame`; the output
    starts from that frame, so this is not a feature-only reference.
  - `video-seedance-2-5-first-last-frame`: exactly one `--first-frame` and one
    `--last-frame`; the provider contract fixes ratio to `adaptive` and duration
    to `-1`.
  - `video-seedance-2-5-reference`: one or more repeatable
    `--reference-image`, `--reference-video`, or `--reference-audio`; these guide
    features/style/content and are not opening or ending frames.
- For 2.0, standard/fast `-text` endpoints accept image/video/audio references;
  mini `-text` accepts images only. Every `-image` endpoint takes one `--image`
  first frame and no reference slots.
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
- For 2.5 reference `edit` or `extend`, supply a reference video and use the
  exact schema constraints (`aspect_ratio=adaptive`, `duration=-1`). The CLI and
  Web boundary reject unsupported combinations before provider submission and
  billing.

## Source And Request
- Lock media, script, duration, output root, source basis, and whether the user wants submission or commands only.
- `promptPlan.*`, `timeline.*`, and `targetEditDurationSeconds` are authoring
  vocabulary, not Seedance request fields. Submit with the endpoint's CLI flags
  from the flat provider contract discovered from `postplus media schema --json`
  (`--prompt`, legacy 2.0 `--image`, 2.5 `--first-frame` / `--last-frame`,
  `--duration`, `--resolution`, `--aspect-ratio`, `--generate-audio`,
  `--output-format`, `--omni-reference-task-type`, and the repeatable `--reference-image` /
  `--reference-video` / `--reference-audio` — reference flags only on the
  endpoints that publish those slots); the CLI rejects any flag outside the
  selected endpoint's contract. Compose the storyline/audio plan and any
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
- Do not claim that uploading through PostPlus hosted storage automatically
  grants Moyu real-person exemption. Automatic Moyu asset-library escalation is
  enabled only for the enterprise Seedance 2.0 `first_frame` path with real
  end-to-end evidence. `reference_image` remained privacy-blocked in a recorded
  run after `asset://` rewrite, and no paid Seedance 2.5 exemption smoke has
  been approved; both paths fail with the provider's typed policy boundary.

## Review And Handoff
- Before submission, verify validation passed, every segment is self-contained,
  references are bound, required media exists, source basis is explicit, and the
  output path is durable.
- Seedance 2.5 support is contract-verified by official/live provider material
  and local submit/poll/result/billing mocks. Until an approved paid smoke checks
  the MP4, actual duration, resolution, audio track, and settlement, do not label
  those output properties artifact-proven.
- If a render is pending, return the segment id, manifest path, the
  `output.data.id` generation handle, the poll command
  `postplus media poll --handle <output.data.id>`, and expected local
  `renders/` output path. The poll command waits in-command (re-checks every 8s
  for up to 45s per invocation; `--wait-seconds 0` = single check): rerun the
  same command while the render stays pending instead of re-submitting or
  writing a tighter retry loop.
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
- Poll a pending render: `postplus media poll --handle <output.data.id>` (waits
  in-command up to 45s per invocation; rerun while pending).
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
