# Normalized Schema

This skill keeps the same post-level item shape as the shared XHS normalization layer, but the dataset type is `account-posts`.

```json
{
  "platform": "xiaohongshu",
  "datasetType": "account-posts",
  "collectionPath": "rednote-xiaohongshu-user-posts-scraper",
  "itemCount": 10,
  "items": [
    {
      "noteId": "69313f74000000001e009f94",
      "noteUrl": "https://www.xiaohongshu.com/explore/69313f74000000001e009f94?...",
      "profileUrl": "https://www.xiaohongshu.com/user/profile/639946a0000000002702b173",
      "authorId": "639946a0000000002702b173",
      "authorName": "显眼包小涛",
      "title": "打工人0帧起手当总裁",
      "contentType": "video",
      "likeCount": 8953,
      "coverUrl": "http://sns-webpic-qc.xhscdn.com/...",
      "coverAspectBucket": "portrait-standard"
    }
  ]
}
```

Account-level analysis then aggregates these rows into:

- one `account` record per `profileUrl` / `authorId`
- post-count sample size
- like summary stats
- repeated title pattern families
- content-type mix
- top note shortlist
- data-quality warnings
