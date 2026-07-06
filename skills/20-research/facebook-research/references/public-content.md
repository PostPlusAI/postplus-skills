# Public Content

Use for source-grounded pulls from public Facebook pages, profiles, groups, or
posts.

## Align

Likely user needs:

- "Show me what this page/group is posting."
- "Summarize this post with evidence."
- "Pull public Facebook examples for this competitor."
- "Give me data I can inspect, not only a chat summary."

Ask only if there is no public source:

`Send a public Facebook page, group, or post URL to start.`

## Run

| Source | Source key | Input |
| --- | --- | --- |
| Page/profile posts | `facebook-profile-posts` | `1-5` page/profile URLs, `1-10` posts each |
| Group posts | `facebook-group-posts` | `1-3` public group URLs, `1-10` posts each |
| Direct post | `facebook-post-by-url` | `1-10` post URLs |

If the user gives multiple independent URLs, run them in parallel by source
type. Keep page/profile, group, and direct-post lanes as separate evidence
lanes.

Page metadata (followers, likes, category, website) is not on the released
public surface. If the decision needs it, say so, record it as a gap, and
continue only with post-level evidence.

## Read Fields

Use the post-level fields present in the result: source URL, text, date or
timestamp, public engagement counts (likes, comments, shares), media fields,
and page or group name. Do not invent fields the result does not contain.

## Output

Create `result.json` and `evidence.html`.

In chat, return source count, item count, strongest visible pattern, biggest
gap, and artifact paths.

## Stop

Stop for private profiles, hidden groups, login-only pages, member lists,
backend analytics, full archives, or requests for complete audience truth.
