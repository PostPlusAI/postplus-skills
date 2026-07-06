# Instagram Audience Voice

Use when the user wants public Instagram comment language: pain points,
objections, repeated questions, praise, buying intent, comparison language, FAQ,
hooks, or copy handoff.

Apply `shared-contract.md` for public surface, collection key semantics, bounds,
evidence labeling, and output discipline.

## User Jobs

- Extract pain points, objections, repeated questions, praise, and buying
  intent from public comments.
- Turn audience language into ad copy, landing-page copy, FAQ, scripts, or
  comment replies.
- Understand what people like, dislike, compare, or misunderstand about a brand,
  product, competitor, or content angle.
- Validate whether a message, claim, or creative angle appears in real comments.

## Alignment

Infer whether the user needs copy handoff, FAQ, objection handling, product or
competitor insight, or content hooks. Ask only when the output would change.

Use this question when needed:

`Should I organize the comments for ad copy, FAQ, objection handling, product insight, or content hooks?`

## Inputs

Minimum source, in order:

1. public post/Reel URLs
2. a bounded post shortlist from another workflow
3. account, hashtag, campaign tag, competitor, category, or query that can
   create a shortlist
4. user-provided comment dataset with source post metadata

Ask once only when needed:

| Situation | Ask |
| --- | --- |
| No platform and no seed | `Which platform should I research, or can you send one public URL, account, hashtag, keyword, competitor, or dataset to start from?` |
| Instagram clear but no seed | `Send one Instagram account, hashtag, keyword, competitor, or post/Reel URL to start from.` |
| Too many URLs / exhaustive ask | `Do you want a representative first pass first, or an exhaustive export for these exact URLs?` |

## Run

| Source | First step | Comment step |
| --- | --- | --- |
| Post/Reel URLs | none | `instagram-comments` |
| Account | `instagram-posts` shortlist | `instagram-comments` |
| Hashtag/campaign tag | `instagram-hashtags` shortlist | `instagram-comments` |
| Category/query/competitor name | `instagram-search`, then selected posts | `instagram-comments` |
| User dataset | no collection unless enrichment is requested | analyze rows |

## Route-Specific Evidence

- Every theme must tie back to source post/Reel and comment evidence.
- Captions, hashtags, and search snippets are not audience voice.
- Comment evidence represents commenters on selected posts, not all followers or
  buyers.
- Empty, disabled, spam-heavy, or low-signal comments produce a gap, not a
  fabricated insight.

## Output Focus

Return the decision supported, source set, comment count, evidence quality,
theme buckets, repeated questions, objections, praise, copy-language phrases,
limits, and next action.

## HTML Artifact Focus

Make the HTML easy to inspect from theme back to comment:

- theme buckets with counts, representative phrases, and source posts
- objection, FAQ, praise, buying-intent, and copy-language sections when present
- comment rows with source post/Reel URL and enough context to review the claim
- low-signal, spam-heavy, disabled, or empty comment gaps kept visible
