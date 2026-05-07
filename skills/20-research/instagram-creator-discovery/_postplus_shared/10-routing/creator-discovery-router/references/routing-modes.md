# Routing Modes

Use this file to choose the discovery route.

## `handle-first`

Best when:

- the user already has creator usernames
- the user names competitors or benchmark accounts
- the task is enrichment, not discovery from scratch

Weak when:

- the user needs new micro or mid-tier creators from scratch

## `content-first`

Best when:

- creator fit matters more than bio keywords
- follower range matters
- the user wants active creators in a niche
- the platform's user search tends to over-rank large accounts

Strong default for:

- `5k-10k niche creators`
- `mid-tier partnership candidates`
- `real creators posting about a workflow`

## `graph-first`

Best when:

- the niche is narrow or local
- search is noisy
- the user wants creators adjacent to a known set

Graph signals can include:

- repeated hashtags
- similar bios
- tagged collaborators
- comments and cross-mentions
- creator clusters around benchmark posts

## `mixed`

Use when a single route under-recalls.

Common pattern:

1. `content-first` for initial seed set
2. `graph-first` to expand from good seeds
3. `handle-first` to enrich and shortlist

## Decision Shortcuts

Choose `content-first` if:

- the request includes follower band plus niche
- the user asks for "suitable creators" rather than specific handles

Choose `handle-first` if:

- the request starts from known accounts

Choose `graph-first` if:

- the user wants overlooked creators or micro creators
- the market is language- or culture-specific
