# PostPlus Skills

PostPlus Skills is the local skill catalog installed through PostPlus CLI.

It is meant to help a user or coding agent do repeatable work across research, sourcing, media analysis, content generation, and packaging without rediscovering the workflow every time.

## What This Package Contains

The `skills/` folder is organized as a set of focused skills plus a few shared rulebooks:

- `skills/INDEX.md` is the human-readable catalog
- `skills/registry.json` is the machine-readable manifest
- `skills/shared-*.md` files are shared routing or workflow rules
- each `skills/*/SKILL.md` file describes one skill family

Canonical naming uses `xiaohongshu-*` for Xiaohongshu-related skills. Some
published skill ids use the shorter `xhs-*` form where the catalog already
exposes that name.

## How To Use It

1. Start with the user intent, not the file name.
2. Open `skills/INDEX.md` to find the right family.
3. Read the target `SKILL.md` and any referenced shared rulebook.
4. Follow the skill’s recommended workflow and failure rules.
5. If the task spans multiple families, use the shared rulebooks first, then chain the specialist skills.

## Main Skill Families

- Cross-platform routing: choose the right platform or discovery route
- Platform research: TikTok, Instagram, X, YouTube, LinkedIn, Facebook, and Xiaohongshu research flows
- Marketplace and sourcing: 1688, Amazon, TikTok Shop, Google Trends, and sourcing judgment
- Media and creative production: transcription, video analysis, B-roll, prompt architecture, generation, and QA
- Xiaohongshu packaging: notes, article packaging, card notes, and media collection
- Release utilities: released-surface discovery and install guidance

## Shared Rulebooks

These files are not standalone skills. They are reusable rulebooks that help multiple skills work together:

- `skills/shared-release-shell-rules.md`
- `skills/shared-research-preferences.md`
- `skills/shared-product-selection-preferences.md`
- `skills/shared-tiktok-music-workflow.md`

Use them when a task is broader than a single skill, or when a skill explicitly references one of them.

## Examples

### Example 1: Find creators for outreach

Use:

- `creator-discovery-router`
- then `instagram-creator-discovery`, `tiktok-research`, or `x-research`
- then `creator-outreach`

Typical flow:

1. decide the route
2. collect candidates
3. enrich profiles
4. shortlist
5. draft outreach

### Example 2: Research content and profiles

Use:

- `shared-research-preferences.md`
- `social-media-extractor`
- `creator-discovery-router`
- `instagram-creator-discovery`
- `instagram-account-research`
- `tiktok-research`
- `youtube-research`
- `linkedin-research`
- `x-research`

Typical flow:

1. decide which platform or discovery route matters first
2. collect creator, account, bio, profile, post, or comment evidence
3. compare the strongest candidates
4. decide whether to deepen research or hand off to outreach or synthesis

### Example 3: Analyze a video and prepare an edit plan

Use:

- `media-router`
- `video-transcription` or `audio-transcription`
- `frame-extraction`
- `broll-catalog-builder`
- `broll-match-engine`
- `editing-decision-engine`

Typical flow:

1. route the media task
2. transcribe or extract frames
3. analyze structure and proof
4. match B-roll to beats
5. package the edit decision

### Example 4: Produce a Xiaohongshu content package

Use:

- `xiaohongshu-research`
- `xiaohongshu-account-research`
- `xiaohongshu-content-benchmark`
- `xiaohongshu-media-collector`
- `xiaohongshu-card-notes` or `xiaohongshu-article-packager`

Typical flow:

1. benchmark the account or topic
2. collect usable assets
3. adapt the source material
4. package it into a card or long-image layout

### Example 5: Publish or share finished work

Use:

- `skill-finder-cn` when the user needs the smallest released install path
- a dedicated external publishing tool only after the local artifact is complete

Typical flow:

1. finish the local artifact
2. verify which released skill actually covers the next step
3. install or update that released skill through PostPlus CLI
4. stop and say so directly if the released surface does not cover the requested destination

### Example 6: Research a product opportunity

Use:

- `shared-product-selection-preferences.md`
- `1688-research`
- `amazon-research`
- `tiktok-shop-research`
- `google-trends-research`
- `sourcing-selection`

Typical flow:

1. identify merchant model and channel
2. collect supply and demand evidence
3. compare fit and risks
4. write a sourcing judgment

## Practical Rules

- Do not use a routing skill as if it were the final collector.
- Do not use a collector as if it were a synthesis skill.
- Do not use a synthesis skill as if it were a publishing tool.
- If a task is unclear, start with the index and the shared rulebooks.
- If the task touches external systems, treat it as higher risk and verify the target carefully.

## Catalog Files

- `skills/INDEX.md` is the readable map.
- `skills/registry.json` is the machine-readable manifest.
- `skills/SKILL.md` files are the source of truth for each skill family.
- Shared rulebooks should stay small and stable.
