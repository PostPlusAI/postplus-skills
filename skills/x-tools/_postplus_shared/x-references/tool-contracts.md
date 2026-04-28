# X Tool Contracts

These are the recommended local tools for an X skill family. Keep the contracts stable even if the underlying actor changes.

## `run_x_actor`

Purpose:

- run one hosted collection actor
- save raw dataset locally

Input:

```json
{
  "collectionPath": "tweet-scraper",
  "inputPath": "tmp/input.json",
  "outputPath": "tmp/raw.json"
}
```

Output:

```json
{
  "collectionPath": "tweet-scraper",
  "itemCount": 120,
  "fetchedAt": "2026-03-20T12:00:00.000Z",
  "outputPath": "tmp/raw.json"
}
```

## `normalize_x_dataset`

Purpose:

- convert actor-specific output into a stable normalized dataset

Input:

```json
{
  "inputPath": "tmp/raw.json",
  "datasetType": "tweets",
  "collectionPath": "tweet-scraper",
  "outputPath": "tmp/normalized.json"
}
```

Output:

```json
{
  "datasetType": "tweets",
  "itemCount": 120,
  "outputPath": "tmp/normalized.json"
}
```

## `rank_x_accounts`

Purpose:

- score profiles for creator discovery, competitor prioritization, and shortlist building

Output:

```json
{
  "itemCount": 25,
  "topUsernames": ["account_a", "account_b"],
  "outputPath": "tmp/account-ranking.json"
}
```

## `rank_x_posts`

Purpose:

- rank tweets for benchmark shortlist creation

Output:

```json
{
  "itemCount": 180,
  "shortlistCount": 20,
  "outputPath": "tmp/tweet-ranking.json"
}
```

## `build_x_audience_graph`

Purpose:

- convert follower / following / retweeter datasets into nodes and edges

Output:

```json
{
  "nodeCount": 75,
  "edgeCount": 210,
  "outputPath": "tmp/audience-graph.json"
}
```

## `cluster_x_bios_and_posts`

Purpose:

- group profile bios and tweet text into reusable audience-language buckets

Output:

```json
{
  "itemCount": 240,
  "clusterCount": 6,
  "outputPath": "tmp/language-clusters.json"
}
```

## File Layout

Recommended local output layout:

```text
customers/<customer-id>/campaigns/<campaign-id>/x/
  raw/
  normalized/
  analysis/
  reports/
```

Keep raw collection outputs under `raw/` and normalized stable artifacts under `normalized/`.
