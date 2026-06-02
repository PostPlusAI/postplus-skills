---
name: sourcing-selection
description: Synthesize supply-side and demand-side evidence into a practical sourcing judgment for a product, niche, or shortlist without collapsing platform data collection and business judgment into one step.
metadata:
  postplus:
    familyId: marketplace-sourcing
    familyName: Marketplace, Sourcing, and Growth
---

# Sourcing Selection

## Use When
- The user wants a sourcing or product-selection judgment, not just raw platform data.
- Supply-side evidence and demand-side evidence need to be combined.
- A product idea, supplier signal, channel opportunity, or shortlist needs a
  cautious go/no-go or next-step memo.

## Do Not Use When
- Do not replace platform collection skills.
- Do not claim hosted supplier collection from this released skill surface.
- Do not turn incomplete evidence into a confident sourcing recommendation.

## Core Rule
A sourcing judgment is only as strong as its weakest missing layer.

Always separate:

- observed evidence
- inference
- missing layer

If evidence is incomplete, return a provisional judgment, supporting signals,
and the missing layer instead of fake certainty.

## Minimal Decision Model
Use this order unless the user asks otherwise:

1. demand proof
2. competition shape
3. channel fit
4. merchant-model fit
5. supply-side feasibility
6. unit-economics pressure
7. compliance or operational risk

## Input Shapes
- Product idea validation: demand proof, supply feasibility, then synthesis.
- Supply-led opportunity check: supplier or cheap-supply signal first, then
  matching demand proof and channel fit.
- Demand-led sourcing check: marketplace, search, or content demand first, then
  supply feasibility.
- Shortlist comparison: normalize candidates into one decision frame, compare
  strongest evidence and biggest gaps, then rank cautiously.

## Capability Routing
- Supply-side source: user-provided supplier sheets, quotations, or approved
  marketplace data. Do not imply a released hosted 1688 collector.
- Search-intent source: use `google-trends-research` for early momentum and
  rising-query signals.
- Search-led demand: use `google-trends-research` for rising-query signals and
  user-provided marketplace exports for listings, reviews, price bands, and
  channel-native competition.
- Content-language fit: use `tiktok-research` when demos, hooks, audience
  language, or content-led selling matter.
- Instagram/Meta social proof: use `social-media-extractor` before choosing
  the platform-specific collector.

## Output Shape
The artifact packages the decision memo as JSON with product or niche, target
channel, decision, demand signals, supply signals, rationale, missing layers,
and recommended next step when provided.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Handoff
- Evidence missing -> route to the right collection skill first.
- Memo complete -> hand `decision.json` to research expansion, supplier
  outreach, channel decision, or brief creation.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- This public skill is instruction-driven. Produce the artifact described by the workflow directly from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
