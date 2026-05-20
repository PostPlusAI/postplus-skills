---
name: tiktok-music-archive-downloader
description: Download TikTok video samples for selected music or sounds, extract local audio references, and preserve manifests for reproducible music research archives.
metadata:
  postplus:
    familyId: tiktok
    familyName: TikTok
---

# TikTok Music Archive Downloader

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when TikTok music or sound candidates have already been selected and the user needs local files.

Good fits:

- "Download representative videos for these sounds"
- "Extract audio from TikTok videos as references"
- "Build a local asset library for these trending music tracks"
- "Download samples and keep a source manifest"

Do not use this skill for:

- discovering trending music
- collecting metadata from hosted collection
- deciding whether an audio is legally usable for public posting

## Read First

- Shared chain: `postplus-shared` TikTok music workflow

## Source Skills

Expected inputs usually come from:

- `../tiktok-research/SKILL.md`

## Downloader

Use the shared TikTok downloader:

```bash
node ${CLAUDE_SKILL_DIR}/_postplus_shared/00-core/shared-runtime/scripts/download_videos_from_manifest_with_ytdlp.mjs \
  --manifest <download-manifest.json> \
  --output-dir <videos-dir> \
  --report <download-report.json> \
  --concurrency 2 \
  --attempts 3
```

The manifest should contain:

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

When the upstream normalized dataset includes both `postPageUrl` and direct
video fields, prefer the canonical TikTok post page URL for `sourceUrl`.
That keeps `yt_dlp` on the stable page surface instead of an expiring CDN URL.

## TikTok Access Boundary

This skill downloads only TikTok post URLs that are reachable from the user's
current local browser/IP environment after the approved local dependency
bootstrap passes. A working `python3`, `yt_dlp`, and `ffmpeg` setup is necessary
but not sufficient when TikTok gates the post by IP, browser access, login, or
cookies.

When the download report contains `failureCode: "tiktok_ip_blocked"`:

- report the blocker directly with the preserved `sourceUrl`, `stderr`, and
  report path
- stop the archive and audio-extraction chain for that source set
- do not retry broad downloads, switch to a proxy, or invent a cookie/browser
  bootstrap path
- continue only after the user provides a TikTok URL or sample file that is
  reachable from their current local browser/IP environment, or after an
  approved access path is added to this skill contract

## Audio Extraction

After videos are downloaded, extract audio with `ffmpeg`.

Prefer `m4a` for compact review assets:

```bash
ffmpeg -y -i <video.mp4> -vn -c:a aac -b:a 192k <audio.m4a>
```

Use `wav` only when a downstream model or editor needs uncompressed audio:

```bash
ffmpeg -y -i <video.mp4> -vn -ac 1 -ar 48000 <audio.wav>
```

## Archive Layout

Use a stable layout:

```text
<work-folder>/.postplus/tiktok-music-archive-downloader/<run-id>/
  manifest/
    download-manifest.json
    download-report.json
  videos/
  audio/
  index.json
```

`index.json` should link every local file back to:

- `musicId`
- `musicTitle`
- `sourceVideoUrl`
- `sourceCollectionPath`
- local video path
- local audio path
- download status

## Verification

Before reporting success:

- confirm downloaded files exist and are non-empty
- confirm audio files exist and are non-empty
- report failures separately instead of hiding them
- keep source URLs in the manifest even when download fails
- if a report item has `failureCode: "tiktok_ip_blocked"`, treat it as a
  supported fail-fast blocker and do not proceed to audio extraction for that
  source set

## Handoff

- Need video-level breakdown: run a dedicated visual analysis workflow on the downloaded files
- Need transcription or lyrics/voice extraction: `../audio-transcription/SKILL.md` or `../video-transcription/SKILL.md`
- Need subtitle files: `../subtitle-packager/SKILL.md`

## Rights Posture

Treat downloaded TikTok music as research/reference material unless the user confirms rights or platform-licensed use. Do not present extracted audio as cleared for commercial reuse.

## Public Skill Execution Contract

- keep download manifests, reports, extracted videos, and extracted audio under
  `<work-folder>/.postplus/tiktok-music-archive-downloader/`
- keep only final user-facing archive summaries or selected exports outside
  `.postplus/`
- start with a bounded first pass on a very small manifest before broader
  archive pulls
- this skill currently depends on explicit host-installed local tools:
  - `python3` with `yt_dlp`
  - `ffmpeg`
- follow the `postplus-shared` Local Dependency Bootstrap Rule before the first
  download or extraction
- if local dependency bootstrap fails, stop immediately instead of switching to
  ad hoc shell glue
- downloads are supported only for TikTok post URLs reachable from the user's
  current local browser/IP environment; TikTok IP/browser/cookie gating is a
  hard blocker unless this contract later adds an approved access bootstrap
