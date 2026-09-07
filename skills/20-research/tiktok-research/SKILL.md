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
When a supported command completes but evidence is empty, sparse, noisy,
off-topic, or the wrong record type, apply the `postplus-shared` reference
`research-quality-recovery.md`; hard execution errors still fail fast.

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
2. Apply `references/shared-contract.md`.
3. Apply the selected workflow reference.
4. Run the narrowest collection chain that can answer the first pass.
5. Stop after the first pass and report scope, evidence, limits, and next
   action.

Result record shapes for every research route are documented in the
`postplus-shared` reference `dataset-item-schemas.md`; consult it before
writing result-processing code, and probe a single record only to verify.

Do not present a public sample as full TikTok truth. Do not use paid ads as
organic creator evidence. Do not use organic videos as paid ad proof. Use only
the filters shown by the selected route.

For local testing, optimize for a fast real first pass. Use the route cards in
`references/shared-contract.md`; do not inspect fixtures or product mappings.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill tiktok-research`.
- If an owned CLI or script command still fails after any bounded recovery allowed by the executing PostPlus skill, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, alternate services, or unpublished tools.
- Inspect a route with `postplus research run <route> --help` only when its
  semantic flags are not already clear.
- Run `postplus research run <route> --<query/url/handle/hashtag flags> --limit
  <n> --wait --output <result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run
  `postplus quote confirm --json --challenge-file <challenge.json>` and retry
  with the returned token.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research run tiktok-ads-top \
  --wait \
  --output ./result.json
```

**Bounded recovery:** Current PostPlus CLIs handle a compatible update and retry the command once when no agent-session restart is required. If an older CLI only reports that an update is required, run `postplus update` and retry once under the same condition. For a missing or invalid CLI session, run `postplus auth login` yourself; it opens the browser by default. Immediately share its exact URL as a clickable link for the user to **Connect**, then retry the original command once only after the CLI confirms success. Never ask the user to run the command or enter/compare a code, approve the connection for them, or automatically restart a cancelled/expired login. For a local usage rejection before remote work starts, use that command's `--help` to make one unambiguous correction from existing user input and retry once.

If PostPlus returns `postplus_cli_balance_required` with an `open_url` user action, give the user its exact label and URL and stop for account action. Do not invent a checkout link, claim whether provider work or charging occurred, or blindly resubmit after payment; continue from the command's documented status or checkpoint once the user confirms credits are available.

Otherwise stop and report the exact error. Never expose login polling secrets, retry after remote work may have started, change user intent, bypass approval, switch providers, rewrite payloads, or make a second recovery attempt. After success, briefly say that PostPlus updated, using only the official update details PostPlus reported.
<!-- END GENERATED EXECUTION EXAMPLE -->
