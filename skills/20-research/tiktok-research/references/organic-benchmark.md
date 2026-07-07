# TikTok Organic Benchmark

Use when the user wants public TikTok organic videos, hooks, formats, hashtags,
competitor content, related examples, or category creative patterns.

Apply `shared-contract.md` for public surface, collection key semantics, bounds,
evidence labeling, and output discipline.

## User Jobs

- Find public organic examples for a category, topic, profile, hashtag,
  competitor, or product.
- Understand openings, formats, captions, text overlays, creator style, and
  reusable content patterns.
- Compare competitor organic content without claiming full performance truth.
- Build an inspiration board, content brief, or shortlist for comment analysis.
- Expand from strong examples into related videos only when adjacency matters.

## Alignment

Infer whether the user needs examples, competitor readout, pattern summary,
related expansion, or a creative handoff. Ask only when the output would change.

Use this question when needed:

`Should I return a content example table, competitor readout, pattern summary, related-video board, or creative brief?`

## Inputs

Minimum: keyword, hashtag, profile/handle, public video URL, competitor, product
category, customer type, topic, or query phrase.

Ask once only when needed:

| Situation | Ask |
| --- | --- |
| No seed | `Give one TikTok keyword, hashtag, profile, video URL, competitor, product, or category to start.` |
| Many broad seeds | `Which 3-5 queries or 2-4 hashtags should I sample first?` |
| Profile-only ambiguity | `Should I pull profile facts, or benchmark this account's public videos?` |
| Paid/organic ambiguity | `Do you want organic TikTok examples, paid ad examples, or separated lanes?` |

## Run

| Seed | Key | Rule |
| --- | --- | --- |
| Keyword, hashtag, profile, or direct video | `tiktok-videos` | Primary organic sample. |
| Strong seed video URLs | `tiktok-related-videos` | Expansion only after seed videos exist. |
| Known handles for facts | `tiktok-profiles` | Profile snapshot, not content benchmark. |

Bounds: `3-5` queries or `2-4` hashtags; `5-12` videos per seed; related
videos from `1-5` seed URLs.

Run independent query/hashtag/profile samples in parallel only when each request
is bounded and saved separately. Do not parallel related expansion until seed
videos are selected.

## Route-Specific Evidence

- Video evidence supports hooks, formats, captions/text, creator style, visible
  engagement fields when returned, and source links.
- Do not claim platform-wide ranking, full trend truth, or causal performance
  from a bounded sample.
- Related video output is adjacency evidence, not a full trend graph.
- Profile snapshots are context; they do not prove content performance.
- Comments require `audience-voice.md`.

## Stop

Stop for backend reach, watch time, retention, conversion, Shop/LIVE metrics,
music downloads, exact trend ranking, full market coverage, or unsupported
filters. If the sample is noisy, report it and ask for a narrower seed.

## Output Focus

Return the decision supported, sampled scope, seeds, content table with
URL/creator/caption or text signal, hook and format patterns, creator signals,
weak evidence or missing fields, and next collection or creative handoff.

## HTML Artifact Focus

Make the HTML useful as an inspiration and evidence board:

- content table with URL, creator, source seed, caption/text signal, hook, and
  format
- grouped sections for hook, format, creator, hashtag, topic, and related-video
  expansion when present
- reusable patterns linked back to supporting videos
- weak evidence and missing fields kept visible near the relevant samples
