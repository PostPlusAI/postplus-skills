---
name: instagram-tools
description: Hosted collection support guidance for Instagram workflows, including dataset normalization, ranking, comment clustering, and watchlist construction.
metadata:
  postplus:
    familyId: instagram
    familyName: Instagram
---

# Instagram Tools

## Use When
- Support skill for Instagram collection, normalization, extraction, and ranking guidance.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Required Input
- Hosted envelope or local normalized Instagram dataset depending on workflow.

## Support Methodology

This support runs in-context against a collected Instagram dataset; there is no
installed script. Keep every step provider-agnostic.

- Normalize: map each collection actor's raw fields into one comparable shape —
  `username`, `followers`, `likes`, `comments`, `caption`, `hashtags`,
  `publishedAt`. Treat a missing or negative engagement value as `0` so ranking
  stays monotonic.
- Rank: score accounts and creators on durable, transferable signals —
  engagement rate, recent posting cadence, verified status, and contact signals
  (`email`, `website`) that enable outreach. When the goal is individual-creator
  discovery, downweight brand and product accounts so personal creators surface
  first. Return both the full research pool and a shortlist instead of a single
  hardcoded cutoff.
- Cluster comments: before bucketing, drop low-signal noise such as very short
  comments and pure reactions (`lol`, `omg`, `wow`). Group the rest into reusable
  audience-language buckets — praise, objection, question, purchase-intent,
  feature-request.
- Watchlist: maintain monitoring sets keyed by username, hashtag, or tagged
  mention for repeat collection runs.

Which sibling skill draws on which support:

- `instagram-account-research`, `instagram-audience-voice`, and
  `instagram-campaign-scout` use collection and normalization support.
- `instagram-content-benchmark` uses post ranking and benchmark support.
- `instagram-creator-discovery` uses creator extraction and ranking support.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Handoff
- Return structured output to the calling Instagram skill.

## Collection Run

Discover the exact released collection keys and request shapes with
`postplus research schema --json`. Write the compiled collection input to a
request file and run
`postplus research collect <collectionKey> --request <input.json>`.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research collect instagram-comments --request request.json --output result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill instagram-tools`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus research schema --collection-key <collectionKey> --json` only when constructing or repairing an unknown request shape.
- Hosted collection: `postplus research collect <collectionKey> --request <input.json> --output <result.json>` (input = the collection parameters).
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
