---
name: instagram-research
description: Research public Instagram accounts, posts, Reels, comments, hashtags, and creators for audits, benchmarks, audience voice, or collaboration shortlists.
metadata:
  postplus:
    familyId: instagram
    familyName: Instagram
---

# Instagram Research

Use this as the single Instagram research entrypoint when the user has not
already chosen a narrower Instagram skill. It routes the request, applies the
public-surface contract, and runs the smallest supported first pass.


## Reference Index

Read only the one route reference matching the request. The local contract is
optional detail when platform scope remains unclear.

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
2. Read only the selected workflow reference.
3. Run the narrowest collection chain that can answer the first pass.
4. If execution succeeds but evidence is empty, sparse, noisy, or off-topic,
   apply the quality rules below; do not repeat the
   same request or silently expand the approved PostPlus credit scope.
5. Stop after the bounded first pass and report scope, evidence, limits, and
   next action.


Do not present a sample as full-platform truth. Do not add hidden implementation
fields, analysis notes, unsupported filters, or compatibility fallbacks.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill instagram-research`.

- Inspect a route with `postplus research run <route> --help` only when its
  semantic flags are not already clear.
- Run `postplus research run <route> --<semantic flags> --wait --output
  <result.json>`.
- Pass only public handles, URLs, hashtags, search terms, locations, and limits
  through flags shown by the selected route.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, obtain user approval for its scope and cost before running `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.

## Command Selection

| Evidence need | Route | Semantic input | First pass |
| --- | --- | --- | --- |
| Known account facts | `instagram-profiles` | repeat `--handle`, `--limit` | 1-5 accounts |
| Recent account posts | `instagram-posts` | repeat `--handle`, `--limit` | 20 posts |
| Comments/audience voice | `instagram-comments` | repeat `--url`, `--limit` | 1-5 posts, 20 comments |
| Hashtag/campaign sample | `instagram-hashtags` | repeat `--hashtag`, `--kind`, `--limit` | 20 items |
| Brand/account/topic recall | `instagram-search` | repeat `--query`, `--kind`, `--limit` | 20 results |
| Public contact signals | `instagram-email-search` | repeat `--handle` | Narrow shortlist |

Only if platform scope or evidence interpretation remains unclear, consult
[platform contract](references/shared-contract.md); it is not a preflight.

## Evidence Quality

1. Check that profile facts, post evidence, and actual comments match the requested decision; captions are not audience voice.
2. Prefer verified handles or post URLs; if discovery misses, change the query or hashtag and verify the shortlisted profiles.
3. Allow at most two changed follow-up passes after successful but insufficient results, within approved scope and budget; do not repeat an identical request or hide a failed/pending operation.
4. Stop when sufficient, at the bound, or when another pass would not help. Report useful evidence and uncertainty; preserve raw results and source links.

Public follower counts are snapshots, not growth; contact signals are unverified, and absent metrics are not zero.
Full machine fields belong to `postplus research schema --route <route> --json`;
consult it only when required for processing, not before every request.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research run instagram-comments \
  --url "https://example.com/source" \
  --wait \
  --output ./result.json
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Wait for explicit user approval when requested; an action does not authorize spending, publishing, or overwriting.
Resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
<!-- END GENERATED EXECUTION EXAMPLE -->
