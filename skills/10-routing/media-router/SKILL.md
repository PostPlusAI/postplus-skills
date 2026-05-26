---
name: media-router
description: Route audio, video, transcript, subtitle, and edit-prep requests into the right media-understanding workflow before execution. Use this when the user wants transcription, subtitle generation, beat mapping, B-roll planning, or edit-ready outputs and the first question is which skill and model chain should run.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Media Router

## Use When
- The user has audio, video, transcript, subtitle, A-roll, or B-roll material.
- The first decision is whether to transcribe, package subtitles, add semantic
  understanding, or build an edit-ready plan.
- The output quality target is rough, subtitle-ready, or edit-ready.

## Do Not Use When
- Do not treat every media request as plain transcription.
- Do not execute downstream collection or editing work in this router.
- Do not choose a costly model chain when rough output is enough.

## Core Rule
Route by job intent, not by input file type alone.

Choose from five dimensions:

- `inputType`: audio, video, transcript, or transcript+assets
- `goal`: transcript, subtitles, semantic-analysis, beats, broll-map, or edit-plan
- `quality`: rough, subtitle-ready, or edit-ready
- `scale`: single or batch
- `costMode`: cheap-first or quality-first

## Default Routing Logic
- Audio to transcript -> `audio-transcription`.
- Video to transcript or subtitles -> `video-transcription`.
- Existing transcript to subtitle files -> `subtitle-packager`.
- Transcript plus assets to cut logic or B-roll plan -> `editing-decision-engine`.
- Video to edit-ready plan -> transcription first, optional subtitle packaging,
  optional semantic video analysis, then `editing-decision-engine`.

## Quality Thresholds
- `rough`: quick review, search, logging, or candidate beat spotting. Prefer
  cheaper transcription and fewer enrichments.
- `subtitle-ready`: captions, SRT/VTT, and reliable sentence or word timing.
  Timestamps are mandatory.
- `edit-ready`: A-roll/B-roll decisions, cutaway placement, and beat-level
  planning. Use timestamped transcript plus semantic understanding when visual
  proof matters.

## Output Shape
The artifact contains:

- `route` and `why`
- `primarySkill`
- `supportingSkills`
- `modelPlan`
- `outputArtifacts`
- `needsTimestamps`
- `executionMode`

## Fail Fast
- Ask for the missing media type or goal when the route would change.
- Stop if the user expects edit-ready output but no transcript, timestamps, or
  visual proof path is available.
- Do not invent provider calls or hidden model chains.

## Handoff
- Hand the route JSON to the named `primarySkill`.
- Preserve expected artifacts so downstream skills know whether to produce
  `transcript.json`, `timed-transcript.json`, subtitles, beat maps, or edit plans.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill media-router`.
- This public skill is instruction-driven. Produce the artifact described by the workflow directly from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
