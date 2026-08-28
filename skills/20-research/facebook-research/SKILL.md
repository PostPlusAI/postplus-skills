---
name: facebook-research
description: Run bounded public Facebook research for pages, profiles, groups, posts, reels, comments, ads, events, marketplace listings, and search. Use when public Facebook evidence should support a marketing, creator, community, competitor, or funnel decision.
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

Apply shared rulebook and user-guidance rules from `postplus-shared`.
When a supported command completes but evidence is empty, sparse, noisy,
off-topic, or the wrong record type, apply the `postplus-shared` reference
`research-quality-recovery.md`; hard execution errors still fail fast.
Apply `references/shared-contract.md` first, then the one narrow reference that
matches the job.

## Two Lanes

Facebook has URL-led routes for public page/profile/group/post content and
specialized routes for reels, comments, ads, events, marketplace, pages, and
search. Pick the route by user intent; PostPlus handles execution details.

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

Do not ask the user for internal route identifiers, schemas, implementation
choices, retries, credentials, hidden filters, or internal routing.

## Run Discipline

1. Pick one reference and one lane.
2. Run the smallest real collection that can answer the decision.
3. Parallelize independent sources when they do not depend on each other.
4. If execution succeeds but evidence is empty, sparse, noisy, or off-topic,
   apply the shared bounded research-quality recovery rule before accepting or
   exhausting the evidence.
5. Produce JSON as the source of truth and a compact HTML evidence artifact when
   item-level evidence was collected.
6. Return a short chat answer: scope, counts, strongest finding, biggest gap,
   artifact path, and next action.

Result record shapes for every research route are documented in the
`postplus-shared` reference `dataset-item-schemas.md`; consult it before
writing result-processing code, and probe a single record only to verify.

Use only the public filters shown by the selected route.

## Public Command Boundary

- Choose the smallest matching research route and run it directly.
- Readiness diagnostics: `postplus doctor --skill facebook-research`.
- If an owned CLI command fails, report the exact error and stop. Do not bypass
  the failure with metadata-only answers, readiness probing, local payload
  rewrites, alternate services, or unpublished tools.
- Inspect one route with `postplus research run <route> --help` when its semantic
  flags are not already clear.
- Run `postplus research run <route> --<semantic flags> --skill
  facebook-research --wait --output <result.json>`.
- Pass only public URLs, search terms, locations, scope, and result limits.
- Keep the first pass bounded; expand only after inspecting the first result.
  Stop on hard errors. Do not silently swap sources or invent missing data.
- If the CLI returns a quote-confirmation challenge, run
  `postplus quote confirm --json --challenge-file <challenge.json>` and retry
  with the returned token.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research run facebook-group-posts \
  --url "https://example.com/source" \
  --wait \
  --output ./result.json
```

```bash
postplus research run facebook-ads-library \
  --query "example topic" \
  --wait \
  --output ./result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->
