---
name: tiktok-research
description: Research public TikTok videos, comments, creators, profiles, related videos, and paid ad examples for audience evidence and creative benchmarks.
metadata:
  postplus:
    familyId: tiktok
    familyName: TikTok
---

# TikTok Research

Research public TikTok evidence for the user's marketing decision. A product,
category, problem, competitor, account, or content URL is enough to start.
Use the task reference below and [shared contract](references/shared-contract.md)
for research completion, reporting, and downstream handoffs.

## Reference Index

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

## Understand the request

Infer the intended decision and useful deliverable from the request. Read an
unfamiliar product's official page before deriving brands, use cases, problem
phrases, and hashtags. Verify brand/account identity instead of guessing from a
name. Do not ask the user to supply competitor lists or choose search batches.

Ask one focused question only when missing product identity, subject, market,
or a public/private boundary would materially change the work. If the user has
provided a usable product/category/account/URL, start; do not ask for another
seed or an output-format choice. Preserve all platforms the user requested.

Keep explicit requirements, inferred search directions, and unknown conditions
separate. Inferred directions are not hidden exclusion rules. Unsupported
private metrics remain unknown; use the available public evidence only when it
can still answer the requested decision.

## Public Command Boundary

Run the selected route with its declared semantic flags:

```bash
postplus research run <route> --<query/url/handle/hashtag flags> --limit <n> --wait --output result.json
```

| Evidence need | Route | Inputs |
| --- | --- | --- |
| Organic videos | `tiktok-videos` | query, hashtag, handle, or URL flags |
| Known profiles | `tiktok-profiles` | repeat `--handle` |
| Account discovery | `tiktok-users` | repeat `--query` |
| Related-video discovery | `tiktok-related-videos` | repeat `--url`, after selecting relevant seed videos |
| Actual comments | `tiktok-comments` | repeat `--url`; optional `--include-replies` |
| Paid examples | `tiktok-ads-top` | `--limit` only; no keyword/brand/market targeting |

Use `postplus research run <route> --help` when flags, enums, or bounds are
unclear; inspect `postplus research schema --route <route> --json` only when
processing needs exact result fields. `postplus doctor --skill tiktok-research`
is a diagnostic, not a compulsory preflight. Never use private supplier inputs.
Save independent batches separately; run them concurrently only after their
inputs are known. Follow the returned structured action for pending/failed
operations; resume the same operation, not a replacement submission.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research run tiktok-ads-top \
  --wait \
  --output ./result.json
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Use existing PostPlus credits for requested work within existing authorization; estimate-only requests do not execute. Do not recharge, buy subscriptions, publish or change external advertising spend without applicable authorization. An initial reservation is not a final price or a hard cost cap. If a required hard final-cost limit cannot be enforced, do not execute; explain that limit.
Correct definite pre-submission field or format errors without changing the requested intent, mode or output constraints. After submission or an unknown outcome, resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
Keep raw results, operation identifiers and recovery commands in execution records. In ordinary chat, give the result, meaningful limitations, known cost and any necessary user decision; do not narrate uploads, polling, internal identifiers or JSON. When asked how media was made, provide the actual model, submitted prompt in the user language and references actually submitted with their roles.
<!-- END GENERATED EXECUTION EXAMPLE -->
