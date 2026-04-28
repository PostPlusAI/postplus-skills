---
name: image-batch-runner
description: Run fact-grounded image generation batches for short-form video production, especially persona images, first-frame candidates, and light consistency edits. Use this when persona and concept inputs already exist and you need local image assets, prompt records, and reusable model-call metadata. This skill should stay anchored to benchmark-backed persona locks and should save both raw provider responses and normalized local asset manifests.
---

# Image Batch Runner

Follow shared release-shell rules in:

- `skills/shared-release-shell-rules.md`

Use this skill after persona and concept work already exists.

This skill is for:

- batch-generating persona candidates
- generating first-frame / cover candidates
- applying light consistency edits to approved images
- saving local image assets plus model-call metadata

This skill is not for unconstrained concept art.

## Quality Default

When realism matters, default to the strongest provider quality settings that are practically available.

Default quality assumption:

- higher image quality usually lowers visible AI artifacts
- lower-quality first passes can exaggerate fake skin, eyes, and texture
- it is better to step down only when cost, latency, or provider limits force it

Capture the chosen quality settings in the local request record so later QA can trace realism issues back to generation parameters.

## Fact Rule

Image generation inputs must be grounded in upstream research artifacts.

Required upstream inputs:

- a benchmark-backed persona lock
- a concept or shot need
- visual constraints derived from benchmark evidence

Do not let the image model invent:

- a new creator archetype
- ad-like polish not supported by references
- wardrobes or environments that break persona continuity

If the visual request is not supported by benchmark evidence, mark it as an explicit variant test.

## Source Selection Rule

Use source files from the active project or client context.

If a current task already lives inside one project folder, keep the evidence lookup there first.

Do not assume one client's reports are the default source basis for all image work.


## Provider

Current hosted image provider support:

- supported models:
  - `google/nano-banana-2`
    - `text-to-image`
    - `edit`
  - `bytedance/seedream-v5.0-lite`
    - `text-to-image`
  - `bytedance/seedream-v5.0-lite/edit`
    - `edit`
  - `bytedance/seedream-v5.0-lite/sequential`
    - `text-to-image`
  - `bytedance/seedream-v5.0-lite/edit-sequential`
    - `edit`

Read [`references/hosted-image-models.md`](references/hosted-image-models.md) for the current provider-specific notes.

If you need image and video outputs to live under one durable asset folder instead of separate job folders, also read [`references/unified-asset-contract-v1.md`](references/unified-asset-contract-v1.md).

## Core Scripts

- `scripts/generate_image.mjs`
- `scripts/poll_prediction.mjs`
- `scripts/upload_media.mjs`
- `scripts/edit_image.mjs`

These scripts take normalized request JSON files and write:

- run metadata under `runs/image/<run-id>/` or `runs/upload/<run-id>/`
- downloaded image assets under `images/candidates/`
- asset-level records such as `asset.json` and `index.json`

## Hosted Boundary Rule

- keep request files, raw provider responses, and polling state under
  `<work-folder>/.postplus/image-batch-runner/` when they are internal
  execution state
- keep only final user-facing assets outside `.postplus/`
- if hosted image capability is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

## Default Workflow

### 1. Lock the generation brief

Before generating any image, write down:

- `assetId`
- `runId`
- `campaignId`
- `personaId`
- `conceptId` if relevant
- `assetPurpose`
  - `persona_candidate`
  - `cover_frame`
  - `shot_support`
  - `edit_fix`
- `sourceBasis`
- `mustKeep`
- `canVary`
- `mustAvoid`

Do not jump straight from prose to provider call.

### 2. Produce a normalized request record

For each generation job, create a local JSON request record containing:

- asset id
- run id
- prompt
- negative prompt if supported upstream
- model name
- mode
- aspect ratio
- resolution
- output format
- local asset directory
- source basis

When the provider exposes multiple quality tiers or resolutions, default to the highest practical tier for first-pass realism work unless the job is explicitly a cheap draft or throughput test.

This request record is the stable local truth even if provider parameters evolve.

### 3. Call the provider and save raw response

Use the PostPlus-supported Node scripts in this skill directory for provider calls.
Do not replace them with `curl`, inline `fetch`, `node -e`, or ad hoc shell
glue.

Always save:

- raw request JSON
- raw provider response JSON
- normalized asset manifest JSON
- final downloaded image files

Do not treat the provider response alone as the asset store.

Current first-version execution path:

1. `generate_image` for new persona or cover candidates
2. `poll_prediction` if a high-quality or async image job returns before outputs are ready
3. `upload_media` if an edit job starts from a local file
4. `edit_image` using uploaded URLs

### 4. Normalize local outputs

Every batch should end with a small local manifest containing:

- `assetId`
- `runId`
- `personaId`
- `conceptId`
- `provider`
- `model`
- `mode`
- `assets[]`
  - local path
  - remote URL if any
  - prompt hash
  - source basis
  - created time

This is the handoff to later review and render stages.

### 5. Prefer edit over full regeneration once a face is approved

Use `edit` mode when the user feedback is about:

- wardrobe tweaks
- desk setup tweaks
- lighting tweaks
- background cleanup
- microphone / accessory adjustment

Do not regenerate from scratch if the approved face and general structure are already correct.

## Path Selection Rule

Store outputs inside the active project's asset structure when one already exists.

If no project-specific asset structure exists yet, choose a clear workspace
asset folder and make the chosen path explicit.

If the output location will become a long-lived handoff point, prefer confirming the destination with the user.

## Example Persistence Convention

One possible project-local layout is:

```text
assets/<asset-id>/
  asset.json
  index.json
  images/
    candidates/
    approved/
  runs/
    image/<run-id>/
      request.json
      response.json
      manifest.json
    upload/<run-id>/
      request.json
      response.json
      manifest.json
```

Keep the `runs/` intermediates under `<work-folder>/.postplus/image-batch-runner/`
when they are internal execution state rather than the user-facing handoff.

Do not assume this example layout is the global default.

Avoid `/tmp` for final assets.

## Tool Contract

This skill expects two tool adapters:

- `generate_image`
- `upload_media`
- `edit_image`

The normalized request/response shapes live in [`references/tool-contracts.md`](references/tool-contracts.md).

The provider-specific first version is also described there.

For the current hosted integration:

- `generate_image` calls the selected model endpoint directly
- `upload_media` uploads local files to hosted media storage and returns a reusable URL
- `edit_image` must consume uploaded image URLs, not raw local file paths

Model selection rule:

- set `request.model` explicitly when you want a non-default model
- default remains `google/nano-banana-2` for backward compatibility
- use Seedream sequential variants when cross-shot identity consistency matters more than single-image iteration speed
- for Seedream models, prefer explicit `size`
- for sequential Seedream models, set `maxImages` to the intended number of outputs

## Review Rule

Before calling an image provider, verify:

- persona is benchmark-backed
- image request is tied to a real asset purpose
- the job records what should stay fixed vs vary

After generation, review:

- realism
- benchmark fit
- repeatability across 10 videos
- risk of looking like a specific copied creator
- ad-like drift

## Failure Mode

Stop and say the request is under-specified if any of these are missing:

- no locked persona or visual direction
- no asset purpose
- no source basis
- no local output path

Do not compensate for missing strategic inputs by inventing a style.

## Example Commands

Generate from a normalized request file:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/generate_image.mjs \
  --request /path/to/request.json
```

Poll an async prediction later:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/poll_prediction.mjs \
  --request /path/to/request.json
```

Upload a local file for later edit:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/upload_media.mjs \
  --request /path/to/upload-request.json
```

Run an edit job using uploaded URLs:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/edit_image.mjs \
  --request /path/to/edit-request.json
```
