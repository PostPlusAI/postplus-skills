---
name: video-request-architect
description: Turn approved storyboard logic, beat sheets, or prompt plans into provider-ready short-form video requests. Use this when the segment structure is already known and you need a model-agnostic request architecture that can later map cleanly into Seedance or other video generators.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Video Request Architect

## Use When
- The scene logic, storyboard, beat sheet, or prompt plan is already approved.
- You need a provider-agnostic request architecture before mapping to a video model.
- A long script must be split into self-contained Seedance-ready segments.
- The target creative format or aspect ratio must stay explicit through request mapping.

## Do Not Use When
- Use `pattern-router` first when the segment pattern or hook mechanism is still unclear.
- Use `reference-decode` or `reference-contract-builder` first when reference meaning or copy boundaries are unresolved.
- Use `prompt-preflight-qa` when the request is already drafted and needs QA before generation.

## Core Rule
Prompt architecture comes before provider syntax.

Write the visible clip in time order before choosing model fields. Every final
request must be self-contained; do not rely on a model remembering previous
segments, earlier prompts, or unstated reference bindings.

Lock the PostPlus creative format before provider mapping. Default to
`short_form_vertical` / `9:16`; use `instagram_meta_ads` / `3:4` when the brief
is for Instagram Meta Ads. The selected ratio must appear in the architecture,
segment contract, and final render request.

## Default Workflow
1. Lock the experiment goal: hook replication, camera realism, persona
   continuity, benefit proof, CTA readability, or another narrow test.
2. Build the scene before fields: first frame, visible action, spoken-line
   support, payoff moment, product timing, and binding references.
3. Convert the scene into provider-agnostic blocks: role, goal, hook logic,
   reference policy, output spec, look/tone, timecoded beat sheet, camera,
   sound intent, and product policy.
4. If the target duration exceeds 15 seconds for Seedance, require a timecoded
   `beatSheet` with ordered, non-overlapping `startSeconds` and `endSeconds`.
   Split into independently generatable segments before provider mapping.
5. Print or return the request skeleton before the final provider request:
   goal, segment type, hook logic, viewer question, reference policy, duration,
   creative format, aspect ratio, camera grammar, product policy, and main risks.
6. Map to provider fields only after the architecture is coherent: model,
   duration, aspect ratio, media references, quality, and resolution.

## Output Shape
The script emits a JSON architecture with:

- `creativeFormat`, `targetAspectRatio`, and `duration`
- `segmentType`, `goal`, `hookLogic`, and `viewerQuestion`
- `referencePolicy`, `cameraGrammar`, `productPolicy`, and `mainRisks`
- `skeleton` for the request checkpoint
- `segmentContract` with Seedance segmentation status and per-segment handoff
  data when segmentation is required

## Fail Fast
- Stop if hook logic, reference policy, timecoded actions, or product policy are missing.
- Stop if a Seedance script exceeds 15 seconds without a valid segment plan.
- Do not invent timing from prose, collapse long scripts into one request, or add provider-specific fallback paths.

## Handoff
- Hand `request-architecture.json` to the provider mapping or generation skill.
- For hook or segment uncertainty, hand back to `pattern-router` or `visual-hook`.
- For reference uncertainty, hand to `reference-decode` or `reference-contract-builder`.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill video-request-architect`.
- This public skill is instruction-driven. Produce the artifact described by the workflow directly from the available evidence.
- Do not call unpublished local scripts or private provider/runtime paths.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
