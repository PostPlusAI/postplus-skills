---
name: amazon-research
description: Research Amazon platform data for competitive products, pricing bands, reviews, best sellers, and related sourcing analysis.
metadata:
  postplus:
    familyId: marketplace-sourcing
    familyName: Marketplace, Sourcing, and Growth
---

# Amazon Research

Use this skill only when the request explicitly needs Amazon platform evidence:
ASINs, reviews, best sellers, seller listings, marketplace pricing, or Amazon
competitor data.

Apply shared rulebook and user-guidance rules from `postplus-shared`.

## Do Not Use When

Generic category, market, or positioning questions should start with cheaper
general research or strategy skills unless the user names Amazon, provides
Amazon URLs or ASINs, or asks for marketplace price/review evidence.

## Task Shapes And Keys

Classify the request first:

1. Product discovery
   - keywords, category pages, search URLs
   - collection key: `amazon-products`
   - alternate key: `amazon-free-products`
2. ASIN enrichment
   - known ASIN list, title/price/rating/seller details
   - collection key: `amazon-asins`
3. Review mining
   - reviews, complaints, low-star patterns
   - collection keys: `amazon-reviews`, `amazon-reviews-v2`
4. Bestseller mapping
   - trend products or leaderboard products
   - collection key: `amazon-bestsellers`

Hosted collection input must be a `schemaVersion: 1` envelope whose `input`
field contains the compiled Amazon request.

## Default Workflow

Use the lightest valid chain:

1. compile a small request from keywords, URLs, or ASINs,
3. normalize the dataset,
4. analyze ranking, pricing, reviews, or seller signals,
5. synthesize the result and name missing evidence.

Start with one keyword set, one ASIN batch, one bestseller page, or at most 20
product-discovery items per start URL. Expand only after the first pass proves
useful.

Keep request files, raw datasets, normalized datasets, and caches under
`.postplus/amazon/`; keep only final summaries or shortlisted exports outside
`.postplus/`.

## Good Output

Return ranking tables, detail tables, review summaries, price bands, negative
review patterns, strongest product examples, and the exact Amazon evidence
source behind each conclusion.

## Failure Modes

- Stop if the user has not asked for Amazon evidence and no Amazon identifiers
  were provided.
- Stop on unsupported keys, missing auth, unavailable hosted service, stable
  network failure, or malformed collection output.
- Do not switch to ad hoc scraping, private backend calls, or generic web
  articles for Amazon platform-data collection.

## Handoff

After delivering results, hand off to `sourcing-selection` for supply-side
validation or continue deeper review mining for a specific ASIN.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill amazon-research`.
- Input schema: `postplus research schema --json`.
- Hosted collection: `postplus research collect --skill amazon-research --collection-key amazon-asins --input <hosted-envelope.json> --output <collection-result.json>`.
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <collection-result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
