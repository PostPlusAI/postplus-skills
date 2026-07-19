---
name: lifestyle-ad
description: Design State-Led Lifestyle Ads where product capability is hidden inside a desirable human state. Use for "Lifestyle Ad", "State-Led Lifestyle Ad", "能力藏在状态里", premium product ads, Ray-Ban-like ad feel, tasteful product films, turning features into lifestyle ad scripts, shot-by-shot scripts with camera/action/sound/subtitle/purpose, and approved lifestyle scripts that should proceed directly into production via video-batch-runner for hosted video renders, image-batch-runner when still assets are needed first, or workflow-creation when the script should become a reusable workflow on the PostPlus workflow platform.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Lifestyle Ad

## Purpose

Create state-led lifestyle ad concepts and shot scripts. The product should feel like part of a person's taste, rhythm, and composure, not a feature demo.

Use this skill to turn product facts, brand docs, reference ads, or rough feature ideas into:

1. A `Camera Grammar Plan`.
2. A shot-by-shot script.
3. A user approval checkpoint.
4. Direct handoff to the right production skill after approval.

## Workflow

### 1. Ground The Brief

Read the smallest useful source context first:

- brand, product, claim-boundary, persona, script, or reference files supplied by the user
- prior ad-analysis files or benchmark notes when explicitly relevant
- product reference, creator reference, audio reference, duration, model, or resolution preferences if provided

Lock these before writing:

- product capability
- desired visible user state
- audience
- proof available
- claim boundaries
- visual world
- output format and duration target when supplied

### 2. Design The Camera Grammar

Read `references/camera-grammar.md`.

Produce a `Camera Grammar Plan` with these fields:

- `status_to_make_visible`
- `body_product_relationship`
- `dominant_framing`
- `motion_ratio`
- `pressure_carrier`
- `product_gesture`
- `proof_style`
- `sound_world`
- `text_restraint`
- `final_identity_line`

Do not force a fixed shot order, scene type, phrase, product category, or ending formula. Choose grammar that fits the current brand and product.

### 3. Write The Shot Script

Read `references/shot-script-rubric.md`.

Return a shot table with exactly these columns:

`time | visual | framing/composition | action | sound | subtitle/text | purpose`

Keep each row concrete enough for filming or video-generation prompting. Use restrained text and make the product action socially natural.

After the shot script, ask the user whether this script direction is OK.

### 4. On Approval, Handoff Directly

If the user approves the script, read `references/workflow-handoff.md` and immediately hand off to the right production runner.

Use `$video-batch-runner` by default: it turns the approved shot script into hosted video renders. This is the standard path when the user simply says to continue after approving the script.

Use `$image-batch-runner` first when the approved script needs still assets before video: persona images, product lifestyle stills, first-frame candidates, scene images, or light consistency edits. Those stills then feed the video renders.

Use `$workflow-creation` when the user wants the approved script to become a reusable production line instead of a one-off render batch: it builds a quotable, human-launched workflow on the PostPlus workflow platform from the locked script and references.

Pass the approved shot script, Camera Grammar Plan, brand constraints, product facts, claim boundaries, and any provided references as locked creative context. Do not output a separate production brief and do not ask a second "generate?" confirmation.

Let the downstream production runner handle missing product, creator, audio, model, resolution, route validation, and asset validation.

## Quality Bar

- Start from human state and tension, not from a product announcement.
- Let the viewer infer capability from composure, behavior, and light proof.
- Use specific environment pressure instead of broad pain-point copy.
- Make product gestures ordinary: touch, adjust, lift, place, glance, close, carry.
- Treat UI, results, labels, and text as proof glimpses, not tutorials.
- Prefer identity-style endings over hard CTAs unless the user asks for direct response.
