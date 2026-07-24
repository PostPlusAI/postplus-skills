# Shared Contract

Apply this before every Reddit search run.

## Request shape

The `reddit-search` collection request is a single raw input object:

```json
{
  "searchTerms": ["portable espresso maker"],
  "searchSort": "relevance",
  "searchTime": "year",
  "maxPostsCount": 20
}
```

- `searchTerms`: the search keywords. Use one keyword per request; keep the
  array to a single entry so scope and count stay attributable.
- `searchSort`: `relevance` (default choice for research), `hot`, `top`,
  `new`, or `comments`. `new` matches loosely against the newest posts and is
  usually noisy for research; prefer `relevance` or `top`.
- `searchTime`: `all`, `hour`, `day`, `week`, `month`, or `year`. Use `year`
  for opinion and product research unless the user wants all-time coverage.
- `maxPostsCount`: how many posts to return. Keep the first pass at 20 and
  expand only after inspecting the results.

Send the raw object. Never wrap it in a hosted envelope or a
`{ "schemaVersion": 1, "input": ... }` shape, and never add fields the request
does not define.

## Output normalization

Each returned item is a Reddit post record. Normalize every item to:

```json
{
  "title": "...",
  "post_url": "https://www.reddit.com/r/.../comments/...",
  "community": "IndiaCoffee",
  "score": 175,
  "comments_count": 112,
  "created_at": "2026-06-16T00:00:00.000Z",
  "snippet": "..."
}
```

- `title`: the post title.
- `post_url`: the post page URL (`postUrl` field); the dedup key.
- `community`: the subreddit name without the `r/` prefix
  (`parsedCommunityName`).
- `score`: the post score (`score`).
- `comments_count`: the comment count (`commentsCount`).
- `created_at`: the post creation time (`createdAt`).
- `snippet`: the first ~200 characters of the post body (`body`), or null for
  link/media posts without text.

Deduplicate by `post_url` and drop items that carry no post URL.

## First-pass discipline

- Run one bounded pass first, at 20 posts.
- Treat empty, unavailable, private, or sparse results as an evidence gap, not
  a reason to silently retry with a different request shape.
- Stop on hard errors and report the exact command error. Do not fabricate
  results and do not substitute an unsupported source.
