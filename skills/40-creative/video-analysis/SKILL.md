---
name: video-analysis
description: Analyze local or downloaded social video files with the official Gemini API, especially for TikTok/Reels shot beats, timelines, voiceover or on-screen text capture, creative strategy, and natural Markdown outputs. Use this when you need video-level analysis beyond metadata, including uploading video files, prompting gemini-3.5-flash, and linking results back to source metadata.
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
- Keep downloaded videos when they are expensive to source. Keep analysis
  Markdown files and manifests under a stable workspace path.

## Analysis Scope
- The default analysis is a single output per source video.
- It covers practical short-form structure such as hook, pacing, shot beats,
  VO/on-screen text, product timing, and creative strategy.
- It also asks for Visual & Brand Signals when visible: genre/mood, color
  palette, lighting, camera language, editing rhythm, brand feeling, and
  best-fit creative use cases.

## Output And Handoff
- The runner writes one natural Markdown analysis file per source video plus
  `_batch-summary.json`. The analysis should cover useful video evidence such
  as shot beats, timeline, VO/on-screen text, reusable content structure, and
  creative strategy when those are relevant.
- Provider text is normalized before writing: Markdown is preserved, Markdown
  wrapped in JSON is extracted, and structured JSON is rendered as readable
  Markdown.
- Results should stay grounded in observable video evidence. Database fields,
  catalog frontmatter, or search indexes belong to a separate ingestion step,
  not to the general video-analysis boundary.

## Public Command Boundary

- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- Use `postplus media schema --json` only when constructing or repairing an
  unknown request shape.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
- Choose the smallest matching command from the user input and run it directly.
- Readiness diagnostics: `postplus doctor --skill video-analysis`.
  If the runner fails, report the exact script error and stop. Do not bypass the
  failure by answering from metadata, base64-inlining video, readiness probing,
  or unowned fallbacks.
