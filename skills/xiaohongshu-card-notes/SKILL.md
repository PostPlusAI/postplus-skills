---
name: xiaohongshu-card-notes
description: Turn an existing HTML page, landing page, oral script, memo draft, result table, or structured source material into a Xiaohongshu card-style image note. Use this when the user wants page-by-page card planning, cover copy, card text, or a design-ready Xiaohongshu图文 brief based on source material rather than writing a plain note from scratch. This skill is especially for 3:4 Xiaohongshu cards that may mix image-led pages with high-density memo pages, using strong information hierarchy and screenshot-worthy text density rather than generic sparse carousel copy.
---

# Xiaohongshu Card Notes

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

Use this skill when the user wants to turn existing material into a Xiaohongshu card-style note.

Typical source inputs:

- an HTML landing page
- a spoken script
- a markdown memo
- a result table or dashboard
- a case study page
- a workflow explanation that should become carousel cards

This skill is for card-style image notes, not for generic captions or long prose posts.

## Default Goal

Produce a Xiaohongshu card note that is:

- easy to scan on mobile
- visually structured
- page-by-page clear
- information-dense without losing scanability
- faithful to the source material

The target is not "rewrite beautifully."

The target is:

- extract the strongest message from the source
- map it into a small number of strong cards
- keep each page readable even when density is high
- make the output directly usable for design

## First Decision

Decide what the user actually needs:

### 1. `content-to-cards`

Use when the user has source material and wants a full Xiaohongshu card note structure.

Return:

- page plan
- cover title
- per-page headline
- per-page body copy

### 2. `layout-only`

Use when the user already has the page copy and wants packaging only.

Do not rewrite the substance unless asked.

### 3. `html-adaptation`

Use when the source is an HTML page or landing page.

Inspect:

- section hierarchy
- proof/data modules
- title system
- visual rhythm

Then convert it into Xiaohongshu pages rather than mirroring the full web layout.

### 4. `script-adaptation`

Use when the source is a spoken script.

Do not preserve spoken redundancy.
Compress the script into card-ready statements.

### 5. `hybrid-source`

Use when the user provides both an HTML page and a script.

Default behavior:

- take structure from the HTML if it is strong
- take judgment and phrasing from the script if it is stronger
- merge them into one card sequence

## Layout Rules

Read [references/card-layout-spec.md](references/card-layout-spec.md) whenever the user asks for design-ready card output.

Non-negotiable defaults:

- aspect ratio: `3:4`
- canvas size: `1242 x 1656`
- do not assume every page must be sparse
- some pages should be `image-led`
- some pages should be `dense memo pages`
- left alignment is the default
- use only a small number of emphasis treatments
- when a repo already contains a strong HTML or landing page reference, inherit its color system, card language, corner radius, and visual rhythm instead of inventing a new style
- when the user provides a strong HTML or landing page reference, treat that
  file as the visual source of truth for card rendering
- use the landing page's dark floating pill, luminous blue gradient blocks, pale blue surfaces, large radius cards, and black headlines on light backgrounds
- older black memo-card constraints are deprecated in the current release style and should be overridden when they conflict with the landing page reference

## Source Adaptation Workflow

Read [references/source-adaptation-workflow.md](references/source-adaptation-workflow.md) when adapting from HTML, scripts, or mixed sources.

The working order is:

1. identify the core claim
2. decide the card sequence
3. compress each page to one job
4. assign a page role
5. write card copy that fits the page role

## Page Roles

Common page roles:

- cover
- image-led cover
- problem
- hidden truth
- framework
- dense memo explanation
- proof / data
- case result
- workflow snapshot
- table screenshot page
- closing judgment

Not every note needs all of them.

Choose the smallest set that makes the story clear.

## Copy Rules

For each page:

- one page = one main takeaway
- do not flatten everything into short slogans
- prefer short declarative lines
- keep keywords strong and sparse
- preserve the user's judgment and operator tone
- avoid `不是……而是……` by default
- avoid `也就是说` by default
- prefer direct statements over rhetorical contrast templates

For dense memo pages:

- allow 3-6 short paragraphs when needed
- each paragraph should push one sub-point
- paragraph spacing matters more than bullet count
- the page should still feel screenshot-worthy on its own

For image-led pages:

- let the image carry pause, mood, or proof
- keep the copy compact but sharp
- use these pages to create rhythm between dense pages

If adapting from a spoken script:

- remove repeated setup
- remove oral filler
- keep the strongest lines
- convert explanation into page headlines and short supporting text

If adapting from HTML:

- do not reproduce navbar, footer, or web-only scaffolding
- keep hero claim, proof blocks, workflow blocks, and result table logic only if they help the card sequence
- web sections often need to be split into multiple cards

Do not force every section into a sparse card.
If the source contains strong reasoning, preserve it as a dense memo page.

## Output Shapes

Return the smallest useful output for the ask.

Common shapes:

- `图文结构`
- `封面标题备选`
- `逐页文案`
- `设计备注`
- `图文 brief`

For full card generation, default to this format:

`封面`
- title
- subtitle or tag

`第2页`
- headline
- body
- optional design note

Repeat page by page.

## Design Notes

Only include design notes when they help execution.

Useful design notes:

- text hierarchy
- suggested emphasis word
- suggested chart / table / screenshot use
- whether the page should be mostly text or mostly visual
- which parts of the reference HTML visual language should be inherited
- which card should use hero-gradient treatment
- which card should use white proof-table treatment
- which card should use pale-blue supporting surfaces instead of dark memo panels

Avoid vague notes like "make it aesthetic."

## Density Preference

This workspace now prefers a denser Xiaohongshu note style than generic carousel cards.

Default preference:

- mix sparse and dense pages
- let some pages read like high-value memo screenshots
- allow stronger paragraph density when the reasoning matters
- use images or screenshots to create breathing room between dense pages

Do not use `3 lines max` as a universal rule.
That only applies to light pages, not to memo pages.

## Anti-Patterns

Do not:

- dump the whole script onto cards unchanged
- mirror a webpage section-for-section without compression
- overload each page with too many bullets
- use too many highlight colors
- make every page equally loud
- add generic Xiaohongshu fluff that weakens trust

## Default Input Shape

A common input shape is:

- professional scripts
- structured HTML pages
- result tables
- proof-heavy workflow explanations

Default preference:

- preserve the strongest judgments from the source
- convert proof into visible card pages
- turn tables or dashboards into one or more dedicated proof cards
- mix high-density memo pages with visual proof pages
- make the final output feel like a professional Xiaohongshu carousel, not a repackaged web page

## Release-Shell Execution Contract

- keep page plans, source extracts, and intermediate layout notes under
  `<work-folder>/.postplus/xiaohongshu-card-notes/`
- keep only final user-facing card copy or design briefs outside `.postplus/`
- start with a bounded first pass on one source document and a small card set
- fail fast if the required source material is missing or under-specified
  instead of inventing missing proof or using customer-specific fallback
  assumptions
