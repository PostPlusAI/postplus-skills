---
name: ugc-flow
description: Orchestrate the public UGC creative production line from product or research evidence through creator logic, storyboard, image/video/audio generation handoffs, montage planning, and QA. Use this when the user asks for a repeatable UGC-style ad or creator video workflow rather than one isolated media asset.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# UGC Flow

## Use When
- The user wants a UGC-style product, app, service, testimonial, or creator
  video pipeline.
- The job spans multiple steps: product analysis, creator/persona logic,
  storyboard, image or video clip generation, montage, subtitles, and QA.
- The request needs a standard production line instead of one isolated runner.

## Do Not Use When
- The user only needs one image, voice take, or simple clip. Use
  `image-generation`, `audio-generation`, or `video-generation`.
- The user only needs transcription, subtitles, or video analysis. Use
  `media-router`.
- A provider-ready request already exists. Use the relevant runner.

## Core Boundary
This is a workflow skill. It coordinates public skills and checkpoints; it does
not call providers or submit generation jobs.

## Standard Pipeline

1. `product_analysis`: collect product facts, core promise, proof points,
   constraints, and claims that must not be invented.
2. `creator_logic`: define creator type, audience fit, native behavior, tone,
   and what the creator is allowed to claim.
3. `board`: use `reference-decode`, `reference-contract-builder`, and
   `storyboard-grid-writer` when references or panel logic matter.
4. `clip`: use `image-generation`, `audio-generation`, and `video-generation`
   to produce controller handoffs.
5. `montage`: use `editing-decision-engine` for cut logic, B-roll roles, and
   subtitle or beat placement.
6. `qa`: use `creative-qa` and `prompt-preflight-qa` before execution and after
   generated assets return.

## Required Checkpoints
- product facts and source basis
- creator/persona rule
- viewer question and hook mechanism
- reference contract with binding, inspiration-only, and excluded references
- storyboard or beat plan
- image/audio/video controller handoffs
- runner-ready requests only after strategy is locked
- QA verdict and rerun notes

## Routing Table

| Need | Handoff |
| --- | --- |
| Product or market evidence | research or strategy skill appropriate to the product |
| Creator discovery | `creator-discovery-router` |
| Benchmark-to-brief | `benchmark-to-brief` |
| Reference decode or boundary | `reference-decode`, `reference-contract-builder` |
| Storyboard grid | `storyboard-grid-writer` |
| Image assets | `image-generation` |
| Voice or dub | `audio-generation` |
| Clips or talking-head video | `video-generation` |
| Cut logic and montage | `editing-decision-engine` |
| Final creative review | `creative-qa` |

## Output Shape
Return a workflow packet:

- `productionGoal`
- `sourceBasis`
- `creatorLogic`
- `referencePolicy`
- `storyboardOrBeatPlan`
- `generationHandoffs`
- `montagePlan`
- `qaPlan`
- `openQuestions`

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- Do not let runners make creative or claim decisions.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- This public skill is instruction-driven. Produce the workflow packet directly
  from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
