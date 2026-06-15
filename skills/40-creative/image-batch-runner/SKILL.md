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
  image generation or reference-based edit run.
- The output must include local image files plus durable request, response, and
  manifest records for later QA or video rendering.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.
- Creative classification, model/reference policy, or storyboard logic is still
  unresolved. Use `image-generation` first.

## Execution Boundary
- Hosted image generation and edits run through the public `postplus media create`
  verb and are async. A submit writes the request, response, manifest, generation
  handle, provider status, and downloaded outputs if already completed.
- This runner validates and executes resolved requests. It must not make creative
  strategy, task-classification, or reference-policy decisions.
- A higher-quality default and faster or cheaper model families are available;
  prefer the default unless the user or upstream brief asks for a specific family,
  ratio, quality, or resolution. The generated example below shows the default
  endpoint key.
- Reference-based edits pass each source image as a remote URL via a repeated
  `--reference-image <url>` flag. Upload local source files to a hosted URL first;
  do not pass local paths as edit references.
- Identifiers and run-local state (`assetId`, `runId`, `localAssetDir`, manifest
  paths) are minted or derived by the runner — do not supply them. Read them back
  from the result for the next handoff.

## Source And Path
- Ground every request in a benchmark-backed persona lock, concept or shot need,
  visual constraints, `assetPurpose`, and `sourceBasis`.
- Use source files from the active project/client folder first. Do not treat one
  client directory as the default for all image work.
- Keep internal requests, responses, and manifests under `.postplus`; keep final
  user-facing images and manifests in the active asset folder. If no asset folder
  exists, choose one explicit workspace path.

## Review And Handoff
- Before submission, verify persona grounding, asset purpose, source basis, and
  what must stay fixed versus vary.
- After generation, check realism, benchmark fit, repeatability across videos,
  copied-creator risk, and ad-like drift.
- If processing is still pending, return the manifest/request paths and the status
  command to poll.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill image-batch-runner`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus media schema --json` only when you need the full endpoint, flag,
  and enum contract or are repairing an unknown request shape.
- Run the hosted image job with the generated command below; do not call provider
  APIs directly.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media create image-gpt-image-2-text \
  --prompt <prompt> \
  --output <result.json>
```
<!-- END GENERATED EXECUTION EXAMPLE -->

- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
