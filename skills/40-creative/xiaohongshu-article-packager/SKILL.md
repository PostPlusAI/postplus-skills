---
name: xiaohongshu-article-packager
description: Lay out an existing draft or script into a Xiaohongshu image-post or long-image package without rewriting the source. Use this when the user wants pagination, hierarchy, image placement, and renderable HTML/CSS while preserving the original wording, information density, and voice of the source text.
---

# Xiaohongshu Article Packager

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

Use this skill when the user wants:

- 一篇原稿变成可发的小红书图文
- 口播稿改成图文分页
- 给一段观点内容做分页、层级、配图和可渲染页面
- 产出适合后续排版或渲染的结构化内容包，但保留原文

This skill is for `layout packaging`.
It is not for:

- platform scraping
- competitor research
- direct posting
- fabricating claims not present in the source
- rewriting the source by default

If the request is mainly about platform research, use `skills/20-research/xiaohongshu-research`.

## Core Idea

Do not turn the source into a different piece of writing.

The job has two layers:

1. `structure without rewrite`
   - split the source into readable pages
   - choose which original lines deserve larger emphasis
   - preserve the original sequence unless the user asks to reorder
2. `render packaging`
   - assign page roles
   - place images
   - prepare clean layout instructions or HTML/CSS for rendering

The default goal is:

- readable
- faithful to the original wording
- faithful to the original information density
- faithful to the original voice

## Inputs

Typical source inputs:

- a markdown file
- a long paragraph dump
- a script written for talking-head video
- rough bullets
- a merged note with too much information

Useful optional inputs:

- preferred page count
- image assets to place
- desired visual direction
- whether the output is:
  carousel pages or one long image

If these are missing, infer the smallest safe set from the source.

## Output Contract

Default outputs should be a package with these sections:

1. `Source Rule`
   - state that the wording is preserved
2. `Cover Copy`
   - only use original lines or original line fragments unless the user explicitly allows rewriting
3. `Page Plan`
   - 6 to 10 pages by default
   - one clear purpose per page
4. `Page Copy`
   - source text assigned to each page
5. `Layout Brief`
   - structured instructions for downstream layout
6. `Render Files`
   - optional HTML/CSS when requested

When the user asks for files, prefer:

- `01-outline.md`
- `02-titles.md`
- `03-pages.md`
- `04-caption.md`
- `05-layout-brief.md`

Read [`references/output-template.md`](references/output-template.md) when composing the package.

## Default Workflow

### 1. Respect the source as immutable by default

Unless the user explicitly asks for rewriting:

- do not paraphrase
- do not compress
- do not add summary lines
- do not add CTA lines
- do not add a separate caption

Allowed operations:

- split into pages
- promote original lines into headline size
- move image modules around the source text
- add neutral page labels

### 2. Decide the page architecture

Default to `6-10` pages.

Each page should do one job only:

- cover
- tension
- key distinction
- proof or explanation
- consequence
- closing or CTA

Do not use page breaks mechanically every N characters.
Split on natural paragraph or sentence boundaries from the source.

### 3. Write for page readability without rewriting

For each page:

- keep one main point
- give it a visible title or emphasis line only by promoting original source lines
- avoid dense wall-of-text blocks
- make the first two lines legible without context from the previous page

If a page exceeds reasonable density, split it.

### 4. Prepare layout-aware copy

Assume the downstream renderer or layout model benefits from structure.

For each page, clearly separate:

- `pageRole`
- `headline` from source if used
- `subhead` if needed
- `body` from source
- `emphasisLines` from source if used

Then prepare a consolidated layout brief.

Read [`references/layout-system.md`](references/layout-system.md) when the user wants the warm-gradient card style from the referenced PDF.

## Quality Rules

### 1. Source-first

Do not invent authority, case studies, metrics, or personal stories not present in the source.

### 2. No stealth rewriting

Do not silently change:

- sentence rhythm
- information density
- spoken-language phrasing
- the user's own wording habits

### 3. Avoid AI-shaped cleanup

Do not force the source into:

- neat binary formulas
- over-organized summary language
- your own preferred phrasing patterns

If the source says it one way, keep that way unless explicitly asked to rewrite.

### 4. Cover copy must be from the source

The cover should use:

- original lines
- or original line fragments

not a fresh headline invented by the model.

## Heuristics

### Good cover material

- strong original opening lines
- strong original judgments
- strong original rhetorical questions

### Weak cover material

- lines that only work after a lot of setup
- lines that require new explanation from the model

## Common Input Shape

A common use case is:

- a draft in the active work folder or a nearby project directory
- especially talking-head scripts or founder/operator viewpoint drafts
- output needs to feel publishable on Xiaohongshu without losing the original opinion

For example:

- `口播稿 -> 小红书图文分页`
- `观点长文 -> 封面 + 标题 + 8 页图文`
- `创始人表达 -> 更适合图文阅读的版本`

## Default File Placement

If the user asks you to write outputs to disk, prefer creating a sibling folder next to the source draft, for example:

```text
<source-dir>/<draft-name>-xhs-package/
```

Store the package files there using the default filenames from the output contract.

## Release-Shell Execution Contract

- keep page planning notes, source extracts, and intermediate packaging files
  under `<work-folder>/.postplus/xiaohongshu-article-packager/`
- keep only final user-facing page packages outside `.postplus/`
- start with a bounded first pass on one draft and one package target before
  broader packaging
- if the source is insufficient or under-specified, stop immediately instead of
  inventing missing material or relying on customer-specific path assumptions

## Failure Modes

Stop and say the source is insufficient if:

- there is no clear argument
- the draft is only slogans
- the user expects claims or case studies not in the material

Then offer one of:

- a lighter layout pass
- a request for more source material
- a narrower page selection based on what is actually present
