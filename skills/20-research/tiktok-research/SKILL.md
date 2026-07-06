---
name: tiktok-research
description: Route and run bounded public TikTok research for organic videos, comments, creators, profiles, related videos, and paid ad examples.
metadata:
  postplus:
    familyId: tiktok
    familyName: TikTok
---

# TikTok Research

Use this as the TikTok research entrypoint when the user wants public TikTok
evidence for a growth, marketing, creator, audience, competitor, or paid
creative decision.

TikTok music/archive download is not part of the released public surface. Apply
shared rulebook and user-guidance rules from `postplus-shared`.

## Reference Index

Always apply `references/shared-contract.md` before running a route.

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
| Profile facts only | Apply `references/shared-contract.md`, then run a bounded `tiktok-profiles` or `tiktok-users` lookup |
| Mixed paid and organic | Run separated paid and organic lanes; never fill one lane with the other |
| Shop, LIVE, private analytics, backend audience, GMV, conversion, hidden contacts, exact targeting, spend, ROAS | Stop or ask for a supported public TikTok scope |
| Music/archive download or audio extraction | Not provided on the current public surface. Say so and stop; analyze user-provided local files through `media-router` instead |
| Cross-platform request | Run only the TikTok lane here; hand off other platforms |

## First Question

Ask one question only when the answer changes platform, route, collection key,
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

Do not ask for credentials, implementation choice, collection keys, schema fields,
hidden fields, private exports, retry strategy, cookies, or music archive
details.

## Run Discipline

1. Route the request with the table above.
2. Apply `references/shared-contract.md`.
3. Apply the selected workflow reference.
4. Run the narrowest collection chain that can answer the first pass.
5. Stop after the first pass and report scope, evidence, limits, and next
   action.

Do not present a public sample as full TikTok truth. Do not use paid ads as
organic creator evidence. Do not use organic videos as paid ad proof. Do not add
hosted envelopes, hidden implementation fields, unsupported filters, or
compatibility fallbacks to collection requests.

For local testing, optimize for a fast real first pass. Use the request cards in
`references/shared-contract.md`; do not inspect fixtures, product mappings, or
implementation docs unless a request actually fails and the error cannot be understood
from the command output.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill tiktok-research`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback services, or unpublished tools.
- Use `postplus research schema --collection-key <collectionKey> --json` only
  when constructing or repairing an unknown request shape.
- Hosted collection:
  `postplus research collect <collectionKey> --request <input.json> --output <result.json>`
  where the request file is the raw collection input object, not a hosted
  envelope and not `{ "schemaVersion": 1, "input": ... }`.
- Resume a pending collection:
  `postplus research collect --run-handle <runHandle> --output <result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run
  `postplus quote confirm --json --challenge-file <challenge.json>` and retry
  with the returned token.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research collect tiktok-ads-top --request request.json --output result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->

## Local Development Direct Check

For local development only, agents may verify a TikTok route through a direct
public-content runner instead of the PostPlus CLI. This is a developer test
path, not the released public boundary.

- Prefer the official `postplus research collect` command first when it works.
- If local product auth, quote handling, async status, or schema exposure blocks
  quick skill validation, use the direct check path and record that as a product
  integration gap for the technical owner.
- Keep the route names, first-pass bounds, and output contract from
  `references/shared-contract.md`.
- Use direct checks only to prove collection viability for a route or document
  a missing candidate surface.
- Write raw collection items, request, stderr, and a run report to the local
  product work folder.
- Treat empty, unavailable, private, sparse, network-failed, or
  collection-failed data as evidence gaps or test failures.
- Before release, route the public skill back through the PostPlus collection
  boundary and remove implementation-specific details from user-facing copy.
