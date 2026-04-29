---
name: amazon-research
description: Research Amazon platform data for competitive products, pricing bands, reviews, best sellers, and related sourcing analysis.
---

# Amazon Research

Follow shared release-shell rules in:

- `postplus-shared` release-shell rules

Use this skill for Amazon platform-data work.

Default use cases:

- 看 Amazon 竞品
- 查价格带
- 抓评论和差评
- 看 best sellers / new releases
- 判断某个产品在 Amazon 上怎么打

Do not default to web search for these when this skill can cover them.
Use web only for external facts or supplemental context.

## Task Shapes

Classify the request first:

1. Product discovery
- keywords
- category pages
- search URLs
- actor: `amazon-crawler`
- fallback: `free-amazon-product-scraper`

2. ASIN enrichment
- known ASIN list
- need titles, prices, ratings, seller details
- actor: `amazon-asins-scraper`

3. Review mining
- need reviews, complaints, low-star patterns
- actor: `amazon-reviews-scraper`
- fallback: `amazon-reviews-scraper-v2`

4. Bestseller mapping
- need trend products or leaderboard products
- actor: `amazon-bestsellers`

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

## Release-Shell Execution Contract

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
- if hosted capability is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

Normalized schema:

- `schemas/amazon-dataset.schema.json`

Main scripts:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/00-core/shared-collection/scripts/collection_actor_run.mjs`
- `scripts/normalize_amazon_dataset.mjs`
- `scripts/analyze_amazon_dataset.mjs`

## Routing Reminder

If the user asks strategic Amazon questions like:

- 最像的竞品有哪些
- 价格锚点是什么
- 评论里最常见的问题是什么
- 我们要怎么打

Treat them as Amazon platform-data questions first, not generic strategy questions.
