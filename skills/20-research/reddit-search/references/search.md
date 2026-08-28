# Reddit Discovery

Use `reddit-search` for keyword posts or a supplied public Reddit search/feed
URL.

```bash
postplus research run reddit-search --query "portable espresso maker" --sort relevance --time-range year --limit 20 --wait --output result.json
```

Repeat `--query` only when terms must share one bounded run; otherwise keep
queries separate. For a supplied public URL, use `--url` instead of rebuilding
it. Supported sort and time-window values are shown by route help.

This route discovers posts, not an exhaustive comment corpus. For comment
evidence, shortlist up to three relevant discussion-rich posts, then use
`reddit-post-comments`. If results are off-topic, change the query once before
changing sort or time range. Preserve each changed pass separately.
