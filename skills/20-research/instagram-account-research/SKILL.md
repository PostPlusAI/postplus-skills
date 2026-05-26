---
name: instagram-account-research
description: Research Instagram accounts for creator discovery, competitor profiling, and account health snapshots using hosted profile and post collection.
metadata:
  postplus:
    familyId: instagram
    familyName: Instagram
---

# Instagram Account Research

Use this skill for known Instagram accounts: creator snapshots, competitor
profiles, brand account checks, and shortlists worth deeper content analysis.

Apply shared rulebook and user-guidance rules from `postplus-shared`.

## Do Not Use When

- The user has no handle list and wants open-ended creator discovery. Route to
  `instagram-creator-discovery`.
- The user wants post/Reel pattern mining rather than account evaluation. Route
  to `instagram-content-benchmark`.
- The user wants comment language or objections. Route to
  `instagram-audience-voice`.

## Collection Key Routing

Released hosted collection keys:

- `instagram-profiles`: profile snapshots for known usernames or profile URLs.
- `instagram-posts`: recent public posts for shortlisted accounts only.

Use hosted collection outputs and the workflow below when collection, normalization, or ranking is needed.

## Default Workflow

1. Confirm the user has known handles, usernames, or profile URLs.
2. Collect `instagram-profiles` for the handle list.
3. Decide which accounts deserve recent-post collection from profile results.
4. Collect a small `instagram-posts` sample for shortlisted accounts only.
5. Normalize profile and post outputs.
6. Rank accounts by audience size, engagement proxy, posting cadence, and
   topical relevance.
7. Return a shortlist plus account notes.

Run profile and post collection serially as one queue. Do not start profile and
post enrichment in parallel. If a request requires a broad profile pass plus a
broad post pass, stop before collection and ask the user to narrow the handle
list or research theme.

## First-Pass Bounds

- 5-15 usernames.
- 6-12 recent posts per shortlisted account.
- No broad market scraping from this account-research skill.

## Good Output

Return an account snapshot table, strongest accounts, likely account type,
posting cadence estimate, top recent content patterns, and risks such as weak
engagement, inactive posting, or weak topical fit.

## Failure Modes

- Stop if the request is open-ended creator discovery.
- Stop on missing handles, unsupported collection keys, missing auth,
  unavailable hosted service, or stable network failure.
- Do not invent private backend calls or broad fallback scraping.

## Handoff

- Need niche creators from search or content signals -> `instagram-creator-discovery`.
- Need post/Reel benchmark patterns -> `instagram-content-benchmark`.
- Need comment-driven pain points -> `instagram-audience-voice`.
- Ready creator leads -> `creator-outreach`.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill instagram-account-research`.
- Input schema: `postplus research schema --json`.
- Hosted collection: `postplus research collect --skill instagram-account-research --collection-key instagram-posts --input <hosted-envelope.json> --output <collection-result.json>`.
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <collection-result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
