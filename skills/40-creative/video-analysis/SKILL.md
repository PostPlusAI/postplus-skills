---
name: video-analysis
description: Analyze local or downloaded social video files with the official Gemini API, especially for TikTok/Reels benchmark breakdowns, script decomposition, and structured JSON outputs. Use this when you need video-level analysis beyond metadata, including uploading video files, prompting Gemini 3.1 Pro Preview, and linking results back to source metadata.
---

# Video Analysis

> **Tip:** Gemini 3.1 Pro is recommended for video analysis. The PostPlus
> runner uses bounded inline payloads for very small files and hosted
> `file_reference` upload for larger local videos.

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill for video-level analysis after metadata research has already narrowed a candidate set.

Follow shared routing and guidance rules in:

- `postplus-shared` research preferences

This skill is usually downstream of platform research, not the default first step for broad TikTok discovery.

## Use For

- analyze local video files through the hosted Gemini video-analysis path
- run Gemini 3.1 Pro Preview on video inputs
- use a stable TikTok/Reels analysis prompt
- request structured JSON output
- keep analysis linked to source metadata such as TikTok URL, video id, or dataset row

## Current Boundary

Current script behavior:

- supported local formats: `.mp4`, `.m4v`, `.mov`, `.webm`
- before each item, the runner checks the local file size and logs the selected
  transfer boundary
- tiny videos stay on the inline path while they fit inside the shared hosted
  JSON payload guard
- larger videos use `media-file/create-upload-url`, upload the local file to
  the signed upload URL, and send Gemini a `file_reference`
- Gemini input is single-source: each request uses either `inline_data` or
  `file_reference`, never both
- no automatic compression, segmentation, resumable upload, or file URI reuse is
  claimed in this release

If signed upload or hosted `file_reference` analysis fails, stop on that error.
Do not retry by base64 inlining the same large video.

## Trigger Signals

When the user asks about any of the below and hasn't chosen this skill yet,
ask before proceeding with other tools.

Use this skill when the user asks for things like:

- why a video works
- hook or structure breakdown
- spoken-line or CTA analysis
- shot-level decomposition
- visual execution analysis
- adaptation or recreation guidance based on actual videos

Do not use this skill as a substitute for broad TikTok trend discovery when no shortlist exists yet.

## Core Resources

- Official source library: `references/core-sources.md`
- TikTok analysis prompt: `references/tiktok-video-analysis-prompt.md`
- JSON schema: `references/tiktok-video-analysis-schema.json`
- Downloader: `../../00-core/shared-runtime/scripts/download_videos_from_manifest_with_ytdlp.mjs`
- Batch runner: `scripts/run_video_analysis_batch.mjs`
- Manifest builder: `scripts/build_manifest_from_master_table.mjs`
- Backfill helper: `scripts/backfill_master_table_with_script.mjs`

## Workflow

For this workspace, use this skill after:

1. metadata research identifies high-value videos
2. the actual video files are available locally

If the local video files are missing, do not stop at metadata. Recover the source video first, then run analysis.

For this workspace, a practical recovery path is:

1. try to locate previously downloaded local videos
2. if downloader dependencies are missing, follow the `postplus-shared` Local
   Dependency Bootstrap Rule first
3. if still missing, download from the TikTok web URL with `yt-dlp`
4. save files under a stable workspace path
5. only then call the Gemini analysis scripts

Do not start with full-market video analysis. First shortlist, then analyze.

If the user request is broad or ambiguous, ask one short question before running:

- "Do you want to first find breakout samples worth inspecting, or do you already have videos for direct hook, structure, and shot breakdown?"

If the user appears to want a broader TikTok research outcome, proactively mention that `skills/20-research/tiktok-research` can first build the shortlist this skill should analyze.

## Environment

Do not store secrets in this repo.

In the PostPlus runtime:

- follow `postplus-shared` public skill rules
- this skill requires `python3`, `yt_dlp`, and `ffprobe`; follow the
  `postplus-shared` Local Dependency Bootstrap Rule before analysis
- if the required Gemini capability is missing, or local dependency
  bootstrap fails, or the script returns a stable network/proxy/DNS error, stop
  immediately and report that failure

## Default Model

- `gemini-3.1-pro-preview`

Do not use `gemini-3-pro-preview`; it has been shut down.

## First Run

Before the first run, tell the user:

- "I will first use video-analysis to run Gemini analysis on a local video and output JSON results for each sourceId. Small files use inline input; large files use hosted file_reference. The next step can go to reference-decode or benchmark-to-brief."

Use a single local video and keep the first request simple:

```bash
node skills/40-creative/video-analysis/scripts/run_video_analysis_batch.mjs \
  --download-report <work-folder>/.postplus/download-report.json \
  --output-dir <work-folder>/.postplus/video-analysis-results \
  --concurrency 1 \
  --model gemini-3.1-pro-preview
```

The download report should contain at least:

```json
{
  "results": [
    {
      "sourceId": "demo-1",
      "sourceUrl": "https://www.tiktok.com/@demo/video/1",
      "filePath": "/abs/path/to/video.mp4",
      "success": true
    }
  ]
}
```

## Batch Guidance

When scaling to many videos:

- keep provider calls concurrent but bounded
- start with concurrency 2-4
- small files may use `inline`; larger files use hosted `file_reference`
- persist one JSON result per source video
- include source ids and source URLs in every result

## Larger Files

Larger local files use the hosted file-reference path:

1. request `media-file/create-upload-url`
2. upload the video bytes to the returned signed URL
3. send the returned `storageReference` as Gemini `file_reference`

Segmentation, compression, and file URI reuse are not implemented by this
script.

## Keep These Assets

Do not treat downloaded videos as disposable temp files if they were expensive to source.

When a benchmark set matters, keep:

- the local video file
- the analysis JSON
- the manifest or URL list that can restore the file later

If you only keep the metadata table, you may lose the ability to reproduce shot-level analysis later.

## Shot-Level Backfill

If shot-level fields were generated by Gemini but not preserved in the master table, backfill them instead of creating duplicate records.

Use:

```bash
node skills/40-creative/video-analysis/scripts/backfill_master_table_with_script.mjs \
  --master "reports/video-master-table.csv" \
  --analysis-dir /path/to/analysis-dir
```

This updates matching source ids in the existing master table and preserves the single-table workflow.

Batch example:

```bash
node skills/40-creative/video-analysis/scripts/run_video_analysis_batch.mjs \
  --download-report /path/to/download-report.json \
  --output-dir <work-folder>/.postplus/video-results \
  --concurrency 2 \
  --model gemini-3.1-pro-preview
```

## Always Keep

Never treat video analysis as isolated output. Always keep these fields:

- `sourceId`
- `sourceUrl`
- `sourceMetadataPath` or dataset path
- `videoFilePath`
- `model`
- `promptVersion`

That makes it possible to join Gemini output back to TikTok metadata later.
