---
name: facebook-research
description: Research public Facebook pages, groups, posts, reels, comments, ads, events, marketplace listings, and profiles for audience or competitor evidence.
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

Read only the one narrow reference matching the job.

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
   apply the quality rules below before accepting or
   exhausting the evidence.
5. Produce JSON as the source of truth and a compact HTML evidence artifact when
   item-level evidence was collected.
6. Return a short chat answer: scope, counts, strongest finding, biggest gap,
   artifact path, and next action.


Use only the public filters shown by the selected route.

## Public Command Boundary

- Choose the smallest matching research route and run it directly.
- Readiness diagnostics: `postplus doctor --skill facebook-research`.

- Inspect one route with `postplus research run <route> --help` when its semantic
  flags are not already clear.
- Run `postplus research run <route> --<semantic flags> --wait --output
  <result.json>`.
- Pass only public URLs, search terms, locations, scope, and result limits.
- Keep the first pass bounded; expand only after inspecting the first result.
  Stop on hard errors. Do not silently swap sources or invent missing data.
- If the CLI returns a quote-confirmation challenge, obtain user approval for its scope and cost before running
  `postplus quote confirm --json --challenge-file <challenge.json>` and retry
  with the returned token.

## Command Selection

| Evidence need | Route | Semantic input | First pass |
| --- | --- | --- | --- |
| Public page/profile posts | `facebook-profile-posts` | `--url`, `--limit` | 1-5 URLs, 20 posts |
| Direct post evidence | `facebook-post-by-url` | `--url` | 1-10 URLs |
| Public group posts | `facebook-group-posts` | `--url`, `--limit` | 1-3 groups, 20 posts |
| Ad-library creative | `facebook-ads-library` | `--query`, `--country`, `--status`, `--limit` | 20 ads |
| Post/reel comments | `facebook-comments` | `--url`, `--limit` | 1-5 URLs, 20 comments |
| Public group discussion | `facebook-groups` | `--url`, optional `--query`, `--limit` | 20 posts |
| Events/local activity | `facebook-events` | `--query` or `--url`, `--limit` | 10 events |
| Marketplace listings | `facebook-marketplace` | `--url`, `--limit` | 10 listings |
| Page identity | `facebook-pages` | `--url` | 1-5 pages |
| Rich page/profile posts | `facebook-posts` | `--url`, `--limit` | 20 posts |
| Reels | `facebook-reels` | `--url`, `--limit` | 20 reels |
| Broad public search | `facebook-search` | `--category`, `--location`, `--limit` | 20 results |

Only if platform scope or evidence interpretation remains unclear, consult
[platform contract](references/shared-contract.md); it is not a preflight.

## Evidence Quality

1. Check that page/post/comment/ad records match the requested lane; public group posts are not automatically comment evidence.
2. Change the public source URL or a supported query when evidence misses; keep ad creative separate from organic posts.
3. Allow at most two changed follow-up passes after successful but insufficient results, within approved scope and budget; do not repeat an identical request or hide a failed/pending operation.
4. Stop when sufficient, at the bound, or when another pass would not help. Report useful evidence and uncertainty; preserve raw results and source links.

Ad-library visibility is not spend or ROAS; preserve the source URL and observed dates, and distinguish comments from post text.
Full machine fields belong to `postplus research schema --route <route> --json`;
consult it only when required for processing, not before every request.

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

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Wait for explicit user approval when requested; an action does not authorize spending, publishing, or overwriting.
Resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
<!-- END GENERATED EXECUTION EXAMPLE -->
