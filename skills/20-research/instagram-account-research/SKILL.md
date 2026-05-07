---
name: instagram-account-research
description: Research Instagram accounts for creator discovery, competitor profiling, and account health snapshots using hosted profile and post collection.
metadata:
  postplus:
    familyId: instagram
    familyName: Instagram
---

# Instagram Account Research

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when the user wants to:

- evaluate creators or KOL/KOC candidates
- compare competitor Instagram accounts
- inspect a brand account's profile, output, and rough momentum
- build a shortlist of accounts worth deeper content analysis

Do not use this as the default first pass for open-ended creator discovery when the user cares about follower bands, topical fit, or audience fit inferred from actual content. In those cases, route to `skills/20-research/instagram-creator-discovery/SKILL.md` first.

Read these references before implementation:

- `skills/20-research/instagram-references/actor-selection.md`
- `skills/20-research/instagram-references/normalized-schema.md`
- `skills/20-research/instagram-references/tool-contracts.md`

## Primary Hosted Collection Keys

- `instagram-profiles`
- `instagram-posts`

## Recommended Workflow

1. collect a profile snapshot for each username
2. decide which accounts deserve post collection from the profile results
3. collect a small recent-post sample for shortlisted accounts only
4. normalize profile and post outputs
5. rank accounts by audience size, engagement proxy, posting cadence, and relevance
6. return a shortlist plus account notes

Run profile and post collection serially as one serial queue. Do not start
`instagram-profiles` and `instagram-posts` in parallel, even if the user asks
for both account profiles and recent content. Use the profile result to narrow
the post batch before starting post collection. If a request would require a
broad profile pass plus a broad post pass, stop before collection and ask the
user to narrow the handle list or research theme.

## Cost Discipline

Start with:

- 5-15 usernames
- 6-12 recent posts per account

Do not start with broad market scraping.

## Public Skill Execution Contract

- keep shortlist briefs, actor inputs, raw datasets, normalized datasets, and
  ranking caches under `<work-folder>/.postplus/instagram-account/`
- keep only final user-facing summaries or shortlist exports outside
  `.postplus/`
- compile the request into a small username or URL batch before the expensive
  collection step
- if PostPlus Cloud service is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

## Good Output

Return:

- account snapshot table
- shortlist of strongest accounts
- likely creator / brand / store / meme-page type
- posting cadence estimate
- top recent content patterns
- risks:
  - inflated audience with weak engagement
  - inactive posting
  - weak topical fit

## Handoff

Escalate to `instagram-creator-discovery` when:

- the user does not already have a handle list
- the user wants niche creators rather than known accounts
- the user wants content-first search

Escalate to `instagram-content-benchmark` when:

- the user wants to understand which specific posts or reels work
- the user wants reusable hook or format patterns

Escalate to `instagram-audience-voice` when:

- the user wants comment-driven pain points or objections
