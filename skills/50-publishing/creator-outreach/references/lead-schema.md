# Creator Outreach Lead Schema

Use this schema for cross-platform creator discovery and outreach work.

Keep the schema compact.
Do not try to encode every possible platform detail at the top level.

## Lead Record

```json
{
  "platform": "tiktok",
  "username": "setups_ai",
  "displayName": "SetupsAI",
  "profileUrl": "https://www.tiktok.com/@setups_ai",
  "bio": "Daily tech and AI tips",
  "website": "https://solo.to/setupsai",
  "route": "content-first",
  "creatorType": "individual_creator",
  "accountType": "creator",
  "topicFit": 0.86,
  "audienceFit": 0.74,
  "geoFit": null,
  "languageFit": null,
  "engagementRateApprox": 0.041,
  "engagementVolumeApprox": 5200,
  "recentContentCount": 8,
  "marketFitHints": [
    "english-language posts",
    "repeated US-market references"
  ],
  "languageFitHints": [],
  "styleFitNotes": [
    "direct response UGC tone"
  ],
  "manualChecks": [
    "manual check required: market fit"
  ],
  "sourceEvidence": {
    "matchedContentCount": 3,
    "topMatchedThemes": ["ai tools", "workflow"],
    "notes": ["surfaced from content-first discovery"]
  },
  "competitorEvidence": null,
  "commentIntentSummary": {
    "high_intent_positive": 6,
    "question_or_info_request": 9,
    "objection_or_risk": 1
  },
  "shopSignals": null,
  "platformMetrics": {
    "likesReceivedCount": 572800,
    "videoCount": 270
  },
  "recommendation": "strong_yes",
  "whyContact": [
    "content is tightly aligned with AI productivity",
    "audience scale is strong"
  ],
  "whyNotPriority": [],
  "suggestedUseCase": "content_collab",
  "contactability": "email",
  "contactEmail": "setupsaitony@gmail.com",
  "contactEmailSource": "bio",
  "contactSignals": [
    {
      "type": "email",
      "value": "setupsaitony@gmail.com",
      "source": "bio"
    },
    {
      "type": "website",
      "value": "https://solo.to/setupsai",
      "source": "profile"
    }
  ],
  "followersCount": 1600000,
  "suggestedAngle": "Lead with AI productivity and workflow use cases, not generic brand partnership language.",
  "outreachReady": true,
  "fitScore": 82,
  "fitReasons": [
    "strong audience scale",
    "explicit topic fit evidence",
    "public email is available"
  ],
  "evidenceGaps": [
    "manual check required: market fit"
  ],
  "outreachStatus": "new",
  "draftSubject": null,
  "draftBody": null,
  "lastContactedAt": null,
  "source": {
    "inputPaths": ["<work-folder>/.postplus/tiktok-candidates.json"],
    "sourceIds": ["tiktok-profiles"],
    "sourceUrls": ["https://www.tiktok.com/@setups_ai"],
    "scrapedAt": ["2026-03-27T12:00:00.000Z"]
  }
}
```

## Supported Input Shapes

The lead builder should accept:

- normalized profile datasets from platform skills
- candidate-style datasets with fields such as `route`, `topicFit`, `audienceFit`, and `sourceEvidence`
- ranked account outputs when they contain useful evidence such as engagement proxies or recent-content counts

This keeps outreach prep compatible with:

- `creator-outreach`
- `creator-discovery-router`
- platform ranking outputs

## Stable Core

Keep these fields stable:

- `platform`
- `username`
- `displayName`
- `profileUrl`
- `bio`
- `website`
- `route`
- `creatorType`
- `followersCount`
- `contactSignals`
- `sourceEvidence`
- `fitScore`
- `recommendation`

## Optional Evidence Fields

Only include when available:

- `topicFit`
- `audienceFit`
- `geoFit`
- `languageFit`
- `engagementRateApprox`
- `engagementVolumeApprox`
- `recentContentCount`
- `marketFitHints`
- `languageFitHints`
- `styleFitNotes`
- `manualChecks`
- `competitorEvidence`
- `commentIntentSummary`
- `shopSignals`
- `platformMetrics`
- `evidenceGaps`

## Normalization Rules

- `bio`
  - TikTok: `signature`
  - Instagram: `biography`
  - X: `description`
- `website`
  - TikTok: `bioLink`
  - Instagram: `website`
  - X: `website`
- `followersCount`
  - use the normalized profile field from each platform skill
- `creatorType`
  - prefer upstream normalized creator type
  - otherwise map from `accountType`
  - otherwise infer from bio keywords
- `route`
  - preserve the upstream discovery route if available

## Contact Signal Rules

Only store contact data that is explicitly visible in public data:

- emails from bio / signature / description
- websites or link-in-bio URLs
- public contact pages

Do not guess email addresses.

## Evidence Rules

- `sourceEvidence` should explain why this lead exists in the pool
- `commentIntentSummary` should only be present if comments were actually collected upstream
- `competitorEvidence` should only be present if there is explicit competitor adjacency evidence
- `geoFit` and `languageFit` are hints, not guarantees, unless the upstream dataset provides stronger proof

## Outreach Status Values

- `new`
- `reviewed`
- `drafted`
- `queued`
- `sent`
- `replied`
- `skip`

## Recommendation Values

- `strong_yes`
- `maybe`
- `not_now`

## Contactability Values

- `email`
- `link_only`
- `dm_possible`
- `no_public_contact`
