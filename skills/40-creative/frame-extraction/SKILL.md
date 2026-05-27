---
name: frame-extraction
description: Extract useful frames from local video files based on task intent, such as persona research, shot breakdown, product visibility, UI walkthroughs, visual-style review, or CTA/compliance checks. Use this when the goal is not generic video analysis, but selecting the right still frames and contact sheets for a specific downstream need.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Frame Extraction

## Use When
- The user needs selected still frames, a contact sheet, or a review pack from
  local video files for persona, product, UI, hook, CTA, before/after, or shot
  structure work.
- Use `video-analysis` before or alongside this skill when shot-level
  understanding already exists or would materially improve frame selection.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Selection Boundary
- Do not default to uniform sampling. Choose the smallest extraction mode that
  matches the task intent.
- Good mode defaults: persona/vibe `face-priority`, shot/structure
  `scene-change`, product visibility `object-priority`, UI/text
  `text-ui-priority`, hook `hook-first`, CTA/compliance `cta-last`, broad scan
  `uniform-sample`.
- Scope should be explicit: first 3-5 seconds, final 3-5 seconds, full video, or
  a requested timestamp range.

## Source And Path
- Inputs can be one local video, a folder, or a manifest mapping source ids to
  local files. If only URLs are available, recover/download local files first.
- Preserve source video, timestamp, extraction mode, selection reason, and
  source basis in the frame manifest.
- Keep internal extraction requests, plan outputs, contact-sheet inputs, and
  intermediate manifests under `.postplus`; keep final frames/contact sheets in
  the user-facing output folder.

## Review And Handoff
- Package outputs for the downstream job: persona frames plus contact sheet and
  vibe notes, shot frames plus timestamp list, product-visible frames plus proof
  notes, or UI frames plus readable text notes.
- For long videos, start with the bounded first pass, then expand only after the
  first manifest proves the mode is useful.
- Return final frame folders, contact sheets, and frame manifest paths.

## Fail Fast
- Missing local video, unclear extraction intent, missing `ffmpeg`/`ffprobe`,
  missing source basis/output path, long video without bounded plan, or an
  extraction command that cannot express the approved range and frame budget.
- Do not generate an unbounded frame dump or switch to provider analysis as a
  fallback for missing local dependencies.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill frame-extraction`.
- Request schema: `postplus media schema --json`; add `--endpoint <endpoint-key>` for media-generation examples.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
