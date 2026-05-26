---
name: creator-discovery-router
description: Route creator discovery requests into the right collection strategy before platform execution. Use this when the user wants to find creators, KOLs, KOCs, influencers, or partnership candidates and the request includes constraints such as follower range, niche, audience, geography, language, or collaboration fit. This skill decides whether to use handle-first, content-first, graph-first, or mixed discovery, then hands off to TikTok, Instagram, X, and creator-outreach skills.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Creator Discovery Router

## Use When
- The user wants creators, KOLs, KOCs, influencers, or partnership candidates.
- The request includes platform, niche, follower band, audience, geo, language,
  seeds, competitor handles, or collaboration fit.
- The first decision is how to collect candidates before outreach.

## Do Not Use When
- Do not collect platform data in this skill; route to the narrowest downstream collector.
- Do not expose internal route labels in user-facing explanations.
- Do not stop at route diagnosis when the next skill is already clear.

## Core Rule
Do not treat every "find creators" request as keyword profile search.

Extract the real constraints first: platform, follower range, recall range,
topic, audience, geo/language, creator type, recency, activity, seeds, and
contactability. Use a wider recall band when platform search is noisy, then
tighten the shortlist later.

## Route Modes
- `handle-first`: use when the user already has seed creators, competitor
  handles, usernames, or watchlists. Enrich profiles and recent content.
- `content-first`: use when niche fit, active posting, content relevance, or
  follower-band discovery matters. Collect content first, then enrich authors.
- `graph-first`: use when good candidates are hidden in clusters, hashtags,
  collaborations, mentions, local-language scenes, or seed-adjacent networks.
- `mixed`: use when discovery needs multiple passes, such as content-first for
  active creators, graph-first expansion, then handle-first enrichment.

## Routing Heuristics
- Follower range plus niche fit should prefer `content-first` or `graph-first`,
  not keyword-only account search.
- Content relevance should collect posts/videos before ranking creators.
- Audience fit should use recent content patterns, language, and repeated
  framing instead of trusting bios alone.
- Creator type should be classified before final shortlist: individual creator,
  brand/product account, educator/consultant, or aggregator.
- Existing seeds should start `handle-first`; contact-ready leads should be
  collected, enriched, scored, then handed to outreach.

## Default Workflow
1. Normalize the brief internally.
2. Create a machine-readable route artifact when it is useful.
3. Explain the plan in plain business language.
4. Hand off in the same turn when platform and route are clear.
5. Ask one short clarification only when the answer changes the route.

## Output Shape
The artifact contains `platform`, `route`, `primarySkill`, `explanation`, and
`handoffReady`. Use that output as the route artifact, then carry the user's
business constraints into the downstream collector.

## Fail Fast
- Fail or ask only when platform ambiguity, seed availability, or route goal
  would change the collection strategy.
- Do not use public web search as the primary route when a released platform
  collector is available.

## Handoff
- TikTok discovery -> `tiktok-research`.
- Instagram creator discovery -> `instagram-creator-discovery`.
- Instagram account enrichment -> `instagram-account-research`.
- X account discovery or enrichment -> `x-tools`.
- Outreach preparation after shortlist -> `creator-outreach`.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill creator-discovery-router`.
- This public skill is instruction-driven. Produce the artifact described by the workflow directly from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
