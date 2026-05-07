# Card Layout Spec

Use these defaults unless the user explicitly overrides them.

## Canvas

- Aspect ratio: `3:4`
- Recommended size: `1242 x 1656`

This is the default production target for Xiaohongshu card notes on the public skill surface.

## Type Scale

- Cover title: `48-60px`, bold
- Subtitle / tag: `24-30px`
- Body text: `15-16px`
- Body line height: `1.3-1.5`
- Notes / source labels: `20-24px`

## Density Rules

- Do not assume every page must be sparse
- Light pages should still usually carry only `1-2` information points
- Dense memo pages may carry `3-6` short paragraphs
- Text blocks may exceed `3` lines if the page is intentionally explanation-led
- If a table is important, split it across pages or show only the most decision-useful fields

## Hierarchy Rules

- Use left alignment by default
- Use whitespace to separate blocks instead of adding more borders
- Highlight only key words, not full paragraphs
- Use one main emphasis color plus one support color plus background
- If there is an existing reference design in the source material, inherit its palette and card system first

## Preferred Visual Language For This Workspace

When adapting the current AI creator outreach materials, prefer:

- soft blue-white gradients
- black or deep navy navigation / label pills
- large rounded cards
- white or pale blue surfaces
- black headline text on light surfaces
- blue accent for metrics and highlights
- sectional contrast that looks like a SaaS landing page instead of a note app screenshot
- one strong hero surface plus one supporting information surface per page when possible
- cards that feel layered: background glow, surface, inset module, badge

When the user provides a strong landing page or HTML reference, inherit from
that source first:

- `#edf1ff` style light background family
- luminous blue hero gradients
- deep navy pill navigation
- oversized radius values
- clean white proof cards and metric chips

Avoid falling back to:

- generic dark dashboards
- flat black memo cards with no product feel
- harsh neon palettes unrelated to the source HTML
- evenly padded plain text pages with no hierarchy break

## Visual Structure

Good page rhythm:

- headline
- one supporting paragraph or bullet group on light pages
- multiple short paragraphs on dense memo pages
- one proof element if needed
- one anchor module that visually carries the page

Good proof elements:

- metric cards
- short tables
- screenshot crops
- one simple chart
- one strong image with lower text block
- full-page text memo with strong paragraph rhythm

Avoid:

- too many font sizes on one page
- too many colors
- dense text with no paragraph spacing
- stacked decorations with no informational role
- memo pages that look detached from the reference landing page

## Output Reminder

When writing card copy for this layout, compress selectively.

If a page becomes hard to scan, split it.
If splitting destroys the argument, keep the page dense and improve hierarchy instead.
