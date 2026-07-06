# TikTok Campaign Scout

Use when the user wants bounded public TikTok evidence for a campaign, launch,
hashtag challenge, slogan, branded phrase, competitor activity, seeding wave, or
watchlist.

Apply `shared-contract.md` for public surface, collection key semantics, bounds,
evidence labeling, and output discipline.

## User Jobs

- Check whether a campaign term, launch phrase, hashtag, or slogan has public
  TikTok evidence.
- Review owned/competitor campaign videos and repeated creative angles.
- Build a watchlist of campaign terms, profiles, videos, creators, and hashtags.
- Find creator or content leads only when tied to campaign evidence.
- Identify sparse, noisy, ambiguous, or unsupported campaign signals.

## Alignment

Infer whether the user wants owned posts, competitor activity, hashtag/search
samples, creator leads, or a watchlist. Ask only when the output would change.

Use this question when needed:

`Should I prioritize owned posts, competitor activity, hashtag/search samples, creator leads, or a watchlist?`

## Inputs

Minimum: campaign hashtag, slogan, launch term, product phrase, brand profile,
competitor profile, example video, or category plus campaign goal.

Ask once only when needed:

| Situation | Ask |
| --- | --- |
| No campaign seed | `Send one campaign hashtag, slogan, brand profile, competitor, launch term, or example video.` |
| Generic campaign term | `Which brand, product, or market should I pair with this campaign term?` |
| Wants full spread | `I can run a bounded public sample, not full campaign reach. Which first seed should I sample?` |

## Run

| Seed | Key | Rule |
| --- | --- | --- |
| Hashtag, slogan, launch phrase, product term | `tiktok-videos` | Campaign sample; not full spread. |
| Brand/competitor profile | `tiktok-videos` | Owned or competitor public content sample. |
| Strong campaign videos | `tiktok-related-videos` | Related expansion only after seed videos. |
| Candidate creators/authors | `tiktok-profiles` | Optional verification after video evidence. |

Run independent hashtag/profile seeds in parallel when bounded and saved
separately. Do not parallel related expansion until seed videos are selected.

## Route-Specific Evidence

- Label evidence as hashtag/search sample, owned profile sample, competitor
  sample, direct video, or related expansion.
- Campaign samples do not prove total reach, share of voice, paid delivery, or
  full UGC spread.
- Creator leads require source campaign videos or profile evidence.
- Noisy or sparse results are findings, not failures to hide.

## Stop

Stop for full campaign measurement, paid delivery, exact reach, backend
analytics, private UGC, Shop/LIVE performance, or unsupported campaign filters.

## Output Focus

Return campaign scope, seed types, evidence table, notable videos/accounts,
themes, watchlist, creator leads when supported, gaps, and next action.

## HTML Artifact Focus

Make the HTML useful as a campaign evidence board:

- evidence grouped by hashtag/search sample, owned profile, competitor profile,
  direct video, or related expansion
- watchlist table with term/profile/video/creator, reason, source URL, and gap
- creator leads tied to campaign evidence
- sparse/noisy/unsupported surfaces visible in a gaps section
