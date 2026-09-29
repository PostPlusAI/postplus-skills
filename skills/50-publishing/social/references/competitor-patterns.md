# Competitor patterns

Use public content to understand a market conversation and generate tests for
the user's own voice. A popular post proves that a visible sample received
interaction, not that it generated revenue or that its format will work for
the user.

Choose a small, relevant comparison set by audience overlap, product category,
and the time period the user cares about. Keep each source URL, date, account,
format, opening promise, proof, call to action, and visible response. Preserve
weak or contrary examples too; selecting only top posts exaggerates a pattern.
When creators differ greatly in audience size, do not rank them by raw likes
alone. Say when follower counts, impressions, or actual conversion data are
unknown.

For a public Instagram account, use its existing research route after checking
`postplus research run instagram-posts --help`; a typical bounded request uses
`--handle <actual handle> --limit 20 --wait --output instagram-posts.json`.
For a supplied Facebook Page URL, use `facebook-profile-posts --url <real URL>
--limit 20`. For a supplied TikTok account, use `tiktok-profiles --handle`
to confirm identity before sampling actual videos. For a supplied YouTube
channel, use the `youtube-channel-summary` or `youtube-videos` route as needed.
Each request may cost credits; reuse existing user material where adequate.
If the particular public source lacks a supported route, a browser or a
user-supplied export may provide a bounded sample with an explicit coverage
limit. Do not use the user's connected account tool as a general competitor
scraper.

Cluster observations by the audience question and the mechanism of the post:
what promise made a reader stop, what evidence paid it off, and what action was
invited. Convert each plausible pattern into a hypothesis for the user's own
content, with a claim or example only the user can credibly make. Do not copy
another creator's prose, images, testimonials, or performance claims. Report
sample size, selection method, exceptions, and what an experiment would need
to measure.
