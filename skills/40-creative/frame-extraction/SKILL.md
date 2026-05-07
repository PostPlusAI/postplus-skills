---
name: frame-extraction
description: Extract useful frames from local video files based on task intent, such as persona research, shot breakdown, product visibility, UI walkthroughs, visual-style review, or CTA/compliance checks. Use this when the goal is not generic video analysis, but selecting the right still frames and contact sheets for a specific downstream need.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Frame Extraction

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when the user needs frames, not just a text analysis of the video.

This is a general-purpose extraction skill. Do not narrow it to creator-face research only.

Follow shared routing rules in:

- `postplus-shared` research preferences

Use `skills/40-creative/video-analysis` before or alongside this skill when shot-level understanding already exists or would materially improve frame selection.

## Use For

- persona or vibe research
- creator appearance reference packs
- shot or structure review
- product visibility checks
- UI or screen-demo capture
- before/after frame pairs
- opening hook frame sets
- ending CTA or compliance frame sets
- cover-frame or first-frame candidate pulls

## Trigger Signals

Use this skill when the user asks for things like:

- extract frames
- capture key frames
- make a contact sheet
- inspect character appearance / vibe
- inspect product exposure
- inspect UI presentation
- capture opening / ending / CTA frames
- pick usable reference frames from a video

Do not use this skill when the user only wants:

- hook analysis
- spoken-line breakdown
- adaptation ideas without frame output

Those are usually better routed to `skills/40-creative/video-analysis`.

## Core Principle

Do not default to uniform frame sampling.

Choose an extraction mode that matches the task intent.

The same video may need different frames depending on whether the user is studying:

- people
- products
- UI
- pacing
- style
- claims or CTAs

## Extraction Modes

Use the smallest mode that matches the request.

See:

- `references/extraction-modes.md`
- `references/output-contract.md`

Default modes:

1. `uniform-sample`
2. `scene-change`
3. `face-priority`
4. `object-priority`
5. `text-ui-priority`
6. `hook-first`
7. `cta-last`
8. `before-after-pair`
9. `style-board`

## Input Types

This skill should work with:

- one local video file
- a local folder of videos
- a manifest that maps source ids to local files
- a shortlist already linked to source metadata

If the user gives TikTok URLs but local video files are missing, first recover or download the local videos before extracting frames.

Do not lock this skill to one platform.

## Output Shapes

Pick outputs based on the use case.

Common outputs:

- selected frame folder
- contact sheet
- frame manifest
- markdown summary
- side-by-side frame comparison

Every extraction run should preserve enough metadata to trace each frame back to:

- source video
- timestamp
- extraction mode
- selection reason

## Workflow

### 1. Clarify the intent

Classify the ask into one of these buckets:

- persona / vibe
- shot / structure
- product visibility
- UI / text readability
- before / after
- hook
- CTA / compliance
- broad visual scan

If the request is ambiguous, ask one short question:

- Are you extracting frames mainly to inspect character/persona vibe, or product / UI / shot structure?

### 2. Select mode

Map the intent to one primary mode.

Good defaults:

- persona / vibe -> `face-priority`
- shot / structure -> `scene-change`
- product visibility -> `object-priority`
- UI / text -> `text-ui-priority`
- hook review -> `hook-first`
- CTA / compliance -> `cta-last`
- broad scan -> `uniform-sample`

Use a secondary mode only if the first one clearly misses the target.

### 3. Choose scope

Do not always scan the full video.

Typical scope choices:

- first 3-5 seconds
- full video
- final 3-5 seconds
- manually specified timestamp range

Long-video boundary:

- if a source video is longer than 5 minutes, do not run broad full-video
  extraction by default
- derive duration before extraction, usually with `ffprobe`
- run `scripts/plan_frame_extraction.mjs` before extracting frames
- for videos above 5 minutes, the preflight plan caps the first pass to a
  maximum frame budget of 60 selected frames
- tell the user: "This video is longer than 5 minutes, so I will extract a limited number of key frames based on the target range to avoid generating thousands of unusable images."
- if the extraction command cannot express the target range and frame budget,
  stop before extraction instead of generating an unbounded frame dump
- only expand the scope after the first manifest proves the extraction mode is
  useful

### 4. Package outputs

Match the packaging to the downstream task:

- persona research -> best frames + contact sheet + vibe notes
- shot review -> scene-change frames + timestamp list
- product review -> product-visible frames + proof notes
- UI study -> readable UI frames + OCR or text notes if needed

## Public Skill Execution Contract

- keep extraction requests, frame manifests, contact-sheet build inputs, and
  other intermediate state under `<work-folder>/.postplus/frame-extraction/`
- keep only final user-facing frame exports, contact sheets, or review packs
  outside `.postplus/`
- use small, task-shaped extraction scopes before broad full-video pulls
- this skill requires `ffmpeg`; follow the `postplus-shared` Local Dependency
  Bootstrap Rule before extraction
- if local dependency bootstrap fails, stop immediately instead of switching to
  ad hoc shell glue

## Scripts

- `scripts/plan_frame_extraction.mjs`

## Default Sequence

For TikTok benchmark work:

1. use platform research to shortlist videos first
2. use local video files when available
3. use `video-analysis` shot outputs if they already exist
4. only then extract frames

When shot-level outputs exist, prefer those as stronger evidence than blind timestamp sampling.

## First-Version Boundary

The first version of this skill should stay pragmatic.

Prefer:

- ffmpeg-based extraction
- scene-change driven sampling
- simple timestamp filtering
- contact sheet generation
- lightweight manifests

Do not require:

- identity recognition
- demographic inference
- heavy CV pipelines
- perfect semantic understanding of every frame

## Keep These Assets

For reusable benchmark work, keep:

- the local source video
- extracted frames
- contact sheets
- frame manifest
- any markdown summary used in later persona or creative work

Do not treat extracted frames as disposable if they support future persona, visual-style, or benchmark decisions.
