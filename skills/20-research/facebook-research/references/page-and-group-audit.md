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

| Target | Route | Input |
| --- | --- | --- |
| Page/profile | `facebook-profile-posts` | `1-5` page/profile URLs, `5-10` posts each |
| Public group | `facebook-group-posts` | `1-3` group URLs, `5-10` posts each |

Run independent pages and groups in parallel.

This route audits from the recent-post collection sample. For page identity,
category, and activity beyond the post sample, add the `facebook-pages` route in
`partner-discovery.md`; for deeper discussion analysis, use `community-voice.md`. The `facebook-groups`
route and `facebook-group-posts` read the same collection, so do not count them as independent evidence. Keep page identity separate from post evidence.

## Judge

Score only from public post evidence:

- activity: recent dates, posting cadence in the sample
- clarity: repeated post topics and stated offers
- engagement: likes/comments/shares inside the sample
- creative: media, video posts, links, offers, calls to action
- group quality: discussion text, spam/noise ratio
- gaps: empty, stale, private, off-topic, or low-signal evidence

## Read Fields

Use `output.items[]` and the record-specific field table in [Public Content](public-content.md#read-fields). Exclude missing counts from comparisons; report unavailable fields explicitly. Group size, founding date and verification cannot be inferred from post activity.

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
