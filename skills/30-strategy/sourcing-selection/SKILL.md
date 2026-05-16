---
name: sourcing-selection
description: Synthesize supply-side and demand-side evidence into a practical sourcing judgment for a product, niche, or shortlist without collapsing platform data collection and business judgment into one step.
metadata:
  postplus:
    familyId: marketplace-sourcing
    familyName: Marketplace, Sourcing, and Growth
---

# Sourcing Selection

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when the user is not just asking for platform data, but for a real sourcing or product-selection judgment.

Typical requests:

- Whether this product is worth sourcing
- Whether to start with Amazon or TikTok Shop
- There is supply on 1688, but whether demand-side evidence supports it
- Combine supply-side and demand-side evidence for a judgment
- Give me a sourcing conclusion closer to a real decision

This skill is an orchestration and synthesis layer.

It should not replace platform skills.
It should decide which evidence to collect, in what order, and how much judgment is justified.

Read first:

- `postplus-shared` product-selection preferences

## Design Goal

Keep the current version simple, but make the interface extensible.

The skill should think in capability groups, not hard-coded platforms:

- `supply-side source`
- `search-intent source`
- `demand-side source`
- `content-language source`
- `finance layer`
- `compliance layer`

Today, these groups may map to:

- `1688` for supply-side
- `Google Trends` for search-intent
- `Amazon` for search-led demand
- `TikTok Shop` for marketplace demand
- `TikTok` for content and audience language

In the future, the same groups may map to:

- `Alibaba`, `Made-in-China`, `GlobalSources`, `Temu supplier-side`, offline vendor lists
- `Google Trends`, `Baidu Index`, ad-library, search-console-like, `Shopee`, `Etsy`, `Temu`, `independent-site`

Do not write the skill as if `1688 + Amazon + TikTok Shop` are permanent.

## Core Rule

A sourcing judgment is only as strong as its weakest missing layer.

Always separate:

- `Observed from evidence`
- `Inference`
- `Missing layer`

If the user asks for a yes/no decision and the evidence is incomplete, return:

- the provisional judgment
- what supports it
- what is still missing

Do not fake certainty.

## Minimal Decision Model

Use this order unless the user explicitly asks otherwise:

1. demand proof
2. competition shape
3. channel fit
4. merchant-model fit
5. supply-side feasibility
6. unit-economics pressure
7. compliance or operational risk

This is intentionally simple.
Do not turn it into a giant scorecard unless the user asks.

## Input Shapes

Classify the request first:

### 1. Product Idea Validation

Use when the user asks:

- Whether this product is worth pursuing
- Whether this direction can be sourced and sold

Default route:

1. collect demand-side proof
2. collect supply-side feasibility
3. synthesize

### 2. Supply-Led Opportunity Check

Use when the user already has a supply-side signal:

- I see a lot of supply on 1688
- A factory or category looks cheap
- There is already a batch of candidate suppliers

Default route:

1. inspect supply-side evidence
2. collect matching demand-side proof
3. test channel fit
4. synthesize

### 3. Demand-Led Sourcing Check

Use when the user already has a demand-side signal:

- It sells well on Amazon
- Many sellers are selling it on TikTok Shop
- A type of content is hot on TikTok

Default route:

1. inspect demand-side proof
2. collect supply-side feasibility
3. synthesize

### 4. Shortlist Comparison

Use when the user has:

- several products
- several niches
- several supplier options

Default route:

1. normalize each candidate into the same decision frame
2. compare strongest evidence and biggest gaps
3. rank cautiously

## Capability Routing

Choose sources by role, not by habit.

### Supply-Side Source

Use for:

- factory options
- supplier variety
- MOQ
- tiered pricing
- customization
- location

Current public release route:

- use user-provided supplier sheets, quotations, or approved marketplace data
  as supply-side evidence
- do not claim hosted 1688 collection from the released skill surface

### Demand-Side Source

Use for:

- listings
- pricing
- reviews
- order or ranking proof
- bestseller shape
- channel-native competition

Current preferred routes:

- Amazon search-led demand -> `skills/20-research/amazon-research`

### Search-Intent Source

Use for:

- early demand signals
- topic or keyword momentum
- geo search interest
- rising-query discovery

Current preferred route:

- Google search-intent -> `skills/20-research/google-trends-research`

Treat this as an early signal layer.
Do not confuse it with transaction demand or channel-native competition proof.

### Content-Language Source

Use when content-led selling matters:

- what hooks are working
- what user language repeats
- what visual demo style fits the product

Current preferred route:

- `skills/20-research/tiktok-research`

If the request is broader than one named platform and the goal is to compare social proof or audience language across networks, route first through:

- `skills/10-routing/social-media-extractor`

Use this layer only when it changes the decision.
Do not force it into every sourcing task.

When social proof is cross-platform, do not let one familiar network stand in for the whole market.
Use the extractor to decide which platform-specific research skill should collect first.

## Extensibility Rule

When a new platform appears, do not rewrite the decision model.

Instead, map it into one of these roles:

- `supply-side`
- `search-intent`
- `demand-side`
- `content-language`
- `finance`
- `compliance`

Then state:

- what role the source covers
- what role is still missing

This keeps the skill stable while letting the source set expand.

## Good Output

Return a compact decision memo with:

- product or niche
- target merchant model
- target channel
- observed evidence
- provisional judgment
- biggest risks
- missing layer
- recommended next step

Good recommendation shapes:

- `promising, but demand proof still thin`
- `good Amazon search fit, weak TikTok demo fit`
- `cheap supply exists, but competition is commodity-price-led`
- `strong demand and workable sourcing, but returns or compliance may kill margin`

If the result is going to move into execution, keep the handoff explicit:

- sourcing judgment -> merchant or channel decision
- merchant or channel decision -> research expansion, supplier outreach, or brief creation

Do not blur evidence collection, business judgment, and execution prep into one opaque step.

## Failure Modes To Avoid

Do not:

- treat one platform's popularity as universal demand proof
- treat cheap 1688 supply as a recommendation by itself
- jump from TikTok content heat to Amazon launch logic without search proof
- jump from Amazon demand to TikTok Shop without content-demo fit
- hide missing finance or compliance layers

## Current Workspace Default

At the moment, this skill should usually compose existing skills rather than create a brand-new collection workflow.

Current building blocks:

- supply-side: user-provided supplier sheets, quotations, or approved
  marketplace data
- search-intent: `skills/20-research/google-trends-research`
- search-led demand: `skills/20-research/amazon-research`
- content-language fit: `skills/20-research/tiktok-research`

Future sources should be slotted into the same roles.
