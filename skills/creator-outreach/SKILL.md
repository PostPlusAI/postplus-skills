---
name: creator-outreach
description: Build creator lead lists for TikTok, Instagram, and X by turning normalized platform datasets into outreach-ready leads with contact signals, shortlist logic, and draft outreach messages. Use this when the user wants creator discovery, contact extraction, shortlist building, or outreach prep.
---

# Creator Outreach

Follow shared release-shell rules in:

- `skills/shared-release-shell-rules.md`

Use this skill when the user wants to:

- find creator or influencer leads across TikTok, Instagram, and X
- combine multiple discovery routes into one candidate pool
- extract public contact signals such as email or link-in-bio URLs
- convert normalized platform datasets into a single outreach-ready lead table
- prepare outreach drafts before Gmail or CRM delivery

Read these references before implementation:

- `skills/creator-outreach/references/lead-schema.md`
- `skills/creator-outreach/references/routing.md`

## Core Method

Do not lock this skill to one niche, one follower band, or one creator archetype.

Use a two-stage model:

1. build a candidate pool from one or more discovery routes
2. run one shared shortlist pass across those candidates

This skill is the shortlist and outreach layer above the platform skills. It should not assume:

- only mid-tier creators matter
- only one niche matters
- keyword account search is the only discovery path
- content-first is always the best path

Choose the route that fits the job.

Default posture:

- keep the default flow light
- add deeper evidence only when the user request clearly needs it

Do not turn every creator discovery task into a full competitor-plus-comments-plus-market-fit investigation by default.

## Discovery Routes

Use one or more of these routes before lead building:

### 1. Official pool route

Examples:

- TikTok Shop Seller Center creator marketplace
- platform-native creator marketplace exports
- manually assembled seller-center handle lists

Use when:

- the user already has an official marketplace export
- the platform exposes filtering for category, market, follower band, or engagement
- the goal is to build a first-pass candidate pool quickly

Current capability:

- this skill can ingest exported or manually copied handle lists after they are normalized into local datasets
- this skill does not currently automate clicking through seller-center UI
- use this route only when the user already has official-pool data or explicitly wants that route

### 2. Keyword search route

Do not search only category nouns.

Prefer combinations like:

- core product term + `review`
- core product term + `unboxing`
- core product term + `haul`
- problem/use-case term + `routine`
- commerce tags such as `TikTokMadeMeBuyIt`, `TikTokShop`, or platform-native shopping tags when relevant

Use when:

- the user needs broad market discovery
- the user wants creators actively posting around a product or use case
- there is no strong seed list yet

This is a common default discovery route when no stronger seed source exists.

### 3. Competitor backtracking route

Start from:

- competitor brand accounts
- competitor product videos
- competitor collab posts
- competitor comment sections

Inspect:

- creators already collaborating with the competitor
- posts with shopping or partner signals
- active commenters asking for link, shade, size, price, or buying help
- likely KOC accounts that can be expanded later

Use when:

- the user wants faster conversion-oriented discovery
- the user has direct competitors with visible creator activity
- the goal is to shorten the path from discovery to outreach

This is an optional enhancement layer, not a default requirement.

### 4. Content-first route

Find relevant posts first, then pull the authors, then enrich the profiles.

Use when:

- the user wants people who are clearly publishing the right content
- account names and bios are weak signals
- the job is format-aware or content-angle-aware discovery

This is often the best default when follower band and content fit both matter.

### 5. Known-handle enrichment route

Use when:

- the user already has handles
- the next step is profile enrichment, contact extraction, or outreach prep

## Screening Dimensions

After discovery, shortlist candidates with a shared framework.

Always consider:

- account type:
  - individual creator
  - KOC
  - educator / consultant
  - brand / product account
  - aggregator / media page
- content fit:
  - does the account repeatedly post around the product, problem, use case, or audience
- audience fit:
  - target market
  - likely audience segment
  - language
  - market relevance
- style fit:
  - visual style
  - creator tone
  - trustworthiness
  - cultural fit
- engagement quality:
  - likes
  - comments
  - shares
  - comment intent quality
- outreach readiness:
  - public email
  - link-in-bio
  - past collab signals
  - stable posting behavior

Do not treat follower count as the only priority.

Follower band should be chosen per campaign:

- head creators for reach
- mid-tier creators for repeatable paid or affiliate work
- small creators or KOCs for low-cost seeding or testing

## Default vs Optional Depth

Default flow:

1. pick one sensible discovery route
2. collect platform data
3. build leads
4. extract public contact signals
5. score and shortlist

Optional enhancement layers:

- official-pool import
- competitor backtracking
- comment-intent evidence
- TikTok Shop commerce signals
- deeper market / language / style review

Only add these when:

- the user explicitly asks for them
- the core shortlist is weak and the next-best move is to deepen evidence
- the campaign type clearly depends on that signal

Avoid stacking all optional layers into the first pass.

## Current Automation vs Manual Judgment

This skill can score automatically from local normalized data:

- follower scale
- visible contact signals
- niche overlap from bio and profile text
- platform preference
- coarse account type inference

This skill cannot reliably infer from current data unless the platform dataset already includes it:

- follower geography
- precise audience market distribution
- deep style quality judgment
- language nuance and cultural fit
- competitor collaboration history from off-platform evidence
- comment-level purchase intent unless comments were explicitly collected upstream

When these factors matter, treat them as required manual or upstream-research checks, not hidden assumptions.

## Workflow

### 1. Choose the discovery route first

Pick the route based on the user request:

- official pool export -> normalize or manually structure it, then enrich
- broad discovery -> platform search route
- competitor scouting -> collect creator candidates from competitor content first
- content-angle discovery -> content-first route
- known handles -> direct enrichment route

If the user gives no special constraints, prefer the lightest route that is likely to produce a usable shortlist.

### 2. Collect platform data

Do not scrape raw platform data directly from this skill unless the platform skill is missing something critical.

Use:

- `skills/tiktok-research`
- `skills/instagram-account-research`
- `skills/x-research`

The expected input to this skill is normalized profile data or normalized profile-like exports from those platform skills.

The lead builder can also accept richer candidate-like datasets when they already include fields such as:

- `route`
- `topicFit`
- `audienceFit`
- `sourceEvidence`
- engagement proxies
- comment or commerce evidence

### 3. Build a unified lead table

Convert normalized profile datasets into one shared lead schema:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/build_creator_leads.mjs \
  --inputs <work-folder>/.postplus/tiktok-profiles.json,<work-folder>/.postplus/instagram-profiles.json,<work-folder>/.postplus/x-profiles.json \
  --output <work-folder>/.postplus/creator-leads.json
```

### 4. Extract contact signals

Only use public signals already visible in platform data:

- email in bio / signature / description
- website or link-in-bio

Do not guess email addresses.

```bash
node ${CLAUDE_SKILL_DIR}/scripts/extract_contact_signals.mjs \
  --input <work-folder>/.postplus/creator-leads.json \
  --output <work-folder>/.postplus/creator-leads-enriched.json
```

### 5. Score and shortlist

Before drafting, score and filter the lead list when the user wants a shortlist rather than the full dataset.

Important:

- treat score as a first-pass ranking, not final truth
- apply campaign-specific overrides for market fit, style fit, and creator type
- if the dataset does not support those checks, call them out explicitly
- do not add deeper evidence collection unless the user request or result quality justifies it

```bash
node ${CLAUDE_SKILL_DIR}/scripts/score_creator_leads.mjs \
  --input <work-folder>/.postplus/creator-leads-enriched.json \
  --brief <work-folder>/.postplus/brand-brief.json \
  --platforms tiktok,instagram,x \
  --output <work-folder>/.postplus/creator-leads-scored.json

node ${CLAUDE_SKILL_DIR}/scripts/shortlist_creator_leads.mjs \
  --input <work-folder>/.postplus/creator-leads-scored.json \
  --min-score 45 \
  --top 20 \
  --output <work-folder>/.postplus/creator-leads-shortlist.json
```

### 6. Generate outreach drafts

Use a structured brief to generate a draft set.

Minimal brief:

```json
{
  "brandName": "Example Brand",
  "productName": "Example Product",
  "niche": "creators relevant to the product, audience, or use case",
  "offer": "a creator partnership or product collaboration",
  "whyYou": "your content feels relevant to this product and audience",
  "cta": "Would you be open to hearing more?",
  "signature": "Name | Brand"
}
```

Then generate drafts:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/generate_outreach_drafts.mjs \
  --leads <work-folder>/.postplus/creator-leads-shortlist.json \
  --brief <work-folder>/.postplus/brand-brief.json \
  --output <work-folder>/.postplus/creator-outreach-drafts.json
```

## Output Expectations

Return:

- a shortlist of creators worth contacting
- fit scores and fit reasons that explain ordering
- contact signals with explicit provenance
- explicit notes on missing evidence when market fit or style fit could not be verified from the dataset
- risks:
  - no email found
  - only link-in-bio found
  - niche mismatch
  - weak audience scale
  - uncertain target-market fit
  - uncertain style or cultural fit
- outreach drafts ready for review or Gmail draft creation

## Decision Rules

- If the user asks for generic creator discovery, choose the discovery route first instead of defaulting to one search pattern.
- If the user already has normalized profile datasets, jump straight to lead building.
- If the user has official marketplace exports or a seller-center shortlist, treat that as a first-class input.
- If the user wants competitor-based discovery, collect creator candidates from competitor assets before running enrichment.
- If the user does not explicitly ask for competitor, comment, official-pool, or commerce-layer evidence, do not force those layers into the default pass.
- If the user wants cold email or partnership prep, always extract contact signals before drafting.
- Default to drafting, not sending.

## Notes

- This skill is the cross-platform layer above individual platform research skills.
- Gmail sending should stay in a separate delivery step.
