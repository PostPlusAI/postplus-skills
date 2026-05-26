---
name: video-analysis
description: Analyze local or downloaded social video files with the official Gemini API, especially for objective TikTok/Reels timeline breakdowns, shot-level editing descriptions, spoken-line capture, and structured JSON outputs. Use this when you need video-level analysis beyond metadata, including uploading video files, prompting gemini-3.5-flash, and linking results back to source metadata.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Video Analysis

## Use When
- The user provides a local video file or video URL and asks to watch, inspect,
  break down, deconstruct, analyze hooks, understand shots, capture spoken
  lines, or explain why a video works.
- Use this for video-level evidence beyond metadata. Do not answer actual
  video-understanding requests from transcript guesses or general marketing
  knowledge.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Execution Boundary
- Default model is `gemini-3.5-flash` through released model key
  `gemini-video-analysis`.
- Supported local formats are `.mp4`, `.m4v`, `.mov`, and `.webm`.
- Local videos are uploaded through the hosted `file_reference` path: signed
  upload URL, local byte upload, then Gemini `file_reference`.
- The runner does not claim inline video bytes, compression, segmentation,
  resumable upload, or file URI reuse. If signed upload or `file_reference`
  analysis fails, stop on that error.

## Source And Path
- A direct local file can be analyzed immediately. For a URL, first download or
  recover the local video, then build a download report.
- Preserve `sourceId`, `sourceUrl`, `videoFilePath`, `sourceMetadataPath` or
  dataset path, model, prompt version, and source basis so results can be joined
  back to source metadata.
- Keep downloaded videos when they are expensive to source. Keep analysis JSON
  and manifests under a stable workspace path.

## Output And Handoff
- The runner writes one JSON file per source video plus `_batch-summary.json`.
  Normalized results should stay objective: timeline, spoken line/meaning,
  visible scene, subject action, camera/framing, edit, caption behavior, audio
  pacing, and uncertainties.
- It does not output marketing recommendations. Hand off objective timelines to
  `frame-extraction`, `reference-decode`, or strategy skills when needed.

## Fail Fast
- Missing local video/download report, missing `ffprobe`, `python3`, or
  `python3:yt_dlp`, missing hosted `media-file`/`video-analysis` capability,
  upload failure, DNS/proxy/network failure, unsupported model, or analysis
  failures in the batch summary.
- Do not retry by base64 inlining video or answering from metadata.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill video-analysis`.
- Request schema: `postplus media schema --json`; add `--endpoint <endpoint-key>` for media-generation examples.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
