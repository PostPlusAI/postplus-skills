---
name: social-media-extractor
description: High-level entry point for cross-platform public social data extraction when the user has not named a platform-specific workflow yet.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Social Media Data Extraction

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill only as a high-level entry point when the user asks for cross-platform public data extraction and has not named a platform-specific workflow yet.

This file is intentionally lightweight. Platform-specific collection logic lives elsewhere:

- TikTok: `tiktok-research`
- TikTok music archive downloads: `tiktok-music-archive-downloader`
- TikTok music chain: `postplus-shared` TikTok music workflow
- TikTok ads: `tiktok-ad-research`
- Instagram creator discovery: `instagram-creator-discovery`
- Instagram accounts: `instagram-account-research`
- Instagram content benchmark: `instagram-content-benchmark`
- Instagram audience voice: `instagram-audience-voice`
- Instagram campaign scouting: `instagram-campaign-scout`
- X: `x-tools`
- YouTube: `youtube-research`
- Facebook: `facebook-research`

## Core Rule

Do not run generic collection actors by default from this skill.

Instead:

1. identify the platform
2. route into the dedicated platform skill
3. let that skill choose the actor, input shape, normalization, and analysis flow

## PostPlus Runtime Rule

This skill is for deciding the first research path, not for staying as a permanent execution layer.
Once the route is clear, move into the narrowest useful platform skill and keep the work there.

In the PostPlus runtime, downstream platform access follows
`postplus-shared` public skill rules.

## When This Skill Is Appropriate

Use it when the user says things like:

- "Collect social media data for trend analysis"
- "Do a cross-platform content study"
- "Inspect TikTok, Instagram, and X"
- "First help me decide which platform fits this topic best"
- "I want to understand this brand's status across different social platforms"

## When This Skill Is Not Appropriate

Do not stay in this skill when the request is already specific, for example:

- TikTok creator discovery
- TikTok benchmark or comments research
- TikTok sound-specific video collection or music archive download
- Instagram account enrichment
- X account or tweet research

Route immediately to the narrower skill.

For Instagram, choose the downstream skill from the user intent:

- creator shortlist or partnership discovery -> `instagram-creator-discovery`
- content benchmark, format study, or angle analysis -> `instagram-content-benchmark`

## Output Expectation

If multiple platforms are involved, return a merged research package with:

- `raw/` per platform
- `normalized/` per platform
- one platform-specific summary per platform
- one merged comparison summary only after each platform has been normalized first

If the user wants to keep moving after research, the next layer should depend on the output:

- creator shortlist or partnership path -> `creator-discovery-router` or `creator-outreach`
- strategy or concept handoff -> `benchmark-to-brief`
- publishing or distribution execution -> only after the content is already packaged into publish-ready copy, assets, or approved deliverables
