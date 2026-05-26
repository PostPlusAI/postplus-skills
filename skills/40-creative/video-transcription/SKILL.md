---
name: video-transcription
description: Transcribe video files directly into timed transcripts and subtitle-ready artifacts using hosted Whisper video-to-text. Use this when the input is a video and the goal is speech extraction, caption generation, or edit-prep timing.
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
- Released endpoint key is `transcription-whisper-with-video` through hosted
  `media-file` and `media-generation`.
- Use `enableTimestamps: true` by default when results drive subtitles or edit
  decisions.
- Hosted video transcription is async. Submit writes request, response, manifest,
  normalized transcript path, generation handle, provider status, provider URLs,
  and artifacts when already completed.

## Source And Path
- Before submit, derive `durationSeconds` from the source video and include it in
  the hosted capability request input for billing/preflight.
- Start with one source file before larger batches.
- Keep internal requests, responses, normalized transcripts, and downloaded
  artifacts under `.postplus/video-transcription`; keep final user-facing
  transcript exports outside `.postplus`.

## Handoff
- If status is pending, return the manifest path, `generationHandle`,
  not keep the conversation open just to poll.
- When completed, hand off `normalizedTranscriptPath`, downloaded artifacts, and
  final transcript paths to `subtitle-packager` if SRT/ASS is needed.

## Fail Fast
- Missing hosted capability request, video path/URL input, `durationSeconds`, output path,
  auth, hosted capability, provider status URL, or stable provider/network
  access.
- Do not switch to ad hoc STT providers or fake timing when hosted transcription
  is unavailable.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill video-transcription`.
- Request schema: `postplus media schema --json`; add `--endpoint <endpoint-key>` for media-generation examples.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
