---
name: video-analysis
description: Analyze local or remote social videos through PostPlus, especially for TikTok/Reels shot beats, timelines, voiceover or on-screen text capture, creative strategy, and natural Markdown outputs. Use this when you need video-level analysis beyond metadata and want results linked back to source metadata.
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
- Analysis runs through `postplus media analyze`; discover its current flags
  with `postplus media schema --json`.
- Supported local formats are `.mp4`, `.m4v`, `.mov`, and `.webm`.
- Pass a local path, HTTPS URL, existing PostPlus media reference, or video data
  URI directly to `--video`. PostPlus prepares the media and runs the request;
  do not pre-upload it or author a manual request object.
- If media preparation or analysis fails, stop on that error.

## Source And Path
- A local file or HTTPS video URL can be analyzed directly.
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
- `media analyze` returns the hosted analysis response. Read the analysis text
  from that response and write one natural
  Markdown file per source video into a stable workspace path; there is no batch
  runner or summary file.
- The analysis should cover useful video evidence such as shot beats, timeline,
  VO/on-screen text, reusable content structure, and creative strategy when
  those are relevant. If the result wraps the analysis in JSON,
  unwrap it to readable Markdown in-context.
- Results should stay grounded in observable video evidence. Database fields,
  catalog frontmatter, or search indexes belong to a separate ingestion step,
  not to the general video-analysis boundary.

## Public Command Boundary

- Run `postplus media analyze <model-key> --video <local-path-or-url> --prompt
  <analysis-prompt> --output <result.json>`.
  When the source video duration is known (for example from the local file),
  pass `--video-seconds <n>` so the hosted boundary can route eligible short videos
  efficiently; omit it when the duration is unknown.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media analyze video-analysis \
  --video ./reference.mp4 \
  --prompt "Describe the result you need" \
  --wait \
  --output ./result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->

- Discover the model keys and request shape with `postplus media schema --json`;
  do not use another execution interface.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
- Choose the smallest matching command from the user input and run it directly.
- Readiness diagnostics: `postplus doctor --skill video-analysis`.
  If a command fails, report the exact error and stop. Do not bypass the
  failure by answering from metadata, rewriting media, readiness probing,
  or unowned fallbacks.
