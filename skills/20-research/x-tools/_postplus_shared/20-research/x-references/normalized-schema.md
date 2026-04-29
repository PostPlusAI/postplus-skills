# X Normalized Schema

Use this file when designing scripts that turn raw collection outputs into stable local artifacts.

## Top-Level Dataset Shape

```json
{
  "platform": "x",
  "datasetType": "tweets|profiles|followers|following|retweeters|unknown",
  "collectionPath": "tweet-scraper",
  "fetchedAt": "2026-03-20T12:00:00.000Z",
  "input": {},
  "itemCount": 0,
  "items": []
}
```

## Tweet Record

```json
{
  "platform": "x",
  "recordType": "tweet",
  "tweetId": "123",
  "conversationId": "123",
  "authorUsername": "brandname",
  "authorDisplayName": "Brand Name",
  "text": "",
  "lang": "en",
  "hashtags": [],
  "mentions": [],
  "urls": [],
  "likeCount": 0,
  "replyCount": 0,
  "retweetCount": 0,
  "quoteCount": 0,
  "bookmarkCount": null,
  "viewCount": null,
  "isRetweet": false,
  "isReply": false,
  "isQuote": false,
  "inReplyToUsername": null,
  "tweetUrl": "https://x.com/brandname/status/123",
  "publishedAt": "2026-03-20T12:00:00.000Z"
}
```

## Profile Record

```json
{
  "platform": "x",
  "recordType": "profile",
  "userId": "u1",
  "username": "brandname",
  "displayName": "Brand Name",
  "description": "",
  "location": "",
  "website": "",
  "followersCount": 0,
  "followingCount": 0,
  "statusesCount": 0,
  "favouritesCount": null,
  "listedCount": null,
  "mediaCount": null,
  "isVerified": false,
  "isBlueVerified": null,
  "canDm": null,
  "joinedAt": "2026-03-20T12:00:00.000Z",
  "profileUrl": "https://x.com/brandname"
}
```

## Relationship Record

```json
{
  "platform": "x",
  "recordType": "relationship",
  "relationshipType": "follower|following|retweeter",
  "sourceUsername": "competitor",
  "targetUsername": "user_a",
  "sourceUserId": null,
  "targetUserId": null,
  "tweetId": null,
  "capturedAt": "2026-03-20T12:00:00.000Z"
}
```

## Derived Fields

Local analysis scripts may add:

- `engagementScore`
- `engagementRateApprox`
- `accountType`
- `topicRelevance`
- `bioTheme`
- `tweetTheme`
- `graphDegree`
- `overlapCount`

Do not overwrite raw fields when adding derived fields. Append new keys instead.
