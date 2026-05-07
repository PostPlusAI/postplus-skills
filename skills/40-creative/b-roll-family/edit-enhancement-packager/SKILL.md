---
name: edit-enhancement-packager
description: Package beat-level edit enhancement instructions from a B-roll plan, subtitle chunks, and optional style context. Use this when the goal is to turn B-roll matching into editor-ready guidance for keyword emphasis, micro-animation hints, A-roll stay-on-face logic, B-roll coverage style, and subtitle interaction.
---

# Edit Enhancement Packager

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill after B-roll matching exists.

This skill does not find B-roll assets.

It turns a `broll-plan.json` into a more complete edit package that says how each beat should be treated visually.

Default output:

- `edit-enhancement-package.json`

Optional supporting outputs:

- markdown edit review
- beat-level editor checklist
- future timeline export input

## Use For

- deciding when to stay on A-roll face
- deciding when to cut to B-roll
- packaging keyword emphasis cues
- packaging micro-animation hints
- coordinating subtitle density with B-roll moments
- producing a beat-level edit package for a human editor or future NLE export layer

## Trigger Signals

Use this skill when the user asks for things like:

- Turn the B-roll plan into an edit plan
- Add keyword emphasis and micro-animation notes
- Where to keep the face and where to cut to B-roll
- Generate an editor-ready edit package
- Package subtitles, B-roll, and keyword motion effects together

Do not use this skill when the user still lacks:

- a B-roll catalog
- a B-roll plan

Route those first to:

- `skills/40-creative/b-roll-family/broll-catalog-builder`
- `skills/40-creative/b-roll-family/broll-match-engine`

## Read These References

- family architecture: `../references/skill-architecture.md`
- shared contracts: `../references/contracts.md`
- edit enhancement contract: `../references/edit-enhancement-contract.md`

Use existing local skills when useful:

- `skills/40-creative/subtitle-packager`
- `skills/40-creative/editing-decision-engine`

## Core Principle

Do not turn every matched B-roll candidate into an automatic cutaway.

The important decision is:

- what should carry attention at this moment

Possible answers:

- face carries attention
- B-roll carries proof
- subtitle keyword carries emphasis
- micro-motion carries pacing

The package should coordinate these layers instead of stacking all of them at once.

## Preferred Inputs

Required:

- `broll-plan.json`

Strongly preferred:

- `chunked-<mode>.json`
- ASS profile or subtitle style profile

Optional:

- A-roll analysis
- reference edit style
- platform target such as `9:16` or `16:9`
- campaign style notes

## Workflow

### 1. Classify attention owner

For each beat, decide the primary attention owner:

- `a-roll-face`
- `b-roll-proof`
- `subtitle-keyword`
- `transition-motion`

### 2. Decide A-roll / B-roll behavior

For each beat, decide:

- stay on A-roll
- full B-roll cutaway
- B-roll overlay support
- picture-in-picture
- split emphasis

Do not overcut low-value filler beats.

### 3. Package keyword emphasis

Use `keywordOverlay` from `broll-plan.json` as a starting point.

Then decide:

- whether to emphasize the keyword at all
- whether emphasis should be in subtitles or a separate text card
- whether the emphasis should be subtle or prominent

### 4. Package micro-motion hints

Use simple motion vocabulary only.

Good first-version hints:

- `none`
- `keyword-pop`
- `gentle-push-in`
- `soft-slide`
- `quick-cut-contrast`
- `hold-clean`
- `soft-fade`

These are hints, not renderer-specific commands.

### 5. Coordinate subtitles

For each beat, decide subtitle treatment:

- `normal`
- `lift-up`
- `reduce-density`
- `keyword-highlight`
- `hold`

The goal is to avoid B-roll and subtitle fighting for the same screen area.

## Minimal Script

First implementation script:

- `scripts/run_package_edit_enhancements.mjs`

Current first-version behavior:

- reads `broll-plan.json`
- treats the top B-roll candidate as the preferred candidate
- classifies the attention owner per beat
- packages A-roll action, B-roll action, keyword emphasis, micro-motion, subtitle treatment, and editor notes
- writes `edit-enhancement-package.json`

Example:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/run_package_edit_enhancements.mjs \
  --broll-plan /abs/path/broll-plan.json \
  --output <work-folder>/edit-enhancement-package.json \
  --aspect-ratio 9:16 \
  --style-profile basic
```

## Public Skill Execution Contract

- keep enhancement inputs, beat-level working files, and intermediate edit
  packaging outputs under `<work-folder>/.postplus/edit-enhancement-packager/`
- keep only final user-facing `edit-enhancement-package.json` or review exports
  outside `.postplus/`
- start with a bounded first pass on one beat plan before broader packaging
- if required upstream inputs are missing or invalid, stop immediately instead
  of switching to ad hoc shell glue

## Output Standard

A good package lets a human editor answer:

- should I stay on face or cut away
- what B-roll candidate should I use
- which words should be emphasized
- what kind of motion should be applied
- should subtitles move, simplify, or stay normal

If the package only repeats the B-roll plan, it is not adding enough value.

## First-Version Boundary

Prefer:

- beat-level JSON
- explicit editor hints
- conservative motion vocabulary
- no renderer-specific assumptions

Do not require in v1:

- CapCut draft generation
- Premiere XML
- real animation rendering
- automatic face detection
- automatic crop solving

## Review Rule

If a beat has weak B-roll candidates, prefer:

- stay on A-roll
- keyword emphasis
- subtitle highlight

Do not force weak B-roll just because a candidate exists.
