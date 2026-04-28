# TikTok Normalized Schema

Use this file when designing scripts that turn raw collection outputs into stable local artifacts.

## Top-Level Dataset Shape

```json
{
  "platform": "tiktok",
  "datasetType": "videos|profiles|user-search|comments|shop-creators|unknown",
  "collectionPath": "tiktok-scraper",
  "fetchedAt": "2026-03-26T12:00:00.000Z",
  "input": {},
  "itemCount": 0,
  "items": []
}
```

## Profile Record

```json
{
  "platform": "tiktok",
  "recordType": "profile",
  "profileId": "123",
  "username": "creatorname",
  "displayName": "Creator Name",
  "signature": "",
  "bioLink": "",
  "followersCount": 0,
  "followingCount": 0,
  "likesReceivedCount": 0,
  "videoCount": 0,
  "isVerified": false,
  "isPrivate": false,
  "isSeller": false,
  "profileUrl": "https://www.tiktok.com/@creatorname",
  "matchedQueries": [],
  "matchedHashtags": [],
  "matchedVideoUrls": [],
  "sourceEvidence": {
    "matchedContentCount": 0,
    "discoveryPaths": []
  }
}
```

## Video Record

```json
{
  "platform": "tiktok",
  "recordType": "video",
  "videoId": "123",
  "authorUsername": "creatorname",
  "authorDisplayName": "Creator Name",
  "text": "",
  "hashtags": [],
  "mentions": [],
  "sourceSurface": "search",
  "sourceQuery": "ai tools",
  "searchKeyword": "ai tools",
  "regionCode": "MY",
  "likeCount": 0,
  "commentCount": 0,
  "shareCount": 0,
  "viewCount": 0,
  "saveCount": null,
  "videoDurationSeconds": null,
  "musicId": "12345",
  "musicTitle": "original sound",
  "textLanguage": "en",
  "commentsDatasetUrl": null,
  "publishedAt": "2026-03-26T12:00:00.000Z",
  "videoUrl": "https://www.tiktok.com/@creatorname/video/123"
}
```

## Comment Record

```json
{
  "platform": "tiktok",
  "recordType": "comment",
  "commentId": "c1",
  "videoId": "123",
  "videoUrl": "https://www.tiktok.com/@creatorname/video/123",
  "authorUsername": "viewer",
  "sourceSurface": "comments",
  "sourceQuery": "https://www.tiktok.com/@creatorname/video/123",
  "regionCode": "MY",
  "text": "",
  "likeCount": 0,
  "replyCount": 0,
  "publishedAt": "2026-03-26T12:00:00.000Z"
}
```

## Shop Creator Record

```json
{
  "platform": "tiktok",
  "recordType": "shopCreator",
  "creatorId": "c1",
  "username": "creatorname",
  "displayName": "Creator Name",
  "followersCount": 0,
  "regionCode": "US",
  "gmv30d": null,
  "unitsSold30d": null,
  "productCount30d": null,
  "profileUrl": "https://www.tiktok.com/@creatorname"
}
```

## Derived Fields

Local analysis scripts may add:

- `engagementScore`
- `engagementRateApprox`
- `hookLine`
- `accountType`
- `creatorType`
- `topicRelevance`
- `hasContactSignal`
- `sourceSurface`
- `sourceQuery`
- `searchKeyword`
- `regionCode`
- `musicTitle`
- `isSponsored`
- `commerceSignals`
- `matchedQueries`
- `matchedHashtags`
- `matchedVideoUrls`
- `sourceEvidence`
- `graphEvidence`

Do not overwrite raw fields when adding derived fields. Append new keys instead.
