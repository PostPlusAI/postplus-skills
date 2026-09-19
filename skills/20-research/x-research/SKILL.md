---
name: x-research
description: Research public X posts, threads, replies, and accounts for audience language, creator discovery, competitor benchmarks, and campaign evidence.
metadata:
  postplus:
    familyId: x
    familyName: X
---

# X Research

Use this as the X research entrypoint when the user needs public evidence for a
marketing, creator, audience, competitor, campaign, or localization decision.


## Reference Index

Read only the one route reference matching the request. The local contract is
optional detail when platform scope remains unclear.

| User asks for | Apply |
| --- | --- |
| Known account, competitor account, account comparison | `references/account-and-competitor-audit.md` |
| Public posts, hooks, formats, topics, competitor content | `references/organic-benchmark.md` |
| Replies, audience voice, objections, FAQ, phrase bank | `references/audience-voice.md` |
| Creators, experts, operators, partners, profile verification | `references/creator-discovery.md` |
| Launch, hashtag, mention, brand or competitor campaign | `references/campaign-scout.md` |
| Market, region, language, or cross-border comparison | `references/market-localization-scout.md` |
| Profile facts only | Use `x-profiles` for known accounts or `x-user-search` for recall |
| Private accounts, DMs, hidden analytics, full follower graphs, ad spend, targeting, conversion, or ROAS | Stop or ask for a supported public X scope |
| Cross-platform request | Run only the X lane here; hand off other platforms |

## First Question

Ask one question only when the answer changes platform, route,
public/private boundary, first-pass scope, or output shape.

| Missing | Ask |
| --- | --- |
| Platform | `Which platform should I use first?` |
| X seed | `Please give one X seed: keyword, hashtag, handle, profile/post URL, competitor, campaign term, or creator criteria.` |
| Account audit without account | `Send the X handle/profile URL, or tell me the brand and closest competitors to use as recall seeds.` |
| Audience voice without thread | `Send a public X post URL, or give a query so I can shortlist one to three threads first.` |
| Creator discovery without seed | `Give one niche, topic, product, competitor, audience, or collaboration goal.` |
| Localization without market | `Which market or language should I compare first?` |

Do not ask for credentials, implementation choices, schemas, hidden
fields, private exports, cookies, or retry strategy.

## Run Discipline

1. Route the request with the table above.
2. Read only the selected workflow reference.
3. Run the narrowest collection chain that answers the first pass.
4. Stop after the first pass and report scope, evidence, limits, and next action.


Do not present a bounded sample as full-platform truth. Use only the public
filters shown by the selected route.

## Public Command Boundary

- Readiness diagnostics: `postplus doctor --skill x-research`.
- Inspect a route with `postplus research run <route> --help` only when its
  semantic flags are not already clear.
- Run `postplus research run <route> --<query/handle/url flags> --limit <n>
  --wait --output <result.json>`.
- Use only the semantic flags shown by the selected route.
- Resume a pending run with
  `postplus research run --resume-from <result.json>`; never extract or
  rewrite the opaque handle stored in that checkpoint.
- Keep the first pass bounded. If a command still fails after any bounded
  recovery allowed by the executing PostPlus skill, report the exact error and
  stop; do not silently swap sources or invent missing data.
- If the CLI returns a quote-confirmation challenge, obtain user approval for its scope and cost before running
  `postplus quote confirm --json --challenge-file <challenge.json>` and retry
  with the returned token.

## Command Selection

| Need | Route | Flags |
| --- | --- | --- |
| Posts, timelines, direct URLs, replies | `x-posts` | repeat query/handle/URL, sort, limit |
| Known account facts | `x-profiles` | repeat handle, limit |
| Keyword account recall | `x-user-search` | repeat query, limit |

Only if platform scope or evidence interpretation remains unclear, consult
[platform contract](references/shared-contract.md); it is not a preflight.

## Evidence Quality

1. Check whether evidence is a post, reply, or profile; a search snippet cannot establish the contents of a full conversation.
2. Prefer direct public URLs or verified handles; change one supported query, date, or language constraint if recall misses.
3. Allow at most two changed follow-up passes after successful but insufficient results, within approved scope and budget; do not repeat an identical request or hide a failed/pending operation.
4. Stop when sufficient, at the bound, or when another pass would not help. Report useful evidence and uncertainty; preserve raw results and source links.

Visible metrics are observations, not reach or conversion; account search recall is not verified identity.
Full machine fields belong to `postplus research schema --route <route> --json`;
consult it only when required for processing, not before every request.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research run x-posts \
  --wait \
  --output ./result.json
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Wait for explicit user approval when requested; an action does not authorize spending, publishing, or overwriting.
Resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
<!-- END GENERATED EXECUTION EXAMPLE -->
