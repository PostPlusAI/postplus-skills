---
name: reference-decode
description: Decode benchmark videos, contact sheets, frames, or rough ideas into reusable prompt structure. Use this when you need to extract hook essence, viewer question, must-copy visual grammar, and forbidden drift before writing storyboard or generation prompts.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Reference Decode

## Use When
- A benchmark video, contact sheet, frame set, rough idea, or source material
  needs to become promptable structure.
- You need the hook essence, viewer question, visual grammar, and forbidden
  drift before storyboard or request writing.
- A no-reference brief still needs a proxy structure before prompt work.

## Do Not Use When
- Do not create the final storyboard grid or provider payload here.
- Do not copy faces, exact wardrobe, creator identity, exact location, or exact
  overlays from benchmark material.

## Core Rule
Do not summarize references as "good vibe", "nice pacing", or "strong
chemistry". Extract four objects:

- `hookEssence`
- `viewerQuestion`
- `mustCopyVisualGrammar`
- `forbiddenDrift`

## Default Workflow
1. Use the smallest sufficient source set: hook-first clip, first 0-5 seconds,
   hook-first contact sheet, supporting note, or full style board only if needed.
2. Decode the opening mechanism: first clear promise, viewer question, and the
   exact visual structure that makes the promise legible.
3. Separate structure from identity. Keep camera grammar, shot order, object
   logic, timing, and relationship logic; do not keep exact identity details.
4. Create a compact decode artifact when it is useful.
5. Print or return the decode block before storyboard or request writing.

## No-Reference Mode
When no usable reference exists, operate in proxy mode:

- start from the chosen segment pattern
- infer the likely viewer question
- express must-copy grammar as scene anchors, not imitation notes
- express forbidden drift as anti-generic safeguards
- state that the output is brief-derived, not observed from footage

## Output Shape
The artifact contains `hookEssence`, `viewerQuestion`, `mustCopyVisualGrammar`, and
`forbiddenDrift`.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Handoff
- Grid, beat sheet, or full render request -> `video-request-architect`.
- Explicit learn/do-not-copy boundary -> `reference-contract-builder`.
- Prompt already drafted -> `prompt-preflight-qa`.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- This public skill is instruction-driven. Produce the artifact described by the workflow directly from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
