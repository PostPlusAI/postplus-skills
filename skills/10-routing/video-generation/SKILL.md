---
name: video-generation
description: Control video generation requests before execution. Use this when the user asks for a simple clip, storyboard video, UGC video, podcast clip, reference video, talking-head, image-to-video, text-to-video, or research-handoff video and the skill must classify the request before handing it to video-request-architect and a runner such as seedance-submitter or video-batch-runner.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Video Generation

## Use When
- The desired final asset is a generated video or video render plan.
- The request may be a simple clip, storyboard, UGC, podcast clip, reference
  video, talking-head, image-to-video, text-to-video, or research handoff.
- The next decision is task class, request architecture, and execution handoff.

## Do Not Use When
- The user only needs transcription, subtitles, semantic analysis, or edit
  decisioning. Use `media-router`.
- The request architecture is already approved and provider-ready. Use
  `seedance-submitter` or `video-batch-runner`.
- The task is image-only or audio-only.

## Core Boundary
This is the video generation controller. It does not submit jobs.

It must:

1. classify the video task,
2. choose whether references or storyboard must be resolved,
3. hand approved structure to `video-request-architect`,
4. hand submit-ready plans to `seedance-submitter` or `video-batch-runner`.

## Task Classes

| Task class | Use when | Required handoff |
| --- | --- | --- |
| `simple_clip` | one short text/image-to-video clip | `video-request-architect` |
| `storyboard` | panel sequence or contact sheet drives the clip | `storyboard-grid-writer`, then `video-request-architect` |
| `ugc` | creator-style product or app video | `ugc-flow` unless it is one isolated clip |
| `podcast` | voice-led clip, audiogram, or speaker segment | `audio-generation`, then video architecture |
| `reference_video` | benchmark video controls rhythm or motion | `reference-decode` and `reference-contract-builder` |
| `research_handoff` | research/benchmark becomes a generation request | `benchmark-to-brief`, then `video-request-architect` |

## Routing Table

| If not video-generation | Send to |
| --- | --- |
| Understanding or subtitles first | `media-router` |
| Image asset must be created first | `image-generation` |
| Voice or dub must be created first | `audio-generation` |
| Product-to-UGC pipeline | `ugc-flow` |
| Provider-ready request exists | `seedance-submitter` or `video-batch-runner` |

## Three-Layer Boundary
- Controller: classify task and produce the handoff. It must not submit.
- Architect: `video-request-architect` builds provider-agnostic structure. It
  must not call providers.
- Runner: `seedance-submitter` or `video-batch-runner` validates and executes
  normalized requests. It must not make creative strategy decisions.

## Output Shape
Return:

- `taskClass`
- `requiredUpstreamSkills`
- `architectureHandoff`
- `runnerHandoff`
- `referencePolicy`
- `mustNotDo`

## Fail Fast
- Stop if duration, aspect ratio, source basis, product identity, required
  references, audio needs, or storyboard structure would change the route.
- Do not invent a provider payload before the architecture is coherent.
- Do not ask a runner to infer hook, persona, or reference meaning.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill video-generation`.
- This public skill is instruction-driven. Produce the controller handoff
  artifact directly from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
