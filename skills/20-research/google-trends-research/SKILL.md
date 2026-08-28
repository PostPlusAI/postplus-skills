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
When a supported command completes but evidence is empty, sparse, noisy,
off-topic, or the wrong record type, apply the `postplus-shared` reference
`research-quality-recovery.md`; hard execution errors still fail fast.

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

## Route

Use `google-trends-fast` with one `--query`, a country, and a time range.
PostPlus locks the route to keyword analysis so the Agent only supplies research
intent.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research run google-trends-fast \
  --query "example topic" \
  --wait \
  --output ./result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->

## Default Workflow

1. Classify the request into one task shape.
2. Compile one keyword with country and timeframe.
3. Collect a small valid sample through `google-trends-fast`.
4. Extract trend signals that matter.
5. Separate observation from inference.
6. Hand off to platform or marketplace research if deeper evidence is needed.

The result record shape for the route is documented in the
`postplus-shared` reference `dataset-item-schemas.md`; consult it before
writing result-processing code, and probe a single record only to verify.

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
- Keep each run to one clear keyword; compare multiple terms as separate bounded
  runs.
- Stop on unsupported keys, missing auth, unavailable hosted service, stable
  network failure, or malformed collection output.
- Do not answer Google Trends platform-data requests from generic web articles
  when the hosted route is available.

## Handoff

- TikTok content heat or hook patterns -> `tiktok-research`.
- Instagram creator, account, or campaign scouting ->
  `instagram-research`.
- Instagram/Meta content proof -> `social-media-extractor`.
- Cross-source sourcing or selection judgment -> `sourcing-selection`.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill google-trends-research`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, alternate services, or unpublished tools.
- Inspect flags with `postplus research run google-trends-fast --help` only when
  needed.
- Run `postplus research run google-trends-fast --query <term> --country <code>
  --time-range <window> --wait --output <result.json>`.
- Preview and approval boundaries stay explicit; do not execute irreversible publishing without the required approval artifact.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
