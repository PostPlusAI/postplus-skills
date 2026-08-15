# Shared Contract

Apply this contract before every route.

## Choose exactly one entry mode

Every request is one raw JSON object and uses exactly one of these entry modes:

| Entry mode | Use for | Shape |
| --- | --- | --- |
| `searchTerms` | Keyword discovery | Array containing one search phrase |
| `startUrls` | A post, profile, subreddit, or search page | Array of `{ "url": "..." }` objects |
| `subredditUrls` | A bounded deep subreddit collection | Array of subreddit names or public URLs |

Never combine entry modes in one run. Send the raw object directly; never wrap
it in a hosted envelope or `{ "schemaVersion": 1, "input": ... }`.

When the user supplies multiple keywords, create one bounded request per
keyword. The requests may run in parallel, but preserve the keyword on every
result set so scope, cost, and evidence remain attributable.

## Public request controls

Use only controls required by the selected route:

- Discovery: `searchPosts`, `searchComments`, `searchCommunities`,
  `withinCommunity`, `searchSort`, and `searchTime`.
- Exact windows: `postedAfter`, `postedBefore`, `commentedAfter`, and
  `commentedBefore` as `YYYY-MM-DD` dates.
- Content filters: `onlyWithFlair` and `includeNSFW`.
- Bounded output: `maxPostsCount`, `maxCommentsCount`,
  `maxCommentsPerPost`, and `maxCommunitiesCount`.
- Thread traversal: `crawlCommentsPerPost`.
- Search-page fidelity: `fastMode`, only for a search URL.

Do not add analysis, labelling, external-delivery, credential, or network
controls to public requests.

## Safety and cost bounds

- Set `includeNSFW` to `false` unless the user explicitly asks for adult
  content; only then set it to `true`.
- Every maximum is a non-negative integer. Zero deliberately disables that
  output type; a negative, fractional, or non-numeric value is invalid.
- Keep the first pass at the route default. Expand only after showing the user
  what the first pass found.
- If an absolute date is present, omit `searchTime`; the exact date window owns
  recency.
- Multiple terms, URLs, subreddits, or profiles must not silently multiply the
  agreed bound.

## Failure and continuation

Treat empty, unavailable, private, or sparse output as an evidence gap. Report
the exact scope and stop instead of changing routes or inventing evidence.

For a hard command error, report the error and stop. For a saved async
checkpoint, resume from the existing result file; do not launch a second run.

For any price challenge, describe the quoted scope and wait for explicit user
confirmation before confirming or retrying.
