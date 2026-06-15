---
name: instagram-creator-discovery
description: Discover Instagram creators through search, hashtags, tagged mentions, posts, and Reels, then enrich and rank them into research pools and shortlists.
metadata:
  postplus:
    familyId: instagram
    familyName: Instagram
---

# Instagram Creator Discovery

Use this skill to find Instagram creators through search, hashtags, tagged
mentions, posts, and Reels, then enrich and rank them into research pools and
shortlists.

Apply shared rulebook and user-guidance rules from `postplus-shared`.

## Core Rule

Do not default creator discovery to profile lookup only.

When the request cares about follower bands, recent activity, topical fit, or
audience fit from actual content, prefer:

1. search or content discovery,
2. candidate username extraction,
3. profile enrichment,
4. ranking with profile plus content evidence.

## Collection Key Routing

Route to the matching hosted collection key by task shape:

- topical, hashtag, tagged, or content-style discovery,
- profile enrichment from candidate usernames,
- contact-oriented enrichment when contact-oriented search is explicitly needed.

Discover the exact released collection keys and request shapes with
`postplus research schema --json`. Use hosted collection outputs and the
workflow below when collection, normalization, or ranking is needed.

## Route Guidance

- `handle-first`: the user already has handles or competitor lists.
- `content-first`: the user wants active niche creators, follower-band fit, or
  audience fit inferred from actual content.
- `mixed`: search or hashtag recall first, then profile enrichment and scoring.

## Default Workflow

1. Choose route: handle-first, content-first, or mixed.
2. Compile the collection input from the brief.
3. Write the compiled collection input to a request file.
5. Normalize the dataset.
6. Extract candidate usernames when the first pass produced posts or search
   results.
7. Enrich candidates with `instagram-profiles`.
8. Rank creators with profile and any collected content evidence.

Keep raw datasets and intermediate files under `.postplus/`; return the
research pool and shortlist as user-facing artifacts.

## Good Output

Return `research_pool`, `shortlist`, why each top creator was surfaced,
creator type estimate, topical fit, audience fit, follower-band fit, and public
contact signals when available.

## Failure Modes

- Stop if the user only needs known-handle snapshots; route to
  `instagram-account-research`.
- Stop on missing required seeds, unsupported keys, missing auth, unavailable
  hosted service, or stable network failure.
- Do not invent broad scraping, private backend calls, or contact data that is
  not visible in the collected public data.

## Handoff

- Stable shortlist requiring deeper account snapshots -> `instagram-account-research`.
- Strong posts or Reels needing benchmark analysis -> `instagram-content-benchmark`.
- Comment-language extraction -> `instagram-audience-voice`.
- Outreach-ready creator leads -> `creator-outreach`.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill instagram-creator-discovery`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus research schema --collection-key <collectionKey> --json` only when constructing or repairing an unknown request shape.
- Hosted collection runs through the shared `research collect` verb (owned by instagram-tools), attributing the run to this skill: `postplus research collect <collectionKey> --skill instagram-creator-discovery --request <input.json> --output <result.json>` (input = the collection parameters).
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
