# ASS Contract

This file defines the generic contract for rendering ASS subtitles from a chunked normalized transcript.

The first profile is `basic`.

## Inputs

ASS rendering should consume:

- a `normalized-transcript.json` file with `schemaVersion = subtitle-normalized/v1`
- a chunk mode, such as `basic`
- an ASS profile JSON

The renderer may chunk the normalized transcript before writing the ASS file.

## ASS Profile Shape

```json
{
  "profileId": "basic",
  "script": {
    "playResX": 704,
    "playResY": 1280,
    "wrapStyle": 2,
    "scaledBorderAndShadow": "yes"
  },
  "style": {
    "name": "Default",
    "fontname": "Helvetica",
    "fontsize": 52,
    "primaryColour": "&H00FFFFFF",
    "secondaryColour": "&H000000FF",
    "outlineColour": "&H00111111",
    "backColour": "&H00000000",
    "bold": 1,
    "italic": 0,
    "underline": 0,
    "strikeOut": 0,
    "scaleX": 100,
    "scaleY": 100,
    "spacing": 0,
    "angle": 0,
    "borderStyle": 1,
    "outline": 3,
    "shadow": 0,
    "alignment": 2,
    "marginL": 48,
    "marginR": 48,
    "marginV": 160,
    "encoding": 1
  },
  "highlight": {
    "enabled": true,
    "primaryColour": "&H0058D7FF",
    "keywords": ["product", "gmail", "reply", "draft", "workflow", "warmer"]
  },
  "layout": {
    "maxLines": 2,
    "maxCharsPerLine": 16
  }
}
```

## Output

The renderer should output a valid `.ass` file with:

- `[Script Info]`
- `[V4+ Styles]`
- `[Events]`

Each dialogue line should come from one chunked subtitle segment.

## `basic` Profile

Goal:

- clean default subtitle
- high contrast
- bottom-centered
- strong readability
- no animation
- no karaoke
- no word highlighting
- light keyword highlighting for product and selling-point words

Rules:

- one dialogue event per chunk
- use `Default` style only
- no custom per-line override tags in v1
- preserve source text exactly except ASS escaping

## Future Extension Surface

Later profiles may add:

- platform-safe vertical offsets
- larger social-caption typography
- top captions for UI-heavy demos
- keyword highlighting
- karaoke timing
- bilingual stacking
- richer highlight rules
