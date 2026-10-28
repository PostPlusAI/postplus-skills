---
name: video-batch-runner
description: Generate videos from briefs, prompts, images, audio, or reference clips. Choose a Seedance 2.5 generation mode, submit one or many clips, resume runs, and download results.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Video Batch Runner

This is the single PostPlus video-generation skill. It owns creative request
assembly and execution across the six Seedance 2.5 generation modes; do not create a separate
architect, preflight report, reference contract, or model-specific submitter.

## Workflow

1. Read the brief and inspect the supplied media. Use `media-analysis` first only
   when understanding an existing video materially changes the new render.
2. Run `postplus media schema --json`, choose the smallest Seedance 2.5 endpoint
   whose input roles match the job, then load its exact fields with `postplus
   media schema --endpoint <endpoint> --json`:
   - no driving media: text-to-video
   - one opening image: image/first-frame-to-video
   - locked opening and closing images: first-last-frame-to-video
   - several images, videos, or audios that guide the result: reference video
   - change an existing video's content: video edit
   - continue an existing video: video extend
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
   current schema. Do not carry private execution field tables in this skill. If one clip
   exceeds the supported duration or creative load, split it into independent
   prompts before spending.
6. Pass each local path, HTTPS URL, existing PostPlus media reference, or data
   URI directly to the matching role flag. The CLI validates and prepares local
   media before a single hosted submit. Use only fields published by the
   selected endpoint; do not pre-upload media or construct private payloads.
7. Prefer `--wait` when the expected runtime fits the command budget. If create
   still returns pending, poll the same run with `postplus media poll
   --handle <output.data.id>`. Prefer the CLI-returned action or resume command
   for the same operation. Honor its wait/recovery boundary and never submit
   a replacement request merely to check status.
8. When a local final file is needed, download the completed output with
   `postplus media-file download --url <fresh-output-url> --output-file <path>
   --skill video-batch-runner`.
9. On successful generation, deliver the video and known cost or cost status.
   Save the actual model, submitted prompt, reference roles and original run
   information in execution records; provide these when the user asks how it
   was made, translating the actual prompt into their language. Inspect
   the finished clip only when the user asks for that check. Generation delivery
   does not wait for transcription, frame extraction or editing.

## Execution Rules

- PostPlus schema is the source of truth for endpoint availability, input
  fields, enums, and defaults.
- Use the released `postplus` CLI. Do not call underlying services directly,
  invent private fields, or create a service-specific submitter skill.
- Keep private request/result files under the active work folder's `.postplus/`
  state; do not manufacture contract or planning artifacts for handoff.
- Requested tasks use existing PostPlus credits after the current price and balance are checked.
  Estimate-only requests do not execute. Stop on insufficient credits; do not
  recharge, buy a subscription, or repeat an uncertain paid operation.
- Correct definite pre-submission field or format errors yourself when the
  correction preserves the user's intent, selected mode, ratio and duration.
  A provider's edit-versus-reference interpretation is not a harmless format
  correction: do not silently inherit source dimensions or duration.
- Once submitted or uncertain, follow the original operation's structured
  recovery action. A new paid attempt requires a definite outcome, known cost
  status and coverage by the existing task and spending authorization.
- For batches, complete the first viable item before expanding. An item-local
  input error or content-policy rejection affects that item; record it and
  continue independent items. Do not rewrite blocked content to evade a limit.
  Shared authentication, balance, configuration or service failures stop new
  submissions. Continue checking and delivering already submitted items through
  their original identities. Unknown scope stops expansion until resolved.

## Public Command Boundary

- Readiness: `postplus doctor --skill video-batch-runner`
- Discover endpoints: `postplus media schema --json`
- Read selected endpoint fields: `postplus media schema --endpoint <endpoint>
  --json`
- Submit local or remote role media directly: `postplus media create <endpoint>
  --skill video-batch-runner ... --wait`
- Resume: `postplus media poll --handle <output.data.id>`
- Download: `postplus media-file download --url <fresh-output-url> --output-file
  <path> --skill video-batch-runner`

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media create video-seedance-2-5-text \
  --prompt "Describe the result you need" \
  --wait \
  --output ./result.json
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Use existing PostPlus credits for requested work within existing authorization; estimate-only requests do not execute. Do not recharge, buy subscriptions, publish or change external advertising spend without applicable authorization. An initial reservation is not a final price or a hard cost cap. If a required hard final-cost limit cannot be enforced, do not execute; explain that limit.
Correct definite pre-submission field or format errors without changing the requested intent, mode or output constraints. After submission or an unknown outcome, resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
Keep raw results, operation identifiers and recovery commands in execution records. In ordinary chat, give the result, meaningful limitations, known cost and any necessary user decision; do not narrate uploads, polling, internal identifiers or JSON. When asked how media was made, provide the actual model, submitted prompt in the user language and references actually submitted with their roles.
<!-- END GENERATED EXECUTION EXAMPLE -->
