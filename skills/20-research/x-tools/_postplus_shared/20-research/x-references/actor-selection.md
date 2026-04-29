# X Actor Selection

Use this file when choosing which hosted collection actor to run for an X workflow.

## Backbone Actors

### `tweet-scraper`

Use for:

- keyword or advanced-search queries
- brand, product, and competitor listening
- hashtag, mention, or account-content sampling
- building a tweet corpus for hook and framing analysis

Why it is primary:

- strongest fit for search-driven collection
- supports advanced search syntax
- handles topic listening and tweet ranking well

Avoid using it for:

- tiny single-tweet tasks
- profile-only tasks
- follower graph tasks

### `twitter-user-scraper`

Use for:

- profile snapshots
- followers
- following
- retweeters
- user-centric graph collection

Why it is primary:

- strongest fit for account and relationship data
- should be the main source for user-level datasets

Avoid using it for:

- broad topic listening when search syntax matters more

## Enrichment / Fallback

### `premium-x-follower-scraper-following-data`

Use for:

- large follower or following enrichment
- cheaper shortlist expansion
- bio, location, professional-account, and email clues

Treat this as:

- enrichment actor
- not the main platform backbone

### `twitter-profile-scraper`

Use for:

- fallback deep profile fetches
- timeline, replies, favorites, and heavier profile detail
- cases where the main user actor does not return enough content context

Treat this as:

- fallback actor
- not the default first choice

## Actors Not In MVP

Do not build the first X skill family around these:

- `curious_coder/twitter-scraper`
- `danek/twitter-profile`

Reason:

- weaker fit, lower confidence, or unnecessary overlap with the primary chain

## Routing Summary

- topic listening -> `tweet-scraper`
- account snapshot -> `twitter-user-scraper`
- follower / following graph -> `twitter-user-scraper`
- follower enrichment -> `premium-x-follower-scraper-following-data`
- deep profile fallback -> `twitter-profile-scraper`
