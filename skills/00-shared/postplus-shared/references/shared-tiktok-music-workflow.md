# Shared TikTok Music Workflow

Shared routing and chaining rules for TikTok music, sound, and audio-reference
work on the released public surface.

## Core Rule

Classify the request by the object the user already has:

- `No specific sound yet`: find candidates first with `tiktok-research`
- `Music URL / sound URL / musicId / song keyword`: use `tiktok-research`
  when the released TikTok collection path can produce sample video URLs; if it
  cannot, ask the user for selected video URLs or an existing sample dataset
- `Wants the videos or audio downloaded`: video/audio archive download and
  audio extraction are not provided on the current public surface. Say so and
  stop that lane; do not improvise a downloader, proxy, or cookie path
- `Local video or audio files`: route through `media-router` into
  transcription, subtitles, or `video-analysis`

Do not treat any obtained audio as commercially cleared unless the user
confirms rights or platform-licensed use.

## Skill Chain

Use this default chain for TikTok music research:

1. `tiktok-research`: discover candidate sounds by region, category, or campaign fit.
2. `tiktok-research`: collect or normalize selected video
   samples when the released collection path supports the request.
3. Stop at sample video URLs. Downloading those videos or extracting reference
   audio is not provided on the current public surface; hand the URL list to
   the user.
4. `video-analysis`: analyze structure, hook, pacing, visual pattern, and usage
   context for videos the user provides as local files.
5. `audio-transcription` or `video-transcription`: transcribe lyrics, speech, or
   voiceover from user-provided files when needed.
6. `subtitle-packager`: produce SRT/ASS only after timed transcript artifacts exist.

Skip steps when the user already provides the corresponding artifact.

## Collection Boundary

The released public surface does not expose a separate TikTok music-sound
collector and does not expose a music/archive downloader. Keep music-specific
collection claims inside `tiktok-research` only when the released collection
key supports the exact request. Steps that need local media files require the
user to supply those files.

## Output Contracts

### Music Candidate

Use for trend discovery outputs:

```json
{
  "platform": "tiktok",
  "recordType": "musicCandidate",
  "musicId": "",
  "musicTitle": "",
  "musicAuthor": "",
  "musicUrl": "",
  "regionCode": "",
  "rank": null,
  "trendReason": "",
  "sampleVideoUrls": [],
  "sourceCollectionPath": "",
  "fetchedAt": ""
}
```

### Music Video Sample

Use for sound collection outputs:

```json
{
  "platform": "tiktok",
  "recordType": "musicVideoSample",
  "videoId": "",
  "videoUrl": "",
  "authorUsername": "",
  "text": "",
  "musicId": "",
  "musicTitle": "",
  "musicAuthor": "",
  "likeCount": null,
  "commentCount": null,
  "shareCount": null,
  "viewCount": null,
  "publishedAt": "",
  "sourceCollectionPath": ""
}
```

## Storage

Use this campaign layout:

```text
customers/<customer-id>/campaigns/<campaign-id>/research/tiktok-music/
  raw/
  normalized/
  analysis/
```

Keep raw collection output and normalized datasets so every candidate and
sample stays traceable to its source video URL and music id.

## Combination Cases

Use `tiktok-research` with this workflow when music fit must be judged against broader TikTok content, creator, hashtag, or comment context.

Use `tiktok-research` paid ads separately when the request is about paid ads or Creative Center ads. Do not infer organic music trends from ad-only data unless the user asks for paid creative context.

Use `video-analysis` only on the shortlisted strongest samples the user has provided as local files. Do not run semantic video analysis over broad unscreened trend results.

Use `media-router` when the user gives local files and the needed output is unclear. Let it choose transcription, subtitle packaging, semantic analysis, or edit prep.

Use `creative-qa` only after a human has reviewed candidate audio/video samples and wants structured review records.

## Failure Patterns

- Promising downloads or audio extraction instead of stating the public-surface
  boundary and stopping.
- Ranking sounds only by trend rank instead of campaign fit and sample availability.
- Losing provenance by keeping analysis output without source video URL and music id.
- Presenting scraped or extracted audio as cleared for commercial reuse.
