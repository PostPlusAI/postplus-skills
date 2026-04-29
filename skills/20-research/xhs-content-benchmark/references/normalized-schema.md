# Normalized Schema

First-version normalized datasets for this skill use one post-level shape.

```json
{
  "platform": "xiaohongshu",
  "datasetType": "benchmark-posts",
  "collectionPath": "rednote-xiaohongshu-user-posts-scraper",
  "itemCount": 1,
  "items": [
    {
      "platform": "xiaohongshu",
      "recordType": "post",
      "noteId": "69cb6cd1000000001a022151",
      "noteUrl": "https://www.xiaohongshu.com/explore/69cb6cd1000000001a022151?...",
      "profileUrl": "https://www.xiaohongshu.com/user/profile/639946a0000000002702b173",
      "authorId": "639946a0000000002702b173",
      "authorName": "显眼包小涛",
      "title": "打工人的表演上班",
      "titleHook": "打工人的表演上班",
      "rawContentType": "video",
      "contentType": "video",
      "likeCount": 168,
      "commentCount": null,
      "collectCount": null,
      "shareCount": null,
      "pageCount": null,
      "coverUrl": "http://sns-webpic-qc.xhscdn.com/...",
      "coverWidth": 1516,
      "coverHeight": 2022,
      "coverAspectBucket": "portrait-standard",
      "sourceSurface": "profile",
      "sourceQuery": "https://www.xiaohongshu.com/user/profile/639946a0000000002702b173",
      "scrapedAt": "2026-04-09T11:06:15.494Z"
    }
  ]
}
```

## Notes

- `rawContentType` preserves the actor-native type
- `contentType` is normalized to:
  - `video`
  - `image`
  - `carousel`
  - `unknown`
- `pageCount` is nullable because some actor paths do not expose page counts
- `coverAspectBucket` is a lightweight summary for cover-shape analysis
- benchmark summaries should explicitly report how many items were missing `pageCount`
