---
name: instagram-audience-voice
description: Mine Instagram comments to extract audience language, pain points, objections, FAQs, and purchase-intent signals from shortlisted posts or Reels.
---

# Instagram Audience Voice

Follow shared release-shell rules in:

- `postplus-shared` release-shell rules

Use this skill when the user wants to:

- understand what people say in Instagram comments
- extract pain points, objections, and FAQs
- find real language for ads, captions, or scripts
- compare audience reaction across shortlisted content

Read these references before implementation:

- `skills/20-research/instagram-references/actor-selection.md`
- `skills/20-research/instagram-references/normalized-schema.md`
- `skills/20-research/instagram-references/tool-contracts.md`

## Primary Actor

- `instagram/comment-scraper`

## Entry Requirement

Do not start from a huge blind set of posts.

Prefer one of these first:

- benchmark shortlist from `instagram-content-benchmark`
- manually provided post URLs
- a small set of competitor top posts

## Recommended Workflow

1. collect comments from a shortlisted set of posts or reels
2. normalize comments
3. cluster comments by theme and intent
4. separate high-signal language from low-signal reactions
5. summarize actionable audience voice

## Release-Shell Execution Contract

- keep shortlisted post inputs, raw comment datasets, normalized outputs, and
  clustering caches under `<work-folder>/.postplus/instagram-audience-voice/`
- keep only final user-facing summaries or reusable copy notes outside
  `.postplus/`
- start from a bounded first pass:
  - a small shortlist of posts
  - one or two themes
  - comments only after the shortlist exists
- if hosted capability is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

## Good Output

Return:

- top comment themes
- repeated questions
- objections or skepticism
- purchase or trial intent signals
- exact phrases worth reusing in copy
- comments that suggest unmet needs

## Suggested Buckets

- praise
- objection
- question
- purchase-intent
- request-for-details
- low-signal / meme

## Handoff

Escalate to campaign or content strategy workflows when:

- the user wants to turn audience language into hooks, offers, or creative briefs
