---
name: shot-by-shot-analysis
description: Inspect multiple reference or benchmark videos shot by shot, record observable visual and audio evidence independently for each source, then synthesize their recurring short-form style grammar, one-off details, imitation boundaries, and generator risks in one human-readable Markdown report. Use before image prompt construction, video request architecture, Seedance workflow creation, or batch media generation when reference footage defines the desired production language.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Shot-by-Shot Analysis

## Purpose

Turn multiple reference videos into one evidence-backed Markdown report that a
human can review and downstream generation skills can use. Analyze first;
synthesize only after every source has been inspected.

## Execution Boundary

- Use `video-analysis` for actual video understanding. Analyze each source in a
  separate request with the same shot-table contract.
- Do not generate images, videos, prompts, workflows, or provider payloads.
- Do not infer video content from metadata, filenames, transcripts, thumbnails,
  or general knowledge when the footage itself has not been inspected.
- Keep raw hosted responses and temporary request records internal. Deliver one
  Markdown report named `<case>-shot-by-shot-analysis.md`.

## Workflow

1. Inventory every input video. Record a stable source label, path or URL,
   duration when known, and source basis.
2. Inspect each video independently. Do not expose earlier analyses or a draft
   shared style theory while analyzing later videos.
3. Segment by observable shot or meaningful continuous beat. Use start-end
   timecodes. Mark approximate boundaries when exact timing is uncertain.
4. Complete the shot table for the current video before interpreting its broader
   purpose. Describe visible and audible evidence before inference.
5. Verify that the table covers the full usable duration, preserves shot order,
   and does not invent speech, sound, motion, products, or production intent.
6. Repeat until every video has a complete table.
7. Compare all completed tables. Separate recurring grammar from one-off details
   and unique recognizable elements.
8. Write the Style Grammar Report with concrete rules, supporting source and
   timecode references, recurrence, and confidence.
9. Add a compact downstream handoff section. Preserve the style logic without
   turning it into final prompts or execution requests.

## Shot Table Contract

Use this exact column order for every video:

`timecode | visual | framing/composition | camera motion | subject/action | product/prop relationship | lighting/color | edit rhythm | sound/music | speech/text | emotional state | production purpose`

Apply these rules:

- Describe what is visible and audible before interpreting it.
- Keep `visual` factual. Put inferred narrative or commercial function only in
  `production purpose`.
- Describe framing with production terms such as shot size, angle, headroom,
  subject placement, depth, foreground, and negative space.
- Distinguish camera movement from subject movement.
- Quote speech or visible text only when legible or audible. Otherwise write
  `unclear`, `partially audible`, or another precise uncertainty marker.
- Describe edit rhythm using observable cut length, cut type, pauses, speed
  changes, montage density, or continuity behavior.
- Mark inferred emotional state or production purpose with confidence when the
  evidence is ambiguous.
- Use `not present` when a field truly does not occur. Do not fill absence with
  speculation.

## Synthesis Rules

- Do not average the videos early. Synthesize only from completed shot tables.
- Treat a pattern as recurring only when supported by more than one source, or
  by repeated independent examples within a source. State the narrower basis.
- Cite evidence as `<source-label> @ <timecode>`.
- For every grammar dimension, distinguish:
  - `shared rule`: the reusable production behavior
  - `evidence`: supporting source and timecode references
  - `recurrence`: recurring, source-specific, or uncertain
  - `confidence`: high, medium, or low
- Prefer concrete language over labels such as `premium`, `cinematic`,
  `authentic`, or `native`. Use those labels only after describing the visible
  and audible evidence that supports them.
- Preserve camera grammar, timing, object logic, relationship logic, sound
  behavior, and emotional progression without preserving creator identity.

## Imitation Boundary

Do not copy or recommend copying:

- creator identity, face, voice identity, or distinctive personal mannerisms
- exact scenes, locations, wardrobe, dialogue, jokes, or shot sequences
- brand marks, packaging identity, private details, or recognizable background
  information
- unique overlays, signature graphics, or other source-identifying elements

Translate useful reference evidence into general production rules. Put
recognizable or source-specific elements under `avoid`, not `must_keep`.

## Markdown Deliverable

Read `references/report-template.md`. Produce one report with complete source tables, the ordered `Style Grammar Report`, and a concise downstream handoff.

## Downstream Handoff

Keep the handoff concise and derived from the report:

- **Image Generation:** Extract static framing, subject state, scene, lighting, palette, product placement, `must_keep`, `can_vary`, and `avoid`. Hand this to creative planning before `image-batch-runner`.
- **Video Prompt Architecture:** Extract camera language, movement, edit rhythm, sound, speech posture, emotional progression, product behavior, continuity, and generator risks before `video-batch-runner`.
- **Workflow Creation:** Provide the full report as source evidence. Compile its
  rules into positive, executable scene carriers and explicit reference jobs;
  do not paste analysis language or imitation warnings into model prompts.

Do not create separate handoff files unless the user explicitly requests them.

## Quality Check

Before handoff, confirm:

- every input video has a complete, ordered shot table
- synthesis begins only after the final table
- shared claims cite supporting sources and timecodes
- recurring and one-off details are separated
- uncertainty is visible rather than silently resolved
- production-purpose inference is not presented as observation
- unique identity, brand, private, and recognizable elements are excluded from
  reusable rules
- the report is readable by a human and specific enough for downstream prompt
  construction

## Stop Conditions

- Stop when a source video cannot be accessed or actually inspected.
- Stop when missing sources would materially change a requested cross-video
  synthesis.
- If the hosted analysis command fails, report the exact error and do not replace
  video evidence with guesses.
