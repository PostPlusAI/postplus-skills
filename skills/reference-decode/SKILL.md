---
name: reference-decode
description: Decode benchmark videos, contact sheets, frames, or rough ideas into reusable prompt structure. Use this when you need to extract hook essence, viewer question, must-copy visual grammar, and forbidden drift before writing storyboard or generation prompts.
---

# Reference Decode

Follow shared release-shell rules in:

- `skills/shared-release-shell-rules.md`

Use this skill before prompt writing when any source material or rough concept exists.

This skill is for:

- breaking a good reference into reusable logic
- separating what should be copied from what must not be copied
- turning vague ideas into promptable structure
- creating a stable handoff for storyboard or provider request work

This skill is not for making the final storyboard grid or provider payload.

## Core Rule

Do not summarize references as "good vibe", "nice pacing", or "strong chemistry".

Extract four objects:

1. `hookEssence`
2. `viewerQuestion`
3. `mustCopyVisualGrammar`
4. `forbiddenDrift`

## Default Workflow

### 1. Load the smallest sufficient reference set

Prefer:

1. hook-first clip or first 0-5 seconds
2. hook-first contact sheet
3. supporting benchmark note
4. full-video style board only if hook-first material is insufficient

If the task is specifically hook replication, do not default to downstream style boards or product-demo frames.

### 2. Decode the opening mechanism

Ask:

- what is the first clear promise?
- what question enters the viewer's head?
- what exact visual structure makes that promise legible?

### 3. Separate structure from identity

Keep:

- camera grammar
- shot order
- visible object logic
- timing logic
- relationship logic

Do not keep:

- exact faces
- exact wardrobe
- creator identity
- exact text overlay
- exact location

### 4. Print the decode block before writing prompts

Read [`references/output-shape.md`](references/output-shape.md).

Print the decode in that exact shape first.

### 5. Hand off cleanly

- if the target is a grid, hand off to `storyboard-grid-writer`
- if the target is a full render request, hand off to `video-request-architect`
- if references should be explicitly bounded, hand off to `reference-contract-builder`

## No-Reference Rule

If there is no usable reference, you may still use this skill in proxy mode.

In proxy mode:

- start from the chosen segment pattern
- infer the likely viewer question
- write must-copy grammar as required scene anchors, not as imitation notes
- write forbidden drift as anti-generic safeguards

Make it explicit that the output is derived from the brief, not from observed benchmark footage.

## Failure Mode

Stop and say the decode is under-specified if there is no way to determine:

- what the opening promise is
- what the viewer should notice first
- what the scene must visibly contain

Do not move to storyboard writing with only mood words.
