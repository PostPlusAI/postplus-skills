# Reddit Post Comments

Use this route for one or more selected public Reddit post URLs:

```bash
postplus research run reddit-post-comments --url "https://www.reddit.com/r/example/comments/example/post/" --limit 50 --wait --output result.json
```

For a guided audience-language deep-dive, first discover 20 relevant posts,
then select at most three threads using topical relevance, comment richness,
and community diversity. If the next pass exceeds the approved PostPlus credit
scope, show the proposed URLs and bound before proceeding.

Keep each thread attributable and preserve parent-child relationships. If a
post is deleted, private, unavailable, or empty, report that gap; never silently
replace it.
