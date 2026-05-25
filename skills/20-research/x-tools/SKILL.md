---
name: x-tools
description: Local execution tools for X/Twitter hosted collection workflows, including actor runs, dataset normalization, tweet ranking, account ranking, audience graph construction, and language clustering.
metadata:
  postplus:
    familyId: x
    familyName: X / Twitter
---

# X Tools

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when implementing or running the local execution layer for the X skill family.

Main scripts:

- `${CLAUDE_SKILL_DIR}/scripts/run_x_actor.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/normalize_x_dataset.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/rank_x_accounts.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/rank_x_posts.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/build_x_audience_graph.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/cluster_x_bios_and_posts.mjs`

Shared helpers:

- `${CLAUDE_SKILL_DIR}/scripts/lib/x_common.mjs`

Reference contracts:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/20-research/x-references/tool-contracts.md`
- `${CLAUDE_SKILL_DIR}/_postplus_shared/20-research/x-references/normalized-schema.md`

## Execution Rule

Do not invent a separate actor runner unless the shared collection runner is not enough.

Prefer:

- `${CLAUDE_SKILL_DIR}/scripts/run_x_actor.mjs`

The runner's `--input` file must be a `schemaVersion: 1` hosted execution
envelope whose `input` field contains the compiled collection request.

This skill should stay focused on local contracts after raw data has been collected.

## Supported Collection Keys

This support skill may run only these PostPlus public collection keys:

- `x-posts`
- `x-profiles`

Minimal runner examples:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/run_x_actor.mjs \
  --collection-key x-posts \
  --input <work-folder>/.postplus/x-tools/x-posts-envelope.json \
  --output <work-folder>/.postplus/x-tools/x-posts-raw.json

node ${CLAUDE_SKILL_DIR}/scripts/run_x_actor.mjs \
  --collection-key x-profiles \
  --input <work-folder>/.postplus/x-tools/x-profiles-envelope.json \
  --output <work-folder>/.postplus/x-tools/x-profiles-raw.json
```

Do not pass non-public collection names or unpublished keys.

## Public Skill Execution Contract

- keep actor inputs, raw datasets, normalized outputs, ranking files, and graph
  caches under `<work-folder>/.postplus/x-tools/`
- keep only final user-facing summaries or shortlist exports outside
  `.postplus/`
- start with a bounded first pass before broadening the crawl
- use PostPlus-supported scripts plus the shared collection runner only; do not switch to
  ad hoc shell glue
- if PostPlus Cloud service is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue
