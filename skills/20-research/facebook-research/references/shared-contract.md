# Facebook Shared Contract

Read this before every route. Keep research public, bounded, attributable, and
useful to the user's decision. PostPlus owns execution, credit guards, and
polling.

## Routes

| Evidence need | Route | Semantic input | First pass |
| --- | --- | --- | --- |
| Public page/profile posts | `facebook-profile-posts` | `--url`, `--limit` | 1-5 URLs, 20 posts |
| Direct post evidence | `facebook-post-by-url` | `--url` | 1-10 URLs |
| Public group posts | `facebook-group-posts` | `--url`, `--limit` | 1-3 groups, 20 posts |
| Ad-library creative | `facebook-ads-library` | `--query`, `--country`, `--status`, `--limit` | 20 ads |
| Post/reel comments | `facebook-comments` | `--url`, `--limit` | 1-5 URLs, 20 comments |
| Public group discussion | `facebook-groups` | `--url`, optional `--query`, `--limit` | 20 posts |
| Events/local activity | `facebook-events` | `--query` or `--url`, `--limit` | 10 events |
| Marketplace listings | `facebook-marketplace` | `--url`, `--limit` | 10 listings |
| Page identity | `facebook-pages` | `--url` | 1-5 pages |
| Rich page/profile posts | `facebook-posts` | `--url`, `--limit` | 20 posts |
| Reels | `facebook-reels` | `--url`, `--limit` | 20 reels |
| Broad public search | `facebook-search` | `--category`, `--location`, `--limit` | 20 results |

Run:

```bash
postplus research run <route> --<semantic flags> --wait --output result.json
```

Use `postplus research run <route> --help` only when the flags are unclear.

Private profiles, hidden groups, member lists, Page Insights, account metrics,
targeting, spend, and ROAS are outside this public surface. Say so and stop.

## Human Alignment

Infer whether the user wants diagnosis, comparison, discovery, extraction,
planning, or verification. Ask one question only when it changes the route,
privacy boundary, sample, or deliverable. Do not ask for implementation details.

## Bounds And Recovery

- Start with one route and the smallest useful sample.
- Keep independent sources separately attributable.
- On hard auth, network, contract, or service errors, stop with the exact error.
- On a successful but sparse/noisy result, apply
  `postplus-shared/research-quality-recovery.md` once within the same bound.
- Resume a pending checkpoint with
  `postplus research run --resume-from result.json`; never resubmit it.

## Evidence

Keep the complete JSON result. Preserve source URLs and observed dates. Separate
observations from inference, deduplicate repeated records, and never turn a
bounded sample into a platform-wide claim. For item-level work, also produce a
compact HTML artifact with scope, count, strongest examples, gaps, and next
action.
