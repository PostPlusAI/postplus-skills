---
name: editing-decision-engine
description: Plan short-form post-edit decisions from A-roll, B-roll, scripts, and reference videos. Use this when the goal is not generic video analysis or rendering, but deciding how to cut a social video beat by beat, including where to stay on face, where to insert proof B-roll, how to use reference patterns, and how to package an actionable edit plan for a human editor or downstream timeline tooling.
---

# Editing Decision Engine

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

Use this skill when the user wants a strong short-form edit plan, not just a script rewrite or a generic video breakdown.

This skill is for post-edit decision making across:

- A-roll performance
- B-roll proof footage
- script meaning
- beat timing
- reference-video editing patterns
- final edit packaging

Do not treat this as a video renderer.

First-version goal:

- output a high-quality edit decision package
- not fully automate the final NLE timeline

## Use For

- planning how to cut a talking-head short
- deciding where B-roll should appear
- mapping script beats to visual proof
- deciding when to stay on A-roll vs cut away
- translating a reference video into reusable edit patterns
- packaging a cut plan for Premiere, Final Cut, CapCut, or a human editor

## Trigger Signals

Use this skill when the user asks for things like:

- 这条怎么剪
- 根据 A-roll 和 B-roll 设计剪法
- 参考某条视频的剪辑逻辑
- 按脚本和素材做 post-edit plan
- 逐句决定哪里贴屏幕、哪里留脸
- 给我一个时间轴级别的剪辑方案

Do not use this skill when the user only needs:

- raw video analysis without edit decisions
- frame extraction without timeline reasoning
- render generation from image and audio

Route those to:

- a dedicated visual analysis workflow
- `skills/40-creative/frame-extraction`
- `skills/40-creative/video-batch-runner`

## Core Principle

Do not describe footage only by what appears on screen.

For edit planning, the important question is:

- what does this shot prove
- what beat does it support
- how much attention should it take
- whether it should lead, support, bridge, or punctuate

The same B-roll clip can be:

- primary proof
- support proof
- transition cover
- pace reset
- visual filler

depending on the spoken beat around it.

## Read These References

- workflow and decision rules: `references/workflow.md`
- core objects and output shapes: `references/schemas.md`

## Required Inputs

The skill works best when at least these exist:

- script text or spoken transcript
- local A-roll file or a reliable description of the A-roll performance
- local B-roll files or a usable B-roll shot inventory
- intended output length or target platform

Optional but high-value inputs:

- one or more reference videos
- subtitle draft or transcript with timestamps
- previous edit notes
- campaign or persona context

If assets are missing, do not pretend the plan is precise.

Instead:

1. state which decisions are grounded
2. state which decisions are provisional
3. produce the strongest plan possible from available evidence

## Workflow

### 1. Lock the edit thesis

Before building a timeline, identify:

- what the video is trying to prove
- whether it is tutorial-led, viewpoint-led, comparison-led, or proof-led
- what visual contrast drives the piece

Examples:

- `old fragmented workflow vs in-context workflow`
- `tool overload vs cleaner setup`
- `annoying to start vs easy to start`

### 2. Break the spoken content into beats

Do not plan edits sentence by sentence only.

Break into edit beats based on:

- meaning shift
- emotional shift
- proof need
- pace change

Each beat should capture:

- the spoken line or paraphrase
- timing if known
- beat role
- proof requirement
- visual demand

### 3. Understand assets semantically

For A-roll:

- delivery energy
- pauses
- emphasis words
- facial or body moments worth preserving

For B-roll:

- what it literally shows
- what it proves
- where it is strongest
- how long it can stay on screen before feeling repetitive

For references:

- what structural pattern is reusable
- what is surface style only

### 4. Decide the cut logic

For each beat, decide:

- stay on A-roll or cut away
- which B-roll asset to use
- whether the B-roll is primary or supporting proof
- overlay length
- subtitle density
- whether to use punch-in, hold, montage, J-cut, or L-cut

### 5. Package the output

Default output should include:

- edit thesis
- beat map
- B-roll assignment table
- time-ordered edit decisions
- risks and missing assets

## Release-Shell Execution Contract

- keep edit theses, beat maps, asset notes, and intermediate decision packages
  under `<work-folder>/.postplus/editing-decision-engine/`
- keep only final user-facing edit plans outside `.postplus/`
- start with a bounded first pass on one sequence or one short video before
  broader edit planning
- if required inputs such as transcript, A-roll context, or B-roll inventory
  are missing, stop immediately instead of switching to ad hoc shell glue

## First-Version Boundary

Keep the first version pragmatic.

Prefer:

- markdown edit plans
- JSON beat maps
- B-roll proof tables
- simple timeline-ready CSV if useful

Do not require in v1:

- direct XML generation for NLEs
- automatic cut rendering
- perfect shot detection
- automatic motion-design systems

## Output Standard

A strong result from this skill should let a human editor start cutting immediately.

Minimum bar:

- they can tell what the first 3 seconds should do
- they know where the proof moments land
- they know which B-roll is essential vs optional
- they know where the edit should breathe instead of over-cutting

If the output cannot guide a real editor, it is not specific enough.
