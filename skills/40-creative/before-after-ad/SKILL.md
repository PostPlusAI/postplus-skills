---
name: before-after-ad
description: Design evidence-led before-and-after short-form ads from product facts, approved proof, reference analysis, or rough concepts. Use for before/after ads, transformation ads, problem-solution-result UGC, skincare/body/wellness routines, visual comparison scripts, or approved before-after scripts that should proceed to image-batch-runner or video-batch-runner.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Before-After Ad

## Purpose

Create approval-ready before-and-after ad concepts and shot scripts. Make the
starting state inspectable, show a plausible product-use behavior, and resolve
with controlled visual evidence rather than an unsupported transformation claim.

Produce a `Before-After Grammar Plan`, shot script, one approval checkpoint, and
direct downstream handoff after approval.

## Workflow

### 1. Ground The Brief

Read the smallest useful source context first:

- product facts, approved claims, usage instructions, and substantiation
- audience, persona, concern, desired visible result, and duration
- product, creator, scene, audio, and style references
- prior reference-video analysis or benchmark notes when relevant

If the user supplies raw reference videos without an analysis, use
`video-analysis` first. Do not infer style from filenames, thumbnails, or a
single frame.

Lock these before writing:

- `starting_state`
- `desired_result_state`
- `pressure_carrier`
- `product_capability`
- `approved_proof`
- `claim_boundary`
- `persona_and_concern_map`
- `product_appearance`
- `duration_and_format`
- `reference_duties`

Ask only when a missing fact would change the product, proof, claim, identity,
or workflow. Do not invent treatment timelines, dosage, medical causality,
guaranteed outcomes, or product appearance.

### 2. Design The Proof Grammar

Read `references/style-grammar.md`.

Produce a `Before-After Grammar Plan` with these fields:

- `core_human_state`
- `pressure_carrier`
- `baseline_evidence`
- `comparison_control`
- `product_entrance`
- `product_gesture`
- `result_evidence`
- `camera_language`
- `framing_rules`
- `movement_rules`
- `edit_rhythm`
- `sound_mode`
- `text_mode`
- `claim_boundary`
- `continuity_locks`
- `generator_risks`

Choose one primary proof route:

- `direct comparison`: baseline → use → matched result → optional split view
- `discovery`: external trigger → inspection → use → result
- `routine montage`: concern → repeated normal use → result portrait

Do not copy a reference creator, exact scene, wording, music, brand marks, or
recognizable personal details. Transfer only reusable camera, movement, edit,
proof, sound, and text behavior.

### 3. Write The Shot Script

Read `references/shot-script-rubric.md`.

Return a shot table with exactly these columns:

`time | visual | framing/composition | camera motion | action | sound | subtitle/text | proof duty | purpose`

After the table, return `Production Locks` with:

- `persona_lock`
- `concern_map_lock`
- `product_lock`
- `scene_lock`
- `before_after_match_lock`
- `audio_lock`
- `claim_lock`
- `post_only_elements`

Keep each shot physically executable. Use one clear action per shot. Treat
captions, arrows, circles, split-screen assembly, end cards, disclaimers, and
comparison labels as post-production elements rather than generated scene
content.

After the script, ask whether the direction is approved. Stop before media
generation unless the user approves or explicitly asks to
continue into production in the same request.

### 4. Handoff After Approval

Read `references/downstream-handoff.md` and hand off directly:

- Use `image-batch-runner` first when persona, product lifestyle, concern-map,
  matched before/after, first-frame, or per-clip scene images are needed.
- Use `video-batch-runner` when the approved script and required hosted assets
  already exist and the user wants renders.
Pass the approved plan, script, locks, facts, claim boundary, source basis, and reference duties without a redundant brief or second confirmation.

Let the downstream skill own model selection, request schema, upload rules,
render execution, polling, and manifests.

## Quality Bar

- Make the problem inspectable before a normal product-use gesture.
- Match proof-critical before and after framing, posture, light, and concern area.
- Put the emotional shift after evidence and preserve natural texture.
- Use one restrained text system, hard cuts, and subject-driven motion.
- Separate observed state, testimony, and substantiated product facts.

## Stop Conditions

- Stop when required product appearance lacks an approved reference or creation permission.
- Stop when the requested result or timeline exceeds the approved claim boundary.
- Stop when comparison cannot be honest or references contain no transferable grammar.
