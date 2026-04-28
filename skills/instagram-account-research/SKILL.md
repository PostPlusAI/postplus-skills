---
name: instagram-account-research
description: Research Instagram accounts for creator discovery, competitor profiling, and account health snapshots using hosted collection profile, post, and follower-count actors.
---

# Instagram Account Research

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

Use this skill when the user wants to:

- evaluate creators or KOL/KOC candidates
- compare competitor Instagram accounts
- inspect a brand account's profile, output, and rough momentum
- build a shortlist of accounts worth deeper content analysis

Do not use this as the default first pass for open-ended creator discovery when the user cares about follower bands, topical fit, or audience fit inferred from actual content. In those cases, route to `skills/instagram-creator-discovery/SKILL.md` first.

Read these references before implementation:

- `skills/instagram-references/actor-selection.md`
- `skills/instagram-references/normalized-schema.md`
- `skills/instagram-references/tool-contracts.md`

## Primary Actors

- `instagram/profile-scraper`
- `instagram/post-scraper`
- `instagram/followers-count-scraper`

## Recommended Workflow

1. collect a profile snapshot for each username
2. collect a small recent-post sample for each shortlisted account
3. collect follower-count snapshots only if momentum matters
4. normalize profile and post outputs
5. rank accounts by audience size, engagement proxy, posting cadence, and relevance
6. return a shortlist plus account notes

## Cost Discipline

Start with:

- 5-15 usernames
- 6-12 recent posts per account
- follower snapshots only for the final shortlist

Do not start with broad market scraping.

## Release-Shell Execution Contract

- keep shortlist briefs, actor inputs, raw datasets, normalized datasets, and
  ranking caches under `<work-folder>/.postplus/instagram-account/`
- keep only final user-facing summaries or shortlist exports outside
  `.postplus/`
- compile the request into a small username or URL batch before the expensive
  collection step
- if hosted capability is unavailable, unauthorized, or returns a stable
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
