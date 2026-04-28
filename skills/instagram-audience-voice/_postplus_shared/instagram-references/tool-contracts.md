# Instagram Tool Contracts

These are the recommended local tools for an Instagram skill family. Keep the contracts stable even if the underlying actor changes.

## `run_instagram_actor`

Purpose:

- run one hosted collection actor
- save raw dataset locally

Input:

```json
{
  "collectionPath": "instagram/profile-scraper",
  "inputPath": "tmp/input.json",
  "outputPath": "tmp/raw.json"
}
```

Output:

```json
{
  "collectionPath": "instagram/profile-scraper",
  "itemCount": 12,
  "fetchedAt": "2026-03-19T12:00:00.000Z",
  "outputPath": "tmp/raw.json"
}
```

## `build_instagram_actor_input`

Purpose:

- compile a brief-shaped discovery or enrichment request into actor-specific input JSON

Input:

```json
{
  "briefPath": "tmp/brief.json",
  "collectionPath": "instagram/search-scraper",
  "outputPath": "tmp/input.json"
}
```

Output:

```json
{
  "collectionPath": "instagram/search-scraper",
  "outputPath": "tmp/input.json"
}
```

## `normalize_instagram_dataset`

Purpose:

- convert actor-specific output into a stable normalized dataset

Input:

```json
{
  "inputPath": "tmp/raw.json",
  "datasetType": "profiles",
  "collectionPath": "instagram/profile-scraper",
  "outputPath": "tmp/normalized.json"
}
```

Output:

```json
{
  "datasetType": "profiles",
  "itemCount": 12,
  "outputPath": "tmp/normalized.json"
}
```

## `extract_instagram_candidate_usernames`

Purpose:

- extract and dedupe candidate creators from normalized posts, reels, hashtag, or tagged datasets

Output:

```json
{
  "itemCount": 18,
  "usernames": ["creator_a", "creator_b"],
  "outputPath": "tmp/candidate-usernames.json"
}
```

## `rank_instagram_accounts`

Purpose:

- score profiles for creator discovery and competitor prioritization

Inputs may include:

- followers count
- recent post engagement
- posting cadence
- verified / category / business signals

Output:

```json
{
  "itemCount": 12,
  "topUsernames": ["creator_a", "creator_b"],
  "outputPath": "tmp/account-ranking.json"
}
```

## `rank_instagram_creators`

Purpose:

- score creator candidates using both profile data and content evidence
- return research pool plus shortlist for creator discovery

Inputs may include:

- profile fields
- recent post or Reel evidence
- matched content counts
- discovery path diversity
- public contact signals

Output:

```json
{
  "itemCount": 30,
  "shortlistCount": 12,
  "topUsernames": ["creator_a", "creator_b"],
  "outputPath": "tmp/creator-ranking.json"
}
```

## `rank_instagram_posts`

Purpose:

- rank posts or reels for benchmark shortlist creation

Inputs may include:

- likes
- comments
- views
- recency
- sponsored signal
- caption / hashtag relevance

Output:

```json
{
  "itemCount": 25,
  "shortlistCount": 8,
  "outputPath": "tmp/post-ranking.json"
}
```

## `cluster_instagram_comments`

Purpose:

- group comments into reusable audience-language buckets

Suggested buckets:

- praise
- objection
- question
- purchase-intent
- feature-request
- meme-or-low-signal

Output:

```json
{
  "itemCount": 240,
  "clusterCount": 6,
  "outputPath": "tmp/comment-clusters.json"
}
```

## `build_instagram_watchlist`

Purpose:

- maintain monitoring sets for usernames, hashtags, and tagged mentions

Output:

```json
{
  "watchlistType": "accounts|hashtags|tagged",
  "entityCount": 10,
  "outputPath": "tmp/watchlist.json"
}
```

## File Layout

Recommended local output layout:

```text
customers/<customer-id>/campaigns/<campaign-id>/instagram/
  raw/
  normalized/
  analysis/
  reports/
```

Keep raw collection outputs under `raw/` and normalized stable artifacts under `normalized/`.
