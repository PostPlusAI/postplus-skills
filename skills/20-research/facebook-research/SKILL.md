---
name: facebook-research
description: Route and run bounded public Facebook research across two lanes - page, profile, group, and post scrapes plus hosted collections for reels, comments, ads, events, marketplace, pages, and search.
metadata:
  postplus:
    familyId: platform-research
    familyName: LinkedIn, Facebook, and YouTube
---

# Facebook Research

Use this skill when the user needs public Facebook evidence - page/profile posts,
direct posts, public group posts, reels, comments, ad-library creative, events,
marketplace listings, page profiles, or public search - for a growth, marketing,
creator, community, competitor, or funnel decision.

Apply `references/shared-contract.md` first, then the one narrow reference that
matches the job.

## Two Lanes

Facebook research runs through two hosted routes:

- Public page/profile/group/post content scrapes a public-content source. The
  `--request` file is a JSON array of input records, one per URL.
- Reels, comments, ad-library, events, marketplace, pages, posts, and search
  collect a hosted collection. The `--request` file is the collection input
  object directly.

Keep the two lanes separate. Never fill one lane with the other.

## Route

| User intent | Read |
| --- | --- |
| Public page, profile, group, or post content pull | `references/public-content.md` |
| Page health, competitor page, group quality, public presence audit | `references/page-and-group-audit.md` |
| Organic hooks, formats, competitors, post examples, content patterns | `references/organic-benchmark.md` |
| Reels, short-form video, video hooks, media-led benchmark | `references/reels-and-video.md` |
| Comments, audience voice, objections, FAQ, group discussion | `references/community-voice.md` |
| Ad-library creative, paid offers, CTAs, funnel review | `references/ads-and-funnel.md` |
| Events, local activations, organizers, offline demand | `references/events-and-local.md` |
| Marketplace listings, local commerce, price bands | `references/shops-and-marketplace.md` |
| Partner/creator/organizer discovery, broad Facebook search, page verification | `references/partner-discovery.md` |
| Private profiles, hidden groups, member lists, Page Insights, ad account metrics, targeting, spend, ROAS | Stop and ask for a public source or export |

## First Question

Ask only when the answer changes the route, source, privacy boundary, sample
size, or output shape.

| Missing | Ask |
| --- | --- |
| Seed | `What Facebook source should anchor this: page, profile, group, post URL, keyword, or event?` |
| Decision | `What decision should this support: audit, benchmark, voice, ads, events, marketplace, or discovery?` |
| Private target | `Can you provide a public URL or exported dataset instead?` |
| Too broad | `Which 1-5 sources matter most for the first pass?` |

Do not ask the user for source keys, collection keys, schemas, implementation
choices, retries, credentials, hidden filters, or internal routing.

## Run Discipline

1. Pick one reference and one lane.
2. Run the smallest real collection that can answer the decision.
3. Parallelize independent sources when they do not depend on each other.
4. Produce JSON as the source of truth and a compact HTML evidence artifact when
   item-level evidence was collected.
5. Return a short chat answer: scope, counts, strongest finding, biggest gap,
   artifact path, and next action.

Result record shapes for every collection and source key are documented in the
`postplus-shared` reference `dataset-item-schemas.md`; consult it before
writing result-processing code, and probe a single record only to verify.

Do not add hosted envelopes, hidden implementation fields, unsupported filters,
or compatibility fallbacks to a request.

## Public Command Boundary

- Choose the smallest matching source or collection key and run it directly.
- Readiness diagnostics: `postplus doctor --skill facebook-research`.
- If an owned CLI command fails, report the exact error and stop. Do not bypass
  the failure with metadata-only answers, readiness probing, local payload
  rewrites, fallback providers, or unpublished tools.
- Use `postplus research schema --json` or
  `postplus research schema --collection-key <collectionKey> --json` only when
  constructing or repairing an unknown request shape.
- Public content scrape:
  `postplus research scrape <sourceKey> --skill facebook-research --request <input-array.json> --output <result.json>`.
- Hosted collection:
  `postplus research collect <collectionKey> --skill facebook-research --request <input.json> --output <result.json>`
  where the request file is the raw collection input object, not a hosted
  envelope and not `{ "schemaVersion": 1, "input": ... }`.
- Resume a pending public content scrape:
  `postplus research scrape --run-handle <runHandle> --output <result.json>` (waits in-command up to 45s per invocation; rerun while pending).
- Resume a pending hosted collection:
  `postplus research collect --run-handle <runHandle> --output <result.json>` (waits in-command up to 45s per invocation; rerun while pending).
- Keep the first pass bounded; expand only after inspecting the first result.
  Stop on hard errors. Do not silently swap sources or invent missing data.
- If the CLI returns a quote-confirmation challenge, run
  `postplus quote confirm --json --challenge-file <challenge.json>` and retry
  with the returned token.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research scrape facebook-group-posts --request request.json --output result.json
```

```bash
postplus research collect facebook-ads-library --request request.json --output result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->
