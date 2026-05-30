---
name: slideshow-producer
description: End-to-end TikTok or Instagram slideshow production with vibe-driven prompt writing, local JSON slide management, optional localhost review GUI, batch GPT Image 2 generation, and text overlay compositing. Use this when the user wants to create slideshows or carousels from scratch, including script planning, image prompts, and export-ready slide sequences.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Slideshow Producer

## Use When
- The user wants TikTok slideshow or Instagram carousel production from vibe,
  local images, slide prompts, reviewable manifest JSON, generated images, and
  final text overlays.
- Use after script/hook strategy is clear enough to plan slides. This skill owns
  slide manifest, preview/review, generation orchestration, and compositing.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Execution Boundary
- Do not write hook variants from scratch, call image providers directly, create
  persona packs, or replace final creative QA.
- Default image models are `image-gpt-image-2-text` for slides without
  references and `image-gpt-image-2-edit` for slides with references.
- Default quality is `medium`, resolution `1k`, output PNG. Default platform is
  TikTok `9:16`; Instagram carousel uses `4:5` unless the user asks otherwise.

## Manifest And Routing
- The slide manifest is the routing source of truth.
- `imageSource: "local"` uses `localImagePath` as the final image and must not
  call generation.
- `imageSource: "generate"` with no reference paths/URLs must use
- `imageSource: "generate"` with any reference path/URL must use
- Never send reference-backed slides through text-to-image. Fix the manifest
  before generation if routing is inconsistent.

## Source And Prompt
- Ask for platform, slideshow count, vibe, source basis, output folder, and any
  local images. Classify local images as final slide images or generation
  references.
- Prompts should be core scene plus vibe in two or three sentences. Add concrete
  product, environment, emotion, and prop details when they matter; avoid long
  negative-constraint walls.
- Save a local manifest before generation. For three or more slideshows, split
  manifest drafting across parallel sub-agents, then the main agent reviews the
  collected manifests.

## Review And Handoff
- Before generation, ask for explicit approval: number of slides, model, quality,
  resolution, and counts of text-to-image versus reference edits.
- After compositing, hand off final image paths, updated manifest, and any
  `creative-qa` or publishing.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill slideshow-producer`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus media schema --json` only when constructing or repairing an unknown request shape.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
