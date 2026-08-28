---
name: image-batch-runner
description: Run fact-grounded image generation batches for short-form video production, especially persona images, first-frame candidates, and light consistency edits. Use this when persona and concept inputs already exist and you need local image assets, prompt records, and durable run metadata. Keep requests anchored to benchmark-backed persona locks and save normalized local asset manifests.
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
  verb and are async. A submit records the run handle, current status, and
  completed artifact metadata (bytes are not
  auto-downloaded; see the download command below).
- This runner validates and executes resolved requests. It must not make creative
  strategy, task-classification, or reference-policy decisions.
- A higher-quality default and faster or cheaper model families are available;
  prefer the default unless the user or upstream brief asks for a specific family,
  ratio, quality, or resolution. The generated example below shows the default
  endpoint key.
- Only edit endpoints accept `--reference-image` (default edit endpoint:
  `image-gpt-image-2-edit`). Text endpoints such as `image-gpt-image-2-text`
  reject the flag with `Unknown option`, so any reference-bound generation must
  target an edit endpoint, not a text endpoint.
- Reference-based edits pass each source image via a repeated
  `--reference-image` flag. Each value may be a local path, HTTPS URL, existing
  PostPlus media reference, or data URI. The CLI validates and prepares local
  media before the single hosted submit; do not pre-upload it or construct a
  manual request object.
- Save a finished image output to disk with
  `postplus media-file download --reference <output.data.artifacts[0].mediaReference> --output-file <path>`.
  Use the completed result's artifact reference as the download source.
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
- If processing is still pending, return the manifest/request paths and the poll
  command `postplus media poll --handle <output.data.id> --output path/to/generation-result.json`.
  Reuse the exact `--output` path from the initial submit. A completed poll
  atomically replaces the processing JSON at that path with the completed result;
  rerun the same command while pending (each invocation waits up to 45s).

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, alternate execution paths, or unpublished tools.
- Batch canary: before fanning out a batch of independent items, submit item 1
  alone and poll it to a terminal state. If the canary is content-policy
  blocked (the per-item typed code below), record and skip it per batch
  isolation, then canary the next item; fan out only after a non-blocked
  canary completes successfully. Every other canary failure is systemic: stop.
  Some failures are only visible on poll (async terminal states), so a
  submit-accepted batch can still be 100% doomed — a canary caps the blast
  radius of any systemic defect (bad reference form, service outage, auth) at
  one item instead of the whole batch.
- Batch isolation: when producing a batch of independent items, a per-item
  content/safety rejection is isolated to that item. It is identified
  only by the typed code `postplus_cli_hosted_media_content_policy_blocked`,
  never by matching error prose, and it surfaces at either boundary: a failed
  `postplus media create` whose typed error `code` is that code, or a
  submitted run whose poll result carries `output.data.status: failed` and
  `output.data.error.code` set to that code. On either, record which item was
  blocked and its exact reason, skip it, and continue submitting and polling
  the remaining items, then report the incomplete set at the end. Do not retry,
  soften, or re-submit the blocked item — that is a forbidden payload rewrite.
  Every other failure (a failed owned CLI/script command whose typed `code` is
  not that content-policy code, or a run whose `error.code` is not that
  content-policy code — auth, transport, quota, malformed request, service
  outage) is systemic: stop per the rule above.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill image-batch-runner`.
- Poll a pending image job: `postplus media poll --handle <output.data.id> --output path/to/generation-result.json`.
  Reuse the initial submit's result path so the completed poll atomically
  replaces its processing JSON; rerun while pending (each invocation waits up
  to 45s).
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, alternate execution paths, or unpublished tools.
- Use `postplus media schema --json` only when you need the full endpoint, flag,
  and enum contract or are repairing an unknown request shape.
- Run the hosted image job with the generated command below; do not use another
  execution interface.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media create image-gpt-image-2-text \
  --prompt "Describe the result you need" \
  --wait \
  --output ./result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->

- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
