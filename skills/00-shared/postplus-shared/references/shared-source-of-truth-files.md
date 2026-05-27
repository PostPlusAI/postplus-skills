# Shared Source-Of-Truth Files

Use this reference when a skill needs stable campaign- or project-level context for repeated creative generation.

The goal is not to create more documents.

The goal is to stop every script, hook, storyboard, and render request from starting as a blank prompt with no memory.

## Why This Matters

Short-form creative systems drift when they regenerate everything from one chat turn:

- brand voice shifts
- product claims become inconsistent
- personas lose credibility
- hooks repeat or flatten
- the next skill cannot tell what was grounded versus improvised

Stable source-of-truth files solve that.

## Default File Set

Recommended default files:

- `brand.md`
- `persona.md`
- `product.md`
- `hooks.md`

These are shared campaign or project assets.
They are not private implementation details of any one creative skill.

## What Each File Owns

### `brand.md`

Owns:

- brand voice rules
- forbidden phrases
- positioning
- message boundaries

Use it so the brief does not get lost in scattered chat threads or copied inconsistently.

### `persona.md`

Owns:

- who is speaking
- why this person is credible
- relationship to the product
- repeatable delivery constraints

Use it to keep recurring AI UGC creators or narrator identities coherent across many assets.

### `product.md`

Owns:

- product facts
- claims
- mechanism
- objections
- approved proof anchors

Use it so scripts, voice, and render layers do not invent unsupported product logic.

### `hooks.md`

Owns:

- hook shells
- tested openers
- emotional triggers
- format variations
- anti-repetition memory

Use it as a living hook library.
Do not automatically treat it as validated performance truth unless the surrounding workflow confirms that.

## When To Recommend This System

Default recommendation signals:

- repeated script generation for one brand
- multiple products or SKUs
- multiple personas
- multiple platforms
- batch testing of hooks or angles
- need for continuity across script, storyboard, and render layers

For one-off exploration, this file system may be optional.
For repeated campaign work, it should become the default bias.

## Relationship To Skills

Creative skills may read these files.

Creative skills should not each reinvent their own local equivalent.

Typical pattern:

- shared or project setup creates or maintains the files
- script review consumes them for scripts
- storyboard and render skills consume the approved script objects downstream

## User-Facing Framing

Explain this as a quality and consistency system, not as paperwork.

Good framing:

- "If you want stronger batch script quality, I recommend keeping brand, persona, product, and hook context in four stable files so later generations stay consistent."

Weak framing:

- "Please fill out these files before we can help."
