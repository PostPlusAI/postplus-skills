---
name: media-analysis
description: Analyze videos, images, or carousels. Start videos with local contact sheets, refine visual details locally, and use cloud analysis only for important speech that subtitles cannot establish.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Media Analysis

Start every video with a local contact sheet. The CLI combines roughly one frame
per second, scene-change candidates and the last decoded frame, with real source
timestamps. Inspect the returned sheets before choosing any cloud inference;
preparing images alone is not a completed analysis.

## Choose the next step after inspection

- **Visual questions stay local.** Read structure, scene order, composition,
  visible copy and product presentation from inspected images. Open full-size
  frames for small text and product details. Refine short shots, brief subtitles
  and action order with denser local frames; read [local frames](references/video-frames.md).
  A one-second survey can miss an entire short shot. Scene candidates and ending
  frames improve coverage but do not prove every cut or action was captured.
- **Use cloud analysis only for a remaining important speech gap.** If spoken
  content needed to answer the question cannot be established from readable
  subtitles, use the original retained local video with `--cloud`. Read
  [cloud execution and recovery](references/video-analysis.md). A talking person,
  an MP4 extension or a desire for a more complete-looking report is not enough.
- **Stop when the evidence answers the question.** Existing readable reports and
  frames can answer follow-ups. Do not purchase cloud analysis to confirm a
  supported visual answer. For an unspecified "analyze this video", deliver the
  visual/subtitle findings with their scope; resolve a material speech gap when
  the topic cannot otherwise be understood.

Subtitles are visible text, not verified original speech. Frames cannot establish
music, voice tone or unheard dialogue, and cannot exclude an off-screen narrator.
Label uninspected audio as unassessed. A failed local preparation remains failed;
do not bypass it by buying cloud analysis.

Images remain direct visual inspection: view accessible images, or use
`postplus media prepare --source <url>` for ordered image posts (see
[image evidence](references/ordered-image-evidence.md)). Keep multiple sources
and their evidence, reports and failures separate.

## Start with local visual evidence

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media analyze video-analysis \
  --video ./reference.mp4 \
  --json \
  --output ./contact-sheet.json
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Use existing PostPlus credits for requested work within existing authorization; estimate-only requests do not execute. Do not recharge, buy subscriptions, publish or change external advertising spend without applicable authorization. An initial reservation is not a final price or a hard cost cap. If a required hard final-cost limit cannot be enforced, do not execute; explain that limit.
Correct definite pre-submission field or format errors without changing the requested intent, mode or output constraints. After submission or an unknown outcome, resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
Keep raw results, operation identifiers and recovery commands in execution records. In ordinary chat, give the result, meaningful limitations, known cost and any necessary user decision; do not narrate uploads, polling, internal identifiers or JSON. When asked how media was made, provide the actual model, submitted prompt in the user language and references actually submitted with their roles.
<!-- END GENERATED EXECUTION EXAMPLE -->

The default command returns contact-sheet and frame paths for Agent inspection,
without uploading for inference. A local video needs no account connection;
remote source acquisition can still cost credits. Reuse the returned local file
for refinement and any later cloud analysis to avoid collecting it again.

`video-analysis` is the CLI capability key, not another skill. For the explicit
cloud step, PostPlus supplies one fixed analysis prompt for the full original
timeline. Do not supply, replace or append custom questions, formats or marketing
instructions. There is no short/deep cloud branch. Use command help for local
frame controls; use `postplus media schema --json` only when repairing an unknown
cloud input.

## Deliver

For local work, answer the user's question with real inspected images, measured
timestamps and a brief note on sampling/refinement and audio coverage. Separate
visible facts and captured wording from interpretation. A visual timeline survey
is not a complete audiovisual record. Do not impose the cloud report template on
local observations. Embed supporting images and keep their saved attachments
readable after temporary source cleanup; preserve user files.

For cloud analysis, deliver the returned model Markdown unchanged, linking the complete report when
long. Do not substitute a summary, marketing verdict, cleaned-up transcript or
rewritten shot list. See [report scope](references/single-video-report.md).
Do not schedule an extra Agent completeness review, strategy synthesis, or paid
rerun as part of this flow. If separately asked for interpretation or strategy,
use the saved original report and deliver that work separately without changing
the analysis prompt or replacing the original record.

Keep sources, reports and failures separate. Preserve user files and delivered
evidence. Screenshots cannot establish full
motion or audio coverage. A failed analysis remains failed; partial screenshots
or subtitle observations must be labeled with their limits.

## Wait and recover

For source acquisition and cloud tasks, follow structured progress and next actions. After a disconnected wait, use the
returned poll/checkpoint action for the same task, account and environment.
Do not restart an uncertain paid analysis. Let PostPlus perform bounded recovery;
do not resubmit uncertain work, repeat
exhausted recovery, or switch providers to bypass failure.

For a clear local parameter rejection before submission, use command help for
one correction. For readiness failures, use `postplus doctor --skill media-analysis`.
Use existing PostPlus credits within the requested scope and existing spending
authorization. Estimates do not guarantee a final maximum; do not execute an
explicit hard final-cost limit that the server cannot enforce.
Do not purchase a redo for wording or perceived content quality.

On terminal failure, explain the affected analysis, reason, known cost status
and necessary user action. Save the operation id and technical recovery action
in execution records. An unknown result or missing usage does not mean no
charge. Do not claim unseen or unheard material was analyzed.
