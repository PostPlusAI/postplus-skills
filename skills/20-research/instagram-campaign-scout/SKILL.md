---
name: instagram-campaign-scout
description: Scout Instagram hashtag opportunities, tagged mentions, and campaign spread to monitor branded activity, UGC, and creator participation.
---

# Instagram Campaign Scout

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

Use this skill when the user wants to:

- monitor a branded hashtag
- find UGC or creator posts tagging a brand
- inspect campaign spread on Instagram
- map related hashtags around a topic or campaign

Read these references before implementation:

- `skills/20-research/instagram-references/actor-selection.md`
- `skills/20-research/instagram-references/normalized-schema.md`
- `skills/20-research/instagram-references/tool-contracts.md`

## Primary Actors

- `instagram/hashtag-analytics-scraper`
- `instagram/hashtag-scraper`
- `instagram/tagged-scraper`
- `instagram/scraper` as fallback only

Current verified release-shell path:

- hashtag post collection via `instagram/hashtag-scraper`
- tagged mention collection via `instagram/tagged-scraper`
- watchlist synthesis from normalized hashtag/tagged datasets

Use `instagram/hashtag-analytics-scraper` only when you explicitly need
hashtag-metadata surfaces beyond the current verified post/tagged path.

## Recommended Workflow

1. choose a campaign object:
   - hashtag
   - target username
   - brand keyword
2. collect hashtag analytics or tagged-post data
3. normalize outputs into hashtag or tagged datasets
4. identify:
   - volume signals
   - related hashtags
   - top tagged creators
   - UGC examples
5. build a watchlist for repeated monitoring if needed

## Cost Discipline

Start with:

- 1-3 branded hashtags
- 1-5 target usernames
- a small tagged-post sample

Avoid turning this into a full social-listening crawl on the first pass.

## Release-Shell Execution Contract

- keep scout briefs, actor inputs, raw datasets, normalized outputs, and
  watchlist caches under `<work-folder>/.postplus/instagram-campaign-scout/`
- keep only final user-facing summaries or watchlists outside `.postplus/`
- compile the campaign object into a small hashtag or username brief before the
  expensive collection step
- if hosted capability is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

## Good Output

Return:

- branded hashtag opportunity map
- top tagged or mentioning posts
- likely creators driving visibility
- related hashtag clusters
- recommended watchlist:
  - usernames
  - hashtags
  - tagged mentions

## Handoff

Escalate to `instagram-account-research` when:

- tagged creators should be evaluated as partnership candidates

Escalate to `instagram-creator-discovery` when:

- hashtag or tagged surfaces should become a broader creator pool

Escalate to `instagram-content-benchmark` when:

- tagged or hashtag-derived posts look worth deeper benchmark analysis
