# TikTok Actor Selection

Use this file when choosing which collection actor should power a TikTok workflow.

## Default Rule

Start from the narrowest actor that matches the user request. Do not default to one generic TikTok actor when the task is clearly about:

- searching for creators
- enriching known profiles
- collecting benchmark videos
- enriching one or more known video URLs
- collecting comments
- scanning one hashtag surface only
- scanning ad or Creative Center surfaces
- finding TikTok Shop creators

## Actors

### `tiktok-user-search-scraper`

Use for:

- creator discovery by keyword
- niche scouting
- finding candidate accounts before deeper enrichment

Best when the unit of analysis is the account, not the video.

Do not make this the default first pass for small-creator discovery when the user cares about:

- follower bands
- recent content relevance
- local-language or geo fit
- active creators surfaced from actual topic videos

### `tiktok-profile-scraper`

Use for:

- profile enrichment from known usernames
- creator shortlist building
- pulling profile stats plus recent videos

Prefer this after search has already identified candidate usernames.

Current bounded default:

- keep `resultsPerPage` around 6-12 recent posts per profile unless the current step explicitly needs more
- keep optional downloads such as covers, slideshow images, subtitles, and videos off unless the output really needs those assets

### `tiktok-video-scraper`

Use for:

- one or more known TikTok video URLs
- filling richer details for shortlisted benchmark videos
- direct video lookup when you do not want generic search noise

Prefer this when the user already has video URLs or video ids.

### `tiktok-comments-scraper`

Use for:

- comments on a small or moderate shortlist of videos
- comment-language sampling after benchmark selection
- higher-certainty comment collection on a narrowed set

Prefer this for focused qualitative work, not broad market-scale collection.

### `tiktok-hashtag-scraper`

Use for:

- one or more known hashtags
- hashtag-specific sampling without mixing search surfaces
- tighter control over hashtag-led benchmark collection

Prefer this when hashtag surface purity matters more than actor simplicity.

### `tiktok-profile-scraper`

Use for:

- bulk profile enrichment
- large handle lists
- extracting bio and outbound-link fields at lower cost

Prefer this when throughput matters more than matching a previous Clockworks-specific payload.

### `tiktok-scraper`

Use for:

- broad, low-cost content discovery
- start URL driven scraping
- keyword search with `location` and `sortType`
- mixed scraping across search, hashtag, profile, music, or location surfaces

Prefer this when sample size and unit economics matter more than matching Clockworks payloads.

### `tiktok-scraper-api`

Use for:

- low-cost query-driven expansion
- fast iterative search/tag/profile sampling
- workflows that can benefit from the actor's free first-page behavior on some surfaces

Prefer this when the task is exploratory and you want to test many queries before deeper enrichment.

### `tiktok-comments-scraper`

Use for:

- larger-scale comment collection
- comment collection where cost per result matters
- workflows that need detailed user info attached to comments

Prefer this after you already know which videos matter.

### `tiktok-scraper`

Use for:

- keyword or hashtag video sampling
- benchmark discovery
- adjacent creator discovery from search results
- creator discovery from matched topic videos
- graph expansion from shortlisted videos via related-video scraping

This is the best fit when the object of interest is the video, hook, or format pattern.

High-value inputs worth using in the local workflow:

- `searchSection`
- `searchSorting`
- `searchDatePosted`
- `postURLs`
- `scrapeRelatedVideos`
- `commentsPerPost`
- `maxRepliesPerComment`
- `maxFollowersPerProfile`
- `maxFollowingPerProfile`
- `proxyCountryCode`

Current bounded default from the official input schema:

- use `searchSection: "/video"` for content-first creator discovery so search queries stay on video results instead of TikTok Top
- keep `resultsPerPage` small on the first pass, typically 5-12 per query / hashtag / profile
- keep `scrapeRelatedVideos` off unless you are already in a graph-expansion step
- keep `commentsPerPost`, `topLevelCommentsPerPost`, and `maxRepliesPerComment` at `0` until you have narrowed the video shortlist
- keep `shouldDownloadVideos`, `shouldDownloadCovers`, `shouldDownloadSlideshowImages`, `shouldDownloadAvatars`, `shouldDownloadMusicCovers`, and subtitle/transcription add-ons off unless the current step explicitly needs those files
- when scraping profiles with this actor, keep `profileScrapeSections` to `["videos"]` and prefer `excludePinnedPosts: true` unless pinned posts are part of the research question

### `tiktok-creative-center-top-ads`

Use for:

- Creative Center top ad sampling
- ad-market scanning by region, objective, language, or industry
- performance-oriented ad benchmark collection

Do not mix this actor into generic organic creator discovery. Treat it as ad intelligence.

### TikTok Shop Creator Scouting

Status: unsupported in the current hosted release.

Do not route user requests to `tiktok-shop-creators`. PostPlus Cloud does not
expose this as a hosted collection key, and the provider input contract is not a
keyword-discovery surface.

## Routing Guidance

If the user wants:

- "Find creators in a category" -> usually `tiktok-scraper` first, `tiktok-user-search-scraper` as account-search supplement
- "Inspect which videos and creators are active under this topic" -> `tiktok-scraper`
- "Inspect specific videos under this hashtag" -> `tiktok-hashtag-scraper`
- "I already have handles; enrich profiles and contact paths" -> `tiktok-profile-scraper`
- "I already have video links; enrich details and author information" -> `tiktok-video-scraper`
- "Collect comments under these videos" -> `tiktok-comments-scraper`
- "Use low-cost multi-query exploration first" -> `tiktok-scraper` or `tiktok-scraper-api`
- "Expand the creator pool from a batch of matched videos" -> `tiktok-scraper` with `postURLs + scrapeRelatedVideos`
- "Inspect TikTok ad rankings / Creative Center ads" -> `tiktok-creative-center-top-ads`
- "Find TikTok Shop affiliate creators" -> unsupported in the current hosted release

## Cost and Fallback Guidance

Prefer a two-step escalation path instead of one actor for everything:

1. start with the narrowest actor that matches the surface
2. switch to lower-cost routes when:
   - volume matters more than payload continuity
   - you need region-aware search
   - you are still in exploratory sampling

Practical defaults:

- small sample, higher certainty -> Clockworks
- larger sample, lower cost -> ApiDojo
- direct URL enrichment -> dedicated video/comments/profile actor
- ad intelligence -> Codebyte
- shop creator analytics -> Lemur, U.S. only

## Cost Discipline

Start small:

- 3-8 queries
- 10-30 candidate profiles
- 6-12 recent videos per shortlisted profile
- 6-12 seed videos for graph expansion
- 4-10 related videos per seed
- TikTok Shop runs only on narrowed keywords or product themes
- comments only after the video shortlist is narrowed
- Creative Center ad runs only after geo and industry are clear

Avoid broad market collection before ranking and filtering.
