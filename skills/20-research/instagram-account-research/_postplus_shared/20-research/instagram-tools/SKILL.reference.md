---
name: instagram-tools
description: Local execution tools for Instagram hosted collection workflows, including actor runs, dataset normalization, ranking, comment clustering, and watchlist construction.
metadata:
  postplus:
    familyId: instagram
    familyName: Instagram
---

# Instagram Tools

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when implementing or running the local execution layer for the Instagram skill family.

Main scripts:

- `${CLAUDE_SKILL_DIR}/scripts/build_instagram_actor_input.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/run_instagram_actor.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/normalize_instagram_dataset.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/extract_instagram_candidate_usernames.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/rank_instagram_creators.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/rank_instagram_accounts.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/rank_instagram_posts.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/cluster_instagram_comments.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/build_instagram_watchlist.mjs`

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

- `${CLAUDE_SKILL_DIR}/scripts/lib/instagram_common.mjs`

This installed support skill is self-contained. Do not read external Instagram
reference directories from the installed skill tree unless they are packaged
with the calling business skill.

## Public Skill Execution Contract

- keep actor inputs, raw datasets, normalized outputs, candidate lists,
  ranking files, and watchlist caches under `<work-folder>/.postplus/instagram-tools/`
- keep only final user-facing summaries or shortlist exports outside
  `.postplus/`
- use `${CLAUDE_SKILL_DIR}/scripts/build_instagram_actor_input.mjs` or a small real input file
  before the expensive collection step
- wrap any compiled actor input in a `schemaVersion: 1` hosted execution
  envelope before passing it to `${CLAUDE_SKILL_DIR}/scripts/run_instagram_actor.mjs`; the builder's
  raw actor-input output is not an executable runner input
- start with a bounded first pass before broadening the crawl
- use PostPlus-supported scripts plus the shared collection runner only; do not switch to
  ad hoc shell glue
- if PostPlus Cloud service is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue
