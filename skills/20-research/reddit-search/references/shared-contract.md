# Shared Contract

Apply this contract before every route.

## Choose exactly one route collection

Every request is one raw JSON object and uses exactly one route-owned collection:

| Collection key | Use for | Entry shape |
| --- | --- | --- |
| `reddit-search` | Keyword discovery, public search URLs, or ordinary subreddit feeds | `searchTerms` with one phrase, or `startUrls` with one `{ "url": "..." }` object |
| `reddit-post-comments` | Selected post threads | `postUrls` with one to three `{ "url": "..." }` objects |
| `reddit-subreddit-posts` | Bounded deep subreddit collection | `subreddits` with names or public subreddit URLs |
| `reddit-user-activity` | Explicitly requested public profiles | `usernames` with names or public profile URLs |

Never combine entry modes in one run. Send the raw object directly; never wrap
it in a hosted envelope or `{ "schemaVersion": 1, "input": ... }`.

When the user supplies multiple keywords, create one bounded request per
keyword. The requests may run in parallel, but preserve the keyword on every
result set so scope, cost, and evidence remain attributable.

## Public request controls

Use only controls required by the selected route:

- Discovery: `searchPosts`, `searchCommunities`, `withinCommunity`,
  `searchSort`, and `searchTime`.
- Exact windows: `postedAfter`, `postedBefore`, `commentedAfter`, and
  `commentedBefore` as `YYYY-MM-DD` dates.
- Content filters: `onlyWithFlair` and `includeNSFW`.
- Bounded output: use the route-owned maximums: `maxPostsCount`,
  `maxCommentsCount`, `maxCommentsPerPost`, or `maxCommunitiesCount`.
- Thread traversal belongs to `reddit-post-comments`; do not enable
  `crawlCommentsPerPost` on discovery or deep-subreddit requests.
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

For a hard command, contract, auth, network, typed provider, unavailable, or
private-surface error, report the error and stop. For a saved async checkpoint,
resume from the existing result file; do not launch a second run.

When a supported run completes but output is empty, sparse, noisy, off-topic, or
the wrong record type, apply `postplus-shared/references/research-quality-recovery.md`.
The initial request plus at most two changed passes form one bounded first pass.
Each changed pass must name the query, entity, route, community, sort, or time
axis it changes, remain inside the approved cost bound, and preserve separate
result files and attribution. Never rerun the same canonical request.

Accept the evidence only when at least one intended `dataType` record contains
inspectable fields and directly supports the user's question. Otherwise report
the attempted scopes and that evidence was exhausted within the bound.

For any price challenge, describe the quoted scope and wait for explicit user
confirmation before confirming or retrying.
