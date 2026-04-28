---
name: tiktok-shop-research
description: Research TikTok Shop listings, shops, pricing, and benchmark products through a local normalize-and-analyze workflow.
---

# TikTok Shop Research

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

Use this skill when the user wants TikTok Shop data gathered, normalized, and analyzed locally.

This skill is not a fixed workflow for one narrow task. Its main job is to help the agent:

- interpret flexible TikTok Shop research requests
- choose a suitable actor
- map the request into actor input fields
- normalize raw output into one stable local shape
- run lightweight analysis without binding the workflow to one product or one report format

## Core Principle

The user will usually describe a research goal, not an actor input schema.

Your job is to translate the user request into:

- scrape target type
- actor choice
- input JSON
- local output paths
- optional normalization
- optional analysis

Do not expose raw actor complexity unless it matters.

## Supported Task Shapes

This skill is suitable for requests such as:

- analyze one product page
- compare several product URLs
- inspect one shop
- sample a category or result set
- summarize pricing, shops, reviews, or benchmark candidates
- collect a local dataset first and analyze later

The user does not need to know which actor is being used.

## Decision Model

Before running anything, classify the request into one of these shapes:

### 1. Product Lookup

Use when the user gives:

- one product URL
- several product URLs
- "analyze this listing"

Preferred actor:

- primary: `tiktok-shop-scraper`
- fallback: `tiktok-shop-scraper-v2`

### 2. Shop Audit

Use when the user asks:

- "look at this shop"
- "what is this seller pushing"
- "compare these shops"

Preferred actor:

- primary: `tiktok-shop-scraper`
- fallback only if the primary actor cannot handle the URL shape

### 3. Category or Search Sampling

Use when the user asks:

- "what products show up for this category"
- "what price bands show up in this niche"
- "find benchmark products in this segment"

Prefer the actor that supports the required page type or query shape.

If only one actor can accept the available input, use it and state that constraint.

## Actor Strategy

Current defaults:

- primary: `tiktok-shop-scraper`
- fallback: `tiktok-shop-scraper-v2`

Use the primary actor by default because it is the richer general backend.

Use the fallback actor when:

- the primary actor fails
- the primary actor does not support the needed page type
- the user only needs a simple URL-based scrape

Treat actor choice as replaceable infrastructure.

## Input Mapping Rule

Map the user request into actor input in the lightest possible way.

Typical mappings:

- single product URL for `tiktok-shop-scraper` -> `url`
- multiple product or shop URLs -> `startUrls` only when the selected actor supports it
- category URLs -> `startUrls`
- pre-known identifiers -> actor-specific id fields only if needed

Do not overfit the skill to one input template. Build the smallest valid input for the actor being used.

When the user request is vague, prefer:

1. a small sample
2. URL-driven collection if URLs are available
3. normalization after scraping
4. analysis after normalization

## Output Contract

When raw scraping is performed, prefer this progression:

1. raw actor output
2. normalized dataset
3. optional analysis summary

Normalized datasets follow:

- `schemas/tiktok-shop-dataset.schema.json`

The normalized shape exists so downstream analysis does not depend on actor-specific fields.

Each normalized item should preserve:

- source metadata
- product identity
- shop identity
- pricing
- demand / proof signals
- merchandising details
- media
- raw original payload

## Release-Shell Execution Contract

- keep actor input JSON, raw datasets, normalized datasets, and analysis caches
  under `<work-folder>/.postplus/tiktok-shop/`
- keep only final user-facing summaries or shortlisted exports outside
  `.postplus/`
- compile the user's intent into a small actor-input file before the expensive
  collection step
- start with a bounded first pass:
  - one URL
  - one shop
  - one small category sample
- if hosted capability is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

If the user does not specify paths, choose clear descriptive names under
`.postplus/` for intermediates and make the final output path explicit.

## Minimal Toolchain

Use these pieces in combination, not as a rigid pipeline:

- collection runner:
  - `${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs`
- normalization:
  - `${CLAUDE_SKILL_DIR}/scripts/normalize_tiktok_shop_dataset.mjs`
- analysis:
  - `${CLAUDE_SKILL_DIR}/scripts/analyze_tiktok_shop_dataset.mjs`

The scripts are modular on purpose:

- scrape only when the user wants data collection
- normalize when downstream portability matters
- analyze when the user wants decisions, not raw rows

## Analysis Guidance

The current analysis layer is best for:

- price distribution
- category frequency
- dominant shops or brands
- top products by orders or review volume
- benchmark-candidate ranking

It is not a full business intelligence system.

If the user asks for something more specific, use the normalized dataset as the source of truth and compute the extra slice rather than rewriting the scrape layer.

## Failure and Fallback

If a run fails:

1. check whether the page type matches the chosen actor
2. reduce scope to a smaller sample
3. switch to the fallback actor
4. preserve the raw response or error context

Do not silently switch actors without noting it in the output summary.

## Things To Avoid

Do not:

- assume every request is a fixed "选品" workflow
- hard-code one actor's field names into analysis logic
- require the user to speak in actor input terms
- bundle scraping, normalization, analysis, and reporting into one giant step by default

This skill should stay as a decision guide plus a small reusable toolkit.

## Files

- `package.json`
- `schemas/tiktok-shop-dataset.schema.json`
- `scripts/lib/tiktok_shop_normalize.mjs`
- `scripts/normalize_tiktok_shop_dataset.mjs`
- `scripts/analyze_tiktok_shop_dataset.mjs`
- `templates/pratikdani-product-urls.json`
- `templates/jeremy-product-urls.json`
