# Creator Discovery Brief Schema

Use this schema to normalize creator-discovery requests before choosing a route.

```json
{
  "platforms": ["tiktok", "instagram"],
  "discoveryMode": "auto",
  "topic": ["ai tools", "productivity"],
  "audience": ["overseas students"],
  "recallRange": {
    "min": 3000,
    "max": 15000
  },
  "followerRange": {
    "min": 5000,
    "max": 10000
  },
  "geo": ["global"],
  "language": ["en"],
  "creatorType": ["individual creator"],
  "mustHave": ["recent activity"],
  "exclude": ["aggregator", "agency", "store"],
  "goal": "partnership shortlist"
}
```

## Field Notes

- `platforms`: one or more target platforms
- `discoveryMode`: `auto`, `handle-first`, `content-first`, `graph-first`, or `mixed`
- `topic`: what the creator actually talks about
- `audience`: who the creator reaches
- `recallRange`: wider collection band for noisy discovery
- `followerRange`: preferred creator size band
- `geo`: geography or market focus
- `language`: content language
- `creatorType`: individual creator, educator, meme page, brand account, founder, agency, etc.
- `mustHave`: hard requirements
- `exclude`: filters that should remove candidates
- `goal`: discovery, benchmarking, outreach, watchlist, etc.

## Normalization Rule

When the user gives loose wording, rewrite it into this structure before picking a route.

Example:

`Find AI tools creators with 5k-10k followers, preferably covering overseas students`

becomes:

```json
{
  "platforms": ["tiktok"],
  "discoveryMode": "auto",
  "topic": ["ai tools"],
  "audience": ["overseas students"],
  "recallRange": {
    "min": 3000,
    "max": 15000
  },
  "followerRange": {
    "min": 5000,
    "max": 10000
  },
  "creatorType": ["individual creator"],
  "mustHave": ["recent activity"],
  "exclude": ["aggregator", "store"],
  "goal": "partnership shortlist"
}
```

## Default Normalization Rule

If the user gives only one target follower band, infer:

- `recallRange`: wider band for collection
- `followerRange`: tighter band for shortlist

Suggested default:

- target `5k-10k` -> recall `3k-15k`

If the user does not specify creator type, default to:

- `creatorType`: `individual creator`

Then treat `brand/product`, `educator/consultant`, and `aggregator` as types to classify and optionally exclude.
