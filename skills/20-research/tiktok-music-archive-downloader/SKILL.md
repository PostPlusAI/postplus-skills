---
name: tiktok-music-archive-downloader
description: Download TikTok video samples for selected music or sounds, extract local audio references, and preserve manifests for reproducible music research archives.
metadata:
  postplus:
    familyId: tiktok
    familyName: TikTok
---

# TikTok Music Archive Downloader

Use this skill after TikTok music or sound candidates have already been
selected and the user needs local sample files, audio references, and a
reproducible archive manifest.

Apply shared local-dependency and user-guidance rules from `postplus-shared`.

## Do Not Use When

- The user is still discovering trending music. Start with `tiktok-research`.
- The user needs hosted TikTok metadata collection.
- The user asks whether an audio is legally cleared for public posting.

## Required Input

- A small download manifest with TikTok post page URLs.
- Local dependencies: `python3` with `yt_dlp`, and `ffmpeg`.
- A work folder where the archive can be written under `.postplus/`.

When a normalized upstream dataset includes both `postPageUrl` and direct video
fields, prefer the canonical TikTok post page URL for `sourceUrl`.

## Access Boundary

Downloads are supported only for TikTok post URLs reachable from the user's
current local browser/IP environment after dependency checks pass. Local tools
are necessary but not sufficient when TikTok gates a post by IP, browser
access, login, or cookies.

If the download report contains `failureCode: "tiktok_ip_blocked"`, report the
blocker with the preserved `sourceUrl`, stderr, and report path. Do not retry
broad downloads, switch proxies, or invent a cookie/browser bootstrap path.

## Default Workflow

1. Build a bounded manifest from selected videos or sounds.
2. Run the shared downloader:

```bash
  --manifest <download-manifest.json> \
  --output-dir <videos-dir> \
  --report <download-report.json> \
  --concurrency 2 \
  --attempts 3
```

3. Stop on download blockers before audio extraction.
4. Extract audio from successful downloads with `ffmpeg`.
5. Write an `index.json` that links each local file to `musicId`,
   `musicTitle`, `sourceVideoUrl`, source collection path, download status,
   local video path, and local audio path.

## Archive Layout

Use:

```text
<work-folder>/.postplus/tiktok-music-archive-downloader/<run-id>/
  manifest/
  videos/
  audio/
  index.json
```

Keep final archive summaries or selected exports outside `.postplus/` only
when the user needs to inspect or pass them onward.

## Verification

- Confirm downloaded files exist and are non-empty.
- Confirm audio files exist and are non-empty.
- Report failures separately instead of hiding them.
- Keep source URLs in the manifest even when download fails.
- Do not proceed to audio extraction for a source set blocked by TikTok access.

## Rights Posture

Treat downloaded TikTok music as research or reference material unless the user
confirms rights or platform-licensed use. Do not present extracted audio as
cleared for commercial reuse.

## Handoff

- Need more TikTok music or source candidates -> `tiktok-research`.
- Need video-level breakdown -> `video-analysis`.
- Need transcription or voice extraction -> `audio-transcription` or
  `video-transcription`.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill tiktok-music-archive-downloader`.
- Input schema: `postplus research schema --json`.
- Hosted collection: `postplus research collect --skill tiktok-music-archive-downloader --collection-key <collection-key> --input <hosted-envelope.json> --output <collection-result.json>`.
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <collection-result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
