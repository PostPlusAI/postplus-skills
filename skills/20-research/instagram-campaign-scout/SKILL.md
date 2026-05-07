---
name: instagram-campaign-scout
description: Scout Instagram hashtag opportunities, branded mentions, and campaign spread to monitor public UGC and creator participation.
---

# Instagram Campaign Scout

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when the user wants to:

- monitor a branded hashtag
- find UGC or creator posts tagging a brand
- inspect campaign spread on Instagram
- map related hashtags around a topic or campaign

Read these references before implementation:

- `skills/20-research/instagram-references/actor-selection.md`
- `skills/20-research/instagram-references/normalized-schema.md`
- `skills/20-research/instagram-references/tool-contracts.md`

## Primary Hosted Collection Keys

- `instagram-hashtags`
- `instagram-search`
- `instagram-posts`

Current verified public skill path:

- hashtag post collection via `instagram-hashtags`
- branded keyword or account discovery via `instagram-search`
- watchlist synthesis from normalized hashtag/search/post datasets

## Recommended Workflow

1. choose a campaign object:
   - hashtag
   - target username
   - brand keyword
2. collect hashtag, search, or post data
3. normalize outputs into hashtag/search/post datasets
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

## Public Skill Execution Contract

- keep scout briefs, actor inputs, raw datasets, normalized outputs, and
  watchlist caches under `<work-folder>/.postplus/instagram-campaign-scout/`
- keep only final user-facing summaries or watchlists outside `.postplus/`
- compile the campaign object into a small hashtag or username brief before the
  expensive collection step
- if PostPlus Cloud service is unavailable, unauthorized, or returns a stable
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
