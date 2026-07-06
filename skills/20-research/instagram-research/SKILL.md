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

Ask one question only when the answer changes platform, route, collection key,
public/private boundary, or first-pass scope.

| Missing | Ask |
| --- | --- |
| Platform | `Which platform should I use first?` |
| Instagram seed | `Please give one Instagram seed: handle, profile URL, post/Reel URL, hashtag, brand/search query, campaign term, or creator criteria.` |
| Brand audit without handle | `Do you have the official handle, or should I first run search recall for candidate accounts?` |
| Audience voice without post source | `Send 1-5 public post/Reel URLs, or give an account, hashtag, or query so I can build a shortlist first.` |
| Creator discovery without seed | `Give one niche, category, hashtag, competitor account, audience keyword, region/language, or collaboration goal.` |
| Contact enrichment without shortlist | `Send the narrowed creator usernames/profile URLs, or let me first shortlist candidates.` |

Do not ask for credentials, supplier choice, collection keys, schema fields,
private exports, hidden fields, or retry strategy.

## Run Discipline

1. Route the request with the table above.
2. Apply `references/shared-contract.md`.
3. Apply the selected workflow reference.
4. Run the narrowest collection chain that can answer the first pass.
5. Stop after the first pass and report scope, evidence, limits, and next action.

Do not present a sample as full-platform truth. Do not add hosted envelopes,
hidden supplier fields, analysis notes, unsupported filters, or compatibility
fallbacks to collection requests.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill instagram-research`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus research schema --collection-key <collectionKey> --json` only when constructing or repairing an unknown request shape.
- Hosted collection runs through the shared `research collect` verb: `postplus research collect <collectionKey> --skill instagram-research --request <input.json> --output <result.json>` (input = the collection parameters).
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research collect instagram-comments --request request.json --output result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->

## Local Development Direct Provider Check

For local development only, agents may verify the same route contract through a
direct public-content provider runner instead of the PostPlus CLI. This is a
developer test path, not the released public boundary.

- Keep the route names, first-pass bounds, and output contract from
  `references/shared-contract.md`.
- Use direct provider checks only to prove data collection viability for a
  problematic route, such as hashtag samples or public contact-signal
  enrichment.
- Write raw provider items and a run report to the local product work folder;
  do not rewrite raw payloads to make a run appear successful.
- Treat empty comments, unavailable accounts, private data, missing contact
  signals, network errors, and provider errors as evidence gaps or test
  failures.
- Before release, route the public skill back through the PostPlus collection
  boundary and remove supplier-specific implementation details from public
  user-facing copy.
