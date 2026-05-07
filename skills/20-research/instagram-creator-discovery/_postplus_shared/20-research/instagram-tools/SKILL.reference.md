---
name: instagram-tools
description: Local execution tools for Instagram hosted collection workflows, including actor runs, dataset normalization, ranking, comment clustering, and watchlist construction.
---

# Instagram Tools

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when implementing or running the local execution layer for the Instagram skill family.

Main scripts:

- `scripts/build_instagram_actor_input.mjs`
- `scripts/run_instagram_actor.mjs`
- `scripts/normalize_instagram_dataset.mjs`
- `scripts/extract_instagram_candidate_usernames.mjs`
- `scripts/rank_instagram_creators.mjs`
- `scripts/rank_instagram_accounts.mjs`
- `scripts/rank_instagram_posts.mjs`
- `scripts/cluster_instagram_comments.mjs`
- `scripts/build_instagram_watchlist.mjs`

## Script To Skill Map

Use these scripts through the owning business skill instead of presenting
technical script names as the user-facing workflow. When a script is shared,
the business skill chooses the collection key and dataset type.

| Script | Owning business skills |
|---|---|
| `build_instagram_actor_input.mjs` | `instagram-account-research`, `instagram-creator-discovery`, `instagram-content-benchmark`, `instagram-audience-voice`, `instagram-campaign-scout` |
| `run_instagram_actor.mjs` | `instagram-account-research`, `instagram-creator-discovery`, `instagram-content-benchmark`, `instagram-audience-voice`, `instagram-campaign-scout` |
| `normalize_instagram_dataset.mjs` | `instagram-account-research`, `instagram-creator-discovery`, `instagram-content-benchmark`, `instagram-audience-voice`, `instagram-campaign-scout` |
| `extract_instagram_candidate_usernames.mjs` | `instagram-creator-discovery`, `instagram-campaign-scout` |
| `rank_instagram_creators.mjs` | `instagram-creator-discovery` |
| `rank_instagram_accounts.mjs` | `instagram-account-research` |
| `rank_instagram_posts.mjs` | `instagram-content-benchmark`, `instagram-campaign-scout` |
| `cluster_instagram_comments.mjs` | `instagram-audience-voice` |
| `build_instagram_watchlist.mjs` | `instagram-campaign-scout` |

Business workflows:

| Business skill | Execution shape |
|---|---|
| `instagram-account-research` | profile input -> hosted profile run -> profile normalization -> narrowed post input -> hosted post run -> post normalization -> account ranking |
| `instagram-creator-discovery` | discovery input -> hosted search or post run -> normalization -> candidate username extraction -> hosted profile enrichment -> creator ranking |
| `instagram-content-benchmark` | benchmark input -> hosted post or hashtag run -> normalization -> post ranking |
| `instagram-audience-voice` | comment input -> hosted comment run -> comment normalization -> comment clustering |
| `instagram-campaign-scout` | hashtag or tagged input -> hosted run -> normalization -> post ranking -> watchlist build |

Tell the user which business skill is running. Keep the script names in the
artifact log and failure copy.

Shared helpers:

- `scripts/lib/instagram_common.mjs`

Reference contracts:

- `../instagram-references/tool-contracts.md`
- `../instagram-references/normalized-schema.md`

## Public Skill Execution Contract

- keep actor inputs, raw datasets, normalized outputs, candidate lists,
  ranking files, and watchlist caches under `<work-folder>/.postplus/instagram-tools/`
- keep only final user-facing summaries or shortlist exports outside
  `.postplus/`
- use `scripts/build_instagram_actor_input.mjs` or a small real input file
  before the expensive collection step
- start with a bounded first pass before broadening the crawl
- use PostPlus-supported scripts plus the shared collection runner only; do not switch to
  ad hoc shell glue
- if PostPlus Cloud service is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue
