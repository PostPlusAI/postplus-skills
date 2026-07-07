# TikTok Account And Competitor Audit

Use when the user gives TikTok accounts, brands, competitors, or profiles and
wants a public account readout, competitor comparison, positioning check, or
content shortlist for deeper research.

Apply `shared-contract.md` for public surface, collection key semantics, bounds,
evidence labeling, and output discipline.

## User Jobs

- Diagnose whether a brand account looks active, clear, and content-ready.
- Compare competitors by profile positioning, recent public videos, hooks, and
  content pillars.
- Find account-level gaps: stale content, unclear offer, weak proof, missing
  demo, or sparse public evidence.
- Build a shortlist for audience voice, product-content fit, creator discovery,
  or paid-vs-organic comparison.

## Alignment

Infer whether the user needs brand health, competitor comparison, content
strategy, ecommerce fit, or a shortlist. Ask only when the output would change.

Use this question when needed:

`Should I focus on brand health, competitor comparison, content strategy, ecommerce fit, or a shortlist for the next step?`

## Inputs

Minimum: one TikTok handle/profile URL, a brand plus likely account seed, or
`2-8` competitor handles/profiles.

Ask once only when needed:

| Situation | Ask |
| --- | --- |
| Brand name only | `Do you have the official TikTok handle, or should I start from brand/competitor search seeds?` |
| Many accounts | `Which 2-8 accounts should I audit first?` |
| Private/backend request | `Can you provide public TikTok handles, public videos, or an exported dataset instead?` |

## Run

| Source | Key | Rule |
| --- | --- | --- |
| Known handles/profiles | `tiktok-profiles` | Account/profile sample first; use returned `authorMeta` and recent video rows when present. |
| Account content benchmark | `tiktok-videos` | Recent public videos only when content evidence is needed. |
| Brand/competitor name recall | `tiktok-users` | Candidate recall only; verify handles before judging. |

Run independent profile lookups or account video samples in parallel only when
each account has its own bounded request and output file. Do not parallel a
dependent search -> verify chain.

## Route-Specific Evidence

- Profile facts can support positioning, public counts, bio/link signals, and
  availability when returned.
- Video evidence is required before judging hooks, formats, content pillars,
  cadence, or creative gaps.
- Account-search recall is not official-account proof.
- Public counts are snapshots, not growth or backend performance.

## Stop

Stop for private account analytics, follower lists, backend reach, watch time,
conversion, full history, or unavailable accounts. If official-account identity
is ambiguous, report candidates and ask for confirmation.

## Output Focus

Return the decision supported, accounts checked, profile facts, content sample
when collected, strongest account patterns, gaps, and next action.

## HTML Artifact Focus

Make the HTML easy to audit by account:

- account comparison table with handle, profile URL, bio/positioning, public
  counts, links, and availability
- recent-video section grouped by account when video evidence was collected
- findings tied to profile rows or video rows
- next-step shortlist for comments, product-content fit, or creator discovery
