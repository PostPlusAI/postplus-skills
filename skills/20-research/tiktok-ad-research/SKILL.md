---
name: tiktok-ad-research
description: Research TikTok Creative Center or ad-library style datasets for winning ad patterns, regions, objectives, hook language, and creative signals without mixing paid ads with organic creator discovery.
metadata:
  postplus:
    familyId: tiktok
    familyName: TikTok
---

# TikTok Ad Research

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when the user wants paid TikTok ad intelligence, not organic creator or content discovery.

Typical requests:

- Find TikTok ad creatives that are performing well
- Inspect top ads for a category, country, or objective
- Study how competitor ads handle hooks, selling points, and CTAs
- Extract ad briefs from Creative Center data

Read first:

- `postplus-shared` research preferences
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

- `${CLAUDE_SKILL_DIR}/_postplus_shared/20-research/tiktok-research/SKILL.reference.md`

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

## Public Skill Execution Contract

- keep actor input JSON, raw datasets, normalized datasets, and analysis caches
  under `<work-folder>/.postplus/tiktok-ads/`
- keep only final user-facing summaries or shortlisted exports outside
  `.postplus/`
- start with a bounded first pass before broader ad pulls
- if PostPlus Cloud service is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

## Recommended Workflow

1. classify the request into a paid-ad task shape
2. write a small actor input JSON
3. wrap the actor input as a `schemaVersion: 1` hosted execution envelope
4. run the actor with a narrow scope first
5. normalize into the local ad schema
6. analyze repeated hooks, brands, objectives, regions, and CTA language
7. only then turn it into a brief or recommendation

## Example

Run the actor:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs \
  --collection-key tiktok-ads-top \
  --input <work-folder>/.postplus/tiktok-top-ads-envelope.json \
  --output <work-folder>/.postplus/tiktok-top-ads-raw.json
```

The `--input` file must be a `schemaVersion: 1` hosted execution envelope. Put
the top-ads actor request under the envelope's `input` field. If starting from
`${CLAUDE_SKILL_DIR}/templates/top-ads-sample.json`, copy that template payload
under `input` instead of passing the template file directly.

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
- ad creative review after humans inspect outputs -> `creative-qa`
- organic TikTok benchmark comparison -> `tiktok-research`
