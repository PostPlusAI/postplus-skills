# Result Shapes

The result file is the source record. Keep every complete raw item there.
Normalize only the user-facing projection and preserve its source URL.

## Classification and deduplication

Classify each item by `dataType`: `post`, `comment`, `community`, or
`user_profile`. Deduplicate primarily by `dataType + id`; for posts collected
across separate passes, also treat the canonical post URL as the same post.
Never merge different result types merely because their identifiers match.

## User-facing projections

| Type | Present these fields |
| --- | --- |
| `post` | Title/body or snippet, author, canonical URL, community, created time, score, comment count, flair, and media metadata without downloading media |
| `comment` | Body, author, created time, score, post title/URL, community, parent comment, depth, and whether the author is the original poster |
| `community` | Name, title, public URL, description, member count, rules, content restrictions, public status, and adult-content status |
| `user_profile` | Username, public URL, karma totals, public bio, account creation time, and available public profile metadata |

Use null for an unavailable optional value; never guess. Preserve ISO time
values. Keep parent identifiers and depth on comments so conversation order can
be reconstructed.

## Chat response

The chat response contains only:

1. the request scope and date/filter bounds;
2. counts by result type after deduplication;
3. representative evidence with source links;
4. material gaps or limits; and
5. one useful next action.

Do not paste the raw dataset into chat. Do not describe an empty, unavailable,
private, or bounded result as comprehensive evidence.
