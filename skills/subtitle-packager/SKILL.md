---
name: subtitle-packager
description: Convert normalized timed transcript data into subtitle artifacts such as SRT and VTT. Use this when a stable normalized transcript JSON already exists and the main job is subtitle chunking, timing normalization, and export packaging.
---

# Subtitle Packager

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

Use this skill when the transcript already exists and the next problem is:

- chunking a normalized transcript into subtitle-sized units
- ASS generation
- SRT generation
- VTT generation
- readable caption chunking
- packaging timed transcript data for editors

This skill should not call STT models itself.

## Input Rule

Expect:

- a `normalized-transcript.json` file produced by `video-transcription`

If timing is missing, say so plainly.

Do not fake subtitle timing unless the user explicitly asks for heuristic timing.

## Scripts

- `scripts/chunk_normalized_transcript.mjs`
- `scripts/render_ass_from_normalized.mjs`
- `scripts/transcript_json_to_srt.mjs`
- `scripts/text_to_srt.mjs`

## Read These References

- `references/ass-contract.md`
- `references/chunk-modes.md`
- `references/output-shape.md`

## Release-Shell Execution Contract

- keep chunking inputs, intermediate subtitle JSON, and render artifacts under
  `<work-folder>/.postplus/subtitle-packager/`
- keep only final user-facing subtitle exports outside `.postplus/`
- start with a bounded first pass on one normalized transcript before broader
  batch packaging
- if normalized timing is missing or invalid, stop immediately instead of
  inventing subtitle timing or switching to ad hoc shell glue
