---
name: storyboard-grid-writer
description: Write dense storyboard-grid prompts for short-form image or previsualization workflows. Use this when a generation controller needs a 6-9 panel grid with hook logic, visible actions, product timing, and negative constraints before image or video request architecture.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Storyboard Grid Writer

## Use When
- A controller needs a storyboard grid, beat panel plan, contact sheet, or panel
  prompt pack.
- Hook logic must become visible frame-by-frame action before image or video
  generation.
- The output should hand off to `image-generation` or `video-request-architect`.

## Do Not Use When
- The final provider request is already approved. Use the runner.
- Reference meaning or copy boundaries are unresolved. Use `reference-decode`
  or `reference-contract-builder`.
- The user wants plain prose, a script only, or execution submission.

## Core Rule
Common prompt should be short. Storyboard panels should be detailed.

The grid must carry the narrative load. Do not hide scene logic inside vague
style words.

## Required Inputs
- `segmentType`
- `viewerQuestion`
- `openingMechanism`
- `creativeFormat`
- `targetFrameAspectRatio`
- `mustCopyVisualGrammar` or required scene anchors
- `forbiddenDrift`
- `productRevealTiming`
- text/UI policy

If no reference exists, mark the output as no-reference and state the inferred
scene anchors before writing panels.

## Grid Spec
Default to 6 panels for short hooks and up to 9 panels for longer proof or
motion continuity.

Keep these ratios separate:

- `boardLayoutRatio`: the contact-sheet or storyboard-board canvas
- `targetFrameAspectRatio`: the per-panel creative output ratio, such as `9:16`
  or `3:4`

The board layout must not silently change the generated asset ratio.

## Writing Method
1. Lock viewer question and stop-scroll job for panel 1.
2. Write structural grammar before style: camera start, closest subject, early
   object visibility, and native-feeling behavior.
3. Keep common prompt to reference policy, canvas rules, realism, no-text/UI,
   and safety boundaries.
4. Write each panel as visible events: camera position, subject placement,
   action, environment anchors, and one candid realism flaw when useful.
5. State product reveal timing and forbidden drift.

## Output Shape
Return:

- `gridSpec`
- `commonPrompt`
- `variantTitle`
- `hookEssence`
- `viewerQuestion`
- `panelSequence`
- `productRevealTiming`
- `forbiddenDrift`
- `handoffSkill`

## Preflight Checkpoint
Before the final prompt, print:

```text
Variant title:
Viewer question:
Panel 1 job:
Panel 2-3 support:
Panel 4-6 progression:
Product reveal timing:
Main drift risks:
```

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- Do not create provider JSON or submit renders.
- Do not let a runner infer storyboard logic from generic prompt adjectives.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Handoff
- Image panels -> `image-generation`.
- Video architecture -> `video-request-architect`.
- Reference uncertainty -> `reference-decode` or `reference-contract-builder`.
- Prompt risk review -> `prompt-preflight-qa`.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- This public skill is instruction-driven. Produce the storyboard artifact
  directly from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
