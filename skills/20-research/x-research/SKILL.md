---
name: x-research
description: Route and run bounded public X research for posts, threads and replies, account audits, organic benchmarks, audience voice, creator discovery, campaign scouting, and market localization.
metadata:
  postplus:
    familyId: x
    familyName: X
---

# X Research

Use this as the X research entrypoint when the user needs public evidence for a
marketing, creator, audience, competitor, campaign, or localization decision.

Apply shared rulebook and user-guidance rules from `postplus-shared`.
When a supported command completes but evidence is empty, sparse, noisy,
off-topic, or the wrong record type, apply the `postplus-shared` reference
`research-quality-recovery.md`; hard execution errors still fail fast.

## Reference Index

Always apply `references/shared-contract.md` before running a route.

| User asks for | Apply |
| --- | --- |
| Known account, competitor account, account comparison | `references/account-and-competitor-audit.md` |
| Public posts, hooks, formats, topics, competitor content | `references/organic-benchmark.md` |
| Replies, audience voice, objections, FAQ, phrase bank | `references/audience-voice.md` |
| Creators, experts, operators, partners, profile verification | `references/creator-discovery.md` |
| Launch, hashtag, mention, brand or competitor campaign | `references/campaign-scout.md` |
| Market, region, language, or cross-border comparison | `references/market-localization-scout.md` |
| Profile facts only | Apply `references/shared-contract.md`, then use `x-profiles` for known accounts or `x-user-search` for recall |
| Private accounts, DMs, hidden analytics, full follower graphs, ad spend, targeting, conversion, or ROAS | Stop or ask for a supported public X scope |
| Cross-platform request | Run only the X lane here; hand off other platforms |

## First Question

Ask one question only when the answer changes platform, route, collection key,
public/private boundary, first-pass scope, or output shape.

| Missing | Ask |
| --- | --- |
| Platform | `Which platform should I use first?` |
| X seed | `Please give one X seed: keyword, hashtag, handle, profile/post URL, competitor, campaign term, or creator criteria.` |
| Account audit without account | `Send the X handle/profile URL, or tell me the brand and closest competitors to use as recall seeds.` |
| Audience voice without thread | `Send a public X post URL, or give a query so I can shortlist one to three threads first.` |
| Creator discovery without seed | `Give one niche, topic, product, competitor, audience, or collaboration goal.` |
| Localization without market | `Which market or language should I compare first?` |

Do not ask for credentials, supplier choice, collection keys, schemas, hidden
fields, private exports, cookies, or retry strategy.

## Run Discipline

1. Route the request with the table above.
2. Apply `references/shared-contract.md`.
3. Apply the selected workflow reference.
4. Run the narrowest collection chain that answers the first pass.
5. Stop after the first pass and report scope, evidence, limits, and next action.

Result record shapes are documented in the `postplus-shared` reference
`dataset-item-schemas.md`; consult it before processing results, and inspect one
real record only to verify.

Do not present a bounded sample as full-platform truth. Do not add hosted
envelopes, hidden implementation fields, unsupported filters, network-graph
switches, or compatibility fallbacks to collection requests.

## Public Command Boundary

- Readiness diagnostics: `postplus doctor --skill x-research`.
- Use `postplus research schema --collection-key <collectionKey> --json` only
  when constructing or repairing an unknown request shape.
- Run a hosted collection with
  `postplus research collect <collectionKey> --skill x-research --request <input.json> --output <result.json>`.
- Resume a pending run with
  `postplus research collect --resume-from <result.json>`; never extract or
  rewrite the opaque handle stored in that checkpoint.
- Keep the first pass bounded. If a command fails, report the exact error and
  stop; do not silently swap sources or invent missing data.
- If the CLI returns a quote-confirmation challenge, run
  `postplus quote confirm --json --challenge-file <challenge.json>` and retry
  with the returned token.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research collect x-posts --request request.json --output result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->
