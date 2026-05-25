---
name: postplus-shared
description: Shared rules, routing preferences, execution boundaries, and workflow references for released PostPlus skills. Use this before any PostPlus skill that mentions shared public skill rules, research preferences, product-selection preferences, TikTok music workflow, or ads workflow.
metadata:
  postplus:
    familyId: shared-rules
    familyName: Shared Rules
---

# PostPlus Shared

Use this skill first when another PostPlus skill asks for shared rules or
shared workflow preferences.

This skill is the single source of truth for principle-level PostPlus skill
documents. Runtime scripts and executable adapters remain vendored inside each
business skill's `_postplus_shared/` directory.

## References

- [`shared-public-skill-rules.md`](references/shared-public-skill-rules.md)
- [`shared-research-preferences.md`](references/shared-research-preferences.md)
- [`shared-product-selection-preferences.md`](references/shared-product-selection-preferences.md)
- [`shared-source-of-truth-files.md`](references/shared-source-of-truth-files.md)
- [`shared-tiktok-music-workflow.md`](references/shared-tiktok-music-workflow.md)
- [`shared-ads-workflow.md`](references/shared-ads-workflow.md)
- [`shared-user-guidance.md`](references/shared-user-guidance.md)

## Default Workflow

1. Read the reference named by the downstream skill.
2. Apply the shared rule before reading platform- or production-specific
   details.
3. If a downstream skill and this shared rule conflict, fail fast and surface
   the conflict instead of inventing a fallback.
4. Do not run provider scripts from this shared skill, and do not mutate registry or release metadata from a shared-rule handoff.
