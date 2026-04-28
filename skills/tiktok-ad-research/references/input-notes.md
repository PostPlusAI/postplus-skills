# TikTok Ad Input Notes

These notes summarize the currently documented capabilities of:

- `codebyte/tiktok-creative-center-top-ads`

Based on the actor page, the input supports at least:

- region filtering
- industry filtering
- objective filtering
- ad language filtering
- ad format filtering
- top likes percentage filtering
- brand or product keyword search
- `include_analytics`
- `include_keyframe_metrics`
- `top_ads_spotlight`
- `limit`

Documented behavior:

- `include_analytics=true` adds landing page, ad caption, regions, objectives, performance counts, creative summary, and keyword insights
- `include_keyframe_metrics` adds second-by-second metrics such as retention, CTR, CVR, clicks, and conversions
- `top_ads_spotlight=true` ignores most other filters except `include_analytics`, `include_keyframe_metrics`, and `limit`

## Practical Rule

For first-pass research, prefer:

```json
{
  "include_analytics": true,
  "limit": 20
}
```

Then add only one or two filters at a time:

- geo
- industry
- objective
- keyword

Do not turn on heavy keyframe metrics unless the user explicitly needs second-by-second analysis.
