# Public Profile Route

Use this route only when the user explicitly asks to examine a named public
Reddit profile or supplies its public URL.

## Default request

Use one profile URL in `startUrls`. Bound the first pass to 20 posts and 20
comments:

```json
{
  "startUrls": [{ "url": "https://www.reddit.com/user/example/" }],
  "maxPostsCount": 20,
  "maxCommentsCount": 20,
  "includeNSFW": false
}
```

Apply `postedAfter`/`postedBefore` to posts and
`commentedAfter`/`commentedBefore` to comments when the user supplies exact
dates. Keep post and comment counts separate in the report.

When the user says "recent" without an exact date, keep the 20-post and
20-comment bounds, present each type newest first by its returned creation
time, and report the actual earliest and latest dates found. Do not invent a
fixed time window or describe the sample as a complete activity history.

## Privacy boundary

Return only the public profile, public posts, and public comments present in
the collected result. Do not infer a real identity, enrich private details,
recover deleted activity, suggest personal outreach, or combine the profile
with unrelated personal-data sources.

If the profile is unavailable, private, suspended, or empty, report the exact
evidence gap and stop. Do not broaden to similarly named accounts.
