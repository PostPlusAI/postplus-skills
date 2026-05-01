---
name: broll-catalog-builder
description: Build a semantic inventory of local B-roll assets for edit planning. Use this when the goal is not yet to decide the final cut, but to understand what B-roll exists, what each asset proves, which ranges are usable, and how the asset library should be packaged for downstream matching.
---

# B-roll Catalog Builder

Follow shared release-shell rules in:

- `postplus-shared` release-shell rules

Use this skill when the user has B-roll assets and needs a reusable asset inventory before planning the edit.

This skill should create the asset mother file for the B-roll side of the workflow.

Default output:

- `broll-catalog.json`

Optional supporting outputs:

- contact sheets
- frame manifests
- markdown review summaries

## Use For

- organizing a B-roll folder into a reusable catalog
- tagging B-roll by semantic meaning instead of filename only
- identifying the best usable ranges within longer B-roll clips
- separating strong proof clips from weak filler clips
- preparing assets for later beat-to-B-roll matching

## Trigger Signals

Use this skill when the user asks for things like:

- 先整理一下这些 B-roll 素材
- 给这些素材打标签
- 哪些素材适合做 proof
- 给我一个可复用的 B-roll 素材表
- 先把素材库建起来

Do not use this skill when the user already has a good catalog and needs final beat matching.

Route that to:

- `skills/40-creative/b-roll-family/broll-match-engine`

## Read These References

- family architecture: `../references/skill-architecture.md`
- shared contracts: `../references/contracts.md`

Use these existing local skills when helpful:

- `skills/40-creative/frame-extraction`
- a dedicated visual analysis workflow

## Core Principle

Do not catalog assets only by what is literally visible.

Also capture:

- what the asset proves
- what edit role it can play
- how long it stays fresh on screen
- whether it is strong enough for primary proof or only support

The same clip may be:

- strong proof
- weak proof but good transition cover
- pure pace reset
- UI demo

depending on how it is used.

## Required Inputs

At least one of:

- local folder of B-roll files
- manifest of B-roll files
- list of local file paths

Optional but valuable:

- campaign context
- transcript or script
- target platform
- known proof goals

## Workflow

### 1. Recover the asset set

Build the working file list from:

- folder scan
- manifest
- explicit file list

Preserve local paths.

### 2. Inspect the assets

For each asset, capture:

- media type
- duration if video
- literal description
- strongest usable ranges
- semantic tags
- support roles
- visual risks

Use lightweight extraction or contact-sheet generation where helpful.

### 3. Judge edit usefulness

For each asset, decide:

- is it primary proof, supporting proof, or filler
- what claims it can support
- whether it fits 9:16, 16:9, or both
- whether text or UI is readable enough

### 4. Package the catalog

Build `broll-catalog.json` using the shared contract.

The catalog should be reusable across multiple edit runs.

## Minimal Script

First implementation script:

- `scripts/run_build_broll_catalog.mjs`

Current first-version behavior:

- scans a local folder recursively
- keeps video and image assets
- uses `ffprobe` for duration and dimensions
- reads same-basename `.md` sidecars when present
- infers conservative semantic tags and support roles from filename and sidecar text
- writes `broll-catalog.json`

Example:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/run_build_broll_catalog.mjs \
  --input-dir /abs/path/to/b-roll-source \
  --output <work-folder>/broll-catalog.json
```

## Release-Shell Execution Contract

- keep folder scans, contact-sheet inputs, frame manifests, and intermediate
  catalog builds under `<work-folder>/.postplus/broll-catalog-builder/`
- keep only final user-facing `broll-catalog.json` or review exports outside
  `.postplus/`
- start with a bounded first pass on one folder or shortlist before broader
  cataloging
- verify `ffprobe` before cataloging using `postplus doctor` or a direct check
  such as `ffprobe -version`
- if `ffprobe` is missing, stop immediately and ask the user to install or
  approve installation; do not silently install, repair, or switch to ad hoc
  shell glue
- if verification fails, stop immediately instead of switching
  to ad hoc shell glue

## Output Standard

The catalog is good if a downstream matcher can answer:

- what assets exist
- which claims they support
- which ones are actually strong
- where the useful cut ranges are

If the output is only a file list with vague tags, it is not enough.

## First-Version Boundary

Prefer:

- local file scanning
- ffmpeg metadata
- frame extraction when needed
- markdown and JSON packaging

Do not require:

- heavy CV pipelines
- perfect object recognition
- fully automatic clip scoring without review

## Review Rule

When confidence is low, say so.

Do not pretend a weak or generic clip is strong proof footage.

It is better to mark an asset as:

- `generic filler`

than to overstate its usefulness.
