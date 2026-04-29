# Chunk Modes

Chunking decides how a normalized transcript timeline is turned into subtitle-sized units before render.

The first supported mode is `basic`.

## `basic`

Goal:

- keep the system simple and predictable
- stay close to the STT provider's original timing
- only split segments when a subtitle line is clearly too long

Rules:

- input must be `normalized-transcript.json`
- keep original segment boundaries by default
- if a segment is short enough, keep it as one subtitle chunk
- if a segment is too long, split it into smaller chunks by words
- assign sub-chunk timing proportionally within the original segment time range
- do not merge adjacent source segments in v1
- do not infer semantic emphasis in v1

Suggested defaults:

- `maxCharsPerChunk = 30`
- `maxWordsPerChunk = 12`
- `minDuration = 0.8`
- `maxLines = 2`
- `maxCharsPerLine = 16`

Good for:

- first-pass SRT export
- edit review
- subtitle baseline generation

Not intended for:

- kinetic captions
- word-by-word highlighting
- emphasis-aware packaging
- platform-specific dramatic pacing

## Output Expectation

`basic` should produce chunks that are:

- readable
- traceable back to source segments
- close to the original transcript timing

It is intentionally conservative.
