---
name: video-batch-runner
description: Generate and manage InfiniteTalk and Seedance 2.0 video renders for short-form production. Use this when approved upstream assets or prompt plans already exist and you need local render manifests, downloaded video files, and replaceable routes for talking-head or Seedance generation without losing continuity across concepts and personas.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Video Batch Runner

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill after image, script, voice, or prompt-planning work already exists.

This skill is for:

- generating talking-head videos from approved image and audio inputs
- generating Seedance videos from text, images, videos, audio references, or first/last frames
- storing render jobs as local assets with normalized manifests
- preserving traceability from final video back to persona, concept, script, and voice take
- keeping render providers replaceable behind a stable adapter contract

This skill is not for unconstrained video ideation.

## Quality Default

When the goal is believable human video, default to the highest practical render quality the provider offers.

Default quality assumption:

- lower render quality can make already-imperfect source faces look more fake
- realism-sensitive talking-head jobs should start from the best available resolution before blaming script or voice
- only step down when the user is explicitly running a cheap draft, a latency test, or a provider-limited experiment

The selected resolution should always be persisted in the request and manifest.

## Creative Format Rule

Default to the PostPlus short-form vertical creative format with a `9:16`
target aspect ratio.

For Instagram Meta Ads production, set `creativeFormat: "instagram_meta_ads"`
or an explicit `aspectRatio: "3:4"` in the normalized render request. The
runner must preserve that selected target ratio into the request record,
manifest, and supported generative video payloads.

## Core Idea

The video layer should be organized around render objects, not around one provider endpoint.

Treat a video render as:

- `render job`
  - one attempt to produce a video from approved upstream assets
- `render manifest`
  - the normalized local record of that attempt
- `video asset`
  - the downloaded output file(s) produced by the render

The main value is not "image plus audio becomes video". The main value is preserving the chain:

- `campaign`
- `concept`
- `persona`
- `script`
- `voice take`
- `image asset`
- `render job`
- `qa report`

## Fact Rule

Video render inputs must be grounded in approved upstream assets or an explicit prompt plan.

Required upstream inputs depend on route:

- `talking-head`
  - approved image asset
  - approved voice take
  - script or concept reference
  - render purpose
  - local output directory
- `ark / seedance`
  - prompt or `promptPlan`
  - any required media refs for the chosen mode
  - concept reference
  - render purpose
  - local output directory

Do not let the render stage silently redefine:

- who the persona is
- how the voice should sound
- what the concept is trying to test

If the request is experimenting with a new render style, record that as an explicit render variant.

## Source Selection Rule

Start from the active project's approved upstream assets and manifests.

If a current task clearly belongs to one project or client folder, stay within that context first.

Do not assume one client directory is the default home for all renders.



## Video Routes

Current routes:

- `talking-head`
  - model: hosted talking-head capability
  - category: image-to-video digital human
- `seedance` (hosted)
  - endpoint keys: `video-seedance-2-image`, `video-seedance-2-image-turbo`, `video-seedance-2-text`, `video-seedance-2-text-turbo`
  - category: text/image/reference-media to video
- `kling-reference-motion-transfer` (hosted)
  - endpoint key: `video-kling-v2-6-pro-motion-control`
  - category: reference image plus reference motion video to video
- `ark`
  - direct workspace route for internal video/audio workflows
  - category: text/image/video/audio to video

Not currently released:

- structured motion-control request fields mapped to provider-native parameters

Current `promptPlan.camera`, `promptPlan.shotType`, and `promptPlan.motion`
fields are prompt-planning inputs. They can constrain the generated prompt, but
they do not map to provider-native camera trajectory, object trajectory, or
motion-brush parameters. Hosted requests with explicit structured motion-control
fields must fail before provider submission. Use
`video-kling-v2-6-pro-motion-control` is reference-motion transfer, not a
general structured motion-control API. Use it only when the user has a
reference image and a reference motion video.

Read [`references/hosted-video-talking-head.md`](references/hosted-video-talking-head.md) before implementation or request design.
Read [`references/hosted-video-generative.md`](references/hosted-video-generative.md) before designing hosted Seedance requests.
Read [`references/volcengine-seedance-2.md`](references/volcengine-seedance-2.md) before designing Seedance requests.

If the project should keep related image, audio, and video files under one asset root, use the shared asset model in [`../image-batch-runner/references/unified-asset-contract-v1.md`](skills/40-creative/image-batch-runner/references/unified-asset-contract-v1.md).

## PostPlus Cloud Rule

- keep request files, raw provider responses, and polling state under
  `<work-folder>/.postplus/video-batch-runner/` when they are internal
  execution state
- keep only final user-facing renders outside `.postplus/`
- if PostPlus Cloud video service is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

## Render Objects

### 1. Render Job

One request to a video provider.

Should include:

- `jobId`
- `campaignId`
- `personaId`
- `conceptId`
- `scriptId` or source path
- `voiceTakeId`
- `imageAssetId`
- `assetPurpose`
- `creativeFormat`
- `targetAspectRatio`
- `provider`
- `model`
- `status`

### 2. Render Manifest

The normalized local handoff object for later review.

Should include:

- `jobId`
- `campaignId`
- `personaId`
- `conceptId`
- `provider`
- `model`
- `requestPath`
- `responsePath`
- `predictionId`
- `providerStatus`
- `assets[]`
- `sourceBasis`
- `upstreamRefs`

### 3. Video Asset

One downloaded output.

Should include:

- `assetId`
- `localPath`
- `remoteUrl`
- `mimeType`
- `sourceBasis`
- `createdAt`

## Default Workflow

### 1. Lock the render brief

Before calling any provider, write down:

- `jobId`
- `campaignId`
- `personaId`
- `conceptId`
- `scriptId` or script source
- `voiceTakeId`
- `imageAssetId`
- `assetPurpose`
  - `talking_head`
  - `singing_avatar`
  - `first_pass_render`
  - `render_fix`
- `sourceBasis`
- `mustKeep`
- `canVary`
- `feedback`

Tell the user:

- "I will first lock the video-batch-runner render brief and request JSON, then output a local render manifest. After completion, it can go to creative-qa, subtitle-packager, or social-media-publisher."

### 2. Produce a normalized request record

The local request JSON should contain stable fields even if provider fields change later.

At minimum record:

- provider route
- PostPlus creative format
- model
- prompt or prompt plan
- media refs used by the route
- optional mask image
- resolution
- ratio when relevant
- duration or frames when relevant
- seed
- local output directory

When the provider exposes multiple resolution tiers, default to the highest practical tier for realism-sensitive renders.

### 3. Call the provider and save raw response

Always save:

- `request.json`
- `response.json`
- `manifest.json`
- downloaded video files under `renders/`

Do not use the provider response alone as the durable store.

### 4. Normalize local outputs

Every run should end with a local manifest containing:

- stable upstream refs
- provider ids
- local asset paths
- source basis
- feedback history

### 5. Hand off to human QA

Do not auto-approve a render.

The next stage is `creative-qa`, where a person may record:

- verdict
- what worked
- what failed
- which stage should be rerun

If there is no human feedback yet, the render can remain in `review_pending`.

## Path Selection Rule

Write outputs into the active project's render structure when one already exists.

If no project structure exists yet, choose a clear workspace output path and make it visible in the task summary.

If the chosen location will become the long-term handoff point for a client, prefer confirming the destination with the user.

## Example Persistence Convention

One possible project-local layout is:

```text
videos/<job-id>/
  request.json
  response.json
  manifest.json
  renders/
  qa/
```

Do not assume this example layout is the universal default.

Keep draft request files, raw provider responses, and polling state under
`<work-folder>/.postplus/video-batch-runner/` when they are internal execution
artifacts rather than the final handoff.

## Tool Contract

This skill expects these adapters:

- `generate_video_from_image_audio`
- `poll_prediction` for async providers

For Seedance, the same `generate_video_from_image_audio` script is used as the normalized submit entrypoint even though the request may be text-to-video or multimodal; the route is chosen by `provider`.

The normalized request and manifest shapes live in [`references/tool-contracts.md`](references/tool-contracts.md).

If a render is still pending, do not block the user's conversation just to
poll. Save the checkpoint, tell the user the render is running, and continue
independent QA planning, segment planning, caption prep, or handoff prep until
the render is needed.

## Review Rule

Before calling a video provider, verify:

- for `talking-head`, persona is approved
- for `talking-head`, image asset is approved
- for `talking-head`, voice take is approved
- for `seedance` (hosted), request mode is explicit and required media exists
- for `ark`, request mode is explicit
- for `ark`, media roles match the intended Seedance mode
- for `ark`, prompt or prompt plan is concrete enough to constrain the generation
- render request is tied to a real concept or asset purpose
- local output path is explicit

After generation, review:

- lip sync acceptability
- persona continuity
- audio and image match
- TikTok-native feel
- ad-like drift

## Failure Mode

Stop and say the request is under-specified if any of these are missing:

- for `talking-head`, no approved image asset
- for `talking-head`, no approved voice take
- for `seedance` (hosted), no prompt or no required first image
- for `ark`, no prompt or no usable `content`
- no asset purpose
- no source basis
- no local output path

Do not compensate for missing upstream approvals by letting the render model improvise.

## Seedance Prompt Rule

For Seedance 2.0 work, prefer a structured prompt plan over a single dense paragraph.

The adapter accepts `promptPlan` and turns it into a timeline-first prompt in this order:

- subject
- storyboard timeline
- scene / environment / style
- camera / shot / motion
- sound intent
- continuity constraints
- must-keep
- must-avoid
- reference bindings such as `[image 1]...，[audio 1]...，[video 1]...`

This is a better default than freehand adjective stacks.

The prompt plan may describe framing in natural language, but the selected
PostPlus creative format must also be present in the normalized request as
`creativeFormat` or `aspectRatio`. Do not rely on prompt wording alone to carry
`3:4` Instagram Meta Ads output.

Do not represent `promptPlan.motion` as provider-native motion control. If the
user asks for motion brush, object trajectory, camera trajectory, or
camera-control parameters, stop and say the current implementation only exposes
reference-motion transfer through `video-kling-v2-6-pro-motion-control`.

## Core Scripts

- `scripts/generate_video_from_image_audio.mjs`
- `scripts/poll_prediction.mjs`

These scripts are hosted media entrypoints. The file passed to `--request`
must be a hosted execution envelope:

```json
{
  "schemaVersion": 1,
  "input": {
    "...": "normalized video request"
  }
}
```

The normalized video request is the envelope's `input` value. Bare normalized
request JSON is not an executable script input.

These scripts write:

- `request.json`
- `response.json`
- `manifest.json`
- downloaded videos under `renders/`
