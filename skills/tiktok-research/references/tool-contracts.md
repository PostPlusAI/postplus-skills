# TikTok Tool Contracts

These are the recommended local tools for the TikTok research skill. Keep the contracts stable even if the underlying actor changes.

## `collection_actor_run`

Purpose:

- run one hosted collection actor
- save raw dataset locally

Input:

```json
{
  "collectionPath": "tiktok/scraper",
  "inputPath": "tmp/input.json",
  "outputPath": "tmp/raw.json"
}
```

Output:

```json
{
  "collectionPath": "tiktok/scraper",
  "itemCount": 120,
  "fetchedAt": "2026-03-26T12:00:00.000Z",
  "outputPath": "tmp/raw.json"
}
```

## `normalize_tiktok_dataset`

Purpose:

- convert actor-specific output into a stable normalized dataset

Input:

```json
{
  "inputPath": "tmp/raw.json",
  "datasetType": "videos",
  "collectionPath": "tiktok/scraper",
  "outputPath": "tmp/normalized.json"
}
```

Output:

```json
{
  "datasetType": "videos",
  "itemCount": 120,
  "outputPath": "tmp/normalized.json"
}
```

## `rank_tiktok_accounts`

Purpose:

- score profiles for creator discovery and shortlist building
- combine profile fields with video-level evidence before sorting

Output:

```json
{
  "itemCount": 25,
  "topUsernames": ["creator_a", "creator_b"],
  "outputPath": "tmp/account-ranking.json"
}
```

## `expand_tiktok_creator_graph`

Purpose:

- expand from strong seed videos into related-video creators
- improve recall for `graph-first` or `mixed` creator discovery

Input:

```json
{
  "inputPath": "tmp/normalized-videos.json",
  "outputPath": "tmp/graph-expanded-raw.json",
  "top": 10,
  "resultsPerSeed": 6
}
```

Output:

```json
{
  "collectionPath": "tiktok/scraper",
  "itemCount": 60,
  "outputPath": "tmp/graph-expanded-raw.json"
}
```

## `analyze_tiktok_dataset`

Purpose:

- summarize recurring hashtags, hooks, authors, and structure patterns from normalized video or profile-search datasets

Output:

```json
{
  "itemCount": 120,
  "topHashtags": [],
  "topAuthors": [],
  "outputPath": "tmp/summary.json"
}
```

## File Layout

Recommended local output layout:

```text
customers/<customer-id>/campaigns/<campaign-id>/tiktok/
  raw/
  normalized/
  analysis/
  reports/
```

Keep raw collection outputs under `raw/` and normalized stable artifacts under `normalized/`.

## `build_tiktok_actor_input`

Purpose:

- compile a user- or brief-shaped request into the smallest valid actor input JSON
- keep actor-specific field naming out of upstream task logic

Input:

```json
{
  "briefPath": "tmp/brief.json",
  "outputPath": "tmp/actor-input.json",
  "collectionPath": "tiktok/scraper"
}
```

Example brief:

```json
{
  "task": "video-discovery",
  "hashtags": ["aitools", "productivity"],
  "queries": ["ai tools", "gmail workflow"],
  "limit": 20,
  "country": "MY",
  "sortType": "DATE_POSTED"
}
```

Output:

```json
{
  "collectionPath": "tiktok/scraper",
  "input": {
    "keywords": ["ai tools", "gmail workflow"],
    "startUrls": [
      "https://www.tiktok.com/tag/aitools",
      "https://www.tiktok.com/tag/productivity"
    ],
    "maxItems": 20,
    "location": "MY",
    "sortType": "DATE_POSTED"
  }
}
```
