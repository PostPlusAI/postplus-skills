# Search Routes

Use this reference for keyword discovery and public Reddit search URLs.

## Keyword requests

Use one phrase in `searchTerms` and enable exactly one discovery result type
per `reddit-search` run:

| Goal | Search flags | Default bound |
| --- | --- | --- |
| Find posts | `searchPosts: true`, other search flags `false` | `relevance`, `year`, `maxPostsCount: 20` |
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

- Set `withinCommunity` to a subreddit name for post discovery inside one
  community.
- Set `onlyWithFlair` only when the user supplies a flair or asks for a
  clearly named flair category.
- For posts, use `postedAfter` and/or `postedBefore` for an exact date window.
- When any exact date is used, omit `searchTime` rather than sending both.

Keep each keyword in its own request. If comparing `year` with `all`, preserve
the two passes as separate scopes before deduplication or synthesis.

## Quality recovery

Inspect the returned `dataType`, text, source URL, community, and date before
accepting the result.

- If keyword posts are empty or off-topic, first change only the query: shorten
  it to audience language, try one product/brand alias, or replace a formal term
  with the problem wording people use. A later pass may change one community,
  sort, or time window.
- For keyword comment evidence, do not use native comment-search flags. Search
  for relevant, discussion-rich posts, shortlist up to three posts using direct
  relevance, comment richness, and community diversity, then collect those
  threads with `reddit-post-comments`. If the discovery set is weak, change the
  query once before changing any other axis.
- If community discovery is noisy, verify candidates by public name,
  description, and URL before using them as `withinCommunity` seeds.

The initial collection plus at most two changed passes is the complete first
pass. Every additional provider request must remain inside the approved cost
bound. Accept a comments answer only when at least one relevant `comment` record
has inspectable body text and a parent post or source URL. Report that the
evidence came from selected thread traversal, not from an exhaustive
Reddit-wide comment index.

## Public search URLs

Use `startUrls` with one `{ "url": "..." }` object for a supplied Reddit
search URL. Set `fastMode` to `true` for the default bounded pass. Set it to
`false` only when the user explicitly needs the collected list to match the
visible search page as closely as possible, because strict fidelity costs more.

Do not combine the search URL with `searchTerms` or another entry mode.
