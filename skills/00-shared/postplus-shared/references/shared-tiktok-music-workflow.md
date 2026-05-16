# Shared TikTok Music Workflow

Shared routing and chaining rules for TikTok music, sound, video sample, and local audio-reference work.

## Core Rule

Classify the request by the object the user already has:

- `No specific sound yet`: find candidates first with `skills/20-research/tiktok-research`
- `Music URL / sound URL / musicId / song keyword`: use `skills/20-research/tiktok-research`
  when the released TikTok collection path can produce sample video URLs; if it
  cannot, ask the user for selected video URLs or an existing sample dataset
- `Selected video URLs or sample dataset`: download videos and extract audio with `skills/20-research/tiktok-music-archive-downloader`
- `Local video or audio files`: route through `skills/10-routing/media-router` into transcription, subtitles, or `skills/40-creative/video-analysis`

Do not start with downloading when the user has not selected a sound or sample set.
Do not treat extracted audio as commercially cleared unless the user confirms rights or platform-licensed use.

## Skill Chain

Use this default chain for TikTok music research:

1. `skills/20-research/tiktok-research`: discover candidate sounds by region, category, or campaign fit.
2. `skills/20-research/tiktok-research`: collect or normalize selected video
   samples when the released collection path supports the request.
3. `skills/20-research/tiktok-music-archive-downloader`: download representative videos and extract reference audio.
4. `skills/40-creative/video-analysis`: analyze video structure, hook, pacing, visual pattern, and usage context.
5. `skills/40-creative/audio-transcription` or `skills/40-creative/video-transcription`: transcribe lyrics, speech, or voiceover when needed.
6. `skills/40-creative/subtitle-packager`: produce SRT/ASS only after timed transcript artifacts exist.

Skip steps when the user already provides the corresponding artifact.

## Collection Boundary

The released public surface does not expose a separate TikTok music-sound
collector skill. Keep music-specific collection claims inside `tiktok-research`
only when the released collection key and script path support the exact request.
If they do not, ask for selected TikTok video URLs or an existing sample dataset
before downloading.

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

### Download Manifest

Use for archive-download inputs:

```json
{
  "items": [
    {
      "sourceId": "musicid-videoid",
      "sourceUrl": "https://www.tiktok.com/@user/video/123"
    }
  ]
}
```

## Storage

Use this campaign layout:

```text
customers/<customer-id>/campaigns/<campaign-id>/research/tiktok-music/
  raw/
  normalized/
  analysis/
  archive/<run-id>/
    manifest/
    videos/
    audio/
    index.json
```

Keep raw collection output, normalized datasets, and archive manifests. Do not keep only the final audio files.

## Combination Cases

Use `tiktok-research` with this workflow when music fit must be judged against broader TikTok content, creator, hashtag, or comment context.

Use `tiktok-ad-research` separately when the request is about paid ads or Creative Center ads. Do not infer organic music trends from ad-only data unless the user asks for paid creative context.

Use `video-analysis` after downloading only the shortlisted strongest samples. Do not run semantic video analysis over broad unscreened trend results.

Use `media-router` when the user gives local files and the needed output is unclear. Let it choose transcription, subtitle packaging, semantic analysis, or edit prep.

Use `creative-qa` only after a human has reviewed candidate audio/video samples and wants structured review records.

## Failure Patterns

- Jumping from a trend list directly to audio extraction without checking videos that use the sound.
- Ranking sounds only by trend rank instead of campaign fit and sample availability.
- Treating TikTok sound-page downloads as reliable when `yt-dlp` sound extraction may be broken.
- Losing provenance by saving audio without source video URL, music id, and actor output.
- Presenting scraped or extracted audio as cleared for commercial reuse.
