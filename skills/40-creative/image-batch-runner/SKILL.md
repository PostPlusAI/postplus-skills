---
name: image-batch-runner
description: Run fact-grounded image generation batches for short-form video production, especially persona images, first-frame candidates, and light consistency edits. Use this when persona and concept inputs already exist and you need local image assets, prompt records, and reusable model-call metadata. This skill should stay anchored to benchmark-backed persona locks and should save both raw provider responses and normalized local asset manifests.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Image Batch Runner

## Use When
- Persona, concept, or shot inputs already exist and the next step is a hosted
  image generation, edit, upload, or poll run.
- The output must include local image files plus request, response, attempt, and
  manifest records for later QA or video rendering.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Execution Boundary
- Default model is `image-gpt-image-2-text`; edits default to
  `image-gpt-image-2-edit`.
- Default creative format is `short_form_vertical` with `aspectRatio: "9:16"`,
  `quality: "medium"`, `resolution: "1k"`, and async execution
  (`enableSyncMode: false`).
- For Instagram Meta Ads, set `creativeFormat: "instagram_meta_ads"` or an
  explicit `aspectRatio: "3:4"` in the normalized request, not only in prompt
  wording.
- Switch model, ratio, quality, resolution, or sync mode only when the user asks
  or the upstream brief explicitly marks a draft or provider constraint.

## Source And Path
- Ground every request in a benchmark-backed persona lock, concept or shot need,
  visual constraints, `assetPurpose`, and `sourceBasis`.
- Use source files from the active project/client folder first. Do not treat one
  client directory as the default for all image work.
- Store internal request, response, and polling state under `.postplus` when it
  is not the user-facing handoff; keep final images and manifests in the active
  asset folder. If no asset folder exists, choose one explicit workspace path.

## Request Boundary
- Hosted media requests require a capability request JSON with explicit
  `capability`, `operation`, `operationId`, and normalized `input`.
- Required request fields: `assetId`, `runId`, `localAssetDir`, `prompt`,
  `assetPurpose`, and `sourceBasis`.
- Use canonical fields only; do not accept `jobId` or `localOutputDir` as image
  request fallbacks.
  Upload or reference local source files explicitly before requesting edits.

## Review And Handoff
- Before submission, verify persona grounding, asset purpose, source basis, local
  output path, and what must stay fixed versus vary.
- After generation, check realism, benchmark fit, repeatability across videos,
  copied-creator risk, and ad-like drift.
- If processing is still pending, return the manifest/request paths and the
  status command to poll.

## Fail Fast
- Missing canonical asset/run fields, prompt, source basis, asset purpose, local
  output path, supported model, uploaded edit URL, hosted capability request, auth, hosted
  service, or local media path.
- Do not invent visual strategy, silently downgrade quality, or use a fallback
  provider path to hide the failure.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill image-batch-runner`.
- Request schema: `postplus media schema --json`; add `--endpoint <endpoint-key>` for media-generation examples.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
