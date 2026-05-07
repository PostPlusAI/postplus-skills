# Layout System

Use this reference when the user wants the visual direction inspired by the referenced "layout expert" PDF.

This is not a strict renderer spec.
It is a stable visual brief for downstream HTML, image, or design generation.

## Default Look

- warm premium background, not flat white
- dark outer stage or deep container
- white or near-white reading card as the main content surface
- strong contrast, clean spacing, modern editorial feel

## Stable Design Decisions

- Background: warm gradient rather than plain color
- Main canvas: centered card composition
- Card feeling: elevated, calm, premium
- Corners: rounded, not sharp
- Shadows: layered and soft, not muddy
- Reading feel: strong whitespace and obvious hierarchy

## Suggested Base Tokens

- Canvas ratio: portrait
- Default artboard: `600 x 1000`
- Outer spacing: generous
- Card radius: medium to large
- Inner padding: about `48-56px`
- Divider use: minimal

## Typography Direction

- Chinese headline font: a serious, editorial serif or serif-like Chinese family when available
- Body font: a readable sans-serif
- Monospace only for code, labels, or token-like emphasis

If exact fonts are unavailable, preserve the hierarchy:

- headline: elegant and high-contrast
- body: neutral and readable
- utility text: technical and restrained

## Text Hierarchy

- Cover headline: large, decisive, short
- Page headline: concise and visible
- Body: short paragraphs or short bullets
- Emphasis lines: larger or bolder than body, used sparingly

## Color Direction

- background: warm gold / sand / brown gradient family
- card: white or off-white
- text: dark charcoal
- accent: restrained teal, muted gold, or dark warm gray

Do not let accents overpower the reading experience.

## Composition Rules

- one dominant content block per page
- no cluttered collage layout by default
- prefer left alignment for reading pages
- keep breathing room around emphasis lines
- avoid squeezing too much text into a single page

## Cover Rules

- cover should feel like a poster, not a document screenshot
- use 1 strong headline and optional 1 supporting line
- do not dump paragraphs on the cover

## Page Rules

Each page should support one of these roles:

- cover
- belief being challenged
- key distinction
- explanation
- example
- implication
- closing

Make the visual weight match the page role.

## Renderer Handoff

When handing off to a renderer or HTML generator, specify:

- page count
- page role for each page
- headline
- body
- emphasis lines
- visual tone
- whether the page should feel sparse or dense
