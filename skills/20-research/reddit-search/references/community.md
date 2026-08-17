# Community Routes

Use this reference for a subreddit-specific search, ordinary feed, metadata,
or bounded deep community collection. These are different scopes.

## Community-local search

For a topic inside one subreddit, use `reddit-search` with `searchTerms` and
`withinCommunity`, using the normal 20-post discovery default. Keep comment
traversal off. When the user asks for comment evidence, select relevant posts
from this discovery pass and use `reddit-post-comments`.

## Ordinary feed

For a supplied subreddit URL or name, use one `startUrls` object. Return at
most 20 posts and keep `crawlCommentsPerPost: false`.

```json
{
  "startUrls": [{ "url": "https://www.reddit.com/r/example/" }],
  "maxPostsCount": 20,
  "crawlCommentsPerPost": false,
  "includeNSFW": false
}
```

For metadata only, use the same URL with all post and comment maximums set to
zero. Return the public description, member count, rules, and public status.

## Deep community collection

Use `reddit-subreddit-posts` with `subreddits`, never `startUrls`, when the user
explicitly asks for a complete, historical, or deep subreddit pass. A deep
request must have either an exact date range or a maximum post count.

If neither is supplied, ask the one scope question from the main skill. When
the user delegates the choice, default to posts from the most recent year and
at most 100 posts. Express the rolling year as an exact `postedAfter` date at
run time; do not also send `searchTime`.

Keep `crawlCommentsPerPost: false` for the community pass. If comments are
needed afterward, use a separate `reddit-post-comments` pass over a small set
of representative threads. Never multiply the community bound by automatically
crawling every thread.

```json
{
  "subreddits": ["SaaS"],
  "postedAfter": "2026-01-01",
  "maxPostsCount": 100,
  "crawlCommentsPerPost": false,
  "includeNSFW": false
}
```
