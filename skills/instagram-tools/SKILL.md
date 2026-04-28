---
name: instagram-tools
description: Local execution tools for Instagram hosted collection workflows, including actor runs, dataset normalization, ranking, comment clustering, and watchlist construction.
---

# Instagram Tools

Follow shared release-shell rules in:

- `skills/shared-release-shell-rules.md`

Use this skill when implementing or running the local execution layer for the Instagram skill family.

Main scripts:

- `scripts/build_instagram_actor_input.mjs`
- `scripts/run_instagram_actor.mjs`
- `scripts/normalize_instagram_dataset.mjs`
- `scripts/extract_instagram_candidate_usernames.mjs`
- `scripts/rank_instagram_creators.mjs`
- `scripts/rank_instagram_accounts.mjs`
- `scripts/rank_instagram_posts.mjs`
- `scripts/cluster_instagram_comments.mjs`
- `scripts/build_instagram_watchlist.mjs`

Shared helpers:

- `scripts/lib/instagram_common.mjs`

Reference contracts:

- `../instagram-references/tool-contracts.md`
- `../instagram-references/normalized-schema.md`

## Release-Shell Execution Contract

- keep actor inputs, raw datasets, normalized outputs, candidate lists,
  ranking files, and watchlist caches under `<work-folder>/.postplus/instagram-tools/`
- keep only final user-facing summaries or shortlist exports outside
  `.postplus/`
- use `scripts/build_instagram_actor_input.mjs` or a small real input file
  before the expensive collection step
- start with a bounded first pass before broadening the crawl
- use PostPlus-supported scripts plus the shared collection runner only; do not switch to
  ad hoc shell glue
- if hosted capability is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue
