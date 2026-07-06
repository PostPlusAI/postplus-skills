# Page And Group Audit

Use when the user wants to decide what to fix, copy, monitor, or ignore on a
Facebook page, competitor page, profile, or public group.

## Align

Likely user needs:

- "Is this page alive and useful?"
- "What is the competitor doing better?"
- "Does this group show real demand or just noise?"
- "What should we change next?"

Ask only if the source is missing:

`Which 1-5 public pages or 1-3 public groups should I audit first?`

## Run

| Target | Source key | Input |
| --- | --- | --- |
| Page/profile | `facebook-profile-posts` | `1-5` page/profile URLs, `5-10` posts each |
| Public group | `facebook-group-posts` | `1-3` group URLs, `5-10` posts each |

Run independent pages and groups in parallel.

The audit works from the recent-post sample only. Page metadata (followers,
category, website, ad status) is not on the released public surface; record it
as a gap instead of collecting it another way.

## Judge

Score only from public post evidence:

- activity: recent dates, posting cadence in the sample
- clarity: repeated post topics and stated offers
- engagement: likes/comments/shares inside the sample
- creative: media, video posts, links, offers, calls to action
- group quality: discussion text, spam/noise ratio
- gaps: empty, stale, private, off-topic, or low-signal evidence

## Output

Create `result.json` and `evidence.html`.

Chat format:

- audit target and sources
- what looks healthy
- what looks weak
- 3 concrete next actions
- unsupported claims
- artifact paths

## Stop

Stop for Page Insights, admin-only group analytics, hidden members, follower
exports, demographics, reach, or conversion.
