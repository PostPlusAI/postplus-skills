---
name: instagram-research
description: Route and run bounded public Instagram research for account audits, organic benchmarks, audience voice, creator discovery, campaign scouting, and public contact-signal enrichment.
metadata:
  postplus:
    familyId: instagram
    familyName: Instagram
---

# Instagram Research

Use this as the single Instagram research entrypoint when the user has not
already chosen a narrower Instagram skill. It routes the request, applies the
public-surface contract, and runs the smallest supported first pass.

Apply shared rulebook and user-guidance rules from `postplus-shared`.
When a supported command completes but evidence is empty, sparse, noisy,
off-topic, or the wrong record type, apply the `postplus-shared` reference
`research-quality-recovery.md`; hard execution errors still fail fast.

## Reference Index

Always apply `references/shared-contract.md` before running a route.

| User asks for | Apply |
| --- | --- |
| Known account, handle, profile URL, competitor account | `references/account-audit.md` |
| Organic examples, hooks, formats, "what works", competitor content | `references/organic-benchmark.md` |
| Comments, audience voice, objections, FAQ, consumer language | `references/audience-voice.md` |
| Creators, influencers, KOL/KOC, UGC makers, affiliates, contacts | `references/creator-discovery.md` |
| Campaign, hashtag, branded UGC sample, watchlist, competitor campaign | `references/campaign-scout.md` |
| Paid ads, Stories, Shop, LIVE, private data, backend analytics, broad social listening | Stop or ask for a supported public Instagram scope |
| Cross-platform request | Run only the Instagram lane here; hand off other platforms |

## First Question

Ask one question only when the answer changes platform, route,
public/private boundary, or first-pass scope.

| Missing | Ask |
| --- | --- |
| Platform | `Which platform should I use first?` |
| Instagram seed | `Please give one Instagram seed: handle, profile URL, post/Reel URL, hashtag, brand/search query, campaign term, or creator criteria.` |
| Brand audit without handle | `Do you have the official handle, or should I first run search recall for candidate accounts?` |
| Audience voice without post source | `Send 1-5 public post/Reel URLs, or give an account, hashtag, or query so I can build a shortlist first.` |
| Creator discovery without seed | `Give one niche, category, hashtag, competitor account, audience keyword, region/language, or collaboration goal.` |
| Contact enrichment without shortlist | `Send the narrowed creator usernames/profile URLs, or let me first shortlist candidates.` |

Do not ask for credentials, private exports, or retry strategy.

## Run Discipline

1. Route the request with the table above.
2. Apply `references/shared-contract.md`.
3. Apply the selected workflow reference.
4. Run the narrowest collection chain that can answer the first pass.
5. If execution succeeds but evidence is empty, sparse, noisy, or off-topic,
   apply the shared bounded research-quality recovery rule; do not repeat the
   same request or silently expand the approved PostPlus credit scope.
6. Stop after the bounded first pass and report scope, evidence, limits, and
   next action.

Result record shapes for every research route are documented in the
`postplus-shared` reference `dataset-item-schemas.md`; consult it before
writing result-processing code, and probe a single record only to verify.

Do not present a sample as full-platform truth. Do not add hidden implementation
fields, analysis notes, unsupported filters, or compatibility fallbacks.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill instagram-research`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, alternate services, or unpublished tools.
- Inspect a route with `postplus research run <route> --help` only when its
  semantic flags are not already clear.
- Run `postplus research run <route> --<semantic flags> --skill
  instagram-research --wait --output <result.json>`.
- Pass only public handles, URLs, hashtags, search terms, locations, and limits
  through flags shown by the selected route.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research run instagram-comments \
  --url "https://example.com/source" \
  --wait \
  --output ./result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->
