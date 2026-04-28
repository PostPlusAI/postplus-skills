---
name: broll-match-engine
description: Match spoken edit beats to candidate B-roll assets using a normalized transcript, subtitle chunking, optional A-roll analysis, and a reusable B-roll catalog. Use this when the goal is to decide what B-roll should support each beat, not just to list assets or describe the video.
---

# B-roll Match Engine

Follow shared release-shell rules in:

- `skills/shared-release-shell-rules.md`

Use this skill when the user wants to map a talking-head edit to candidate B-roll coverage.

This skill should produce a structured match plan, not a vague creative summary.

Default output:

- `broll-plan.json`

Optional supporting outputs:

- markdown match summary
- beat review table
- candidate ranking table

## Use For

- deciding which spoken beats need B-roll
- matching a beat to the best available proof clip
- deciding when to stay on A-roll instead of cutting away
- identifying missing proof moments
- attaching keyword-emphasis or motion-hint metadata to the match result

## Trigger Signals

Use this skill when the user asks for things like:

- 这些口播句子该配哪些 B-roll
- 帮我匹配素材
- 哪些地方应该切屏幕或证明画面
- 这条 talking head 怎么上 B-roll 更合理
- 给我一个 B-roll plan

Do not use this skill when the user still lacks a usable B-roll inventory.

Route that first to:

- `skills/b-roll-family/broll-catalog-builder`

## Read These References

- family architecture: `../references/skill-architecture.md`
- shared contracts: `../references/contracts.md`

Use these existing local skills when helpful:

- a dedicated visual analysis workflow
- `skills/editing-decision-engine`

## Core Principle

Do not match by keyword overlap only.

A good match depends on:

- beat meaning
- proof need
- visual support type
- pacing need
- B-roll strength

The best asset is not always the most literally similar one.

Sometimes the right choice is:

- a UI proof clip
- a workflow bridge clip
- a pace reset clip
- or no B-roll at all

## Preferred Inputs

Required:

- `normalized-transcript.json`
- `broll-catalog.json`

Strongly preferred:

- `chunked-<mode>.json`

Optional but high-value:

- A-roll semantic analysis
- reference edit pattern
- target platform
- intended output length

## Workflow

### 1. Build beat units

Prefer subtitle chunks or edit beats over raw transcript segments.

For each beat, capture:

- spoken text
- timing
- beat role
- visual need

### 2. Evaluate B-roll need

Not every beat deserves a cutaway.

For each beat, decide:

- stay on face
- use supporting B-roll
- use primary proof B-roll
- use light visual reset only

### 3. Rank candidate assets

For each beat that needs B-roll, rank candidates based on:

- semantic fit
- support-role fit
- proof strength
- pacing fit
- visual clarity
- usable range quality

Every candidate should include a plain-language reason.

### 4. Package the match result

Build `broll-plan.json` with:

- beat metadata
- B-roll need decision
- candidate list
- fallback
- keyword overlay suggestions
- motion hints

## Minimal Script

First implementation script:

- `scripts/run_match_broll_plan.mjs`

Current first-version behavior:

- reads `chunked-<mode>.json`
- reads `broll-catalog.json`
- treats subtitle chunks as beat units
- infers `beatRole` and `visualNeed` from spoken text
- ranks B-roll candidates using conservative heuristics over:
  - spoken keywords
  - catalog `semanticTags`
  - catalog `supportRoles`
- writes `broll-plan.json`

Example:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/run_match_broll_plan.mjs \
  --chunks /abs/path/chunked-basic.json \
  --catalog /abs/path/broll-catalog.json \
  --output <work-folder>/broll-plan.json
```

## Release-Shell Execution Contract

- keep beat chunks, candidate rankings, and intermediate match plans under
  `<work-folder>/.postplus/broll-match-engine/`
- keep only final user-facing `broll-plan.json` or review exports outside
  `.postplus/`
- start with a bounded first pass on one transcript plus one catalog before
  broader edit planning
- if required upstream inputs are missing or invalid, stop immediately instead
  of switching to ad hoc shell glue

## Output Standard

A strong output should let a human editor answer:

- where to cut away
- what to cut to
- how long to stay there
- what the fallback is if the preferred clip is weak

If the output cannot guide a real edit, it is not specific enough.

## First-Version Boundary

Prefer:

- explainable candidate ranking
- beat-level JSON
- optional markdown review

Do not require:

- fully automatic timeline assembly
- NLE export
- guaranteed perfect semantic matching
- motion graphics rendering

## Review Rule

Always distinguish:

- essential proof
- useful support
- optional filler

If the inventory does not contain strong proof footage, the plan should say so directly.
