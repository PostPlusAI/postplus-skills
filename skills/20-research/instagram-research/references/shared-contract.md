# Instagram Shared Contract

This is the public Instagram route and evidence contract. PostPlus owns
execution, credit guards, and polling.

## Routes

| Evidence need | Route | Semantic input | First pass |
| --- | --- | --- | --- |
| Known account facts | `instagram-profiles` | repeat `--handle`, `--limit` | 1-5 accounts |
| Recent account posts | `instagram-posts` | repeat `--handle`, `--limit` | 20 posts |
| Comments/audience voice | `instagram-comments` | repeat `--url`, `--limit` | 1-5 posts, 20 comments |
| Hashtag/campaign sample | `instagram-hashtags` | repeat `--hashtag`, `--kind`, `--limit` | 20 items |
| Brand/account/topic recall | `instagram-search` | repeat `--query`, `--kind`, `--limit` | 20 results |
| Public contact signals | `instagram-email-search` | repeat `--handle` | Narrow shortlist |

Run:

```bash
postplus research run <route> --<semantic flags> --wait --output result.json
```

Use `postplus research run <route> --help` only when needed.

Paid ads, Stories, Shop, LIVE, DMs, private/login-only data, follower lists,
backend analytics, mention graphs, and full campaign spread are outside this
surface. Re-scope or stop.

## Human Alignment

Infer whether the user wants diagnosis, comparison, discovery, extraction,
planning, or verification. Direct identifiers beat recall: prefer known handles
and URLs, and use search only to discover candidates that are then verified.
Ask one question only when it changes the public/private boundary, route,
sample, or deliverable.

## Common Chains

- Unknown brand handle: `instagram-search`, then verify candidates with
  `instagram-profiles`.
- Organic benchmark: `instagram-posts`; add comments only for selected posts.
- Audience voice: shortlist posts first, then `instagram-comments`.
- Creator discovery: search/hashtag sample, then verify chosen profiles.
- Contact enrichment: only after a narrow shortlist exists.

## Bounds And Recovery

- Start with one route and a small sample; keep each seed attributable.
- For an organic benchmark, start with `10-15` items per theme, account,
  hashtag, or query and no more than `3-5` broad seeds.
- On hard auth, network, contract, or service errors, stop with the exact error.
- On successful but sparse/noisy evidence, apply the shared bounded recovery
  rule once; do not repeat an identical request or silently expand the approved
  PostPlus credit scope.
- Resume with `postplus research run --resume-from result.json`; never resubmit.

## Evidence

Keep the complete JSON result and source URLs. Label search recall as recall,
public contact signals as unverified signals, and samples as samples. Separate
observation from inference and return scope, counts, representative evidence,
gaps, artifact path, and one useful next action.

Never present a sample as full-platform truth.
