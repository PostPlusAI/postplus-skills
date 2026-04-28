---
name: x-tools
description: Local execution tools for X/Twitter hosted collection workflows, including actor runs, dataset normalization, tweet ranking, account ranking, audience graph construction, and language clustering.
---

# X Tools

Follow shared release-shell rules in:

- `skills/shared-release-shell-rules.md`

Use this skill when implementing or running the local execution layer for the X skill family.

Main scripts:

- `scripts/run_x_actor.mjs`
- `scripts/normalize_x_dataset.mjs`
- `scripts/rank_x_accounts.mjs`
- `scripts/rank_x_posts.mjs`
- `scripts/build_x_audience_graph.mjs`
- `scripts/cluster_x_bios_and_posts.mjs`

Shared helpers:

- `scripts/lib/x_common.mjs`

Reference contracts:

- `../x-references/tool-contracts.md`
- `../x-references/normalized-schema.md`

## Execution Rule

Do not invent a separate actor runner unless the shared collection runner is not enough.

Prefer:

- `skills/shared-collection/scripts/collection_actor_run.mjs`

This skill should stay focused on local contracts after raw data has been collected.

## Release-Shell Execution Contract

- keep actor inputs, raw datasets, normalized outputs, ranking files, and graph
  caches under `<work-folder>/.postplus/x-tools/`
- keep only final user-facing summaries or shortlist exports outside
  `.postplus/`
- start with a bounded first pass before broadening the crawl
- use PostPlus-supported scripts plus the shared collection runner only; do not switch to
  ad hoc shell glue
- if hosted capability is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue
