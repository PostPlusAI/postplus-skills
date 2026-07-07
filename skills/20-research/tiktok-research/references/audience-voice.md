# TikTok Audience Voice

Use when the user wants public TikTok comment language: objections, questions,
pain points, praise, purchase intent, comparison language, FAQ, phrase bank, or
copy insights.

Apply `shared-contract.md` for public surface, collection key semantics, bounds,
evidence labeling, and output discipline.

## User Jobs

- Extract pain points, objections, repeated questions, praise, buying intent,
  comparison language, and FAQ from public comments.
- Turn audience language into ad copy, landing-page copy, scripts, content
  hooks, or comment replies.
- Validate whether a product claim, offer, feature, or creative angle appears
  in real comments.
- Identify low-signal, spam-heavy, disabled, or off-topic comment samples
  before over-summarizing them.

## Alignment

Infer whether the user needs copy handoff, FAQ, objection handling, product
insight, competitor insight, or content hooks. Ask only when the output would
change.

Use this question when needed:

`Should I organize the comments for ad copy, FAQ, objection handling, product insight, or content hooks?`

## Inputs

Minimum source, in order:

1. public TikTok video URLs
2. a bounded video shortlist from another workflow
3. keyword, hashtag, profile, competitor, product, or category seed that can
   create a shortlist
4. user-provided comment dataset with source video metadata

Ask once only when needed:

| Situation | Ask |
| --- | --- |
| No platform and no seed | `Which platform should I research, or can you send one video URL, keyword, hashtag, profile, competitor, or dataset?` |
| TikTok clear but no video source | `Send public TikTok video URLs, or give a keyword, hashtag, profile, or competitor so I can build a shortlist first.` |
| Too many URLs / exhaustive ask | `Do you want a representative first pass first, or an exhaustive export for these exact videos?` |

## Run

| Source | First step | Comment step |
| --- | --- | --- |
| Video URLs | none | `tiktok-comments` |
| Profile/handle | `tiktok-profiles` recent-video sample | `tiktok-comments` |
| Keyword, hashtag, product, topic, or competitor phrase | `tiktok-videos` shortlist | `tiktok-comments` |
| User dataset | no collection unless enrichment requested | analyze rows |

Bounds: direct URLs `1-8`; generated shortlist `3-8` videos.

Run comment collection in parallel only for independent direct video URLs with
separate outputs. If videos must be shortlisted first, collect comments after
the shortlist exists.

For account comment research, use the known-account request card in
`shared-contract.md`, filter returned videos by the requested time window, then
run `tiktok-comments` on the selected `webVideoUrl` values. Do not inspect
fixtures or product code to rediscover this path.

## Route-Specific Evidence

- Every theme must tie back to source video and comment evidence.
- Video captions, search snippets, likes, shares, or views are not audience
  voice.
- Comment evidence represents commenters on selected videos, not all followers,
  viewers, buyers, or TikTok users.
- Empty, private, disabled, spam-heavy, repetitive, or low-signal comments
  produce a gap, not a fabricated insight.

## Stop

Stop for private comments, DMs, buyer identity, demographics, Shop buyer data,
paid delivery comments, backend sentiment, or platform-wide sentiment. If
comments are unavailable or empty, report the gap and recommend a better source.

## Output Focus

Return the decision supported, source videos, comment count, evidence quality,
theme buckets, repeated questions, objections, praise, copy-language phrases,
limits, and next action.

## HTML Artifact Focus

Make the HTML easy to inspect from theme back to comment:

- theme buckets with counts, representative phrases, and source videos
- objection, FAQ, praise, buying-intent, and copy-language sections when present
- comment rows with source video URL and enough context to review the claim
- low-signal, spam-heavy, disabled, or empty comment gaps kept visible
