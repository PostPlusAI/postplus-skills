# Community Voice

Use for public comments, objections, FAQs, buyer language, group discussion, and
qualitative audience voice.

## Align

Likely user needs:

- "What are people complaining about?"
- "What words do customers use?"
- "What objections should our copy answer?"
- "What questions keep showing up?"

Ask only when there is no discussion source:

`Send 1-10 public post or reel URLs, or 1-3 public group URLs, or a comment export.`

## Run

| Evidence need | Route | First pass |
| --- | --- | --- |
| Comments on public posts/reels | `facebook-comments` | `1-10` post/reel URLs, small comment bound |
| Public group discussion | `facebook-groups` | `1-3` group URLs, small post bound |

Run comments for multiple post URLs in parallel. Keep comment evidence and group
discussion as separate lanes.

## Read Fields

Use the fields present in the result: comment or post text, source URL, date,
public engagement counts, author display name, thread depth, and the parent
post or group name. Comment counts without comment text are not voice evidence.
Do not invent fields the result does not contain.

## Analyze

Group evidence into:

- repeated objections
- questions and FAQs
- desired outcomes
- pain language
- praise language
- content or offer ideas
- weak or noisy threads

## Group Sample Boundary

Group collection returns a chronological sample, not a server-side keyword search. Read `output.items[]`: `text`, `time`, `commentsCount`, `sharesCount`, `likesCount`, `groupTitle`, and `legacyId`. Group media is in `attachments[]`, not the ordinary-post `media[]` shape. Analyze relevant text within the returned sample and disclose that sample scope; do not claim exhaustive keyword coverage or treat post text as comments.

## Output

Create `result.json` and `evidence.html`.

Chat format:

- sources and comment/discussion count
- 5-10 voice bullets with evidence links
- copy and product implications
- weak areas
- artifact paths

## Stop

Stop for private comments, hidden groups, member lists, direct messages,
demographics, full sentiment claims, or login automation.
