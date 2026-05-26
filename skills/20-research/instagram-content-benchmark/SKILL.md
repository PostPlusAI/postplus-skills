---
name: instagram-content-benchmark
description: Benchmark Instagram posts and Reels to discover winning content patterns, shortlist high-value examples, and extract reusable hooks and formats.
metadata:
  postplus:
    familyId: instagram
    familyName: Instagram
---

# Instagram Content Benchmark

Use this skill to benchmark Instagram posts and Reels, find strong examples,
and extract reusable hooks, caption structures, formats, and content pillars.

Apply shared rulebook and user-guidance rules from `postplus-shared`.

## Do Not Use When

- The user wants to evaluate known accounts. Route to
  `instagram-account-research`.
- The user wants to discover creators for outreach. Route to
  `instagram-creator-discovery`.
- The user wants comment language. Route to `instagram-audience-voice` after a
  shortlist exists.

## Collection Key Routing

Released hosted collection keys:

- `instagram-posts`: post or Reel samples from known accounts or URLs.
- `instagram-hashtags`: hashtag-derived benchmark pools.

Use hosted collection outputs and the workflow below.

## Default Workflow

1. Define seeds: usernames, post URLs, Reel URLs, hashtags, or themes.
2. Collect the first candidate pool at 10-15 posts or Reels per theme.
3. Normalize post and Reel-like results into one comparable dataset.
4. Rank by engagement proxy, relevance, recency, and format fit.
5. Produce a benchmark shortlist.
6. Summarize repeated hooks, visual formats, caption patterns, and hashtag use.

Treat 10-15 posts or Reels per theme as the first-pass boundary. Do not compile
a wider first input from broad wording like "as many as possible." Expand only
after the first shortlist proves seed quality and the user approves a second
pass.

## Good Output

Return top benchmark examples, content-type split, repeated opening patterns,
value promises, likely content pillars, and recommended next posts to inspect
deeper.

## Failure Modes

- Stop if no usable benchmark seeds exist.
- Stop on unsupported keys, missing auth, unavailable hosted service, or stable
  network failure.
- Do not treat benchmark content as permission to contact creators directly;
  lead work belongs in `creator-outreach`.

## Handoff

- Need creator pool from benchmark content -> `instagram-creator-discovery`.
- Need comment sentiment or audience language -> `instagram-audience-voice`.
- Need shot-level video breakdown -> `video-analysis`.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill instagram-content-benchmark`.
- Input schema: `postplus research schema --collection-key instagram-hashtags --json`.
- Hosted collection: `postplus research collect --skill instagram-content-benchmark --collection-key instagram-hashtags --input <hosted-envelope.json> --output <collection-result.json>`.
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <collection-result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
