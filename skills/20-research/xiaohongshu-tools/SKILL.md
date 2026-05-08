---
name: xiaohongshu-tools
description: Local execution tools for Xiaohongshu/Rednote hosted collection workflows, including actor runs, dataset normalization, account and post ranking, comment clustering, product-pool ranking, and topic-map building.
metadata:
  postplus:
    familyId: xiaohongshu
    familyName: Xiaohongshu / Rednote
---

# Xiaohongshu Tools

Follow shared public skill rules in:

- `postplus-shared` public skill rules

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
- `${CLAUDE_SKILL_DIR}/_postplus_shared/00-core/shared-collection/scripts/collection_actor_run.mjs`

This skill should stay focused on stable local contracts after raw data has been collected.

## Supported Collection Keys

This support skill may run only these PostPlus public collection keys:

- `xhs-account-posts`
- `xhs-search`

Minimal runner examples:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/run_xhs_actor.mjs \
  --collection-key xhs-account-posts \
  --input <work-folder>/.postplus/xiaohongshu-tools/xhs-account-posts-input.json \
  --output <work-folder>/.postplus/xiaohongshu-tools/xhs-account-posts-raw.json

node ${CLAUDE_SKILL_DIR}/scripts/run_xhs_actor.mjs \
  --collection-key xhs-search \
  --input <work-folder>/.postplus/xiaohongshu-tools/xhs-search-input.json \
  --output <work-folder>/.postplus/xiaohongshu-tools/xhs-search-raw.json
```

Do not pass provider-specific collection names or unpublished keys.

## Public Skill Execution Contract

- keep actor inputs, raw datasets, normalized datasets, ranking outputs,
  clustered comments, product rankings, and topic maps under
  `<work-folder>/.postplus/xiaohongshu-tools/`
- keep only final user-facing shortlists or reports outside `.postplus/`
- start with a bounded first pass before broader collection
- if PostPlus Cloud service is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue
