# TikTok Ad Task Shapes

Use this file to classify paid TikTok research requests before collection.

## 1. Top Ads Market Scan

Use when the user asks:

- 某国家最近什么广告在跑
- 某行业 top ads 有哪些
- 先给我一个 paid creative map

Preferred actor:

- `tiktok-creative-center-top-ads`

## 2. Keyword-Led Ad Scan

Use when the user asks:

- 搜某个品牌或产品词相关广告
- 想看某个产品卖点在广告里怎么包装

Preferred actor:

- `tiktok-creative-center-top-ads`

Focus on:

- `keyword`
- optional industry / objective / language filters

## 3. Objective-Led Creative Research

Use when the user asks:

- 找 product sales / conversion / app install 这类目标下的广告
- 对比不同 objective 的创意外壳

Preferred actor:

- `tiktok-creative-center-top-ads`

Focus on:

- objective filters
- repeated CTA and offer framing

## 4. Spotlight Inspiration Pull

Use when the user asks:

- 直接给我平台精选 top ads
- 我要月度灵感库

Preferred actor:

- `tiktok-creative-center-top-ads`

Use:

- `top_ads_spotlight=true`

This ignores most other filters except:

- `include_analytics`
- `include_keyframe_metrics`
- `limit`

## Failure Pattern To Avoid

Do not answer these tasks with organic creator data.

If the user really wants:

- creators
- comments
- hooks from organic UGC

then switch to `skills/tiktok-research`.
