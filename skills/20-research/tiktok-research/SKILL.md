---
name: tiktok-research
description: Research TikTok metadata, creators, comments, trends, and benchmark data for organic platform analysis.
metadata:
  postplus:
    familyId: tiktok
    familyName: TikTok
---

# TikTok Research Skill

Use this skill for organic TikTok platform research: keyword and hashtag
sampling, competitor or creator sampling, profile enrichment, comments, trend
and benchmark discovery, and dataset summaries.

Apply shared rulebook and user-guidance rules from `postplus-shared`.

## Do Not Use When

- The user wants paid ad intelligence. Route to `tiktok-ad-research`.
- The user has already selected sounds and needs local downloads or audio
  extraction. Route to `tiktok-music-archive-downloader`.
- The user asks for external articles, policy, or news rather than TikTok
  platform data.
- The request requires unsupported shop creator analytics.

## Cost Discipline

Keep the first pass bounded:

- 3-5 strongest queries or 2-4 seed hashtags.
- 5-12 results per hashtag or query.
- Treat `limit` as the target shortlist or candidate goal, not as a per-query
  scrape size.
- Do not collect comments, related videos, downloads, subtitles, or follower
  expansion in the first pass unless the current step truly needs them.
- Run serially; inspect and refine before expanding.

## Collection Key Routing

Route to the matching hosted collection key by task shape:

- keyword, hashtag, profile URL, music URL, direct video, and content-first
  creator discovery,
- keyword account-search supplement,
- profile enrichment from known handles,
- graph expansion from shortlisted video URLs,
- focused comment collection.

Discover the exact released collection keys and request shapes with
`postplus research schema --json`. Pass the request body to
`postplus research collect <collectionKey> --request <input.json>`.

## Creator Discovery Rule

For creator discovery with follower-band, recent-activity, local-language,
geo-fit, or content-fit constraints, do not default to plain account search.

Prefer:

1. collect matched videos with `tiktok-videos`,
2. extract authors from `.items[].authorUsername`,
3. expand around strong seed videos if recall is weak,
4. enrich profiles with `tiktok-profiles`,
5. rank with profile plus content evidence.

Use `tiktok-users` only as an account-search supplement unless the user
explicitly asks for account-search recall.

## Default Workflow

1. Choose the route first: content-first, handle-first, graph-first, or mixed.
2. Keep the first hosted collection narrow when the brief is simple.
3. Write the compiled collection input to a request file and run
   `postplus research collect <collectionKey> --request <input.json>`.
4. Enrich profiles only after the content or account dataset exists.
5. Expand around strong seed videos only after a promising shortlist exists.
6. Summarize source surface, source query, strongest openings, repeated
   formats, creators, hashtags, and missing evidence.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research collect tiktok-comments --request request.json --output result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->

Keep raw datasets and intermediate files under `.postplus/`; keep final
reports or shortlist exports outside `.postplus/` when the user needs them.

## Failure Modes

- Do not answer TikTok collection tasks with generic web search.
- Do not use paid ad data as organic creator or content evidence.
- Do not route profile enrichment through unpublished keys or implementation
  names.
- Stop on missing auth, unavailable PostPlus Cloud service, stable network
  failure, malformed collection output, or unsupported collection keys.

## Handoff

- Creator shortlist or public contact signals -> `creator-outreach`.
- Instagram creator discovery -> `instagram-creator-discovery`.
- Paid ad hooks or objectives -> `tiktok-ad-research`.
- Local benchmark video files or audio references -> `tiktok-music-archive-downloader`.
- Hook, structure, shot, or spoken-line breakdown -> `video-analysis`.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill tiktok-research`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus research schema --collection-key <collectionKey> --json` only when constructing or repairing an unknown request shape.
- Hosted collection: `postplus research collect <collectionKey> --request <input.json> --output <result.json>` (input = the collection parameters).
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
