# Shared Product Selection Preferences

Shared routing rules for product-selection work.

Use this file first. It exists to help the agent choose the right path before collecting data or making recommendations.

## Merchant Models

Classify the business model first:

- `white-label`: generic or lightly customized products, speed and margin first
- `brand`: differentiated products, trust and premium first
- `distribution`: authorized resale, assortment and channel leverage first
- `content-led`: creator or media-driven selling, content efficiency first
- `hybrid`: mixed model, choose the dominant constraint first

Do not confuse merchant model with sales channel.

## Channels

Classify the main selling channel next:

- `amazon`: search-led marketplace
- `tiktok-shop`: content-led marketplace
- `independent-site`: audience and LTV-led storefront
- `multi-channel`: compare channel fit explicitly instead of averaging assumptions

Treat channel choice as a strategy question, not a formatting detail.

## Question Types

Classify the user request before doing any work:

- `platform data`: listings, prices, reviews, rankings, creators, comments, shop pages
- `social proof`: cross-platform content demand, audience language, creator traction, comment signals
- `supply chain`: factory options, MOQ, lead time, customization, packaging, logistics feasibility
- `financial judgment`: margin, contribution profit, break-even CPA, inventory pressure, return sensitivity
- `compliance risk`: restricted claims, category restrictions, certification or safety exposure
- `selection synthesis`: whether a product fits a merchant model and channel combination

Do not answer a platform-data question from generic web search if a platform skill exists.

## Skill Routing

Default route:

1. identify merchant model
2. identify channel
3. classify question type
4. collect the minimum valid evidence
5. synthesize only after evidence exists

Use these routes:

- Instagram/Meta demand or content proof -> `social-media-extractor`
- TikTok content and audience language -> `tiktok-research`
- Instagram creator/content/comment proof -> `instagram-research`
- supply-side product or supplier data -> user-provided supplier sheets,
  quotations, or approved marketplace exports
- cross-source sourcing judgment -> `sourcing-selection`
- Hook, structure, and why content works -> `video-analysis`
- Creative benchmark adaptation -> `benchmark-to-brief`

If no supply-chain or finance skill exists yet, state the missing layer clearly and avoid false confidence.

## Minimum Judgment Order

Use this order unless the user asks otherwise:

1. Is there real demand or proof of demand?
2. What kind of competition is this: price, content, trust, supply, or search ranking?
3. Does this product fit the target channel?
4. Does this product fit the merchant model?
5. Can the unit economics survive ads, fees, shipping, and returns?
6. Is the compliance or operational risk acceptable?

Do not jump from "people are selling it" to "we should sell it."

## Failure Patterns To Avoid

- mixing merchant model and channel into one label
- using TikTok signals to justify an Amazon-first launch without search proof
- using Amazon demand to justify TikTok Shop without content-demo fit
- using one social platform's proof as if it represents all audience demand without checking channel fit
- skipping margin and return sensitivity because top-line demand looks strong
- treating "product selection" as one workflow when the real bottleneck is supply chain or finance
