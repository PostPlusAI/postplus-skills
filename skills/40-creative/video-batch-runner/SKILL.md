---
name: video-batch-runner
description: Generate one or many videos through PostPlus from a brief, script, prompt, image, audio, or reference video. Use for text-to-video, image-to-video, first/last-frame video, multimodal reference video, talking-head video, and motion transfer. The agent chooses the matching released endpoint from current schema, writes one self-contained prompt per clip, uploads local media, submits, polls, downloads, and hands the render to QA.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Video Batch Runner

This is the single PostPlus video-generation skill. It owns creative request
assembly and execution across released video models; do not create a separate
architect, preflight report, reference contract, or model-specific submitter.

## Workflow

1. Read the brief and inspect the supplied media. Use `video-analysis` first only
   when understanding an existing video materially changes the new render.
2. Run `postplus media schema --json`, choose the smallest released endpoint
   whose input roles match the job, then load its exact fields with `postplus
   media schema --endpoint <endpoint> --json`:
   - no driving media: text-to-video
   - one opening image: image/first-frame-to-video
   - locked opening and closing images: first-last-frame-to-video
   - several images, videos, or audios that guide the result: reference video
   - portrait plus approved audio: talking head
   - identity image plus motion source video: motion transfer
3. Decide each asset's role from the task. Bind identity, product, first/last
   frame, timing, or motion only when the asset must control that property. Treat
   style and benchmark media as inspiration, and omit media that should not
   influence the render. Never infer a role merely because a file is present.
4. Write one self-contained, model-facing prompt per clip. Include the visible
   subject and action, product behavior, scene, camera, timing, speech/sound,
   continuity, and the role of every submitted reference. Use explicit
   `[image N]`, `[video N]`, and `[audio N]` bindings when the selected endpoint
   accepts numbered references.
5. Validate fields, enum values, defaults, cardinality, and duration against the
   current schema. Do not carry provider field tables in this skill. If one clip
   exceeds the supported duration or creative load, split it into independent
   prompts before spending.
6. Upload every local input and pass its persistent `output.mediaReference` to
   the matching media field. For Moyu Seedance, run `postplus media-file upload --storage-only --skill video-batch-runner --input-file <file> --mime <mime> --output <upload.json>`.
   This stops at PostPlus Storage and does not contact Moyu. During create, Web
   registers all referenced media with Moyu, waits until all are `Active`, and
   sends only `asset://` references in the single provider submit; the Skill
   never owns Moyu asset ids. For another video provider, omit `--storage-only`.
   Video Analysis keeps its own upload contract. Submit with `postplus media
   create <endpoint> --skill video-batch-runner ...` using only fields published
   by that endpoint.
7. If create returns pending, poll the same run with `postplus media poll
   --handle <output.data.id>`. Re-run that poll while pending; never submit a
   replacement request merely to check status.
8. When a local final file is needed, download the completed output with
   `postplus media-file download --url <fresh-output-url> --output-file <path>
   --skill video-batch-runner`.
9. Return the actual result, downloaded media or result path, endpoint, prompt,
   submitted media roles, and run handle. Send the finished render to
   `video-analysis` or `creative-qa` only when final media QA is requested.

## Execution Rules

- PostPlus schema and the hosted execution manifest are the source of truth for
  endpoint availability, input fields, enums, defaults, and billing dimensions.
- Use the released `postplus` CLI. Do not call provider APIs directly, invent
  provider-native fields, or create a provider-specific submitter skill.
- Keep private request/result files under the active work folder's `.postplus/`
  state; do not manufacture contract or planning artifacts for handoff.
- If the CLI returns a quote-confirmation challenge, show it to the user, run
  `postplus quote confirm --json --challenge-file <challenge.json>` only after
  approval, then retry the exact operation with the returned token.
- On an auth, transport, quota, malformed-request, capability, or provider
  failure, report the typed error and stop. Do not switch endpoints, rewrite the
  request, or claim a local plan is an executed render.
- In a batch, only the typed error
  `postplus_cli_hosted_media_content_policy_blocked` is item-local: record that
  item as blocked without rewriting or retrying it, continue the independent
  items, and report the incomplete set. Every other error stops the batch.

## Public Command Boundary

- Readiness: `postplus doctor --skill video-batch-runner`
- Discover endpoints: `postplus media schema --json`
- Read selected endpoint fields: `postplus media schema --endpoint <endpoint>
  --json`
- Upload local media: `postplus media-file upload --skill video-batch-runner
  --input-file <file> --mime <mime> --output <upload.json>`; add
  `--storage-only` for Moyu Seedance as specified above.
- Submit: `postplus media create <endpoint> --skill video-batch-runner ...`
- Resume: `postplus media poll --handle <output.data.id>`
- Download: `postplus media-file download --url <fresh-output-url> --output-file
  <path> --skill video-batch-runner`

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media create video-kling-v3-0-pro-text \
  --prompt <prompt> \
  --output <result.json>
```
<!-- END GENERATED EXECUTION EXAMPLE -->
