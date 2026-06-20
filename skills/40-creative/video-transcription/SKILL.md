---
name: video-transcription
description: Transcribe remote HTTPS videos, or local videos after a PostPlus media-file upload, into timed transcripts and subtitle-ready artifacts using hosted Whisper video-to-text. Use this when the input is a video and the goal is speech extraction, caption generation, or edit-prep timing.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Video Transcription

## Use When
- The input is a video file and the goal is speech extraction, timed transcript,
  caption generation, multilingual transcript, or edit-prep timestamps.
- Use `video-analysis` instead when the user needs semantic visual analysis.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Execution Boundary
- Hosted video transcription runs through the public `postplus media transcribe`
  verb and is async. The generated example below shows the endpoint key.
- The transcription submit command accepts a remote HTTPS video URL. For a local
  video file, first run the generic hosted upload step, read `output.download_url`
  from the upload result, then pass that HTTPS URL to `--video`.
- Request timestamps by default when results drive subtitles or edit decisions.
- Hosted video transcription is async. Submit writes request, response, manifest,
  normalized transcript path, generation handle, provider status, provider URLs,
  and artifacts when already completed.

## Source And Path
- Before submit, derive `durationSeconds` from the source video or uploaded
  source URL and include it in the hosted capability request input for
  billing/preflight.
- Start with one source file before larger batches.
- Keep internal requests, responses, normalized transcripts, and downloaded
  artifacts under `.postplus/video-transcription`; keep final user-facing
  transcript exports outside `.postplus`.

## Handoff
- If status is pending, return the manifest path, the `output.data.id` generation
  handle, and the poll command `postplus media poll --handle <output.data.id>`. Do
  not keep the conversation open just to poll.
- When completed, hand off `normalizedTranscriptPath`, downloaded artifacts, and
  final transcript paths to `subtitle-packager` if SRT/ASS is needed.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill video-transcription`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus media schema --json` only when you need the full endpoint, flag,
  and enum contract or are repairing an unknown request shape.
- Run the hosted transcription job with the generated command below; do not call
  provider APIs directly.
- For a local file, first run
  `postplus media-file upload --skill video-transcription --input-file <video-file> --mime <video/mp4|video/quicktime|video/webm> --output <upload.json>`.
  Then read the HTTPS `output.download_url` from `<upload.json>` and pass that
  URL as `--video`. Do not pass local paths, `file://` URLs, or
  `storageReference` objects to `postplus media transcribe`.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media transcribe transcription-video \
  --video <video> \
  --duration-seconds <duration-seconds> \
  --output <result.json>
```
<!-- END GENERATED EXECUTION EXAMPLE -->
