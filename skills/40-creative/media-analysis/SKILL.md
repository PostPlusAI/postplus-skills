---
name: media-analysis
description: Analyze videos, images, or carousels with visible and audible evidence. Answer visual questions, inspect frames, or compare references shot by shot when requested.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Media Analysis

Analyze the user's link, local file, or visible images and deliver readable
findings with the actual visual evidence. Choose the necessary work internally.

For multi-reference comparison or requested detailed shot-by-shot evidence, read
[multi-source shot analysis](references/multi-source-shot-analysis.md). This branch
keeps sources independent before synthesis; ordinary analysis skips it.

## Choose the work

- **Video understanding:** use `postplus media analyze video-analysis` for
  actions, sound, dialogue, and development over time. Pass the original source;
  the CLI owns acquisition and transfer. Read [execution and recovery](references/video-analysis.md).
- **Readable images:** view them directly. No download, upload, or Gemini call
  is needed for images already accessible in the conversation or locally.
- **Native image posts:** use `postplus media prepare --source <url>`, then
  inspect the ordered originals. Read [image evidence](references/ordered-image-evidence.md).
- **Screenshots, text, color, or layout:** inspect sufficient images or local
  video frames without purchasing full video analysis. Read [video frames](references/video-frames.md).

An MP4 made from stills remains a video with a real timeline. Preparation must
return an actual local file before you treat it as downloaded evidence.
Keep multiple sources, failures, and outputs separate. Answer
follow-ups from existing reports and evidence without another paid analysis.

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

Omit `--prompt` for the default shot table and production notes described in
[video report](references/single-video-report.md). Supply it for the user's
specific question or requested format; do not append an unrelated full report.
`video-analysis` is the CLI capability key, not another Skill.
Use `postplus media schema --json` only when constructing or repairing an
unknown hosted media request shape; keep the generated command above for the
normal analysis path.

## Deliver

Embed inspected images or real screenshots in the conversation or Markdown,
with source, original page index or measured video timestamp, and the observation
each supports. Paths or folder links alone are not visual delivery. Never replace
missing evidence with a cover, generated image, or guessed description.

For a long report, show representative frames in chat and link the full Markdown.
Preserve returned model Markdown unchanged; add Agent-viewed screenshots and any
corrections in a separate evidence note. Save attachments beside the report using
relative links, verify those links, and retain them after temporary cleanup.
Never delete user files or delivered evidence.

State missing pages, unreadable text, unavailable audio, and inspected subsets.
A few frames do not prove full audio/video coverage. Distinguish visible facts,
captured wording, interpretation, and claims that need external verification.

## Recover

Report observed progress while waiting. Let the CLI perform bounded recovery;
after a disconnected wait use its emitted poll or checkpoint command for the
same task, account, and environment. Do not restart an uncertain paid analysis.
A content-quality concern or rewording request does not authorize a paid redo.

For an unambiguous local parameter rejection before remote work starts, use the
command's `--help` and existing user input for one correction. If submission may
have started, follow only its emitted recovery command. Use `postplus doctor --skill media-analysis` for readiness
diagnostics after a readiness failure. Preserve task identity if submission may have happened.
Honor quote challenges using existing explicit cost authorization when sufficient;
otherwise ask for approval, then use the provided confirmation/retry commands.

For a terminal failure, give its stage, reason, operation id when present, cost
status, and concrete next step. Unknown results do not mean no charge. Deliver
useful partial evidence with its limits; never claim unseen material was analyzed.
