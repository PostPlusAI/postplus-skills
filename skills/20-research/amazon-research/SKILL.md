---
name: amazon-research
description: Research Amazon platform data for competitive products, pricing bands, reviews, best sellers, and related sourcing analysis.
---

# Amazon Research

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill for Amazon platform-data work.

Default use cases:

- Inspect Amazon competitors
- Check price bands
- Collect reviews and negative reviews
- Inspect best sellers / new releases
- Judge how to position a product on Amazon

Do not default to web search for these when this skill can cover them.
Use web only for external facts or supplemental context.

## Task Shapes

Classify the request first:

1. Product discovery
- keywords
- category pages
- search URLs
- collection key: `amazon-products`
- alternate collection key: `amazon-free-products`

2. ASIN enrichment
- known ASIN list
- need titles, prices, ratings, seller details
- collection key: `amazon-asins`

3. Review mining
- need reviews, complaints, low-star patterns
- collection key: `amazon-reviews`
- alternate collection key: `amazon-reviews-v2`

4. Bestseller mapping
- need trend products or leaderboard products
- collection key: `amazon-bestsellers`

## Default Workflow

Use the lightest valid chain:

1. collect
2. normalize
3. analyze
4. synthesize

Prefer:

- small sample first
- URL input when URLs are known
- ASIN input for review work

Tell the user:

- "I will first use a small set of keywords or ASINs for the first Amazon collection pass and output ranking tables, detail tables, review summaries, or lists; if the signal is strong enough, I will pass it to sourcing-selection for cross-evidence judgment."

## Public Skill Execution Contract

- keep request files, raw datasets, normalized datasets, and analysis caches
  under `<work-folder>/.postplus/amazon/`
- keep only final user-facing summaries or shortlisted exports outside
  `.postplus/`
- compile the request into a small input JSON before the expensive collection
  step when URLs, ASINs, or keyword seeds need shaping
- start with a bounded first pass:
  - one keyword set
  - one ASIN batch
  - one bestseller page
- if PostPlus Cloud service is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

Normalized schema:

- `schemas/amazon-dataset.schema.json`

Main scripts:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/00-core/shared-collection/scripts/collection_actor_run.mjs`
- `scripts/normalize_amazon_dataset.mjs`
- `scripts/analyze_amazon_dataset.mjs`

## Routing Reminder

If the user asks strategic Amazon questions like:

- Which competitors are closest
- What the price anchors are
- What problems appear most often in reviews
- How we should position against them

Treat them as Amazon platform-data questions first, not generic strategy questions.

## Downstream Handoff

After delivering results, offer to hand off to `sourcing-selection` for supply-side
validation or to drill deeper into a specific ASIN's reviews.
