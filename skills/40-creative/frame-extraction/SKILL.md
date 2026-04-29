---
name: frame-extraction
description: Extract useful frames from local video files based on task intent, such as persona research, shot breakdown, product visibility, UI walkthroughs, visual-style review, or CTA/compliance checks. Use this when the goal is not generic video analysis, but selecting the right still frames and contact sheets for a specific downstream need.
---

# Frame Extraction

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

Use this skill when the user needs frames, not just a text analysis of the video.

This is a general-purpose extraction skill. Do not narrow it to creator-face research only.

Follow shared routing rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-research-preferences.md`

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

- 抽帧
- 截关键帧
- 做 contact sheet
- 看人物长相 / vibe
- 看产品怎么露出
- 看 UI 怎么展示
- 抓开头 / 结尾 / CTA 画面
- 从视频里挑一些可做参考的画面

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

- 你这次抽帧主要是为了看人物、人设 vibe，还是看产品 / UI / 镜头结构？

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

### 4. Package outputs

Match the packaging to the downstream task:

- persona research -> best frames + contact sheet + vibe notes
- shot review -> scene-change frames + timestamp list
- product review -> product-visible frames + proof notes
- UI study -> readable UI frames + OCR or text notes if needed

## Release-Shell Execution Contract

- keep extraction requests, frame manifests, contact-sheet build inputs, and
  other intermediate state under `<work-folder>/.postplus/frame-extraction/`
- keep only final user-facing frame exports, contact sheets, or review packs
  outside `.postplus/`
- use small, task-shaped extraction scopes before broad full-video pulls
- if `ffmpeg` is missing, the user's agent should proactively install it with
  the host package manager already present on the machine before continuing
- rerun a direct check such as `ffmpeg -version` after installation
- if installation or verification fails, stop immediately instead of switching
  to ad hoc shell glue

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
