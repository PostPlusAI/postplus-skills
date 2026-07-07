# TikTok Shared Contract

This contract is the single source of truth for TikTok human alignment, public
source scope, collection key semantics, first-pass bounds, and evidence
discipline. Each workflow reference adds only route-specific method.

## Public Surface

Use only public TikTok evidence:

- keyword, hashtag, profile, and direct-video organic video samples
- related video expansion from selected public videos
- public comments from known video URLs or a bounded shortlist
- public profile enrichment for known or discovered creators
- account-search recall when names or handles are the task
- public paid ad examples from the productized TikTok paid-ad collection
- user-provided exports or datasets, labeled as supplied evidence

Current released collection keys:

| Evidence need | Collection key | Rule |
| --- | --- | --- |
| Organic videos from keyword, hashtag, profile, or direct video seed | `tiktok-videos` | Primary organic sample; not comments or full trend proof. |
| Related expansion from selected videos | `tiktok-related-videos` | Use only after strong seed videos exist. |
| Comments | `tiktok-comments` | Requires public video URLs first. |
| Known creator/profile handles | `tiktok-profiles` | Account/profile sample; returned video rows may carry profile facts in `authorMeta`. |
| Names-only account search | `tiktok-users` | Recall only; not creator ranking proof. |
| Public paid ad examples | `tiktok-ads-top` | Paid creative evidence only; not delivery proof. |

Stop or re-scope for Shop, LIVE, private/login-only data, GMV, conversion,
backend audience analytics, hidden contacts, follower lists, exact targeting,
spend, ROAS, billing, ad account data, or music/archive download work.

## Human Alignment

Before collecting, infer the decision the user is trying to make:

- diagnose: understand a content, profile, audience, creator, or ad problem
- compare: benchmark competitors, examples, hooks, creators, or paid vs organic
- discover: build a shortlist of videos, creators, comments, or ads
- extract: turn comments or public content into language, hooks, objections, or FAQ
- plan: produce a content angle, creator list, paid brief, watchlist, or next action
- verify: check whether public TikTok evidence supports a claim or candidate

Ask one question only when the answer changes route, sample, output mode,
public/private boundary, or first-pass scope. When the goal is clear enough,
choose the smallest useful first pass and state the assumption.

Do not ask for implementation details such as collection keys, credentials,
private exports, hidden filters, retries, implementation choice, or execution
strategy.

## Common Chains

- Organic benchmark: use `tiktok-videos` first; use `tiktok-related-videos`
  only after seed videos are selected.
- Audience voice: build a `3-8` video shortlist, then collect
  `tiktok-comments`.
- Creator discovery: collect content first with `tiktok-videos`, extract
  authors, then enrich with `tiktok-profiles`; use `tiktok-users` only for
  account recall.
- Paid ads: collect `tiktok-ads-top`; keep paid evidence separate from organic
  content and comments.
- Profile lookup: use `tiktok-profiles` for known handles; use `tiktok-users`
  only when names/handles need recall.
- Account and competitor audit: collect `tiktok-profiles`; add `tiktok-videos`
  only when content evidence is needed.
- Product content fit: collect organic examples first, then comments or paid
  examples only when they answer the decision.
- Campaign scout: collect campaign/profile samples first; use related videos
  and profile enrichment only after seed evidence exists.
- Market localization: run one bounded `tiktok-videos` lane per market or
  language; keep markets labeled separately.

## Request Cards

Use these cards for local skill testing and first-pass execution. The request
file is the raw collection input object. Do not wrap it in `schemaVersion` or an
`input` envelope. Use
`postplus research schema --collection-key <collectionKey> --json` only when
constructing or repairing an unknown request shape.

### Known Account Recent Videos

Use when the user gives a TikTok handle/profile and wants recent content,
account voice, or a comment shortlist.

```json
{
  "profiles": ["yappy.apparel"],
  "resultsPerPage": 8,
  "shouldDownloadCovers": false,
  "shouldDownloadSlideshowImages": false,
  "shouldDownloadSubtitles": false,
  "shouldDownloadVideos": false
}
```

Run:

```bash
postplus research collect tiktok-profiles --skill tiktok-research --request request.json --output result.json
```

Expect public video rows with fields such as `webVideoUrl`, `text`,
`createTimeISO`, `commentCount`, visible engagement counts, and `authorMeta`
when available. Filter recency from `createTimeISO` in the returned JSON.

### Organic Query Or Hashtag Sample

Use when the seed is a product, category, hashtag, competitor phrase, or topic.

```json
{
  "searchQueries": ["portable blender"],
  "searchSection": "/video",
  "maxItems": 10,
  "proxyCountryCode": "US",
  "shouldDownloadCovers": false,
  "shouldDownloadSlideshowImages": false,
  "shouldDownloadSubtitles": false,
  "shouldDownloadVideos": false
}
```

Run with `tiktok-videos`.

### Comments From Known Videos

Use after `1-8` public video URLs are known.

```json
{
  "postURLs": [
    "https://www.tiktok.com/@yappy.apparel/video/7651749463421193485"
  ],
  "commentsPerPost": 50,
  "maxRepliesPerComment": 0
}
```

Run with `tiktok-comments`. Independent direct video URLs may run in parallel
when each has its own request and output file.

### Async Result

If a run returns `status: "processing"` with `runHandle`, do not relaunch it.
Resume the same run:

```bash
postplus research collect --run-handle "$RUN_HANDLE" --output result.json
```

If a request fails with a clear collection input error, report the operation id,
collection key, request file, and exact message. For local prototype testing,
then adjust only the minimal request shape and continue; do not search unrelated
fixtures or product code first.

## First-Pass Bounds

| Route | Bound |
| --- | --- |
| Organic benchmark | `3-5` queries or `2-4` hashtags; `5-12` videos per seed |
| Related videos | `1-5` strong seed videos |
| Audience voice | direct URLs `1-8`; generated shortlist `3-8` videos |
| Creator discovery | content-first sample, then `10-30` profile enrichments |
| Profile lookup | `1-20` known handles or a small account-search recall |
| Paid ads | one clear paid scope; usually `10-30` ads when schema allows |
| Account and competitor audit | `1-8` accounts; add `5-12` videos per account only when useful |
| Product content fit | `2-4` product/problem seeds; comments from `3-8` selected videos |
| Campaign scout | `1-4` campaign seeds; related expansion from `1-5` selected videos |
| Market localization | `2-4` markets/languages; `5-12` videos per lane |

## Evidence Contract

- Separate direct facts, recalled candidates, inferred interpretation, and gaps.
- Label each evidence set by source type: organic video sample, related video,
  comment thread, profile snapshot, account-search recall, or paid ad example.
- Search/account results are candidate recall until profile or content evidence
  verifies them.
- Related videos are adjacency evidence, not a complete trend graph.
- Comments represent commenters on selected videos, not all viewers, followers,
  buyers, or TikTok users.
- Public counts are current snapshots when returned, not growth, reach,
  conversion, paid delivery, or audience quality.
- Paid ad examples are creative evidence, not proof of spend, exact targeting,
  ROAS, conversion, or billing.
- Empty, unavailable, private, disabled, spam-heavy, sparse, malformed, or
  low-signal data produces a gap, not a fabricated insight.

## Parallelism

Run independent lanes in parallel only when each lane has a bounded request,
its own output path, and no dependency on another lane's result.

Good parallel lanes:

- competitor account profile lookups
- separate market/language samples
- separate campaign hashtags or profile samples
- paid and organic lanes when both scopes are already clear

Do not parallel dependent chains such as search -> verify profiles, videos ->
comments, videos -> related expansion, or content recall -> creator enrichment.

## Research Artifact

When item-level evidence is collected, do not only return a chat summary. If the
host supports local file output, produce a compact HTML evidence view alongside
the JSON result.

The JSON result is the source of truth. The HTML is a review surface over that
JSON; it must not invent fields, hide gaps, or turn unsupported inferences into
facts.

The HTML should make the first pass easy to inspect:

- overview: user goal, route, scope, seeds, collection keys, counts, and time
- findings: strongest supported patterns with evidence links
- evidence: sortable or grouped cards/tables for videos, comments, profiles,
  account recall, related videos, or paid ads
- gaps: unavailable, low-signal, noisy, private, or unsupported surfaces
- next action: the smallest useful follow-up

Every finding must point to source URLs, item ids, or evidence rows. If support
is weak, label it as an inference or gap.

Keep the chat response short: link or name the artifact, then summarize scope,
strongest finding, biggest gap, and recommended next action.

## Output Contract

Stop after the first pass. Return:

- user goal and bounded scope
- collection keys run and evidence counts
- JSON result path and HTML artifact path when files were produced
- direct facts
- route-specific findings
- inferences clearly labeled as inferences
- evidence gaps and unsupported surfaces
- next action tied to the user's decision

Never present a sample as full-platform truth.
