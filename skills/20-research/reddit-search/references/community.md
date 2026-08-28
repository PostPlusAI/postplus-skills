# Reddit Community Routes

For an ordinary subreddit feed or supplied search URL, use `reddit-search`
with `--url` and a small limit. For a topic inside one subreddit, encode the
public subreddit constraint in `--query` and keep comment traversal as a
separate selected-thread step.

Use `reddit-subreddit-posts` only when the user explicitly requests a deeper
subreddit pass:

```bash
postplus research run reddit-subreddit-posts --subreddit SaaS --limit 100 --wait --output result.json
```

A deep pass needs a maximum post count. Ask when it is missing, unless the user
delegates the choice. Never multiply the bound by automatically crawling every
thread; use `reddit-post-comments` later for a small selected set.
