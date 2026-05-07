---
name: xiaohongshu-account-research
description: Research Xiaohongshu accounts from validated recent-post surfaces, then aggregate account-level content signals without pretending follower or bio metrics are available when the validated profile actor is empty.
---

# XHS Account Research

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Legacy alias: `xhs-account-research`.

Use this skill when the user wants to:

- compare one or more Xiaohongshu accounts
- build a shortlist of benchmarkable accounts from known profile URLs
- understand what an account usually posts, what title patterns repeat, and which notes perform best
- produce account-level snapshots for partner or competitor review

Read these references before implementation:

- `skills/20-research/xhs-account-research/references/actor-selection.md`
- `skills/20-research/xhs-account-research/references/normalized-schema.md`

## Default posture

Start from validated recent-post evidence.

Default actor:

- `rednote-xiaohongshu-user-posts-scraper`

Do not default to `rednote-xiaohongshu-profile-scraper`.
Treat it as non-default until it returns usable `profileData` on the public skill surface.

Before collection, tell the user that profile bio, follower count, and other
profile-level fields are not reliable on the released path. Results are based
on recent posts unless the validated dataset exposes them.

## What this skill is for

- recent-post sampling from known profile URLs
- account-level aggregation from post evidence
- ranking accounts by observed post performance and thematic fit
- producing account snapshots with top notes and repeated title patterns

## What this skill is not for

- keyword discovery
- comment mining
- follower counts
- bio extraction
- posting cadence claims when no publish timestamps are available

## Failure posture

- fail if no `profileUrls` or `profileIds` are provided
- fail if the validated actor returns zero posts
- fail if account aggregation cannot produce any top note URL
- report missing profile-level fields explicitly instead of inventing them

## Public Skill Execution Contract

- keep account briefs, actor inputs, raw datasets, normalized datasets,
  rankings, and analysis outputs under
  `<work-folder>/.postplus/xiaohongshu-account-research/`
- keep only final user-facing account shortlists or reports outside
  `.postplus/`
- start with a bounded first pass, usually `1-3` accounts and `8-15` recent
  posts per account
- if PostPlus Cloud service is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

## Main scripts

- `scripts/build_xhs_account_actor_input.mjs`
- `scripts/normalize_xhs_account_dataset.mjs`
- `scripts/rank_xhs_accounts.mjs`
- `scripts/analyze_xhs_accounts.mjs`

Use the shared collection runner for actor calls:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/00-core/shared-collection/scripts/collection_actor_run.mjs`

## Minimal workflow

```bash
node ${CLAUDE_SKILL_DIR}/scripts/build_xhs_account_actor_input.mjs \
  --brief <work-folder>/.postplus/xhs-account-brief.json \
  --output <work-folder>/.postplus/xhs-account-actor-input.json

node ${CLAUDE_SKILL_DIR}/_postplus_shared/00-core/shared-collection/scripts/collection_actor_run.mjs \
  --collection-key xhs-account-posts \
  --input <work-folder>/.postplus/xhs-account-actor-input.json \
  --output <work-folder>/.postplus/xhs-account-raw.json

node ${CLAUDE_SKILL_DIR}/scripts/normalize_xhs_account_dataset.mjs \
  --input <work-folder>/.postplus/xhs-account-raw.json \
  --output <work-folder>/.postplus/xhs-account-normalized.json

node ${CLAUDE_SKILL_DIR}/scripts/rank_xhs_accounts.mjs \
  --input <work-folder>/.postplus/xhs-account-normalized.json \
  --theme "workplace,office workers" \
  --output <work-folder>/.postplus/xhs-account-ranking.json

node ${CLAUDE_SKILL_DIR}/scripts/analyze_xhs_accounts.mjs \
  --input <work-folder>/.postplus/xhs-account-normalized.json \
  --output <work-folder>/.postplus/xhs-account-analysis.json
```

## Good output

Return:

- account shortlist
- top note URLs per account
- median and max like signal
- content-type mix
- repeated title-pattern families
- cover-shape mix
- explicit data-quality warnings for unavailable profile-level fields
