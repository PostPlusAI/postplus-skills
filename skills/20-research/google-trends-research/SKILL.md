---
name: google-trends-research
description: Research Google Trends search-intent signals for topic discovery, keyword momentum, regional interest, and rising queries without treating search trends as the same thing as platform content heat or marketplace demand.
metadata:
  postplus:
    familyId: marketplace-sourcing
    familyName: Marketplace, Sourcing, and Growth
---

# Google Trends Research

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill for Google Trends platform-data work.

Typical requests:

- See which keywords or topics are heating up
- Compare search trends across several keywords
- See which countries or regions are warmer for a topic
- Find rising queries or related topics
- Provide search-intent signals for content research, product-selection research, and campaign planning

Read first:

- `postplus-shared` research preferences

## Core Rule

Treat Google Trends as a search-intent source, not as full demand proof.

Good uses:

- topic discovery
- keyword momentum tracking
- regional interest comparison
- rising-query discovery
- watchlist monitoring

Do not overclaim from Google Trends alone:

- transaction demand
- conversion intent
- marketplace competitiveness
- creator or content execution quality
- merchant-model fit

Those need to be combined with marketplace, content-platform, or business-context evidence.

## Task Shapes

Classify the request first:

### 1. Trending Now Scan

Use when the user asks:

- What is trending on Google recently
- What hot searches a country has today or in the past few days
- Give me an initial set of real-time trending topics

Preferred hosted collection key:

- `google-trends-fast`

### 2. Keyword Momentum Check

Use when the user asks:

- Whether this keyword has heated up recently
- Compare trend changes across several terms
- Inspect search interest over the past months or year

Preferred hosted collection keys:

- `google-trends-fast`

### 3. Regional Interest Mapping

Use when the user asks:

- Which countries or regions are more responsive to this topic
- Where this term is warmer across markets
- Need a geographic priority judgment

Preferred hosted collection key:

- `google-trends-fast`

### 4. Related Query Expansion

Use when the user asks:

- Which related search terms this topic has
- Whether there are rising queries usable as seeds
- Expand a keyword pool for me

Preferred hosted collection key:

- `google-trends-fast`

## Hosted Collection Strategy

Do not expose provider selection to the user.

Current defaults:

- broad keyword analysis: `google-trends-fast`
- realtime trending feed: `google-trends-fast`

Choose the narrowest actor that fits the task.

Use `google-trends-fast` by default when the task needs:

- interest over time
- geo comparison
- realtime trending searches
- regional trend signals

## Hosted Collection Input Fields

### `google-trends-fast`

The skill compiles user requests into one of two internal input shapes:

- keyword analysis: keyword, timeframe, geo, optional regional data
- trending-search scan: country, lookback window, max item count

The hosted actor's mode switch is an internal implementation detail. Do not
ask the user to choose or edit provider fields. Classify the request, compile
the correct actor input, and keep implementation field names inside logs or
developer errors only.

## PostPlus-Provided Runner

For PostPlus runtime execution, use the PostPlus-provided collection runner:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs \
  --collection-key google-trends-fast \
  --input <envelope.json> \
  --output <raw-output.json>
```

The `--input` file must be a `schemaVersion: 1` hosted execution envelope. Put
the Google Trends collection request under the envelope's `input` field.

## Recommended Workflow

Use the lightest valid chain:

1. classify the request into one task shape
2. collect a small valid sample
3. extract the trend signals that matter
4. separate observation from inference
5. hand off to other skills if deeper evidence is needed

## Public Skill Execution Contract

- keep query briefs, raw trend payloads, normalized outputs, and watchlist
  caches under `<work-folder>/.postplus/google-trends/`
- keep only final user-facing summaries or shortlist exports outside
  `.postplus/`
- compile a small keyword or geo brief before the expensive collection step
- start with a bounded first pass:
  - one topic cluster
  - one geo scope
  - one timeframe comparison
- if PostPlus Cloud service is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

## Good Output

Return:

- keyword or topic set
- observed trend signal
- timeframe
- geo scope
- strongest rising queries or related topics
- provisional implication
- missing layer

Good recommendation shapes:

- `search interest is rising, but platform-content proof is still missing`
- `good US search signal, weak evidence for other markets`
- `topic is hot now, but looks news-driven rather than durable`
- `use these rising queries as seeds for TikTok or Instagram content scouting`

## Handoff

Escalate to platform research skills when search intent should be validated against actual content or commerce evidence:

- TikTok content heat or hook patterns -> `tiktok-research`
- Instagram creator, account, or campaign scouting -> `instagram-account-research` or `instagram-campaign-scout`
- Amazon marketplace demand -> `amazon-research`
- marketplace demand -> `amazon-research`

Escalate to higher synthesis when the user is making a real business decision:

- cross-source sourcing or selection judgment -> `sourcing-selection`

## Failure Modes To Avoid

Do not:

- treat search spikes as proof that a product will sell
- confuse news-driven spikes with durable category demand
- skip geo and timeframe details when comparing terms
- answer Google Trends requests from generic web articles when a platform-data route is available
