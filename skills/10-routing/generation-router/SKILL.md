---
name: generation-router
description: Route generative media requests before any creative planning or provider execution. Use this when the user asks to generate, modify, dub, animate, or assemble image, video, audio, workflow, or analysis-derived media and the first decision is which generation controller should own the job.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Generation Router

## Use When
- The user asks for generated media, edited media, dubbing, voice, lip-sync,
  storyboard-to-video, reference-to-asset, or analysis-derived generation.
- The first decision is the output family, not the provider or model.
- The request may need a media generation controller before execution.

## Do Not Use When
- Transcription, subtitles, video analysis, beat maps, or edit plans are the
  primary output. Use `media-router`.
- The user already selected `image-generation`, `video-generation`,
  `audio-generation`, or `ugc-flow` and supplied that controller's inputs.
- The task is only research, creator discovery, copywriting, or publishing.

## Core Rule
Classify the generation job before choosing a model or runner.

The router owns only the first split:

- `image`: new image, image edit, product image, batch variants, reference image
  generation
- `video`: simple clip, storyboard video, UGC video, reference video, motion or
  talking-head render
- `audio`: TTS, voice change, translated dub, voice clone, audio handoff for
  lip-sync
- `workflow`: a multi-step production line such as UGC creative, podcast clip,
  product demo, or ad variant set
- `analysis_after_generation`: media understanding first, generation second,
  such as "analyze this competitor clip, then make our version"

## Route Table

| Request shape | Route | First handoff |
| --- | --- | --- |
| Pure image prompt, uploaded image edit, product page image | `image` | `image-generation` |
| Clip, storyboard, creator video, reference-motion video | `video` | `video-generation` |
| Voice, TTS, dubbing, translated audio, voice reference | `audio` | `audio-generation` |
| Product-to-UGC, creator pipeline, repeated asset production | `workflow` | `ugc-flow` or the named workflow skill |
| "Analyze this, then generate..." | `analysis_after_generation` | `media-router` for analysis, then the right generation controller |

## Output Shape
Return a compact route artifact:

- `generationFamily`
- `why`
- `controllerSkill`
- `upstreamSkill` when analysis or research must happen first
- `requiredInputs`
- `handoffNotes`
- `mustNotDo`

## Fail Fast
- Stop if the desired output family would change the route and the request is
  ambiguous.
- Do not choose a provider, endpoint key, runner, or storyboard format here.
- Do not submit generation jobs.

## Handoff
- Image route -> `image-generation`.
- Video route -> `video-generation`.
- Audio route -> `audio-generation`.
- Workflow route -> `ugc-flow` or another workflow skill.
- Understanding-first route -> `media-router`, then return to this router or the
  selected generation controller.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill generation-router`.
- This public skill is instruction-driven. Produce the route artifact directly
  from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
