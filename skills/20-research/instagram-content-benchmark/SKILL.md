---
name: instagram-content-benchmark
description: Benchmark Instagram posts and Reels to discover winning content patterns, shortlist high-value examples, and extract reusable hooks and formats.
metadata:
  postplus:
    familyId: instagram
    familyName: Instagram
---

# Instagram Content Benchmark

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when the user wants to:

- find strong Instagram post or Reel examples
- benchmark competitor content
- identify repeatable hooks, caption structures, or format patterns
- decide what type of Instagram content to recreate or adapt

Use embedded `instagram-tools` support scripts for local execution. When this
skill needs to run Instagram collection, normalization, or ranking scripts from
an installed public skill, call them through installed-safe embedded support paths such
as:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/20-research/instagram-tools/scripts/run_instagram_actor.mjs`
- `${CLAUDE_SKILL_DIR}/_postplus_shared/20-research/instagram-tools/scripts/normalize_instagram_dataset.mjs`
- `${CLAUDE_SKILL_DIR}/_postplus_shared/20-research/instagram-tools/scripts/rank_instagram_posts.mjs`

## Primary Hosted Collection Keys

- `instagram-posts`
- `instagram-hashtags`

## Recommended Workflow

1. define seeds:
   - usernames
   - post URLs
   - Reel URLs
   - hashtags
2. scrape the first candidate pool at 10-15 posts or reels per theme
3. normalize posts and Reel-like results into one comparable dataset
4. rank by engagement, relevance, recency, and format fit
5. produce a shortlist of benchmark content
6. summarize:
   - repeated hooks
   - repeated visual formats
   - caption patterns
   - hashtag usage

## Cost Discipline

Start with:

- 10-15 posts or reels per theme for the first pass
- one or two themes at a time
- comments only after a shortlist exists

Treat `10-15` posts or reels per theme as the first-pass boundary, not a
preference. Do not ask the user to choose a broad crawl range up front and do
not compile a wider first actor input from broad wording like "as many as
possible" or "scan the whole niche." Expand only after the first shortlist
proves seed quality and the user approves a second pass.

## Public Skill Execution Contract

- keep benchmark briefs, actor inputs, raw datasets, normalized datasets, and
  shortlist caches under `<work-folder>/.postplus/instagram-benchmark/`
- keep only final user-facing summaries or shortlist exports outside
  `.postplus/`
- compile a small benchmark brief before the expensive collection step
- if PostPlus Cloud service is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

## Good Output

Return:

- top benchmark shortlist
- content-type split:
  - Reel
  - static post
  - carousel
- repeated opening patterns
- repeated value promises
- likely content pillars
- recommended next posts to inspect deeper

## Handoff

Escalate to `instagram-audience-voice` when:

- the user wants to read comment sentiment and language

Escalate to video or creative analysis workflows outside this skill family when:

- the user wants shot-level breakdowns of the actual videos

Escalate to `instagram-creator-discovery` when:

- the user wants to turn benchmark content into a creator pool
