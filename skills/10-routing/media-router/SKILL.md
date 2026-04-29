---
name: media-router
description: Route audio, video, transcript, subtitle, and edit-prep requests into the right media-understanding workflow before execution. Use this when the user wants transcription, subtitle generation, beat mapping, B-roll planning, or edit-ready outputs and the first question is which skill and model chain should run.
---

# Media Router

Follow shared release-shell rules in:

- `postplus-shared` release-shell rules

Use this skill when the user wants to do something with:

- audio
- video
- transcripts
- subtitles
- A-roll / B-roll edit prep

This skill is a routing layer.

It should decide:

- what the actual task is
- what output shape is required
- whether the job is rough, subtitle-ready, or edit-ready
- whether cost or quality should dominate
- which downstream skill or skill chain should execute

This skill should not pretend every request is "just transcription".

## Use For

- deciding whether to call audio STT or video STT
- deciding when timestamps are required
- deciding when subtitle packaging is enough
- deciding when semantic video understanding must be added
- deciding when editing-decision-engine should run
- deciding whether a batch workflow should be used

## Read These References

- `references/brief-schema.md`
- `references/routing-modes.md`

## Core Rule

Route by job intent, not by input file type alone.

A video input may still be:

- plain transcription
- subtitle generation
- transcript plus semantic understanding
- edit-beat planning

The route should be chosen from five dimensions:

- input type
- output goal
- required precision
- scale
- cost mode

## Default Routing Logic

### `audio -> transcript`

Use `skills/40-creative/audio-transcription`.

### `video -> transcript/subtitles`

Use `skills/40-creative/video-transcription`.

### `transcript with timestamps -> subtitle files`

Use `skills/40-creative/subtitle-packager`.

### `transcript + assets -> cut logic / B-roll plan`

Use `skills/40-creative/editing-decision-engine`.

### `video -> edit-ready plan`

Chain:

1. `video-transcription`
2. `subtitle-packager` if subtitle files are needed
3. `frame-extraction` if visual-proof snapshots are needed
4. `editing-decision-engine`

## Quality Thresholds

### `rough`

Good enough for:

- search
- quick review
- rough logging
- candidate beat spotting

Prefer:

- cheaper models
- fewer enrichments

### `subtitle-ready`

Good enough for:

- human-readable captions
- SRT / VTT generation
- reliable sentence or word timestamps

Prefer:

- Whisper with timestamps

### `edit-ready`

Good enough for:

- A-roll/B-roll decision making
- cutaway placement
- beat-level planning

Prefer:

- Whisper with timestamps
- semantic video understanding when proof footage matters
- editing-decision-engine downstream

## User-Facing Explanation Rule

Do not expose internal route labels unless the user is explicitly designing the system.

Normal user-facing language should say:

- what will be extracted first
- what will be aligned second
- what editing decisions become possible afterward

## Default Output

Return:

- chosen route
- why it fits the task
- primary skill
- supporting skills
- model plan
- expected output artifacts
- whether timestamps are mandatory
