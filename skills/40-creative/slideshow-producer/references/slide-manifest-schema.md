# Slide Manifest Schema

The slide manifest is the single source of truth for a slideshow. It is a JSON file that AI writes and the user reviews. It feeds image generation and text compositing.

## Full Schema

```json
{
  "manifestVersion": "slideshow/v1",
  "slideshowId": "unique-slug",
  "platform": "tt",
  "aspectRatio": "9:16",
  "canvasPx": "1080x1920",
  "totalSlides": 6,
  "createdAt": "2026-05-09T00:00:00Z",
  "updatedAt": "2026-05-09T00:00:00Z",
  "slides": [
    {
      "position": 1,
      "cognitiveJob": "hook",
      "prompt": "concise scene description, core + vibe",
      "overlayText": "i tried everything",
      "overlayStyle": {
        "color": "#FFFFFF",
        "strokeColor": "#000000",
        "strokeWidth": 3,
        "fontSize": 56,
        "position": "upper-center",
        "maxLines": 2
      },
      "imageSource": "generate",
      "localImagePath": null,
      "generationMode": "text-to-image",
      "referenceImagePaths": [],
      "referenceImageUrls": [],
      "generatedImagePath": null,
      "finalImagePath": null,
      "status": "pending"
    }
  ]
}
```

## Field Reference

### Top-Level

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| manifestVersion | string | yes | `"slideshow/v1"` |
| slideshowId | string | yes | Unique identifier for this slideshow |
| platform | string | yes | `"tt"` or `"ig"` |
| aspectRatio | string | yes | `"9:16"`, `"4:5"`, or `"1:1"` |
| canvasPx | string | yes | `"1080x1920"` or `"1080x1350"` or `"1080x1080"` |
| totalSlides | number | yes | Number of slides |
| createdAt | string | yes | ISO 8601 timestamp |
| updatedAt | string | yes | ISO 8601 timestamp, updated on every save |
| slides | array | yes | Ordered array of slide objects |

### Slide Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| position | number | yes | 1-indexed slide order |
| cognitiveJob | string | yes | What this slide does: hook, problem, insight, proof, product, cta, context, escalation, payoff, validation |
| prompt | string | yes | Image generation prompt (core scene + vibe, 2-3 sentences) |
| overlayText | string\|null | yes | Text overlaid on the image; null if no overlay |
| overlayStyle | object | no | Text rendering style (uses defaults if omitted) |
| imageSource | string | yes | `"generate"` or `"local"` |
| localImagePath | string\|null | yes | Absolute path to local image; null if generating |
| generationMode | string\|null | yes | `"text-to-image"` when generating without references; `"edit"` when references exist; null for local slides |
| referenceImagePaths | string[] | yes | Absolute local reference image paths for generated edit-mode slides; empty when not used |
| referenceImageUrls | string[] | yes | Uploaded HTTP(S) reference image URLs for generated edit-mode slides; empty when not used |
| generatedImagePath | string\|null | no | Set after generation completes |
| finalImagePath | string\|null | no | Set after text compositing |
| status | string | yes | `"pending"`, `"generating"`, `"generated"`, `"approved"`, `"rejected"` |

## Generation Routing Invariants

- Local final-image slides use `imageSource: "local"`, require `localImagePath`, set `generationMode: null`, and keep both reference arrays empty.
- Generated slides without reference images use `imageSource: "generate"`, set `generationMode: "text-to-image"`, and keep both reference arrays empty.
- Generated slides with one or more reference images use `imageSource: "generate"` and must set `generationMode: "edit"`.
- `referenceImagePaths` are uploaded with `upload_media.mjs`; the returned URLs are copied into `referenceImageUrls` before `edit_image.mjs` runs.
- A slide with non-empty `referenceImagePaths` or `referenceImageUrls` must never use `generationMode: "text-to-image"`.

### OverlayStyle Object

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| color | string | `"#FFFFFF"` | Text color (hex) |
| strokeColor | string | `"#000000"` | Stroke/outline color |
| strokeWidth | number | 3 | Stroke width in px |
| fontSize | number | 56 | Font size in px (relative to 1080px canvas) |
| position | string | `"upper-center"` | `"upper-center"`, `"center"`, `"lower-center"` |
| maxLines | number | 2 | Maximum lines of text |

### ProductOverlay Object (optional)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| imagePath | string | (required) | Absolute path to product logo/PNG |
| position | string | `"bottom-right"` | `"bottom-right"`, `"bottom-left"`, `"top-right"`, `"top-left"`, `"bottom-center"` |
| width | number | 180 | Logo width in px (relative to 1080px canvas) |
| margin | number | 40 | Distance from edge in px |

## Cognitive Job Values

Standard values for `cognitiveJob`:

- `hook` — first slide, must grab attention instantly
- `problem` — show the pain or desire
- `insight` — reveal a non-obvious truth
- `proof` — show evidence (results, receipts, before/after)
- `product` — introduce the product naturally
- `cta` — soft call to action
- `context` — additional framing or backstory
- `escalation` — raise the stakes
- `payoff` — emotional resolution
- `validation` — social proof or external credibility

## Status Lifecycle

```
pending → generating → generated → approved
                   ↘ rejected → pending (re-generate)
```

Local slides skip `generating` and go directly to `generated`.

## Example Manifest

```json
{
  "manifestVersion": "slideshow/v1",
  "slideshowId": "back-pain-fix-001",
  "platform": "tt",
  "aspectRatio": "9:16",
  "canvasPx": "1080x1920",
  "totalSlides": 6,
  "createdAt": "2026-05-09T10:00:00Z",
  "updatedAt": "2026-05-09T10:00:00Z",
  "slides": [
    {
      "position": 1,
      "cognitiveJob": "hook",
      "prompt": "iphone photo of a person holding their lower back in pain, sitting on a living room couch, natural afternoon light, frustrated but not dramatic expression, slightly candid framing",
      "overlayText": "i tried everything",
      "overlayStyle": {
        "color": "#FFFFFF",
        "strokeColor": "#000000",
        "strokeWidth": 3,
        "fontSize": 56,
        "position": "upper-center",
        "maxLines": 2
      },
      "imageSource": "generate",
      "localImagePath": null,
      "generationMode": "text-to-image",
      "referenceImagePaths": [],
      "referenceImageUrls": [],
      "status": "pending"
    },
    {
      "position": 2,
      "cognitiveJob": "problem",
      "prompt": "flat lay of common back pain products on a bed — heating pad, pain relief cream, massage ball, rolled towel, all looking used, natural bedroom light, phone snapshot aesthetic",
      "overlayText": "nothing worked",
      "imageSource": "generate",
      "localImagePath": null,
      "generationMode": "text-to-image",
      "referenceImagePaths": [],
      "referenceImageUrls": [],
      "status": "pending"
    },
    {
      "position": 3,
      "cognitiveJob": "insight",
      "prompt": "a simple diagram or handwritten note on a real piece of paper: 'weak core → bad posture → back pain', sitting on a wooden desk next to a coffee mug, feels like someone's personal notebook page",
      "overlayText": "then i realized",
      "imageSource": "generate",
      "localImagePath": null,
      "generationMode": "text-to-image",
      "referenceImagePaths": [],
      "referenceImageUrls": [],
      "status": "pending"
    },
    {
      "position": 4,
      "cognitiveJob": "proof",
      "prompt": "iphone screenshot of a notes app or health tracking app showing improvement over 2 weeks, slightly tilted, held in a hand with the living room in the background",
      "overlayText": "2 weeks later",
      "imageSource": "generate",
      "localImagePath": null,
      "generationMode": "text-to-image",
      "referenceImagePaths": [],
      "referenceImageUrls": [],
      "status": "pending"
    },
    {
      "position": 5,
      "cognitiveJob": "product",
      "prompt": "the posture corrector device sitting on a real home desk, next to a half-full water bottle and laptop, natural room lighting, not product photography — more like someone just put it down after using it",
      "overlayText": "this changed it",
      "imageSource": "generate",
      "localImagePath": null,
      "generationMode": "text-to-image",
      "referenceImagePaths": [],
      "referenceImageUrls": [],
      "status": "pending"
    },
    {
      "position": 6,
      "cognitiveJob": "cta",
      "prompt": "person sitting comfortably at their desk, relaxed posture, natural smile, working on laptop, same room as slide 1, golden afternoon light, feels like a genuine moment not a posed shot",
      "overlayText": "link in bio",
      "imageSource": "generate",
      "localImagePath": null,
      "generationMode": "text-to-image",
      "referenceImagePaths": [],
      "referenceImageUrls": [],
      "status": "pending"
    }
  ]
}
```
