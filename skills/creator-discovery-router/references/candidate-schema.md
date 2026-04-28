# Candidate Schema

Use this schema to normalize creator candidates across TikTok, Instagram, and X.

The goal is not to force all platforms into identical raw fields.
The goal is to produce a shared downstream candidate shape that can be ranked, filtered, and handed off.

## Design Rule

Keep two layers:

1. stable core fields
2. optional extension fields

Do not make the entire schema unstable from request to request.

## Stable Core

```json
{
  "platform": "tiktok",
  "username": "chat.with.kait",
  "displayName": "kait",
  "profileUrl": "https://www.tiktok.com/@chat.with.kait",
  "followersCount": 8387,
  "creatorType": "individual_creator",
  "route": "content-first",
  "topicFit": 0.86,
  "audienceFit": 0.74,
  "contactSignals": {
    "email": null,
    "website": null,
    "bioLink": null,
    "dmOpen": null
  },
  "sourceEvidence": {
    "matchedContentCount": 3,
    "topMatchedThemes": ["ai tools", "study workflow"],
    "notes": []
  }
}
```

## Field Definitions

- `platform`: `tiktok`, `instagram`, or `x`
- `username`: platform handle
- `displayName`: public display name
- `profileUrl`: canonical profile URL
- `followersCount`: latest known follower count
- `creatorType`: normalized account type
- `route`: which discovery route surfaced this candidate
- `topicFit`: normalized topical relevance score
- `audienceFit`: normalized audience relevance score
- `contactSignals`: public contact clues
- `sourceEvidence`: why this candidate was surfaced

## Suggested Creator Types

Use a stable, compact set:

- `individual_creator`
- `brand_product_account`
- `educator_consultant`
- `aggregator`
- `media_meme`
- `unknown`

## Optional Extensions

Add only when needed:

```json
{
  "geoFit": 0.65,
  "languageFit": 0.9,
  "engagementRateApprox": 0.034,
  "recentContentCount": 8,
  "postCadence": "weekly",
  "partnershipFit": 0.78,
  "brandSafetyNotes": [],
  "platformMetrics": {
    "likesReceivedCount": 572800,
    "videoCount": 270
  }
}
```

## Request-Specific Flexibility

Schema flexibility should come from optional fields, not from changing the core shape.

Examples:

- influencer outreach -> add `partnershipFit`
- audience research -> add `languageFit`, `geoFit`
- performance review -> add `engagementRateApprox`, `recentContentCount`

## Output Layers

When useful, produce multiple layers using the same schema:

- `research_pool`
- `expanded_pool`
- `outreach_ready_shortlist`

The field names should stay stable across those layers.

## Example

### TikTok candidate

```json
{
  "platform": "tiktok",
  "username": "dtechtron",
  "displayName": "Im Aamir.",
  "profileUrl": "https://www.tiktok.com/@dtechtron",
  "followersCount": 5894,
  "creatorType": "individual_creator",
  "route": "content-first",
  "topicFit": 0.92,
  "audienceFit": 0.8,
  "contactSignals": {
    "email": null,
    "website": null,
    "bioLink": null,
    "dmOpen": null
  },
  "sourceEvidence": {
    "matchedContentCount": 1,
    "topMatchedThemes": ["ai tools", "student tips"],
    "notes": ["bio explicitly mentions AI tools"]
  }
}
```

### Instagram candidate

```json
{
  "platform": "instagram",
  "username": "creator_name",
  "displayName": "Creator Name",
  "profileUrl": "https://www.instagram.com/creator_name/",
  "followersCount": 9100,
  "creatorType": "individual_creator",
  "route": "account-first",
  "topicFit": 0.77,
  "audienceFit": 0.68,
  "contactSignals": {
    "email": "hello@example.com",
    "website": "https://example.com",
    "bioLink": "https://linktr.ee/creator_name",
    "dmOpen": null
  },
  "sourceEvidence": {
    "matchedContentCount": 4,
    "topMatchedThemes": ["study apps", "productivity"],
    "notes": []
  }
}
```

### X candidate

```json
{
  "platform": "x",
  "username": "creator_handle",
  "displayName": "Creator Handle",
  "profileUrl": "https://x.com/creator_handle",
  "followersCount": 7300,
  "creatorType": "educator_consultant",
  "route": "graph-first",
  "topicFit": 0.71,
  "audienceFit": 0.66,
  "contactSignals": {
    "email": null,
    "website": "https://creator-site.com",
    "bioLink": "https://creator-site.com",
    "dmOpen": true
  },
  "sourceEvidence": {
    "matchedContentCount": 6,
    "topMatchedThemes": ["ai workflow", "research writing"],
    "notes": ["surfaced from seed audience overlap"]
  }
}
```
