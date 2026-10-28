---
name: image-batch-runner
description: Execute ready image briefs and edits, including product or persona images and batch variants. Use resolved references and return image assets with saved run results.
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
- If processing is still pending, keep the manifest/request paths and the poll
  command `postplus media poll --handle <output.data.id> --output path/to/generation-result.json`.
  Reuse the exact `--output` path from the initial submit. A completed poll
  atomically replaces the processing JSON at that path with the completed result;
  prefer the CLI-returned action or resume command for that same operation,
  honor its wait/recovery boundary, and never submit a replacement job.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.

- Before expanding a batch, complete the first viable item. Isolate definite
  item-local input errors and typed content-policy rejections; preserve other
  independent items. Do not soften blocked content to evade a restriction.
- Shared authentication, balance, configuration or service failures stop new
  submissions. Continue checking and delivering already submitted items using
  their original identities. Unknown failure scope stops expansion.
- Correct definite pre-submission field or format errors without changing the
  requested intent, mode or output constraints. After submission or an unknown
  outcome, follow the same operation's structured recovery action. Do not buy a
  replacement merely because a status query failed.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill image-batch-runner`.
- Poll a pending image job: `postplus media poll --handle <output.data.id> --output path/to/generation-result.json`.
  Reuse the initial submit's result path so the completed poll atomically
  replaces its processing JSON. Prefer the returned resume action and stop
  when the CLI wait/recovery boundary is reached.

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

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Use existing PostPlus credits for requested work within existing authorization; estimate-only requests do not execute. Do not recharge, buy subscriptions, publish or change external advertising spend without applicable authorization. An initial reservation is not a final price or a hard cost cap. If a required hard final-cost limit cannot be enforced, do not execute; explain that limit.
Correct definite pre-submission field or format errors without changing the requested intent, mode or output constraints. After submission or an unknown outcome, resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
Keep raw results, operation identifiers and recovery commands in execution records. In ordinary chat, give the result, meaningful limitations, known cost and any necessary user decision; do not narrate uploads, polling, internal identifiers or JSON. When asked how media was made, provide the actual model, submitted prompt in the user language and references actually submitted with their roles.
<!-- END GENERATED EXECUTION EXAMPLE -->

- Requested tasks use existing PostPlus credits after the current price and balance are checked.
  Estimate-only requests do not execute. Stop on insufficient credits; do not
  recharge, buy a subscription, or repeat an uncertain paid operation.
