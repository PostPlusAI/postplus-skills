---
name: xiaohongshu-tools
description: Local execution tools for Xiaohongshu/Rednote hosted collection workflows, including actor runs, dataset normalization, account and post ranking, comment clustering, product-pool ranking, and topic-map building.
---

# Xiaohongshu Tools

Follow shared release-shell rules in:

- `skills/shared-release-shell-rules.md`

Use this skill when implementing or running the local execution layer for the Xiaohongshu skill family.

Main scripts:

- `scripts/run_xhs_actor.mjs`
- `scripts/normalize_xhs_dataset.mjs`
- `scripts/extract_xhs_vendor_page_products.mjs`
- `scripts/rank_xhs_accounts.mjs`
- `scripts/rank_xhs_posts.mjs`
- `scripts/cluster_xhs_comments.mjs`
- `scripts/rank_xhs_products.mjs`
- `scripts/build_xhs_topic_map.mjs`
- `scripts/build_xhs_merchant_report.mjs`

Shared helpers:

- `scripts/lib/xhs_common.mjs`

Reference contracts:

- `../xiaohongshu-references/tool-contracts.md`
- `../xiaohongshu-references/normalized-schema.md`

## Execution Rule

Do not invent actor-specific downstream workflows unless the schema truly requires it.

Prefer:

- `scripts/run_xhs_actor.mjs`
- `skills/shared-collection/scripts/collection_actor_run.mjs`

This skill should stay focused on stable local contracts after raw data has been collected.

## Release-Shell Execution Contract

- keep actor inputs, raw datasets, normalized datasets, ranking outputs,
  clustered comments, product rankings, and topic maps under
  `<work-folder>/.postplus/xiaohongshu-tools/`
- keep only final user-facing shortlists or reports outside `.postplus/`
- start with a bounded first pass before broader collection
- if hosted capability is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue
