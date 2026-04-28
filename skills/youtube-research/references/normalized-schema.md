# Normalized Schema

Use one normalized item per public post or video collected through hosted content collection.

```json
{
  "platform": "youtube",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "postId": "dQw4w9WgXcQ",
  "author": "Rick Astley",
  "authorUrl": "https://www.youtube.com/@RickAstleyYT",
  "publishedAt": "2009-10-25T06:57:33.000Z",
  "title": "Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)",
  "text": "The official video for ...",
  "media": {
    "images": [
      "https://i.ytimg.com/vi_webp/dQw4w9WgXcQ/maxresdefault.webp"
    ],
    "videos": [
      "https://rr1---sn-...googlevideo.com/videoplayback?... "
    ]
  },
  "metrics": {
    "likes": 18914129,
    "comments": null,
    "shares": null,
    "views": 1759335794
  },
  "source": {
    "collectedAt": "2026-04-05T10:29:21.000Z",
    "rawPlatform": "youtube"
  }
}
```

Facebook items follow the same top-level contract:

```json
{
  "platform": "facebook",
  "url": "https://www.facebook.com/openai/videos/123/",
  "postId": "123",
  "author": "OpenAI",
  "authorUrl": "https://www.facebook.com/openai",
  "publishedAt": "2026-03-18T17:07:57.000Z",
  "title": null,
  "text": "Up for a challenge? ...",
  "media": {
    "images": [
      "https://...thumbnail.jpg"
    ],
    "videos": [
      "https://...video.mp4"
    ]
  },
  "metrics": {
    "likes": 435,
    "comments": 83,
    "shares": 22,
    "views": 12297
  },
  "source": {
    "collectedAt": "2026-04-05T15:15:49.966Z",
    "rawPlatform": "facebook"
  }
}
```

## Rules

- `platform`
  - one of `linkedin`, `youtube`, or `facebook`
- `url`
  - canonical public URL when available
- `postId`
  - stable provider post or video identifier
- `author`
  - public-facing author or channel name
- `authorUrl`
  - public-facing profile or channel URL when available
- `publishedAt`
  - ISO timestamp string when available
- `title`
  - use the platform title or headline field
- `text`
  - use the main body text or description

## Media

- `media.images`
  - image URLs only
- `media.videos`
  - video URLs only

Do not assume media URLs are stable long-term assets.

## Metrics

Keep missing or unsupported metrics as `null`.

- `likes`
- `comments`
- `shares`
- `views`

Do not synthesize `views` for LinkedIn if the collection service does not expose it.

## Source

- `collectedAt`
  - collection timestamp from the provider item when available, otherwise local collection time
- `rawPlatform`
  - source platform label preserved from the raw item
