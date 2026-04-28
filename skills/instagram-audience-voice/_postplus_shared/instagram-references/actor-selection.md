# Instagram Actor Selection

Use this file when choosing which collection actor should power an Instagram workflow.

## Default Rule

Start from the narrowest actor that matches the task. Only fall back to `instagram-scraper` when:

- the task spans multiple Instagram object types
- the narrow actor is missing a needed field
- the user wants a quick first pass before deeper collection

## Actors

### `instagram-search-scraper`

Use for:

- creator discovery from Instagram search surfaces
- first-pass username or hashtag recall
- query-led exploration before deeper content or profile enrichment

This is the preferred first pass when the workflow starts from search intent rather than known usernames.

### `instagram-profile-scraper`

Use for:

- profile lookup
- creator shortlist building
- competitor account snapshots
- bio, website, counts, latest posts

Do not use it as the only source for deeper post-level analysis.

### `instagram-post-scraper`

Use for:

- post and feed analysis
- caption, hashtags, mentions, likes, comments
- sponsored and collaboration signal extraction

Prefer this over the generic scraper when the unit of analysis is the post.

### `instagram-reel-scraper`

Use for:

- Reel benchmark discovery
- Reel metadata collection
- short-form content comparison

Use this when the user clearly cares about Reels rather than generic posts.

### `instagram-comment-scraper`

Use for:

- comment mining
- audience language
- objections, praise, purchase intent, FAQs

Run this only after a promising shortlist of posts exists.

### `instagram-tagged-scraper`

Use for:

- finding tagged posts and mentions around a username
- UGC and brand mention collection
- creator partnership scouting

This is the best fit when the object of interest is "who is tagging or mentioning this account".

### `instagram-hashtag-analytics-scraper`

Use for:

- hashtag opportunity research
- related hashtag graph building
- campaign tag monitoring

This is not enough by itself for content judgment. Pair it with post-level scraping when needed.

### `instagram-hashtag-scraper`

Use for:

- collecting posts or Reels under one or more hashtags
- content-first creator discovery from hashtag surfaces
- hashtag-led benchmark pools

Prefer this over pure hashtag analytics when the user needs actual content and authors, not just hashtag metadata.

### `instagram-followers-count-scraper`

Use for:

- lightweight watchlists
- follower count snapshots over time
- growth alerts

This is a monitoring actor, not a deep research actor.

### `instagram-scraper`

Use for:

- generic first-pass exploration
- one-off mixed scraping needs
- fallback when the user is vague

If the workflow becomes repetitive, switch to narrower actors and normalize the output.

### `instagram-profile-scraper-api`

Use for:

- richer profile enrichment fallback
- related profiles and external URL enrichment
- cases where the default profile actor is missing needed profile fields

Use this as a supplement, not the default first pass.

### `instagram-email-scraper`

Use for:

- public email lead enrichment
- outreach preparation on a narrowed creator shortlist

Do not use this as the first-step discovery actor.

### `quick-instagram-posts-checker`

Do not build new workflows around this actor.

Reason:

- deprecated / unstable as a long-term foundation

## Cost Discipline

Start small:

- 3-8 search queries or hashtags for discovery
- 5-15 profiles for account research
- 10-30 posts or reels for benchmarking
- comments only on shortlisted posts
- follower watchlists on a small stable set of accounts

Avoid broad market collection before ranking and filtering.

## Discovery Rule

For creator discovery, do not default to profile lookup only when the brief includes:

- follower bands
- recent activity
- content-fit constraints
- audience-fit constraints

Prefer this order:

1. collect matching search / hashtag / tagged / post surfaces
2. extract candidate authors
3. enrich profiles
4. optionally enrich recent content
5. rank creators with content evidence
