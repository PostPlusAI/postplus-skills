---
name: tiktok-research
description: Research TikTok metadata, creators, comments, trends, and benchmark data for organic platform analysis.
metadata:
  postplus:
    familyId: tiktok
    familyName: TikTok
---

# TikTok Research Skill

Use this skill for TikTok metadata research:

- keyword and hashtag sampling
- competitor or creator sampling
- creator account discovery
- profile enrichment
- comments and audience language
- trend and benchmark discovery
- dataset summaries

Follow shared routing and guidance rules in:

- `postplus-shared` public skill rules
- `postplus-shared` research preferences

Read these references before implementation:

- `${CLAUDE_SKILL_DIR}/references/actor-selection.md`
- `${CLAUDE_SKILL_DIR}/references/normalized-schema.md`
- `${CLAUDE_SKILL_DIR}/references/tool-contracts.md`

Do not treat generic "TikTok research" requests as plain web search unless the user clearly wants external articles, policy, or news.

## Cost Discipline

When using free-tier collection credits, prefer:

- serial runs, not parallel runs
- 5-12 results per hashtag or query
- 3-5 seed hashtags per batch
- 3-5 strongest search queries per batch
- comments only after a promising batch is identified

Do not brute-force full-market collection first. Sample, inspect, refine, then expand.

Current bounded-first-pass rule:

- treat brief `limit` as the target shortlist or candidate goal, not as the per-query scrape size
- let `build_tiktok_actor_input.mjs` keep first-pass `resultsPerPage` / `maxProfilesPerQuery` bounded unless you explicitly need a broader second pass
- for `tiktok-scraper`, default to `searchSection: "/video"` for content-first creator discovery unless you intentionally want account-search behavior
- keep comment collection, media downloads, subtitles, follower/following expansion, and similar extras off in the first pass unless the current step truly needs them

## Key Files

- `${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/build_tiktok_actor_input.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/normalize_tiktok_dataset.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/rank_tiktok_accounts.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/expand_tiktok_creator_graph.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/analyze_tiktok_dataset.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/collect_top_video_comments.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/analyze_tiktok_comments.mjs`
- `${CLAUDE_SKILL_DIR}/scripts/generate_tiktok_report.mjs`
- `${CLAUDE_SKILL_DIR}/templates/` — sample hashtag, search, and competitor input files

## Prerequisites

In the PostPlus runtime, follow `postplus-shared` public skill rules.

TikTok-specific runtime notes:

- when this skill references its own scripts, references, or templates, use absolute paths anchored at `${CLAUDE_SKILL_DIR}`; do not rely on bare paths or repo-relative skill paths that depend on the current working directory
- when extracting creator handles from a normalized video dataset, use `.items[].authorUsername`
- if PostPlus Cloud service is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

Node 18+ is required. This workspace already has Node available.

## Hosted Collection Keys And Local Input Shapes

Use PostPlus hosted collection keys only with `collection_actor_run.mjs
--collection-key`. Use local input-shape names only with `build_tiktok_actor_input.mjs
--actor` or local normalization `--actor`.

Released hosted collection keys:

- `tiktok-videos` - keyword, hashtag, profile URL, music URL, location, direct
  video, and content-first creator discovery; local input shape `tiktok-scraper`
- `tiktok-users` - keyword account-search supplement; local input shape
  `tiktok-user-search-scraper`
- `tiktok-profiles` - profile enrichment from known handles; local input shape
  `tiktok-profile-scraper`
- `tiktok-related-videos` - graph expansion from shortlisted video URLs; actor
  input shape `tiktok-scraper` with `postURLs` and `scrapeRelatedVideos`
- `tiktok-comments` - focused comment collection; local input shape
  `tiktok-comments-scraper`

`tiktok-scraper`, `tiktok-user-search-scraper`, `tiktok-profile-scraper`,
`tiktok-comments-scraper`, and `tiktok-scraper-api` are not hosted collection
keys. Do not pass them to `collection_actor_run.mjs --collection-key`.

PostPlus runtime note:

- profile enrichment is released through hosted collection key `tiktok-profiles`
  only. Do not route profile enrichment through unpublished keys or
  implementation names.

## Routing Rules

Start from the user's real collection surface, not from one favorite actor.

- creator search with follower-band or content-fit constraints -> hosted key
  `tiktok-videos`, local input shape `tiktok-scraper` first
- creator search as account-search supplement -> hosted key `tiktok-users`,
  local input shape `tiktok-user-search-scraper`
- profile enrichment -> hosted key `tiktok-profiles`, local input shape
  `tiktok-profile-scraper`
- bulk profile enrichment stays on hosted key `tiktok-profiles`
- topic/search video discovery -> hosted key `tiktok-videos`, local input shape
  `tiktok-scraper`
- hashtag-only sampling -> hosted key `tiktok-videos`, local input shape
  `tiktok-scraper`
- known video URL enrichment -> hosted key `tiktok-videos`, local input shape
  `tiktok-scraper`
- focused comments -> hosted key `tiktok-comments`, local input shape
  `tiktok-comments-scraper`
- larger or cheaper comment runs -> hosted key `tiktok-comments`
- region-aware low-cost discovery -> hosted key `tiktok-videos`, local input shape
  `tiktok-scraper`
- shop creator analytics -> unsupported in the current hosted release

Do not use TikTok Shop actors for generic creator discovery.
Do not route to `tiktok-shop-creators`; it is not exposed as a hosted
collection key in the current release.
Do not use Creative Center ad actors as if they were organic creator data.
If the user wants paid ad intelligence, route to `tiktok-ad-research`.
If the user specifically wants TikTok music or sound discovery, route to:

- trending music by region -> use the music-discovery path within `tiktok-research`
- videos under a specific music/sound -> use the released `tiktok-research`
  collection path when it supports the request; otherwise ask for selected video URLs
- local download and audio extraction -> `tiktok-music-archive-downloader`

For multi-step TikTok music workflows, read `postplus-shared` TikTok music workflow.

## Creator Discovery V2 Rule

For TikTok creator discovery, do not default to plain user search when the brief includes:

- follower bands like `5k-10k`
- recent activity
- local language or geo fit
- audience fit inferred from what creators actually post

Prefer this order:

1. collect matched videos
2. extract authors
3. expand around strong seed videos if recall is weak
4. enrich profiles
5. rank with profile plus content evidence

Use `tiktok-user-search-scraper` as a supplement, not the default first pass, unless the user explicitly wants account-search recall.

## Input Compilation

When the request is expressed as a research goal instead of actor JSON:

1. write a small brief JSON with fields such as `task`, `queries`, `hashtags`, `usernames`, `urls`, `limit`, `country`
2. run `${CLAUDE_SKILL_DIR}/scripts/build_tiktok_actor_input.mjs`
3. inspect the compiled actor input before the collection run if the request is high-cost or ambiguous

This keeps the workflow stable even when actor input shapes differ.

Bounded brief rule:

1. keep the first pass small by default:
   - 3-5 strongest queries
   - 2-4 seed hashtags
   - `limit` set to the candidate or shortlist goal, not the per-query scrape size
2. only add explicit actor-size overrides such as `resultsPerPage`, `maxProfilesPerQuery`, `commentsPerPost`, or `scrapeRelatedVideos` when the current step truly needs them
3. if the first pass is too thin, expand in a second pass instead of starting broad

### PostPlus runtime temp-file flow

Inside the PostPlus runtime, prefer this order:

1. when possible, skip the temporary brief file and call `build_tiktok_actor_input.mjs` directly with repeated flags such as:
   - `--query`
   - `--hashtag`
   - `--username`
   - `--url`
   - `--limit`
   - `--country`
   - `--actor`
   - `--output`
2. write the actor input JSON into the current work folder's `.postplus/` directory
3. keep raw datasets and other intermediate files in `.postplus/`
4. keep only final user-facing deliverables outside `.postplus/`

Direct-output rule:

1. `${CLAUDE_SKILL_DIR}/scripts/build_tiktok_actor_input.mjs --output <actor-input.json>` creates that actor-input file itself
2. do not `Read` or `Write` the actor-input output path before running that script
3. do not pre-read the actor-input output path just because it does not exist yet
4. let the script create the file, then consume that same file path in the next step

Fallback only when the direct flag path is genuinely awkward:

1. write the brief JSON into the current work folder's `.postplus/` directory with the `Write` tool
2. run `build_tiktok_actor_input.mjs` against that `.postplus/*.json` brief

### First move for clear KOL discovery

For a clear request like:

- `Find 20 TikTok KOLs suitable for selling skincare devices, prioritize micro and mid-tier accounts, and give me a shortlist for further filtering.`

default to this first move:

1. skip the temporary brief JSON
2. run `${CLAUDE_SKILL_DIR}/scripts/build_tiktok_actor_input.mjs` with `--query`, `--limit`, `--actor`, and `--output`
3. place the domain actor input under the current work folder's `.postplus/`
4. wrap that domain actor input as `schemaVersion: 1` + `input`
5. then run `${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs` with the
   released hosted collection key `tiktok-videos`

Do not start by reading or writing a new `.postplus/*.json` file when the direct actor-input path already fits.

```bash
node ${CLAUDE_SKILL_DIR}/scripts/build_tiktok_actor_input.mjs \
  --query "portable photo printer" \
  --limit 20 \
  --country US \
  --actor tiktok-scraper \
  --output <work-folder>/.postplus/tiktok-actor-input.json

node ${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs \
  --collection-key tiktok-videos \
  --input <work-folder>/.postplus/tiktok-envelope.json \
  --output <work-folder>/.postplus/tiktok-run.json \
  --skill-name tiktok-research
```

In this example, `--actor tiktok-scraper` selects the local actor-input
shape. `--collection-key tiktok-videos` selects the released PostPlus hosted
collection route.

### Profile-enrichment bridge

For creator discovery from a normalized `videos` dataset:

1. extract usernames from `.items[].authorUsername`
2. write a real profile-request JSON file under `.postplus/`
3. run `collection_actor_run.mjs` with `--collection-key tiktok-profiles`
4. normalize the profile dataset
5. run `rank_tiktok_accounts.mjs --profiles <profiles-normalized.json> --videos <videos-normalized.json>`

Do not call `rank_tiktok_accounts.mjs` with only `--videos`.

### Merge rule

If you collect ranked results in multiple batches:

1. write each ranked batch to its own JSON file
2. merge them from disk with a plain file-based command such as:

```bash
jq -s 'map(.items) | add | sort_by(-.followersCount) | .[0:20]' file-a.json file-b.json
```

## Minimal Workflow

`collection_actor_run.mjs` is a hosted collection entrypoint. Every file passed
to its `--input` flag must be a hosted execution envelope:

```json
{
  "schemaVersion": 1,
  "input": {
    "...": "compiled actor input"
  }
}
```

The compiled actor input is the envelope's `input` value. Bare actor input JSON
is not an executable `collection_actor_run.mjs` input.

### Hashtag sampling

Build input:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/build_tiktok_actor_input.mjs \
  --brief ${CLAUDE_SKILL_DIR}/templates/hashtags.json \
  --actor tiktok-scraper \
  --output <work-folder>/.postplus/hashtags-input.json
```

Run actor:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs \
  --collection-key tiktok-videos \
  --input <work-folder>/.postplus/hashtags-envelope.json \
  --output <work-folder>/.postplus/hashtags.json
```

Then summarize:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/normalize_tiktok_dataset.mjs \
  --input <work-folder>/.postplus/hashtags.json \
  --actor tiktok-scraper \
  --dataset-type videos \
  --output <work-folder>/.postplus/hashtags-normalized.json

node ${CLAUDE_SKILL_DIR}/scripts/analyze_tiktok_dataset.mjs \
  --input <work-folder>/.postplus/hashtags-normalized.json
```

### Search-query sampling

Build input:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/build_tiktok_actor_input.mjs \
  --brief ${CLAUDE_SKILL_DIR}/templates/searches.json \
  --actor tiktok-scraper \
  --output <work-folder>/.postplus/searches-input.json
```

Run actor:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs \
  --collection-key tiktok-videos \
  --input <work-folder>/.postplus/searches-envelope.json \
  --output <work-folder>/.postplus/searches.json
```

Then summarize:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/normalize_tiktok_dataset.mjs \
  --input <work-folder>/.postplus/searches.json \
  --actor tiktok-scraper \
  --dataset-type videos \
  --output <work-folder>/.postplus/searches-normalized.json

node ${CLAUDE_SKILL_DIR}/scripts/analyze_tiktok_dataset.mjs \
  --input <work-folder>/.postplus/searches-normalized.json
```

### Competitor sampling

```json
{
  "schemaVersion": 1,
  "input": {
    "profiles": ["grammarly", "notionhq", "raycastapp"],
    "resultsPerPage": 10
  }
}
```

```bash
node ${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs \
  --collection-key tiktok-profiles \
  --input <work-folder>/.postplus/competitors-envelope.json \
  --output <work-folder>/.postplus/competitors-results.json
```

Then normalize and rank:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/normalize_tiktok_dataset.mjs \
  --input <work-folder>/.postplus/competitors-results.json \
  --actor tiktok-profile-scraper \
  --dataset-type profiles \
  --output <work-folder>/.postplus/competitors-profiles-normalized.json

node ${CLAUDE_SKILL_DIR}/scripts/rank_tiktok_accounts.mjs \
  --profiles <work-folder>/.postplus/competitors-profiles-normalized.json
```

### Creator discovery by keyword

```json
{
  "schemaVersion": 1,
  "input": {
    "searchQueries": ["ai tools", "productivity workflow", "gmail tips"],
    "maxProfilesPerQuery": 8
  }
}
```

```bash
node ${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs \
  --collection-key tiktok-users \
  --input <work-folder>/.postplus/creator-search-envelope.json \
  --output <work-folder>/.postplus/creator-search-results.json

node ${CLAUDE_SKILL_DIR}/scripts/normalize_tiktok_dataset.mjs \
  --input <work-folder>/.postplus/creator-search-results.json \
  --actor tiktok-user-search-scraper \
  --dataset-type user-search \
  --output <work-folder>/.postplus/creator-search-normalized.json

node ${CLAUDE_SKILL_DIR}/scripts/rank_tiktok_accounts.mjs \
  --profiles <work-folder>/.postplus/creator-search-normalized.json
```

### Creator discovery by matched videos and graph expansion

Use this when the request cares about small creators, real topical activity, or content fit more than user-search ranking.

```bash
node ${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs \
  --collection-key tiktok-videos \
  --input <work-folder>/.postplus/topic-video-search-envelope.json \
  --output <work-folder>/.postplus/topic-video-search-raw.json

node ${CLAUDE_SKILL_DIR}/scripts/normalize_tiktok_dataset.mjs \
  --input <work-folder>/.postplus/topic-video-search-raw.json \
  --actor tiktok-scraper \
  --dataset-type videos \
  --output <work-folder>/.postplus/topic-video-search-normalized.json

node ${CLAUDE_SKILL_DIR}/scripts/expand_tiktok_creator_graph.mjs \
  --input <work-folder>/.postplus/topic-video-search-normalized-envelope.json \
  --output <work-folder>/.postplus/topic-graph-raw.json \
  --collection-key tiktok-related-videos \
  --top 10 \
  --results-per-seed 6
```

`expand_tiktok_creator_graph.mjs` is also a hosted side-effecting entrypoint.
It sends shortlisted seed videos through the `tiktok-related-videos` collection
key. Wrap the normalized video dataset under `input` before passing it to
`--input`.

### Comment sampling

```bash
node ${CLAUDE_SKILL_DIR}/scripts/collect_top_video_comments.mjs \
  --input <work-folder>/.postplus/searches-normalized-envelope.json \
  --output <work-folder>/.postplus/comments.json \
  --collection-key tiktok-comments \
  --top 8 \
  --comments-per-post 40
```

`collect_top_video_comments.mjs` is a hosted side-effecting entrypoint. Its
`--input` file must be a `schemaVersion: 1` hosted execution envelope whose
`input` value is the raw or normalized video dataset to sample. It sends
shortlisted video URLs to the hosted comments actor as `postURLs` and uses
`commentsPerPost` for the per-video comment limit.

Then summarize:

```bash
node ${CLAUDE_SKILL_DIR}/scripts/analyze_tiktok_comments.mjs \
  --input <work-folder>/.postplus/comments.json
```

### Report output

```bash
node ${CLAUDE_SKILL_DIR}/scripts/generate_tiktok_report.mjs \
  --keyword-summary <work-folder>/.postplus/searches-summary.json \
  --hashtag-summary <work-folder>/.postplus/hashtags-summary.json \
  --competitor-summary <work-folder>/.postplus/competitors-summary.json \
  --comments-summary <work-folder>/.postplus/comments-summary.json \
  --output reports/tiktok-research.md
```

## Default Sequence

1. choose the route first: content-first, handle-first, graph-first, or mixed
2. collect 3-5 seed hashtags or 5-10 jobs-to-be-done searches
3. extract authors from matched videos before relying on account search
4. expand around strong seed videos when recall is weak
5. enrich a shortlisted set of profiles
6. rank with both profile and video evidence
7. summarize each dataset locally
8. merge findings into hooks, formats, and content pillars

## Skill Handoff

Escalate to `video-analysis` when:

- the user wants hook or structure breakdowns
- the user asks why specific videos work
- the user wants shot-level or spoken-line analysis
- the user wants to recreate or adapt benchmark videos

When the request is broad, ask one short guiding question before running:

- "Do you want to first inspect which TikTok directions are worth researching, or do you already have videos for direct content-structure breakdown?"

Mention that this skill finds good samples first, and `video-analysis` can read the actual videos later.

Escalate to `tiktok-ad-research` when:

- the user wants Creative Center top ads
- the user wants paid ad hooks, objectives, or ad brief inputs
- the request is about ad-market scanning rather than organic creator or content behavior

## Download Recovery Note

This skill is primarily for research, not guaranteed video asset persistence.

If a later workflow needs the actual benchmark videos and the earlier local files are gone:

1. recover from saved local video paths if available
2. otherwise download directly from the TikTok post URLs with `yt-dlp`
3. store the recovered videos in a stable workspace folder
4. hand those files to `video-analysis`

Do not assume collection dataset items will always contain reusable `mediaUrls` or `downloadAddr` fields.

## Good Output

For each run, extract:

- strongest opening lines
- repeated framing patterns
- recurring hashtags
- recurring creators
- bio-link or outbound-link signal on creator profiles
- comments that reveal pain points or objections
- source surface and source query so later analysis can distinguish search vs hashtag vs profile vs direct URL runs
- region or location signal when the actor supports it
- creator-discovery evidence:
  - which queries surfaced each creator
  - how many matched videos each creator contributed
  - whether the creator was found directly or through graph expansion
  - whether the profile has contactable public signals
- visual format types:
  - screen demo
  - before/after
  - POV/relatable
  - listicle
  - talking head
