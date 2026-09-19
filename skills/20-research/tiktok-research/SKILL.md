---
name: tiktok-research
description: Research public TikTok videos, comments, creators, profiles, related videos, and paid ad examples for audience evidence and creative benchmarks.
metadata:
  postplus:
    familyId: tiktok
    familyName: TikTok
---

# TikTok Research

Use this as the TikTok research entrypoint when the user wants public TikTok
evidence for a growth, marketing, creator, audience, competitor, or paid
creative decision.

TikTok music/archive download is not part of the released public surface.

## Reference Index

Read only the one route reference matching the request. The local contract is
optional detail when platform scope remains unclear.

| User asks for | Apply |
| --- | --- |
| Brand account, competitor account, profile health, account comparison | `references/account-and-competitor-audit.md` |
| Organic examples, hooks, hashtags, formats, competitor videos, related videos | `references/organic-benchmark.md` |
| Comments, audience voice, objections, FAQ, phrase bank, buyer language | `references/audience-voice.md` |
| Creators, UGC makers, KOL/KOC, profile enrichment, creator shortlist | `references/creator-discovery.md` |
| Paid ads, paid hooks, CTA, offers, region/objective ad examples | `references/paid-ads.md` |
| Product demo fit, ecommerce angle, buyer objection, content-to-offer fit | `references/product-content-fit.md` |
| Launch campaign, hashtag challenge, branded activity, competitor campaign | `references/campaign-scout.md` |
| Market, region, language, cross-border localization, local angle comparison | `references/market-localization-scout.md` |
| Profile facts only | Run a bounded `tiktok-profiles` or `tiktok-users` lookup |
| Mixed paid and organic | Run separated paid and organic lanes; never fill one lane with the other |
| Shop, LIVE, private analytics, backend audience, GMV, conversion, hidden contacts, exact targeting, spend, ROAS | Stop or ask for a supported public TikTok scope |
| Music/archive download or audio extraction | Not provided on the current public surface. Say so and stop; analyze user-provided local files through `media-analysis` instead |
| Cross-platform request | Run only the TikTok lane here; hand off other platforms |

## First Question

Ask one question only when the answer changes platform, route,
public/private boundary, first-pass scope, or output shape.

| Missing | Ask |
| --- | --- |
| Platform | `Which platform should I use first?` |
| TikTok seed | `Please give one TikTok seed: keyword, hashtag, profile, video URL, competitor, product, creator criteria, or paid-ad scope.` |
| Account audit without account | `Send the TikTok handle/profile URL, or tell me the brand and closest competitors to use as search seeds.` |
| Ecommerce fit without product | `What product, audience, market, or offer should I test against TikTok evidence?` |
| Campaign scout without campaign seed | `Send one campaign hashtag, slogan, brand profile, competitor, launch term, or example video.` |
| Localization without market | `Which market or language should I compare first?` |
| Audience voice without videos | `Send public TikTok video URLs, or give a keyword, hashtag, profile, or competitor so I can build a shortlist first.` |
| Creator discovery without seed | `Give one niche, product, hashtag, competitor, customer type, video URL, or collaboration goal.` |
| Paid ads without scope | `What paid scope should I sample: category, competitor, region/language, objective, hook, offer, or keyword?` |
| Private/backend request | `This needs public evidence. Should I continue with public TikTok examples instead?` |

Do not ask for credentials, private exports, retry strategy, cookies, or music
archive details.

## Run Discipline

1. Route the request with the table above.
2. Read only the selected workflow reference.
3. Run the narrowest collection chain that can answer the first pass.
4. Stop after the first pass and report scope, evidence, limits, and next
   action.


Do not present a public sample as full TikTok truth. Do not use paid ads as
organic creator evidence. Do not use organic videos as paid ad proof. Use only
the filters shown by the selected route.

For local testing, optimize for a fast real first pass. Use the command selection below; do not inspect fixtures or product mappings.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill tiktok-research`.

- Inspect a route with `postplus research run <route> --help` only when its
  semantic flags are not already clear.
- Run `postplus research run <route> --<query/url/handle/hashtag flags> --limit
  <n> --wait --output <result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, obtain user approval for its scope and cost before running
  `postplus quote confirm --json --challenge-file <challenge.json>` and retry
  with the returned token.

## Command Selection

| Evidence need | Route | Semantic input | First pass |
| --- | --- | --- | --- |
| Organic videos | `tiktok-videos` | query/handle/hashtag/URL, country, limit | 20 videos |
| Comments/audience voice | `tiktok-comments` | repeat `--url`, `--limit` | 1-5 videos, 20 comments |
| Known profiles | `tiktok-profiles` | repeat `--handle`, `--limit` | 1-5 profiles |
| Account recall | `tiktok-users` | repeat `--query`, `--limit` | 20 accounts |
| Related videos | `tiktok-related-videos` | repeat `--url`, country, limit | 20 videos |
| Paid examples | `tiktok-ads-top` | `--limit` | 20 ads |

Only if platform scope or evidence interpretation remains unclear, consult
[platform contract](references/shared-contract.md); it is not a preflight.

## Evidence Quality

1. Check whether results are organic videos, comments, profiles, or paid examples; never substitute one lane for another.
2. Change one supported seed, market, or query when a completed result misses; collect comments only from relevant shortlisted video URLs.
3. Allow at most two changed follow-up passes after successful but insufficient results, within approved scope and budget; do not repeat an identical request or hide a failed/pending operation.
4. Stop when sufficient, at the bound, or when another pass would not help. Report useful evidence and uncertainty; preserve raw results and source links.

Captions and views are not audience voice or sales; preserve the paid/organic source and observed date.
Full machine fields belong to `postplus research schema --route <route> --json`;
consult it only when required for processing, not before every request.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research run tiktok-ads-top \
  --wait \
  --output ./result.json
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Wait for explicit user approval when requested; an action does not authorize spending, publishing, or overwriting.
Resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
<!-- END GENERATED EXECUTION EXAMPLE -->
