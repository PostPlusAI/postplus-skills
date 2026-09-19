# Local subtitle conversion

Read only when the user requests SRT or ASS from an existing, genuinely timed
transcript. The agent converts it locally; this is not a CLI export command and
must not start transcription, inference, or another paid operation.

## Input and timing

- Inspect the actual transcript format and its declared units. Map observed text,
  start, and end times; do not assume a production JSON schema or infer missing
  times from file names, word counts, or duration proportions.
- Every cue must have nonempty text and finite nonnegative start/end times with
  end strictly later than start. Validate all cues before writing any output.
  Reject invalid or missing times without partial exports; preserve source files.
- Keep source order and one cue per timed segment by default. Preserve genuine
  overlaps; do not silently trim, shift, or merge them. Split a long segment only
  at actual word/phrase timestamps. Without them, preserve the segment and report
  the readability limitation; do not invent timing for nicer captions.
- For format precision, round nonnegative times to the nearest millisecond for
  SRT or centisecond for ASS, with exact half units rounded up. Handle carries
  across seconds/minutes/hours. If rounding collapses a cue, stop rather than
  lengthening it without evidence.

## Output

Write UTF-8 text with LF newlines. Preserve wording and Unicode; normalize source
line endings to LF. Do not add styling or interpret source text as markup.

SRT uses sequential integers beginning at 1, `HH:MM:SS,mmm --> HH:MM:SS,mmm`,
the original cue text, and a blank line between cues. Hours have at least two
digits. Keep multiline cue text on separate lines.

For plain ASS, use this minimal header and one event per cue (no extra styles):

```text
[Script Info]
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,1,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
```

Events are `Dialogue: 0,H:MM:SS.cc,H:MM:SS.cc,Default,,0,0,0,,<text>`.
Preserve commas inside the final text field and encode line breaks as `\N`.
If source text contains ASS control sequences or braces that could become style
commands, stop the ASS export and report that escaping needs a verified renderer
policy; do not silently remove text. SRT may still be provided if requested.

Use a local conversion method already available to the agent. If it requires a
missing dependency such as Python, follow a concrete CLI/doctor action or stop
and explain the affected export; do not guess an install command or permissions.
Save final subtitle files outside `.postplus`, keep the transcript unchanged, and
return file paths, source path, selected format, and any timing/readability limits.
