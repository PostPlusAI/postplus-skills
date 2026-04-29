---
name: google-trends-research
description: Research Google Trends search-intent signals for topic discovery, keyword momentum, regional interest, and rising queries without treating search trends as the same thing as platform content heat or marketplace demand.
---

# Google Trends Research

Follow shared release-shell rules in:

- `postplus-shared` release-shell rules

Use this skill for Google Trends platform-data work.

Typical requests:

- 看最近哪些关键词或话题在变热
- 比较几个关键词的搜索趋势
- 看某个主题在哪些国家或地区更热
- 找 rising queries 或 related topics
- 给内容研究、选品研究、campaign planning 提供 search-intent signals

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

- 最近 Google 上什么在热
- 某个国家今天 / 这几天的热点搜索是什么
- 先给我一批实时热点主题

Preferred route:

- primary: `google-trending-now`
- specialized fallback: trending mode in `google-trends-fast-scraper`

### 2. Keyword Momentum Check

Use when the user asks:

- 这个关键词最近有没有变热
- 比较几个词的趋势变化
- 看过去几个月 / 一年里的搜索热度

Preferred route:

- primary: `google-trends-scraper`
- fallback: `google-trends-fast-scraper`

### 3. Regional Interest Mapping

Use when the user asks:

- 哪些国家 / 地区对这个主题更敏感
- 这个词在不同市场哪里更热
- 想做 geo priority 判断

Preferred route:

- primary: `google-trends-scraper`

### 4. Related Query Expansion

Use when the user asks:

- 这个主题还有哪些相关搜索词
- 有没有 rising queries 可当 seed
- 帮我扩一组关键词池

Preferred route:

- primary: `google-trends-scraper`

## Actor Strategy

Do not bind the skill to one actor.

Current defaults:

- broad keyword analysis: `google-trends-scraper`
- realtime trending feed: `google-trending-now`
- flexible all-in-one fallback: `google-trends-fast-scraper`

Choose the narrowest actor that fits the task.

Use the default collection actor by default when the task is keyword-centric and needs:

- interest over time
- geo comparison
- related queries
- related topics

Use `google-trending-now` when the task is specifically a realtime trend feed, not a keyword analysis job.

## Actor Input Fields

### `google-trends-scraper` Actor Input Fields

Required field: `searchTerms` (array of strings). Do **not** use `keywords` — the actor
rejects it with a validation error and the run ends with status `FAILED`.

```json
{
  "searchTerms": ["led skincare device", "red light therapy"],
  "geo": "US"
}
```

### `google-trending-now`

Pass `geo` (country code) and optional `timeRange`. No `searchTerms` needed — this actor
returns the current trending feed, not per-keyword analysis.

### `google-trends-fast-scraper`

Accepts flexible input; consult actor docs for exact field names before use.

## Repo-Owned Runner

For product-shell execution, use the repo-owned collection runner:

```bash
node skills/20-research/google-trends-research/scripts/collection_actor_run.mjs \
  --collection-key google-trends-keywords \
  --input <input.json> \
  --output <raw-output.json>
```

## Recommended Workflow

Use the lightest valid chain:

1. classify the request into one task shape
2. collect a small valid sample
3. extract the trend signals that matter
4. separate observation from inference
5. hand off to other skills if deeper evidence is needed

## Release-Shell Execution Contract

- keep query briefs, raw trend payloads, normalized outputs, and watchlist
  caches under `<work-folder>/.postplus/google-trends/`
- keep only final user-facing summaries or shortlist exports outside
  `.postplus/`
- compile a small keyword or geo brief before the expensive collection step
- start with a bounded first pass:
  - one topic cluster
  - one geo scope
  - one timeframe comparison
- if hosted capability is unavailable, unauthorized, or returns a stable
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

- TikTok content heat or hook patterns -> `skills/20-research/tiktok-research`
- Instagram creator, account, or campaign scouting -> `skills/20-research/instagram-account-research` or `skills/20-research/instagram-campaign-scout`
- Amazon marketplace demand -> `skills/20-research/amazon-research`
- TikTok Shop marketplace demand -> `skills/20-research/tiktok-shop-research`

Escalate to higher synthesis when the user is making a real business decision:

- cross-source sourcing or selection judgment -> `skills/30-strategy/sourcing-selection`

## Failure Modes To Avoid

Do not:

- treat search spikes as proof that a product will sell
- confuse news-driven spikes with durable category demand
- skip geo and timeframe details when comparing terms
- answer Google Trends requests from generic web articles when a platform-data route is available
