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

| Source | Route | Input |
| --- | --- | --- |
| Page/profile posts | `facebook-profile-posts` | `1-5` page/profile URLs, `1-10` posts each |
| Group posts | `facebook-group-posts` | `1-3` public group URLs, `1-10` posts each |
| Direct post | `facebook-post-by-url` | `1-10` post URLs |

If the user gives multiple independent URLs, run them in parallel by source
type. Keep page/profile, group, and direct-post lanes as separate evidence
lanes.

This reference covers URL-led post collection. If the decision needs reels, comments,
richer page identity, or ad-library creative, route to `reels-and-video.md`,
`community-voice.md`, `partner-discovery.md`, or `ads-and-funnel.md` instead of
stretching a post sample.

## Read Fields

Read records from `output.items[]`, not a top-level `data` array. Preserve missing values as unavailable, never zero or false.

| Record | Read |
| --- | --- |
| Ordinary page/profile/direct post | `postId`, `url`, `text`, `time`, `user.id`, `user.name`, `user.profileUrl`, `likes`, `comments`, `shares`, `media[]` |
| Group post | `legacyId`, `url`, `text`, `time`, `user`, `likesCount`, `commentsCount`, `sharesCount`, `groupTitle`, `attachments[]` |
| Direct Reel | `message.text`, `creation_time` (Unix seconds), `short_form_video_context.shareable_url`, `short_form_video_context.video.id`, `short_form_video_context.video_owner` |

For ordinary posts, `likes` is the returned reaction aggregate; use `reactionLikeCount` for the specific Like reaction when present. Do not compare missing reaction counts as zero. Group `id` may be encoded: use `legacyId` for the post identity. A display name is not a username. `paidPartnership` is not a complete sponsorship determination.

For Reels, `post_id` is a post identity, not the video identity. Keep abbreviated share/play counts as display strings, not exact numbers. Media analysis should receive the original Reel URL; signed media URLs expire.

Group member counts, creation dates, categories and descriptions are unavailable from this post route. Page followers, biography and websites require a separate `facebook-pages` collection when the question needs them. Sponsorship and verification status are unknown unless explicitly evidenced. Do not automatically issue additional collections to fill gaps.

## Output

Create `result.json` and `evidence.html`.

In chat, return source count, item count, strongest visible pattern, biggest
gap, and artifact paths.

## Stop

Stop for private profiles, hidden groups, login-only pages, member lists,
backend analytics, full archives, or requests for complete audience truth.

## External Source Discovery

Use `web-search` only when external public links are needed to identify or corroborate a source. Results are in `output.items[].organicResults[]` with `title`, `url`, `description` and `position`; a dataset item is one distinct `searchQuery.term` / `searchQuery.page` pair, not a single link. A true `#error` flag is a failure, even if a row contains result-like fields. Duplicate query/page rows are a failed collection, not extra evidence; do not count or silently deduplicate them into a successful report. Count links separately and preserve missing descriptions. Search snippets are not Facebook posts or comments and cannot establish engagement or audience behavior.
