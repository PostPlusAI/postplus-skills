# Manifest Schema

```json
{
  "platform": "xiaohongshu",
  "assetCount": 1,
  "assets": [
    {
      "assetId": "69313f74000000001e009f94-cover",
      "assetType": "image",
      "assetRole": "cover",
      "noteId": "69313f74000000001e009f94",
      "noteUrl": "https://www.xiaohongshu.com/explore/69313f74000000001e009f94?...",
      "remoteUrl": "http://sns-webpic-qc.xhscdn.com/...",
      "relativePath": "covers/69313f74000000001e009f94-cover.webp",
      "downloadStatus": "pending"
    }
  ]
}
```

The download report then adds:

- `localPath`
- `httpStatus`
- `downloadStatus`
- `byteSize`

The released collector only emits `assetType: "image"` with
`assetRole: "cover"`. Video assets and arbitrary non-cover note images are
outside the supported manifest contract.
