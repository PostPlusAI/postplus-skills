# TikTok Ad Task Shapes

Use this file to classify paid TikTok research requests before collection.

## 1. Top Ads Market Scan

Use when the user asks:

- Which ads are running recently in a country
- Which top ads exist in an industry
- Give me an initial paid creative map

Preferred actor:

- `tiktok-creative-center-top-ads`

## 2. Keyword-Led Ad Scan

Use when the user asks:

- Search ads related to a brand or product term
- Want to see how a product selling point is packaged in ads

Preferred actor:

- `tiktok-creative-center-top-ads`

Focus on:

- `keyword`
- optional industry / objective / language filters

## 3. Objective-Led Creative Research

Use when the user asks:

- Find ads under objectives such as product sales, conversion, or app install
- Compare creative wrappers across different objectives

Preferred actor:

- `tiktok-creative-center-top-ads`

Focus on:

- objective filters
- repeated CTA and offer framing

## 4. Spotlight Inspiration Pull

Use when the user asks:

- Give me platform-curated top ads directly
- I need a monthly inspiration library

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

then switch to `tiktok-research`.
