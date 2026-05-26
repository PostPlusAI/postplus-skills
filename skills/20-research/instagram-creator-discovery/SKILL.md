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

Released hosted collection keys:

- `instagram-search`: topical, hashtag, tagged, or content-style discovery.
- `instagram-profiles`: profile enrichment from candidate usernames.
- `instagram-email-search`: released enrichment when contact-oriented search is
  explicitly needed.

Use hosted collection outputs and the workflow below when collection,
normalization, or ranking is needed.

## Route Guidance

- `handle-first`: the user already has handles or competitor lists.
- `content-first`: the user wants active niche creators, follower-band fit, or
  audience fit inferred from actual content.
- `mixed`: search or hashtag recall first, then profile enrichment and scoring.

## Default Workflow

1. Choose route: handle-first, content-first, or mixed.
2. Compile the collection input from the brief.
3. Wrap the input as a `schemaVersion: 1` hosted execution envelope.
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

- Check readiness first: `postplus doctor --skill instagram-creator-discovery`.
- Input schema: `postplus research schema --json`.
- Hosted collection: `postplus research collect --skill instagram-creator-discovery --collection-key instagram-email-search --input <hosted-envelope.json> --output <collection-result.json>`.
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <collection-result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
