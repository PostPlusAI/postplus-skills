---
name: video-postproduction
description: Burn timed captions and static text overlays into an existing video when text postproduction is requested. Keep the raw video and editable text plan.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Video Postproduction

Add captions or static overlays to an existing raw clip only when requested.
Choose the wording, timing and layout from the actual visible footage, timed
speech and the user's brief. The renderer executes that explicit arrangement;
it does not ask a model to paint text into video.

## Arrange the text

Reuse an existing timed transcript and reference analysis. Use video-transcription
only when speech captions need a transcript that is missing. Use media-analysis
only when understanding a supplied reference is needed and no adequate report
exists. Use available real frames to choose placement; acquire relevant frames
only when the layout decision needs them. These are conditional inputs, not a
mandatory multi-model pipeline.

Choose one caption position for the clip where practical. Split speech into short
phrases at actual word boundaries and times, preserving the spoken wording.
Choose overlays separately for each interval: a hook, a relevant emphasis or a
needed call to action may help; no overlay is also a valid choice.

Match the observable text treatment when a reference report is supplied. Otherwise
start from the renderer's approved B-style defaults and adapt them to the actual
frame size and content. The bundled Arimo replaces the reference's Helvetica Neue;
Noto Sans SC is available for Chinese. Do not assume the reference's hook words or
position suit every clip.

## Render and deliver

Read postplus video-text schema --json for the shared plan fields, available
fonts and limits. Save the explicit plan as JSON; it owns the literal wording,
actual times, line breaks and layout. Do not write ASS tags into text fields.

Run:

    postplus video-text render --video ./raw.mp4 --plan ./text-plan.json --output ./captioned.mp4 --json

Local rendering uses FFmpeg/FFprobe and bundled fonts. Add --remote to use the
configured PostPlus Cloud with a local file or owned media reference. If a cloud
wait disconnects, keep its checkpoint and use the returned video-text status
command for that same operation; do not submit a replacement.

Deliver the rendered copy with the retained raw source, text plan and actual
render information. Preserve the ASS and receipt references for re-burning.
No transcription, frame extraction, analysis, generation or added review runs
inside the renderer. A failed or pending render is not a delivered video.
