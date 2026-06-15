---
name: google-trends-research
description: Research Google Trends search-intent signals for topic discovery, keyword momentum, regional interest, and rising queries without treating search trends as the same thing as platform content heat or marketplace demand.
metadata:
  postplus:
    familyId: marketplace-sourcing
    familyName: Marketplace, Sourcing, and Growth
---

# Google Trends Research

Use this skill for Google Trends platform-data work: topic discovery, keyword
momentum, regional interest, rising queries, and search-intent watchlists.

Apply shared rulebook and user-guidance rules from `postplus-shared`.

## Core Rule

Treat Google Trends as a search-intent source, not full demand proof.

Good uses: topic discovery, keyword momentum, regional comparison,
rising-query discovery, and watchlist monitoring.

Do not overclaim transaction demand, conversion intent, marketplace
competitiveness, creator execution quality, or merchant-model fit from Google
Trends alone.

## Task Shapes

Classify the request first:

- Trending now scan: hot searches by country or recent lookback.
- Keyword momentum check: trend changes across one or more terms.
- Regional interest mapping: which markets are warmer for a topic.
- Related query expansion: rising terms usable as seeds.

## Collection Key Routing

Keyword analysis uses one `keyword` string. Keyword requests must set
`enableTrendingSearches: false`; `queries` is not a supported keyword-request
field because it produces generic realtime trending searches.

The `--request` file is the collection input object (the compiled Google Trends
request) directly.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research collect google-trends-fast --request request.json --output result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->

## Default Workflow

1. Classify the request into one task shape.
2. Compile one keyword with country and timeframe.
3. Collect a small valid sample through `google-trends-fast`.
4. Extract trend signals that matter.
5. Separate observation from inference.
6. Hand off to platform or marketplace research if deeper evidence is needed.

Keep query briefs, raw trend payloads, normalized outputs, and watchlist caches
under `.postplus/google-trends/`; keep final summaries or shortlist exports
where the user can inspect them.

## Good Output

Return keyword or topic set, observed trend signal, timeframe, geo scope,
strongest rising queries or related topics, provisional implication, and the
missing evidence layer.

## Failure Modes

- Do not treat search spikes as proof that a product will sell.
- Do not confuse news-driven spikes with durable category demand.
- Do not skip geo and timeframe details when comparing terms.
- Do not send `queries` for keyword momentum checks; use `keyword` with
  `enableTrendingSearches: false`.
- Stop on unsupported keys, missing auth, unavailable hosted service, stable
  network failure, or malformed collection output.
- Do not answer Google Trends platform-data requests from generic web articles
  when the hosted route is available.

## Handoff

- TikTok content heat or hook patterns -> `tiktok-research`.
- Instagram creator, account, or campaign scouting ->
  `instagram-account-research` or `instagram-campaign-scout`.
- Instagram/Meta content proof -> `social-media-extractor`.
- Cross-source sourcing or selection judgment -> `sourcing-selection`.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill google-trends-research`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus research schema --collection-key google-trends-fast --json` only when constructing or repairing an unknown request shape.
- Hosted collection: `postplus research collect google-trends-fast --request <input.json> --output <result.json>` (input = the collection parameters).
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <result.json>`.
- Preview and approval boundaries stay explicit; do not execute irreversible publishing without the required approval artifact.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
