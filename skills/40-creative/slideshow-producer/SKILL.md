---
name: slideshow-producer
description: End-to-end TikTok or Instagram slideshow production with vibe-driven prompt writing, local JSON slide management, optional localhost review GUI, batch GPT Image 2 generation, and text overlay compositing. Use this when the user wants to create slideshows or carousels from scratch, including script planning, image prompts, and export-ready slide sequences.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Slideshow Producer

Follow shared public skill rules in:

- `postplus-shared` public skill rules

## Pipeline Position

```
script-generator (slideshow mode)
  → slideshow-producer [THIS SKILL]
    → image-batch-runner
```

- script-generator owns: hook logic, script flows, angle strategy, persona checks
- This skill owns: vibe-to-prompt translation, slide manifest management, localhost review, batch orchestration, text compositing
- image-batch-runner owns: actual image generation calls, downloaded assets, local manifests

## What This Skill Is For

- turning a user's vibe description into a concrete slide-by-slide plan
- writing concise, effective image prompts (core scene + vibe, not over-constrained)
- producing a local slide manifest JSON for review and iteration
- optionally launching a localhost GUI for drag-and-drop slide editing
- orchestrating batch image generation through image-batch-runner
- compositing TikTok-style overlay text (white with black stroke) onto final slides

## What This Skill Is Not For

- writing hook variants or script flows from scratch (that is script-generator's job)
- calling image generation APIs directly (that is image-batch-runner's job)
- creating persona packs or brand voice documents
- replacing creative-qa for final human quality review

## Model Defaults

| Param | Default | Notes |
|-------|---------|-------|
| text model | `image-gpt-image-2-text` | Use only when the slide has no reference image |
| edit model | `image-gpt-image-2-edit` | Required when the slide has any reference image |
| quality | `medium` | Faster and cheaper; sufficient for UGC slideshows |
| resolution | `1k` | Good for 1080×1920 output; use 2k for fine detail |
| aspectRatio | `9:16` (TT) or `4:5` (IG) | Based on platform |
| outputFormat | `png` | GPT Image 2 always outputs PNG |

## Local Dependencies

- `python3` with Pillow (`PIL`) is required for `scripts/composite-text.mjs`.

## Reference Image Routing Rule

The slide manifest is the routing source of truth.

- `imageSource: "local"` means use `localImagePath` as the final slide image. Do not call image generation.
- `imageSource: "generate"` with no `referenceImagePaths` or `referenceImageUrls` means `generationMode: "text-to-image"` and must call `generate_image.mjs` with `image-gpt-image-2-text`.
- `imageSource: "generate"` with any `referenceImagePaths` or `referenceImageUrls` means `generationMode: "edit"` and must call `edit_image.mjs` with `image-gpt-image-2-edit`.
- Local reference files must be uploaded through image-batch-runner's `upload_media.mjs` first. Pass only the returned URLs into `edit_image.mjs` as `inputUrls`.

Never send a slide with reference images through text-to-image. If the manifest has references but `generationMode` is missing or set to `text-to-image`, fix the manifest before generation.

## Prompt Writing Principles

GPT Image 2 needs clear scene and vibe description, not a wall of constraints.

### Do: core scene + vibe

Describe what the image should show and how it should feel. 2-3 sentences max.

Good:
```
A person sitting at a cluttered home desk, frustrated expression, looking at a laptop screen.
Natural window light from the side, casual iphone photo feel, slightly warm color cast.
```

### Don't: over-constrain

Do not pile on "no studio lighting, no professional photography, no cinematic quality, no soft glow, no perfect skin, no..." — GPT Image 2 doesn't need negative constraints. They clog the prompt and can confuse the model.

If the vibe is "casual iphone photo", just say that. The model understands.

### When to add specifics

- Product visible: describe it clearly (color, shape, placement)
- Environment matters: room type, lighting source, time of day
- Human expression: the specific emotion or action
- Props: what else is in frame

When in doubt, be more specific about what IS there, not what ISN'T.

## Platform Modes

### TikTok Slideshow (default)

- Aspect ratio: 9:16 (1080×1920)
- Safe zones: avoid top ~60px and bottom ~80px for UI overlays
- Overlay text: upper-center, bold white with black stroke
- Default slide count: 5-7

### Instagram Carousel

- Aspect ratio: 4:5 (1080×1350) preferred; 1:1 (1080×1080) alternative
- Most text in the caption field; minimal image overlay
- Default slide count: 4-6

Default to TikTok when the user hasn't specified.

Read detailed specs in [`references/platform-specs.md`](references/platform-specs.md).

## Default Workflow

### Phase 1: Requirements

Ask the user:
1. How many slideshows? → determines sub-agent count
2. TikTok or Instagram? → default TT
3. Describe the vibe — what should this feel like? Keep it loose.
4. Any local images to use for specific slides? → identify whether each path is a final slide image (`imageSource: "local"`) or a reference for generation (`generationMode: "edit"`).

Do not jump to scripts until you understand the feeling they want.

### Phase 2: Script Creation

For each slideshow, produce a slide manifest JSON.

Each slide has:
- `position` (1-indexed)
- `cognitiveJob` (hook, problem, insight, proof, product, cta, etc.)
- `prompt` (concise, following prompt writing principles above)
- `overlayText` (3-8 words, lowercase, conversational — or null if no text)
- `imageSource` (`"generate"` or `"local"`)
- `localImagePath` (only if imageSource is "local")
- `generationMode` (`"text-to-image"`, `"edit"`, or null)
- `referenceImagePaths` (local reference files for generated edit-mode slides)
- `referenceImageUrls` (uploaded reference URLs for generated edit-mode slides)

Save as a local manifest file.

Read the full schema in [`references/slide-manifest-schema.md`](references/slide-manifest-schema.md).

After producing the manifest, ask: "Need a localhost preview to review and edit? (y/n)"

If yes → start the GUI server, user reviews, drags to reorder, edits prompts and overlay text.
If no → show the JSON summary, user confirms by text.

Before asking for generation approval, run:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/validate-manifest.mjs --manifest /path/to/slideshow-manifest.json
```

### Phase 3: Generation Trigger

After user approves the manifest, explicitly ask:

"Ready to generate N slides? GPT Image 2, quality: medium, resolution: 1k. X text-to-image, Y reference edits."

Do not auto-generate. User must confirm.

### Phase 4: Batch Generation

Local slides: copy the image into the output directory as-is.

Generated slides without references: call image-batch-runner's `generate_image.mjs` per slide with a hosted execution envelope whose `input` is the normalized image request.

Generated slides with references: upload each local reference path with `upload_media.mjs`, then call `edit_image.mjs` with the uploaded URLs. Each hosted script request file must be a `schemaVersion: 1` envelope. Existing `referenceImageUrls` can be used directly if they are already HTTP(S) URLs.

Save both the normalized image request and the hosted envelope request per slide so the run is reproducible.

Default text-to-image request shape per slide:
```json
{
  "assetId": "{slideshowId}-slide-{N}",
  "runId": "{slideshowId}-run-{timestamp}",
  "provider": "hosted-media",
  "model": "image-gpt-image-2-text",
  "mode": "text-to-image",
  "prompt": "{the slide prompt}",
  "aspectRatio": "9:16",
  "quality": "medium",
  "resolution": "1k",
  "outputFormat": "png",
  "localAssetDir": "{output directory}"
}
```

Default reference edit request shape per slide:
```json
{
  "assetId": "{slideshowId}-slide-{N}",
  "runId": "{slideshowId}-run-{timestamp}",
  "provider": "hosted-media",
  "model": "image-gpt-image-2-edit",
  "mode": "edit",
  "prompt": "{the slide prompt, explicitly preserving the reference image facts}",
  "inputUrls": ["{uploaded reference image URL}"],
  "aspectRatio": "9:16",
  "quality": "medium",
  "resolution": "1k",
  "outputFormat": "png",
  "localAssetDir": "{output directory}"
}
```

### Phase 5: Text Overlay + Final Review

After all images are generated, run `composite-text.mjs` to add overlay text to each slide.

Overlay style (TikTok default):
- White text (#FFFFFF), black stroke (#000000, 3px)
- Font: bold sans-serif (Helvetica Bold or system equivalent)
- Position: upper-center
- Size: ~56px relative to 1080px canvas width

Show the final results to the user.

## Sub-Agent Orchestration

When N slideshows are requested:

- N ≤ 2: the main agent handles them sequentially
- N ≥ 3: spawn N sub-agents in parallel for Phase 2 script creation

Each sub-agent produces one slide manifest JSON. The main agent collects and presents them together.

## GUI (Optional)

A minimal localhost review tool at `gui/index.html`.

Start with `node gui/server.mjs` (default port 3099).

The GUI lets the user:
- See all slides in order
- Drag to reorder
- Edit prompt and overlay text inline
- Toggle image source (generate vs local)
- Save changes back to the manifest JSON

The GUI is a preview tool, not a render trigger. Generation is separate (Phase 3).

## Failure Modes

- No vibe description → ask again with more specific prompts
- Single slide → minimum is 2 for a slideshow
- Local image not found → flag before generation, not during
- User wants to skip review → allow but warn
- image-batch-runner unavailable → stop, report the gap
- Python Pillow unavailable → stop before compositing and install Pillow in the active `python3` environment

## Shared Source Context

When campaign-level source files exist, use them as context:
- `brand.md` for tone and forbidden phrases
- `persona.md` for visual character constraints (only when slides feature the persona)
- `product.md` for accurate product appearance

This skill may read these files. It does not create or manage them.

## Handoff

After Phase 5, suggest next steps:
- `creative-qa` for human quality review
- `social-media-publisher` for publishing
