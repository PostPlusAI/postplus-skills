# Shared Research Preferences

Shared routing rules for research skills.

## Core Rule

Classify the request first:

- `Web facts`: news, rules, company facts, public articles, policy context -> use web search
- `Platform data`: creators, hashtags, posts, comments, engagement, listings, rankings, reviews -> use the relevant platform skill first
- `Content breakdown`: hook, structure, shots, spoken lines, adaptation -> use analysis skill after collection
- `Mixed`: collect first, shortlist second, analyze third

If a platform skill exists, do not answer a platform-data question primarily from public web search.
Use web only when:

- the user explicitly wants a fast public-web read
- the fact is external to the platform dataset
- no platform skill exists
- the platform skill path is blocked

## Platform-First Rule

Treat these as platform-data requests by default:

- research data from a specific platform
- find bloggers / creators / KOCs / KOLs
- see which content is currently taking off
- inspect comments, engagement, price bands, rankings, and competitors
- find benchmark samples

Default execution order:

1. use the platform skill to collect a small valid dataset
2. normalize or rank locally
3. synthesize findings from the dataset
4. use deeper analysis skills only on shortlisted samples
5. use web search only as a secondary layer if needed

## Preferred Routes

- broad cross-platform social research routing -> `social-media-extractor`
- cross-platform creator discovery routing -> `creator-discovery-router`
- Google search-intent and topic momentum -> `google-trends-research`
- TikTok platform data -> `tiktok-research`
- TikTok ad creative research -> `tiktok-ad-research`
- Amazon platform data -> `amazon-research`
- supply-side product or supplier data -> user-provided supplier sheets,
  quotations, or approved marketplace exports
- Instagram creator discovery -> `instagram-creator-discovery`
- Instagram creator/account research -> `instagram-account-research`
- Instagram content benchmark -> `instagram-content-benchmark`
- Instagram audience language -> `instagram-audience-voice`
- Instagram hashtag/tagged campaign scouting -> `instagram-campaign-scout`
- X account/topic graph research -> `x-tools`
- YouTube channel and video research -> `youtube-research`
- Facebook page and post research -> `facebook-research`
- Hook, structure, and why content works -> `video-analysis`

## Chaining Rule

Do not treat research skills as isolated.

Typical chain:

1. collect
2. normalize
3. rank or shortlist
4. analyze the strongest samples
5. adapt into strategy or creative output

If the user also wants execution after research, hand off only after the research output is explicit:

1. package into brief, shortlist, or publish-ready copy
2. confirm channels or destinations if execution is high-impact
3. then route to outreach or publishing skills

For creator discovery requests, add a routing step before collection:

1. normalize the brief
2. choose `handle-first`, `content-first`, `graph-first`, or `mixed`
3. collect with the platform skill using a wider recall band when needed
4. enrich candidates
5. classify creator type
6. shortlist
7. hand off to outreach only after scoring

## Clarify Only When It Changes The Route

If the user intent is broad and the next step is ambiguous, ask one short question.

Examples:

- Do you want to inspect an account shortlist first, or start with content benchmarks?
- Do you want a platform data scan, or a breakdown of specific content structures?
- Are you scanning the market first, or do you already have samples to analyze?

If the route is already clear, do not stop to ask.

## Video Analysis Proactive Ask

When the user wants to analyze a specific video — hook, structure, shots, or
why it works — ask if they want to use `video-analysis` before falling back to
generic analysis. Skip the ask only if the user already named the skill.

## Failure Pattern To Avoid

Common mistake:

- user asks a platform-specific strategic question
- agent interprets it as a generic strategy question
- agent answers from web search first

Correct response:

- recognize the named platform
- route to the relevant skill first
- collect the minimum valid evidence
- synthesize only after evidence exists

Creator-discovery-specific mistake:

- user asks for `5k-10k` creators in a niche
- agent defaults to keyword-based account search
- follower filtering happens only after noisy recall

Better response:

- recognize that follower band + niche fit usually needs routing
- use `creator-discovery-router`
- prefer `content-first` or `graph-first` when account search is likely to over-rank large accounts
- use wider recall and tighter shortlist instead of strict first-pass filtering
- classify `individual creator` vs `brand/product` vs `educator/consultant` vs `aggregator` before producing outreach-ready leads

Cross-platform mistake:

- user asks a broad social question across multiple networks
- agent jumps straight into one familiar platform
- cross-platform differences are never surfaced

Better response:

- recognize when the request is about social direction rather than one named platform
- start with `social-media-extractor`
- use platform-specific skills only after the route is clear
