---
name: tiktok-ad-research
description: Research TikTok Creative Center or ad-library style datasets for winning ad patterns, regions, objectives, hook language, and creative signals without mixing paid ads with organic creator discovery.
---

# TikTok Ad Research

Follow shared release-shell rules in:

- `skills/shared-release-shell-rules.md`

Use this skill when the user wants paid TikTok ad intelligence, not organic creator or content discovery.

Typical requests:

- 找 TikTok 上跑得好的广告素材
- 看某个类目 / 国家 / objective 的 top ads
- 研究竞品广告怎么做 hook、卖点、CTA
- 从 Creative Center 数据里提炼 ad brief

Read first:

- `${CLAUDE_SKILL_DIR}/../shared-research-preferences.md`
- `${CLAUDE_SKILL_DIR}/references/task-shapes.md`
- `${CLAUDE_SKILL_DIR}/references/input-notes.md`
- `${CLAUDE_SKILL_DIR}/references/normalized-schema.md`

## Core Rule

Do not treat ad data as if it were organic creator data.

This skill is for:

- paid creative benchmarking
- hook and offer analysis
- objective / region / language comparisons
- ad-creative sourcing for briefs

This skill is not for:

- creator discovery
- community comments research
- organic content lane mapping

If the user wants organic content or creator research, route to:

- `${CLAUDE_SKILL_DIR}/../tiktok-research/SKILL.md`

## Preferred Actor

Current default:

- `tiktok-creative-center-top-ads`

Use this actor when the user wants top-performing Creative Center ads and optional analytics or keyframe metrics.

## Minimal Toolchain

Use these pieces in combination:

- scrape:
  - `${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs`
- normalize:
  - `${CLAUDE_SKILL_DIR}/scripts/normalize_tiktok_ads_dataset.mjs`
- analyze:
  - `${CLAUDE_SKILL_DIR}/scripts/analyze_tiktok_ads_dataset.mjs`

## Release-Shell Execution Contract

- keep actor input JSON, raw datasets, normalized datasets, and analysis caches
  under `<work-folder>/.postplus/tiktok-ads/`
- keep only final user-facing summaries or shortlisted exports outside
  `.postplus/`
- start with a bounded first pass before broader ad pulls
- if hosted capability is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

## Recommended Workflow

1. classify the request into a paid-ad task shape
2. write a small actor input JSON
3. run the actor with a narrow scope first
4. normalize into the local ad schema
5. analyze repeated hooks, brands, objectives, regions, and CTA language
6. only then turn it into a brief or recommendation

## Example

Run the actor:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs \
  --actor tiktok-creative-center-top-ads \
  --input ${CLAUDE_SKILL_DIR}/templates/top-ads-sample.json \
  --output <work-folder>/.postplus/tiktok-top-ads-raw.json
```

Normalize:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/normalize_tiktok_ads_dataset.mjs \
  --input <work-folder>/.postplus/tiktok-top-ads-raw.json \
  --actor tiktok-creative-center-top-ads \
  --output <work-folder>/.postplus/tiktok-top-ads-normalized.json
```

Analyze:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/analyze_tiktok_ads_dataset.mjs \
  --input <work-folder>/.postplus/tiktok-top-ads-normalized.json \
  --output <work-folder>/.postplus/tiktok-top-ads-analysis.json
```

## Good Output

Return:

- top brands or advertisers in the sample
- dominant objectives
- repeated hook language
- repeated offer language
- repeated regions / geo scope
- CTA patterns
- duration distribution
- top ads by likes or CTR when available
- whether the sample is spotlight-curated or filter-driven

Separate:

- observed ad facts
- likely creative implications
- missing evidence

## Handoff

Escalate after this skill when needed:

- ad video structure or spoken-line breakdown -> a dedicated visual analysis workflow
- ad creative review after humans inspect outputs -> `skills/creative-qa`
- organic TikTok benchmark comparison -> `skills/tiktok-research`
