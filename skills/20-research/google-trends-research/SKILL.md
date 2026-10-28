---
name: google-trends-research
description: Research Google Trends keyword momentum, regional interest, and related queries. Use search-interest evidence without treating it as sales or total demand.
metadata:
  postplus:
    familyId: marketplace-sourcing
    familyName: Marketplace, Sourcing, and Growth
---

# Google Trends Research

Use this skill for Google Trends platform-data work: topic discovery, keyword
momentum, regional interest, rising queries, and search-intent watchlists.


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

## Evidence Quality

1. Check that term, country, and time window match the question before comparing trends.
2. Refine one query, region, or time window when a completed pass is too sparse; do not mix incomparable scopes.
3. Allow at most two changed follow-up passes after successful but insufficient results, within approved scope and budget; do not repeat an identical request or hide a failed/pending operation.
4. Stop when sufficient, at the bound, or when another pass would not help. Report useful evidence and uncertainty; preserve raw results and source links.

Relative search interest is not absolute search volume, purchases, or full market demand.
Full machine fields belong to `postplus research schema --route <route> --json`;
consult it only when required for processing, not before every request.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research run google-trends-fast \
  --query "example topic" \
  --wait \
  --output ./result.json
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Use existing PostPlus credits for requested work within existing authorization; estimate-only requests do not execute. Do not recharge, buy subscriptions, publish or change external advertising spend without applicable authorization. An initial reservation is not a final price or a hard cost cap. If a required hard final-cost limit cannot be enforced, do not execute; explain that limit.
Correct definite pre-submission field or format errors without changing the requested intent, mode or output constraints. After submission or an unknown outcome, resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
Keep raw results, operation identifiers and recovery commands in execution records. In ordinary chat, give the result, meaningful limitations, known cost and any necessary user decision; do not narrate uploads, polling, internal identifiers or JSON. When asked how media was made, provide the actual model, submitted prompt in the user language and references actually submitted with their roles.
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
- Instagram/Meta content proof -> `instagram-research` or `facebook-research`.
- For cross-source decisions, synthesize the evidence for the user’s task;
  do not treat search interest alone as a sourcing recommendation.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill google-trends-research`.

- Inspect flags with `postplus research run google-trends-fast --help` only when
  needed.
- Run `postplus research run google-trends-fast --query <term> --country <code>
  --time-range <window> --wait --output <result.json>`.
- Preview and approval boundaries stay explicit; do not execute irreversible publishing without the required approval artifact.
- Requested tasks use existing PostPlus credits after the current price and balance are checked.
  Estimate-only requests do not execute. Stop on insufficient credits; do not
  recharge, buy a subscription, or repeat an uncertain paid operation.
