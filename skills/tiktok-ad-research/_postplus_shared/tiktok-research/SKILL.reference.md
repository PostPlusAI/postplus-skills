---
name: tiktok-research
description: Research TikTok metadata, creators, comments, trends, and benchmark data for organic platform analysis.
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

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`
- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-research-preferences.md`

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

In the product-shell runtime, follow `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`.

TikTok-specific runtime notes:

- when this skill references its own scripts, references, or templates, use absolute paths anchored at `${CLAUDE_SKILL_DIR}`; do not rely on bare `scripts/...`, `references/...`, `templates/...`, or `skills/tiktok-research/...` paths that depend on the current working directory
- when extracting creator handles from a normalized video dataset, use `.items[].authorUsername`
- if hosted capability is unavailable, unauthorized, or returns a stable
  network error, stop immediately instead of switching to ad hoc shell glue

Node 18+ is required. This workspace already has Node available.

## Default Actors

 - creator discovery by matched videos: `tiktok-scraper`
 - keyword account-search supplement: `tiktok-user-search-scraper`
- profile enrichment: `tiktok-profile-scraper`
- keyword / hashtag video discovery: `tiktok-scraper`
- direct video enrichment: `tiktok-video-scraper`
- hashtag-only sampling: `tiktok-hashtag-scraper`
- comment collection default: `tiktok-comments-scraper`
- low-cost search expansion fallback: `tiktok-scraper`
- low-cost exploratory query fallback: `tiktok-scraper-api`
- TikTok Shop creator discovery: `tiktok-shop-creators`

Treat these as defaults, not hard requirements.

Release-shell note:

- `tiktok-profile-scraper` (secondary provider) remains shelved for current product-shell
  runs. Do not route to it until billing adds and verifies a provider cost
  rule.

## Routing Rules

Start from the user's real collection surface, not from one favorite actor.

- creator search with follower-band or content-fit constraints -> `tiktok-scraper` first
- creator search as account-search supplement -> `tiktok-user-search-scraper`
- profile enrichment -> `tiktok-profile-scraper`
- bulk profile enrichment stays on `tiktok-profile-scraper`
- topic/search video discovery -> `tiktok-scraper`
- hashtag-only sampling -> `tiktok-hashtag-scraper`
- known video URL enrichment -> `tiktok-video-scraper`
- focused comments -> `tiktok-comments-scraper`
- larger or cheaper comment runs -> `tiktok-comments-scraper`
- region-aware low-cost discovery -> `tiktok-scraper`
- shop creator analytics -> `tiktok-shop-creators`

Do not use TikTok Shop actors for generic creator discovery.
Do not use Creative Center ad actors as if they were organic creator data.
If the user wants paid ad intelligence, route to `${CLAUDE_SKILL_DIR}/../tiktok-ad-research/SKILL.md`.
If the user specifically wants TikTok music or sound discovery, route to:

- trending music by region -> use the music-discovery path within `tiktok-research`
- videos under a specific music/sound -> `${CLAUDE_SKILL_DIR}/../tiktok-music-sound-collector/SKILL.md`
- local download and audio extraction -> `${CLAUDE_SKILL_DIR}/../tiktok-music-archive-downloader/SKILL.md`

For multi-step TikTok music workflows, read `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-tiktok-music-workflow.md`.

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

### Product-shell temp-file flow

Inside the product-shell runtime, prefer this order:

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

- `帮我在 TikTok 上找 20 个适合卖护肤仪的 KOL，优先微中腰部账号，给我一个可继续筛选的 shortlist。`

default to this first move:

1. skip the temporary brief JSON
2. run `${CLAUDE_SKILL_DIR}/scripts/build_tiktok_actor_input.mjs` with `--query`, `--limit`, `--actor`, and `--output`
3. place the output under the current work folder's `.postplus/`
4. then run `${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs` against that output file

Do not start by reading or writing a new `.postplus/*.json` file when the direct actor-input path already fits.

### Profile-enrichment bridge

For creator discovery from a normalized `videos` dataset:

1. extract usernames from `.items[].authorUsername`
2. write a real profile-request JSON file under `.postplus/`
3. run `collection_actor_run.mjs` with `tiktok-profile-scraper`
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
  --actor tiktok-scraper \
  --input <work-folder>/.postplus/hashtags-input.json \
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
  --actor tiktok-scraper \
  --input <work-folder>/.postplus/searches-input.json \
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
  "profiles": ["grammarly", "notionhq", "raycastapp"],
  "resultsPerPage": 10
}
```

```bash
node ${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs \
  --actor tiktok-profile-scraper \
  --input <work-folder>/.postplus/competitors.json \
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
  "searchQueries": ["ai tools", "productivity workflow", "gmail tips"],
  "maxProfilesPerQuery": 8
}
```

```bash
node ${CLAUDE_SKILL_DIR}/scripts/collection_actor_run.mjs \
  --actor tiktok-user-search-scraper \
  --input <work-folder>/.postplus/creator-search.json \
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
  --actor tiktok-scraper \
  --input <work-folder>/.postplus/topic-video-search.json \
  --output <work-folder>/.postplus/topic-video-search-raw.json

node ${CLAUDE_SKILL_DIR}/scripts/normalize_tiktok_dataset.mjs \
  --input <work-folder>/.postplus/topic-video-search-raw.json \
  --actor tiktok-scraper \
  --dataset-type videos \
  --output <work-folder>/.postplus/topic-video-search-normalized.json

node ${CLAUDE_SKILL_DIR}/scripts/expand_tiktok_creator_graph.mjs \
  --input <work-folder>/.postplus/topic-video-search-normalized.json \
  --output <work-folder>/.postplus/topic-graph-raw.json \
  --top 10 \
  --results-per-seed 6
```

### Comment sampling

```bash
node ${CLAUDE_SKILL_DIR}/scripts/collect_top_video_comments.mjs \
  --input <work-folder>/.postplus/searches.json \
  --output <work-folder>/.postplus/comments.json \
  --actor tiktok-comments-scraper \
  --top 8 \
  --max-comments 40
```

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

Escalate to `skills/video-analysis` when:

- the user wants hook or structure breakdowns
- the user asks why specific videos work
- the user wants shot-level or spoken-line analysis
- the user wants to recreate or adapt benchmark videos

When the request is broad, ask one short guiding question before running:

- "你是想先看 TikTok 上哪些方向值得研究，还是已经有几条视频想让我直接拆内容结构？"

Mention that this skill finds good samples first, and `video-analysis` can read the actual videos later.

Escalate to `skills/tiktok-ad-research` when:

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

