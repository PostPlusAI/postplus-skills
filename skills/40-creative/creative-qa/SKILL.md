---
name: creative-qa
description: Record human-in-the-loop quality judgments for generated images, voice takes, and videos in short-form production. Use this when a person has reviewed an asset and you need structured verdicts, reasons, issue categories, and rerun guidance without turning subjective approval into untracked chat history.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Creative QA

## Use When
- Record human-in-the-loop quality judgments for generated images, voice takes, video renders, and final exports.
- Use after a person has reviewed an asset and you need structured verdicts, reasons, issue categories, blame stage, proposed action, and rerun guidance.

## Do Not Use When
- No human verdict exists yet.
- The user wants autonomous AI approval.
- The task is prompt critique before generation; use preflight or prompt QA instead.

## Required Input
- Human reviewer verdict and reasons.
- Target object type, id, and version.
- Reviewer and review timestamp.
- Proposed action.

## Human Rule
Humans decide quality. AI may summarize notes, normalize categories, and suggest likely blame stages, but only human-confirmed feedback becomes the durable QA record.

Do not invent approval, rejection, or reviewer intent.

## Default Workflow
1. Confirm the reviewed asset: type, id, version, and optional campaign/persona/concept linkage.
2. Confirm the human reviewer, timestamp, verdict, and reasons.
3. Normalize reasons into `goodReasons`, `badReasons`, issue categories, and blame stage.
4. Decide proposed action: approve, rerun a specific stage, revise source input, or reject.
5. If rerun guidance exists, build a feedback handoff with a concrete `rerunTarget`.
6. Store or return the structured QA record next to the reviewed object or in the work folder's QA area.

## Supported Objects
- `image`
- `voice_take`
- `video_render`
- `final_export`

## Verdicts
Valid verdicts are `approved`, `revise`, and `reject`.

For `revise` or `reject`, require non-empty `badReasons` and `issueCategories`. For `approved`, these may be empty arrays.

## Categories
Common issue categories:
- `lip_sync`, `persona_drift`, `audio_style`, `audio_pacing`, `hook_weak`, `ad_like`, `ugc_native_feel`, `visual_realism`, `subtitle_accuracy`, `mixed`

Common blame stages:
- `image`, `script`, `voice`, `render`, `subtitle`, `mixed`

Use blame stage as diagnostic guidance, not as a substitute for human verdict.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Output Shape
`qaReport`:
- `qaReportId`, `targetObjectType`, `targetObjectId`, `targetVersion`, `campaignId`, `personaId`, `conceptId`, `reviewer`, `reviewedAt`, `verdict`, `goodReasons`, `badReasons`, `issueCategories`, `blameStage`, `scores`, `proposedAction`, `status`

Optional `feedbackHandoff`:
- `feedbackId`, `qaReportId`, `targetObjectType`, `targetObjectId`, `feedbackCategory`, `feedbackText`, `dependencyImpact`, `rerunTarget`

## Anti-Patterns
- silently approving an asset
- replacing a human verdict with an AI guess
- using vague stage labels as rerun targets
- losing linkage to the reviewed object version
- preserving subjective chat notes without structured reasons

## Handoff
- Return the structured QA record structured output or an explicit blocker. If feedback is present, hand off to the named rerun target with the QA record attached.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus media schema --json` only when constructing or repairing an unknown request shape.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
