---
name: tiktok-music-archive-downloader
description: Download TikTok video samples for selected music or sounds, extract local audio references, and preserve manifests for reproducible music research archives.
---

# TikTok Music Archive Downloader

Follow shared release-shell rules in:

- `skills/shared-release-shell-rules.md`

Use this skill when TikTok music or sound candidates have already been selected and the user needs local files.

Good fits:

- "把这些 sound 的代表视频下下来"
- "从 TikTok 视频里抽音频做参考"
- "给这批 trending music 建本地素材库"
- "下载样本并保留来源 manifest"

Do not use this skill for:

- discovering trending music
- collecting metadata from hosted collection
- deciding whether an audio is legally usable for public posting

## Read First

- Shared chain: [`../shared-tiktok-music-workflow.md`](skills/shared-tiktok-music-workflow.md)

## Source Skills

Expected inputs usually come from:

- [`../tiktok-music-sound-collector/SKILL.md`](skills/tiktok-music-sound-collector/SKILL.md)
- [`../tiktok-research/SKILL.md`](skills/tiktok-research/SKILL.md)

## Downloader

Use the shared TikTok downloader:

```bash
node ${CLAUDE_SKILL_DIR}/../shared-runtime/scripts/download_videos_from_manifest_with_ytdlp.mjs \
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

## Handoff

- Need video-level breakdown: run a dedicated visual analysis workflow on the downloaded files
- Need transcription or lyrics/voice extraction: [`../audio-transcription/SKILL.md`](skills/audio-transcription/SKILL.md) or [`../video-transcription/SKILL.md`](skills/video-transcription/SKILL.md)
- Need subtitle files: [`../subtitle-packager/SKILL.md`](skills/subtitle-packager/SKILL.md)

## Rights Posture

Treat downloaded TikTok music as research/reference material unless the user confirms rights or platform-licensed use. Do not present extracted audio as cleared for commercial reuse.

## Release-Shell Execution Contract

- keep download manifests, reports, extracted videos, and extracted audio under
  `<work-folder>/.postplus/tiktok-music-archive-downloader/`
- keep only final user-facing archive summaries or selected exports outside
  `.postplus/`
- start with a bounded first pass on a very small manifest before broader
  archive pulls
- this skill currently depends on explicit host-installed local tools:
  - `python3` with `yt_dlp`
  - `ffmpeg`
- if `python3` is missing, proactively install `python3` with the host package
  manager already present on the machine before continuing
- if `yt_dlp` is missing, proactively run
  `python3 -m pip install --user yt-dlp`
- if `ffmpeg` is missing, proactively install `ffmpeg` with the host package
  manager already present on the machine before continuing
- rerun direct checks such as `python3 --version`,
  `python3 -c "import yt_dlp"`, and `ffmpeg -version` after installation
- if installation or verification fails, stop immediately instead of switching
  to ad hoc shell glue
