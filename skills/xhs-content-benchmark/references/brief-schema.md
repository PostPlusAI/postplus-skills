# Brief Schema

Use one small brief JSON before building actor input.

## Top-level shape

```json
{
  "task": "benchmark recent Xiaohongshu content from two competitor accounts",
  "profileUrls": [
    "https://www.xiaohongshu.com/user/profile/639946a0000000002702b173"
  ],
  "limit": 12,
  "themeKeywords": ["职场", "打工人"]
}
```

## Valid fields

- `task`: short description of the benchmark goal
- `profileUrls`: full Xiaohongshu profile URLs
- `profileIds`: raw profile ids that can be expanded into profile URLs
- `keywords`: explicit keyword or topic list for the experimental search route
- `limit`: target number of items
- `themeKeywords`: optional ranking hints only; not actor input

## Rules

- Provide either `profileUrls` / `profileIds` or `keywords`
- Do not provide both unless one is clearly the primary collection surface
- `limit` should be small for the account route
- `limit` must satisfy the active actor constraints for the search route

## Account route example

```json
{
  "task": "benchmark a competitor's recent post output",
  "profileIds": ["639946a0000000002702b173"],
  "limit": 10,
  "themeKeywords": ["职场", "办公室", "打工人"]
}
```

## Experimental keyword route example

```json
{
  "task": "benchmark keyword-level Xiaohongshu content around skincare",
  "keywords": ["护肤"],
  "limit": 100,
  "themeKeywords": ["成分", "护肤流程", "避坑"]
}
```
