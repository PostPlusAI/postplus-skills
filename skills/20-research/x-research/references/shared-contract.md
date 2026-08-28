# X Shared Contract

Use public X evidence only. PostPlus owns execution, credit guards, and polling.

## Routes

| Need | Route | Flags |
| --- | --- | --- |
| Posts, timelines, direct URLs, replies | `x-posts` | repeat query/handle/URL, sort, limit |
| Known account facts | `x-profiles` | repeat handle, limit |
| Keyword account recall | `x-user-search` | repeat query, limit |

Examples:

```bash
postplus research run x-posts --query "from:OpenAI -filter:retweets" --sort Latest --limit 20 --wait --output result.json
postplus research run x-profiles --handle OpenAI --limit 20 --wait --output result.json
postplus research run x-user-search --query "AI researcher" --limit 20 --wait --output result.json
```

Advanced public search syntax may express account, hashtag, mention, language,
date, media, or conversation constraints. Use a public `--url` when exact
content is required. Search recall is not verified identity; verify selected
accounts with `x-profiles`.

## Bounds And Evidence

- One seed and 20 results is the default first pass.
- Keep multiple markets/queries separately attributable.
- Preserve post/profile URL, observed timestamp, visible metrics, and raw JSON.
- Treat public metrics as observations, not proof of reach or conversion.
- Stop on hard errors; use the shared bounded recovery rule for successful but
  sparse/noisy evidence.
- Resume with `postplus research run --resume-from result.json`; never resubmit.

Protected accounts, DMs, hidden analytics, complete follower graphs, exhaustive
monitoring, targeting, spend, and ROAS are outside this surface. Never infer
private identity.
