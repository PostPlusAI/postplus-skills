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
- Analysis runs through the hosted `video-analysis` capability; discover the
  model keys and request shape with `postplus media schema --json`.
- Supported local formats are `.mp4`, `.m4v`, `.mov`, and `.webm`.
- The analyze verb only accepts an already-hosted video reference. Put the local
  video behind a hosted `storageReference` first with `postplus media-file
  upload`, then reference `output.storageReference` as a Gemini `file_reference`
  in the analyze request. Upload is a separate generic verb, not part of
  `media analyze`.
- This boundary does not claim inline video bytes, compression, segmentation,
  resumable upload, or file URI reuse. If the upload or the hosted analyze call
  fails, stop on that error.

## Source And Path
- A direct local file can be analyzed immediately. For a URL, first download or
  recover the local video, then upload it with `media-file upload`.
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
- `media analyze` returns the hosted provider response (the Gemini candidates)
  verbatim. Read the analysis text from that response and write one natural
  Markdown file per source video into a stable workspace path; there is no batch
  runner or summary file.
- The analysis should cover useful video evidence such as shot beats, timeline,
  VO/on-screen text, reusable content structure, and creative strategy when
  those are relevant. If the provider returns the analysis wrapped in JSON,
  unwrap it to readable Markdown in-context.
- Results should stay grounded in observable video evidence. Database fields,
  catalog frontmatter, or search indexes belong to a separate ingestion step,
  not to the general video-analysis boundary.

## Public Command Boundary

- Step 1 — upload the local video to a hosted reference:
  `postplus media-file upload --input-file <video> --mime <video/mp4|video/quicktime|video/webm> --output <upload.json>`.
  Read `output.storageReference` from the result.
- Step 2 — author the Gemini request file: `contents` with a `text` prompt part
  and a `file_reference` part set to that `output.storageReference`, plus optional
  `generationConfig`.
- Step 3 — run the analysis:
  `postplus media analyze <model-key> --request <gemini-request.json> --output <result.json>`.
  When the source video duration is known (e.g. from the local file before upload),
  pass `--video-seconds <n>` so the hosted boundary can route eligible short videos
  efficiently; omit it when the duration is unknown.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media analyze video-analysis --request request.json --output result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->

- Discover the model keys and request shape with `postplus media schema --json`;
  do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
- Choose the smallest matching command from the user input and run it directly.
- Readiness diagnostics: `postplus doctor --skill video-analysis`.
  If a command fails, report the exact error and stop. Do not bypass the
  failure by answering from metadata, base64-inlining video, readiness probing,
  or unowned fallbacks.
