---
name: facebook-research
description: Route and run bounded public Facebook research for page and profile posts, direct post evidence, and public group posts.
metadata:
  postplus:
    familyId: platform-research
    familyName: LinkedIn, Facebook, and YouTube
---

# Facebook Research

Use this skill when the user needs public Facebook evidence (page/profile
posts, direct posts, or public group posts) for a growth, marketing, creator,
community, competitor, or funnel decision.

Apply `references/shared-contract.md` first, then the one narrow reference that
matches the job.

## Route

| User intent | Read |
| --- | --- |
| Public page, profile, group, or post content pull | `references/public-content.md` |
| Page health, competitor page, group quality, public presence audit | `references/page-and-group-audit.md` |
| Organic hooks, formats, competitors, post examples, content patterns | `references/organic-benchmark.md` |
| Reels/video lane, comments, ads library, events, marketplace, broad Facebook search, partner discovery | Not supported on the current public surface. Say so and stop |
| Private profiles, hidden groups, member lists, Page Insights, ad account metrics, targeting, spend, ROAS | Stop and ask for a public source or export |

## First Question

Ask only when the answer changes the route, source, privacy boundary, sample
size, or output shape.

| Missing | Ask |
| --- | --- |
| Seed | `What Facebook source should anchor this: page, profile, group, or post URL?` |
| Decision | `What decision should this support: audit, benchmark, voice, or monitoring?` |
| Private target | `Can you provide a public URL or exported dataset instead?` |
| Too broad | `Which 1-5 sources matter most for the first pass?` |

Do not ask the user for source keys, schemas, implementation choices, retries,
credentials, hidden filters, or internal routing.

## Run Discipline

1. Pick one reference.
2. Run the smallest real collection that can answer the decision.
3. Parallelize independent sources when they do not depend on each other.
4. Produce JSON as the source of truth and a compact HTML evidence artifact when
   item-level evidence was collected.
5. Return a short chat answer: scope, counts, strongest finding, biggest gap,
   artifact path, and next action.

## Public Command Boundary

- Choose the smallest matching source key and run it directly.
- Readiness diagnostics: `postplus doctor --skill facebook-research`.
- If an owned CLI command fails, report the exact error and stop. Do not bypass
  the failure with metadata-only answers, readiness probing, local payload
  rewrites, fallback providers, or unpublished tools.
- Use `postplus research schema --json` only when constructing or repairing an
  unknown request shape.
- Public content scrape:
  `postplus research scrape <sourceKey> --skill facebook-research --request <input-array.json> --output <result.json>`.
- Resume a pending public content scrape:
  `postplus research scrape --run-handle <runHandle> --output <result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
  Stop on hard errors. Do not silently swap sources or invent missing data.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research scrape facebook-group-posts --request request.json --output result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->
