---
name: social-media-extractor
description: High-level entry point for cross-platform public social data extraction when the user has not named a platform-specific workflow yet.
---

# Social Media Data Extraction

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

Use this skill only as a high-level entry point when the user asks for cross-platform public data extraction and has not named a platform-specific workflow yet.

This file is intentionally lightweight. Platform-specific collection logic lives elsewhere:

- TikTok: [`skills/tiktok-research/SKILL.md`](skills/tiktok-research/SKILL.md)
- TikTok music/sound collection: [`skills/tiktok-music-sound-collector/SKILL.md`](skills/tiktok-music-sound-collector/SKILL.md)
- TikTok music archive downloads: [`skills/tiktok-music-archive-downloader/SKILL.md`](skills/tiktok-music-archive-downloader/SKILL.md)
- TikTok music chain: [`${CLAUDE_SKILL_DIR}/_postplus_shared/shared-tiktok-music-workflow.md`](skills/shared-tiktok-music-workflow.md)
- TikTok ads: [`skills/tiktok-ad-research/SKILL.md`](skills/tiktok-ad-research/SKILL.md)
- TikTok Shop: [`skills/tiktok-shop-research/SKILL.md`](skills/tiktok-shop-research/SKILL.md)
- Instagram creator discovery: [`skills/instagram-creator-discovery/SKILL.md`](skills/instagram-creator-discovery/SKILL.md)
- Instagram accounts: [`skills/instagram-account-research/SKILL.md`](skills/instagram-account-research/SKILL.md)
- Instagram content benchmark: [`skills/instagram-content-benchmark/SKILL.md`](skills/instagram-content-benchmark/SKILL.md)
- Instagram audience voice: [`skills/instagram-audience-voice/SKILL.md`](skills/instagram-audience-voice/SKILL.md)
- Instagram campaign scouting: [`skills/instagram-campaign-scout/SKILL.md`](skills/instagram-campaign-scout/SKILL.md)
- X: [`skills/x-research/SKILL.md`](skills/x-research/SKILL.md)
- LinkedIn: [`skills/linkedin-research/SKILL.md`](skills/linkedin-research/SKILL.md)
- YouTube: [`skills/youtube-research/SKILL.md`](skills/youtube-research/SKILL.md)
- Facebook: [`skills/facebook-research/SKILL.md`](skills/facebook-research/SKILL.md)

## Core Rule

Do not run generic collection actors by default from this skill.

Instead:

1. identify the platform
2. route into the dedicated platform skill
3. let that skill choose the actor, input shape, normalization, and analysis flow

## Product-Shell Rule

This skill is for deciding the first research path, not for staying as a permanent execution layer.
Once the route is clear, move into the narrowest useful platform skill and keep the work there.

In the product shell, downstream platform access follows
`${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`.

## When This Skill Is Appropriate

Use it when the user says things like:

- "帮我抓社媒数据做趋势分析"
- "做一个跨平台内容研究"
- "把 TikTok、Instagram、X 都看一遍"
- "先帮我判断这个题目更该看哪个平台"
- "我想知道这个品牌在不同社媒上分别是什么状态"

## When This Skill Is Not Appropriate

Do not stay in this skill when the request is already specific, for example:

- TikTok creator discovery
- TikTok benchmark or comments research
- TikTok sound-specific video collection or music archive download
- TikTok Shop creator analytics
- Instagram account enrichment
- X account or tweet research

Route immediately to the narrower skill.

## Output Expectation

If multiple platforms are involved, return a merged research package with:

- `raw/` per platform
- `normalized/` per platform
- one platform-specific summary per platform
- one merged comparison summary only after each platform has been normalized first

If the user wants to keep moving after research, the next layer should depend on the output:

- creator shortlist or partnership path -> `skills/creator-discovery-router` or `skills/creator-outreach`
- strategy or concept handoff -> `skills/benchmark-to-brief`
- publishing or distribution execution -> only after the content is already packaged into publish-ready copy, assets, or approved deliverables
