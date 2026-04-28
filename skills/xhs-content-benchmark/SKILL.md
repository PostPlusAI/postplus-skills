---
name: xiaohongshu-content-benchmark
description: Benchmark Xiaohongshu posts from validated public account surfaces first, then extract reusable title hooks, cover patterns, content-type splits, and candidate angles for future XHS card production.
---

# XHS Content Benchmark

Follow shared release-shell rules in:

- `skills/shared-release-shell-rules.md`

Legacy alias: `xhs-content-benchmark`.

Use this skill when the user wants to:

- benchmark competitor or inspiration accounts on Xiaohongshu
- identify repeated Xiaohongshu title hooks and cover patterns
- shortlist strong note examples before adapting them into local XHS cards
- compare recent post output from one or more known Xiaohongshu profiles

Read these references before implementation:

- `skills/xhs-content-benchmark/references/actor-selection.md`
- `skills/xhs-content-benchmark/references/brief-schema.md`
- `skills/xhs-content-benchmark/references/normalized-schema.md`

## Default posture

Start from account-based benchmarking, not broad keyword search.

Default starting surface:

- known profile URLs -> recent post benchmark pool

Do not use this as the default first surface:

- keyword or topic search as the first collection surface

Do not silently switch between surfaces.
If the user asks for keyword search, use the keyword-search route explicitly and fail visibly if it returns no items.

## Validated actor path

Default actor for this skill:

- `rednote-xiaohongshu-user-posts-scraper`

Use it when the user provides:

- one or more Xiaohongshu `profileUrls`
- one or more Xiaohongshu `profileIds`

This is the current default because it returns the post-level fields this benchmark flow needs:

- note URL
- note id
- title
- post type
- like count
- author metadata
- cover image metadata

## Experimental route

Keyword route:

- `rednote-xiaohongshu-search-scraper`

Use it only when the user explicitly wants keyword or topic benchmarking.

Current operational rule:

- require `maxItems >= 100`
- fail if the actor returns zero items

Do not pretend keyword benchmarking succeeded when the actor returned an empty dataset.

## Not part of this skill

- comment mining
- audience language extraction
- media downloading
- profile health snapshots
- publishing or scheduling notes

Route those later to dedicated XHS skills.

## Recommended workflow

1. classify the request:
   - account benchmark
   - keyword benchmark
2. compile a small benchmark brief into actor input
3. run the chosen actor through the shared collection runner
4. normalize into one local post dataset
5. rank by like signal plus theme relevance
6. summarize:
   - recurring hooks
   - title pattern families
   - cover aspect patterns
   - content-type split
   - strongest benchmark examples

## Cost discipline

Validated account route:

- start with 8-15 recent posts per profile
- benchmark 1-3 profiles at a time

Experimental keyword route:

- the actor currently enforces a much higher minimum item count
- do not hide that constraint
- keep keyword batches narrow and specific

## Release-Shell Execution Contract

- keep benchmark briefs, actor inputs, raw datasets, normalized datasets,
  rankings, and analysis outputs under
  `<work-folder>/.postplus/xiaohongshu-content-benchmark/`
- keep only final user-facing benchmark summaries or shortlists outside
  `.postplus/`
- start with a bounded first pass:
  - `1-3` profiles for the validated account route
  - narrow keyword batches only when the user explicitly requests search
- if hosted capability is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

## Main scripts

- `scripts/build_xhs_benchmark_actor_input.mjs`
- `scripts/normalize_xhs_benchmark_dataset.mjs`
- `scripts/rank_xhs_benchmark_posts.mjs`
- `scripts/analyze_xhs_benchmark_dataset.mjs`

Use the shared collection runner for actor calls:

- `skills/shared-collection/scripts/collection_actor_run.mjs`

## Minimal workflow

### Account benchmark

Build actor input from a brief:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/build_xhs_benchmark_actor_input.mjs \
  --brief <work-folder>/.postplus/xhs-benchmark-brief.json \
  --output <work-folder>/.postplus/xhs-benchmark-actor-input.json
```

Run the validated actor:

```bash
node ${CLAUDE_SKILL_DIR}/../shared-collection/scripts/collection_actor_run.mjs \
  --actor rednote-xiaohongshu-user-posts-scraper \
  --input <work-folder>/.postplus/xhs-benchmark-actor-input.json \
  --output <work-folder>/.postplus/xhs-benchmark-raw.json
```

Normalize, rank, analyze:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/normalize_xhs_benchmark_dataset.mjs \
  --input <work-folder>/.postplus/xhs-benchmark-raw.json \
  --output <work-folder>/.postplus/xhs-benchmark-normalized.json

node ${CLAUDE_SKILL_DIR}/scripts/rank_xhs_benchmark_posts.mjs \
  --input <work-folder>/.postplus/xhs-benchmark-normalized.json \
  --theme "职场,打工人,办公室" \
  --output <work-folder>/.postplus/xhs-benchmark-ranking.json

node ${CLAUDE_SKILL_DIR}/scripts/analyze_xhs_benchmark_dataset.mjs \
  --input <work-folder>/.postplus/xhs-benchmark-normalized.json \
  --output <work-folder>/.postplus/xhs-benchmark-analysis.json
```

### Keyword benchmark

Use the same build script, but provide `keywords` in the brief.

Operational constraint:

- keep `limit >= 100`
- expect a visible failure if the actor returns zero items

## Good output

Return:

- benchmark shortlist
- top note URLs
- recurring title hooks
- title pattern breakdown
- cover-shape breakdown
- observed content-type split
- data-quality warnings when fields are missing
- suggested card angles that can later feed `skills/xiaohongshu-card-notes`

## Failure posture

- fail if the request mixes profile benchmarking and keyword benchmarking without saying which should be primary
- fail if no `profileUrls`, `profileIds`, or `keywords` are provided
- fail if the keyword-search actor returns zero items
- fail if the normalized dataset has no note URLs
- keep raw actor output for debugging
