# Instagram Normalized Schema

Use this file when designing scripts that turn raw collection outputs into stable local artifacts.

## Top-Level Dataset Shape

```json
{
  "platform": "instagram",
  "datasetType": "profiles|posts|reels|comments|hashtags|tagged|followers-snapshots|search",
  "collectionPath": "instagram-profile-scraper",
  "fetchedAt": "2026-03-19T12:00:00.000Z",
  "input": {},
  "itemCount": 0,
  "items": []
}
```

## Profile Record

```json
{
  "platform": "instagram",
  "recordType": "profile",
  "profileId": "123",
  "username": "brandname",
  "fullName": "Brand Name",
  "biography": "",
  "website": "",
  "followersCount": 0,
  "followsCount": 0,
  "postsCount": 0,
  "isVerified": false,
  "category": null,
  "businessAddress": null,
  "profileUrl": "https://www.instagram.com/brandname/",
  "latestPosts": [],
  "contactSignals": {
    "email": null,
    "website": "",
    "bioLink": "",
    "dmOpen": null
  },
  "sourceEvidence": {
    "matchedContentCount": 0,
    "discoveryPaths": []
  }
}
```

## Post / Reel Record

```json
{
  "platform": "instagram",
  "recordType": "post",
  "contentType": "post|reel|carousel",
  "postId": "abc",
  "shortCode": "DEF123",
  "ownerUsername": "creator",
  "caption": "",
  "hashtags": [],
  "mentions": [],
  "likeCount": 0,
  "commentCount": 0,
  "viewCount": null,
  "videoDurationSeconds": null,
  "isSponsored": null,
  "coauthors": [],
  "publishedAt": "2026-03-19T12:00:00.000Z",
  "postUrl": "https://www.instagram.com/p/DEF123/",
  "media": [],
  "sourceSurface": "search|hashtag|tagged|profile|direct-url",
  "sourceQuery": null
}
```

## Comment Record

```json
{
  "platform": "instagram",
  "recordType": "comment",
  "commentId": "c1",
  "postId": "abc",
  "postUrl": "https://www.instagram.com/p/DEF123/",
  "ownerUsername": "viewer",
  "text": "",
  "likeCount": 0,
  "publishedAt": "2026-03-19T12:00:00.000Z",
  "replyCount": 0
}
```

## Hashtag Record

```json
{
  "platform": "instagram",
  "recordType": "hashtag",
  "hashtag": "skincare",
  "relatedHashtags": [],
  "postCount": null,
  "topPosts": [],
  "recentPosts": []
}
```

## Tagged / Mention Record

```json
{
  "platform": "instagram",
  "recordType": "tagged",
  "targetUsername": "brandname",
  "ownerUsername": "creator",
  "postId": "abc",
  "postUrl": "https://www.instagram.com/p/DEF123/",
  "caption": "",
  "hashtags": [],
  "mentions": [],
  "likeCount": 0,
  "commentCount": 0,
  "publishedAt": "2026-03-19T12:00:00.000Z"
}
```

## Followers Snapshot Record

```json
{
  "platform": "instagram",
  "recordType": "followersSnapshot",
  "username": "creator",
  "followersCount": 0,
  "capturedAt": "2026-03-19T12:00:00.000Z"
}
```

## Derived Fields

Local analysis scripts may add:

- `engagementRateApprox`
- `hasVideo`
- `postingCadenceBucket`
- `creatorType`
- `contentPillar`
- `commentTheme`
- `sentiment`
- `purchaseIntentSignal`
- `topicFit`
- `audienceFit`
- `contactSignals`
- `sourceEvidence`
- `graphEvidence`
- `sourceSurface`
- `sourceQuery`

Do not overwrite raw fields when adding derived fields. Append new keys instead.
