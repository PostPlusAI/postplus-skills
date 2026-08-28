# Reddit Public Profile

Use only when the user explicitly names a public Reddit profile:

```bash
postplus research run reddit-user-activity --handle example --post-limit 20 --comment-limit 20 --wait --output result.json
```

Keep post and comment counts separate. Present each newest first using observed
timestamps and report the actual date range returned. Do not describe the sample
as complete history.

Return only public profile facts, posts, and comments. Do not infer real identity,
enrich private details, recover deleted activity, suggest personal outreach, or
substitute a similarly named account when the target is unavailable.
