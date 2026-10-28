# Local contact sheets and video frames

Start with the Skill's default video command for a local video or supported URL:

```bash
postplus media analyze video-analysis \
  --video ./reference.mp4 \
  --json \
  --output ./contact-sheet.json
```

The CLI acquires the source when needed and returns local sheets plus individual
frames. It does not buy cloud inference. Collection may cost credits; Agent image
inspection also uses context/usage. A readable local video needs no account login.
`postplus media prepare --source <url-or-local-path>` remains available for source
acquisition alone; it is not a replacement for the initial contact sheet.
Reuse the returned local original for every later screenshot or cloud operation.
Use command help for local frame controls; `postplus media schema --json` is only
for repairing an unknown cloud input, not for local preparation or preflight.
For X, obtain the video with available Agent tools first. An unavailable file
is a stated evidence limit, not permission to buy full analysis for screenshots.
The CLI uses ffmpeg/ffprobe, including ffmpeg's drawtext, scale and tile filters.
If a dependency is missing, follow the CLI/doctor concrete action. If no
executable action is provided, report the missing dependency and affected task
and stop; do not guess installation commands or administrator permissions.

## Inspect, then refine locally

The default survey combines one-second sampling, scene-change candidates and the
last decoded frame. Inspect all returned sheets needed for the question, in
chronological order. Long videos produce multiple pages; do not compress them
into one unreadable sheet or claim pages that were not inspected.

Scene detection is a candidate finder. It can miss subtle transitions or changes
inside one shot. A short shot can lie entirely between one-second samples, and
an action outcome can occur after the last whole-second sample. Check the ending
and refine relevant intervals before claiming precise shot order or action.

For a brief overlay, fast cut or action, use the retained original and narrower
local sampling; for example:

```bash
postplus media analyze video-analysis \
  --video ./retained-original.mp4 \
  --start-seconds 4 \
  --end-seconds 5 \
  --frame-interval-seconds 0.1 \
  --json \
  --output ./detail-frames.json
```

Open the returned individual full-size frames for logos, small copy, product
features or UI text. A contact sheet is an index, not a sufficient view of tiny
details. Repeat local refinement only for an unresolved question, not as a
blanket second review.

Use the manifest's measured `timestampSeconds` for elapsed time. Labels and
`sourceTimestampSeconds` use the source presentation clock; a nonzero start is
recorded separately. Never derive original timing from filenames, seek targets
or nominal frame rate. Exact shot boundaries need adjacent-frame inspection;
one-second gaps are not shot durations or proof of smooth movement.

Embed the real frames with measured times and the observations they support.
Retain readable attachments beside the report. Do not delete user footage.
Frame-only evidence cannot establish unheard speech, music or sound. Subtitles
are visible text; uninspected audio is unassessed, not absent. Stay local for
visual gaps. Escalate only when important spoken information needed for the
answer remains unavailable from subtitles; use the cloud reference for that step.

For login, compatibility, or local usage failures, follow the typed CLI action. If a task may already exist, use only its emitted recovery
command.
