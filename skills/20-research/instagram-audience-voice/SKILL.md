---
name: instagram-audience-voice
description: Mine Instagram comments to extract audience language, pain points, objections, FAQs, and purchase-intent signals from shortlisted posts or Reels.
metadata:
  postplus:
    familyId: instagram
    familyName: Instagram
---

# Instagram Audience Voice

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when the user wants to:

- understand what people say in Instagram comments
- extract pain points, objections, and FAQs
- find real language for ads, captions, or scripts
- compare audience reaction across shortlisted content

Read these references before implementation:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/20-research/instagram-references/actor-selection.md`
- `${CLAUDE_SKILL_DIR}/_postplus_shared/20-research/instagram-references/normalized-schema.md`
- `${CLAUDE_SKILL_DIR}/_postplus_shared/20-research/instagram-references/tool-contracts.md`

Use these embedded support scripts when a local execution step is needed:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/20-research/instagram-tools/scripts/run_instagram_actor.mjs`
- `${CLAUDE_SKILL_DIR}/_postplus_shared/20-research/instagram-tools/scripts/normalize_instagram_dataset.mjs`
- `${CLAUDE_SKILL_DIR}/_postplus_shared/20-research/instagram-tools/scripts/cluster_instagram_comments.mjs`

## Primary Hosted Collection Key

- `instagram-comments`

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

## Public Skill Execution Contract

- keep shortlisted post inputs, raw comment datasets, normalized outputs, and
  clustering caches under `<work-folder>/.postplus/instagram-audience-voice/`
- keep only final user-facing summaries or reusable copy notes outside
  `.postplus/`
- start from a bounded first pass:
  - a small shortlist of posts
  - one or two themes
  - comments only after the shortlist exists
- if PostPlus Cloud service is unavailable, unauthorized, or returns a stable
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
