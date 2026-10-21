---
name: media-analysis
description: Analyze videos, images, or carousels with visible and audible evidence. Answer visual questions, inspect frames, or compare references shot by shot when requested.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Media Analysis

For video, submit the original local path or supported URL, wait or resume the same operation, and
hand over the original full-timeline report. PostPlus owns one fixed analysis
prompt shared by CLI and MCP. Do not supply, replace, or append custom questions,
formats, or marketing instructions. Every video gets the same detailed record;
there is no short/deep analysis branch.

Use [execution and recovery](references/video-analysis.md) for source handling.
For multiple videos, submit each separately and retain a separate original report.

Images remain direct visual inspection: view accessible images, or use
`postplus media prepare --source <url>` for ordered image posts (see
[image evidence](references/ordered-image-evidence.md)). If the task only asks for
specific screenshots, use [video frames](references/video-frames.md); label them
as partial frame observations, never as completed full-video analysis.

## Video command

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus media analyze video-analysis \
  --video ./reference.mp4 \
  --output ./result.md
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Wait for explicit user approval when requested; an action does not authorize spending, publishing, or overwriting.
Resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
<!-- END GENERATED EXECUTION EXAMPLE -->

`video-analysis` is the CLI capability key, not another skill. With MCP, submit
the same video through its declared capability input; the server supplies the
same fixed prompt. Use `postplus media schema --json` only when repairing an unknown CLI input.

## Deliver

Deliver the returned model Markdown unchanged, linking the complete report when
long. Do not substitute a summary, marketing verdict, cleaned-up transcript or
rewritten shot list. See [report scope](references/single-video-report.md).
Do not schedule an extra Agent completeness review, strategy synthesis, or paid
rerun as part of this flow. If separately asked for interpretation or strategy,
use the saved original report and deliver that work separately without changing
the analysis prompt or replacing the original record.

Keep sources, reports and failures separate. Preserve user files and delivered
evidence. Screenshots are optional supporting evidence and cannot establish full
motion or audio coverage. A failed analysis remains failed; partial screenshots
or subtitle observations must be labeled with their limits.

## Wait and recover

Follow structured progress and next actions. After a disconnected wait, use the
returned poll/checkpoint action for the same task, account and environment.
Do not restart an uncertain paid analysis. Let PostPlus perform bounded recovery;
do not resubmit uncertain work, repeat
exhausted recovery, or switch providers to bypass failure.

For a clear local parameter rejection before submission, use command help for
one correction. For readiness failures, use `postplus doctor --skill media-analysis`.
Honor quote challenges using existing explicit cost authorization when sufficient;
otherwise ask for approval and use the returned confirmation/retry action.
Do not purchase a redo for wording or perceived content quality.

On terminal failure, report stage, reason, operation id, known cost status and
the returned next action. An unknown result or missing usage does not mean no
charge. Do not claim unseen or unheard material was analyzed.
