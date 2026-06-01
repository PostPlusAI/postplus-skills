---
name: subtitle-packager
description: Convert normalized timed transcript data into subtitle artifacts such as SRT and ASS. Use this when a stable normalized transcript JSON already exists and the main job is subtitle chunking, timing normalization, and export packaging.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Subtitle Packager

## Use When
- A stable timed transcript already exists and the job is subtitle chunking,
  SRT/ASS generation, readable caption packaging, or editor handoff.
- This skill packages transcripts. It must not call speech-to-text or video
  analysis models.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Input Boundary
- Primary input is `normalized-transcript.json` from `audio-transcription` or
  `video-transcription` with stable timing.
- If timing is missing or invalid, stop and say so plainly. Do not invent timing
  unless the user explicitly asks for heuristic timing.
- Preserve source transcript path, subtitle mode, output path, and source basis
  in handoff notes or intermediate JSON.

## Path And Handoff
- Keep chunking inputs, intermediate subtitle JSON, and render artifacts under
  `.postplus/subtitle-packager` when they are internal state.
- Keep final user-facing `.srt`, `.ass`, and editor handoff files outside
  `.postplus`.
- Start with one normalized transcript before broader batch packaging.
- Return final subtitle paths, source transcript path, selected chunk mode, and
  any profile path used.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

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
