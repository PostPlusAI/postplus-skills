# Search Routes

Use this reference for keyword discovery and public Reddit search URLs.

## Keyword requests

Use one phrase in `searchTerms` and enable exactly one result type per run:

| Goal | Search flags | Default bound |
| --- | --- | --- |
| Find posts | `searchPosts: true`, other search flags `false` | `relevance`, `year`, `maxPostsCount: 20` |
| Find comments | `searchComments: true`, other search flags `false` | `relevance`, `year`, `maxCommentsCount: 20` |
| Find communities | `searchCommunities: true`, other search flags `false` | `maxCommunitiesCount: 10` |

Example post discovery request:

```json
{
  "searchTerms": ["portable espresso maker"],
  "searchPosts": true,
  "searchComments": false,
  "searchCommunities": false,
  "searchSort": "relevance",
  "searchTime": "year",
  "maxPostsCount": 20,
  "includeNSFW": false
}
```

Use `top` when the user wants the most upvoted evidence, `new` for recency,
`comments` for discussion-rich posts, or `hot` for current momentum. Otherwise
keep `relevance`.

## Narrowing a search

- Set `withinCommunity` to a subreddit name for posts or comments inside one
  community.
- Set `onlyWithFlair` only when the user supplies a flair or asks for a
  clearly named flair category.
- For posts, use `postedAfter` and/or `postedBefore` for an exact date window.
- For comments, use `commentedAfter` and/or `commentedBefore`.
- When any exact date is used, omit `searchTime` rather than sending both.

Keep each keyword in its own request. If comparing `year` with `all`, preserve
the two passes as separate scopes before deduplication or synthesis.

## Public search URLs

Use `startUrls` with one `{ "url": "..." }` object for a supplied Reddit
search URL. Set `fastMode` to `true` for the default bounded pass. Set it to
`false` only when the user explicitly needs the collected list to match the
visible search page as closely as possible, because strict fidelity costs more.

Do not combine the search URL with `searchTerms` or another entry mode.
