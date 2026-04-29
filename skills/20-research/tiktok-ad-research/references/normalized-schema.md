# TikTok Ad Normalized Schema

Use this schema to turn actor-specific top-ad output into a stable local shape.

## Top-Level Dataset Shape

```json
{
  "platform": "tiktok",
  "datasetType": "ads",
  "collectionPath": "tiktok-creative-center-top-ads",
  "fetchedAt": "2026-03-29T12:00:00.000Z",
  "input": {},
  "itemCount": 0,
  "items": []
}
```

## Ad Record

```json
{
  "platform": "tiktok",
  "recordType": "ad",
  "adId": "7447454107521122322",
  "adTitle": "2025 New Year 50% OFF!",
  "brandName": "New Year Sale!",
  "objectiveKey": "campaign_objective_product_sales",
  "industryKey": "label_15100000000",
  "keywordList": ["50% off"],
  "regions": ["US", "MY"],
  "languages": [],
  "adFormat": null,
  "landingPageUrl": "https://example.com",
  "caption": "",
  "summary": "",
  "isSearchAd": false,
  "isSpotlight": false,
  "likeCount": 9925,
  "commentCount": 302,
  "shareCount": 58,
  "ctr": 0.03,
  "cvr": null,
  "cost": 2,
  "durationSeconds": 42.471,
  "coverUrl": "https://...",
  "videoUrl": "https://...",
  "keyframeMetrics": {},
  "source": {
    "collectionPath": "tiktok-creative-center-top-ads",
    "scrapedAt": "2026-03-29T12:00:00.000Z"
  }
}
```

## Derived Fields

Analysis may add:

- `hookLine`
- `offerSignal`
- `ctaSignal`
- `primaryRegion`
- `hasAnalytics`
- `hasKeyframeMetrics`

Keep raw source payload available under `raw` or recoverable from the original raw dataset.
