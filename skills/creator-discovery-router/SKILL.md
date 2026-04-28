---
name: creator-discovery-router
description: Route creator discovery requests into the right collection strategy before platform execution. Use this when the user wants to find creators, KOLs, KOCs, influencers, or partnership candidates and the request includes constraints such as follower range, niche, audience, geography, language, or collaboration fit. This skill decides whether to use handle-first, content-first, graph-first, or mixed discovery, then hands off to TikTok, Instagram, X, and creator-outreach skills.
---

# Creator Discovery Router

Use this skill when the user wants to:

- find creators or influencers for outreach
- shortlist KOL / KOC candidates
- find mid-tier or micro creators in a niche
- find creators under follower constraints such as `5k-10k`
- find creators by audience fit, not only by topic keywords
- compare discovery routes across TikTok, Instagram, and X

This skill is a routing layer. It should not be the primary collector.

It decides:

- what kind of discovery problem this is
- which platform skill should collect first
- whether to start from handles, content, or creator graph expansion
- when to hand off to `skills/creator-outreach`

Follow shared release-shell and research rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`
- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-research-preferences.md`

## Execution Rules

Inside the product-shell runtime, keep this skill narrow and fast:

- this skill is route selection only, not a collection workflow
- do not enter plan mode
- do not spawn Agent/Task subagents
- do not use `TodoWrite` just to manage simple routing work
- do not use `Glob` or any other discovery step to search for this skill's own reference files
- do not use Bash, `ls`, `find`, `cat`, or similar shell exploration to inspect skill directories or references
- read only the directly relevant reference files listed in this skill with the `Read` tool
- treat the reference list in this file as explicit. If you need one reference, read that exact file path directly
- after choosing the route, either:
  - explain the route briefly in user-facing language and hand off to the downstream platform skill
  - or ask one short clarification question if the route is genuinely ambiguous
- do not end the turn immediately after only reading a reference file
- do not stop at route diagnosis; continue into the downstream skill in the same turn whenever the route is already clear

If the request already clearly maps to one route, do not stop for extra exploration.

## Same-Turn Handoff Rule

For a clear creator-discovery request, this skill must complete three things in the same turn:

1. normalize the request into a brief internally
2. choose the discovery route
3. hand off to the downstream platform skill

Do not stop after step 1 or step 2.

If the request already names a platform and the route is clear, do not return a route-only answer.

## Default Handoff For TikTok Discovery

When the request is about finding TikTok creators/KOLs with topical fit plus a follower-band preference:

- default to `content-first`
- explain the plan in plain business language
- hand off directly to `skills/tiktok-research` in the same turn

For requests like:

- `找 20 个 TikTok 护肤仪 KOL，优先微中腰部账号`
- `找 TikTok 上适合做合作的美妆仪器达人`

do not pause after reading `brief-schema.md`. Route to `skills/tiktok-research` immediately unless a missing detail would genuinely change the route.
Do not treat a missing local reference file as a reason to stop or fail this handoff.
If the route is already clear from the user request, skip extra reference reads and continue into `skills/tiktok-research`.

## User-Facing Explanation Rule

When explaining the plan to the user before collection, do not expose internal route labels such as:

- `handle-first`
- `content-first`
- `graph-first`
- `mixed`

Use business language that a marketer can understand.

Good examples:

- "我会先从最近真的在发这类内容的人里找，再补他们的主页和联系方式。"
- "我会先从竞品已经合作过的人和相关内容里拉一批候选，再筛掉不适合联系的账号。"
- "我会先用你现有的达人名单补资料，再按内容、互动和合作价值做一轮筛选。"
- "如果平台后台已经有达人池，我会先用那个做第一轮过滤，再补公开资料。"

Avoid explanations like:

- "我会先走 content-first"
- "这次更适合 graph-first"
- "我准备 mixed route"

Internal route labels are for system reasoning, not for user-facing communication.

Read these references before implementation:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-research-preferences.md`
- `skills/creator-discovery-router/references/brief-schema.md`
- `skills/creator-discovery-router/references/routing-modes.md`
- `skills/creator-discovery-router/references/iteration-loop.md`
- `skills/creator-discovery-router/references/candidate-schema.md`
- `skills/creator-discovery-router/references/instagram-candidate-mapping.md`
- `skills/creator-discovery-router/references/x-candidate-mapping.md`

## Core Rule

Do not treat all "find creators" requests as keyword-based profile search.

First extract the real constraints:

- platform
- follower range
- recall range
- topic or niche
- audience
- geo or language
- creator type
- recency / activity
- contactability

Then choose the route.

Default assumption:

- do not use the user's target follower band as the first-pass recall band when the platform search is noisy
- use a wider recall band first, then tighten in shortlist scoring

## Discovery Modes

### `handle-first`

Use when the user already has:

- seed creators
- competitor handles
- account usernames
- brand watchlists

Route:

1. collect profiles from platform skills
2. enrich recent content if needed
3. rank and shortlist
4. hand off to `creator-outreach` if partnership prep is needed

### `content-first`

Use when the user wants:

- creators in a niche
- creators under a follower band
- real creators who are actively posting a topic
- partnership candidates based on what they post, not only what they claim in bio

Route:

1. collect topic-relevant videos / posts / reels first
2. extract authors from the content set
3. enrich author profiles
4. classify creator type
5. filter by follower range and creator fit
6. shortlist and hand off

This should be the default when the user asks for combinations like:

- `5k-10k AI tools creators`
- `small study creators who post productivity workflows`
- `mid-tier creators with overseas student audiences`

### `graph-first`

Use when the best creators are unlikely to be found by simple search ranking.

Examples:

- micro creators
- local-language creators
- creators in a narrow subculture
- creators around a specific seed account or hashtag cluster

Route:

1. start from one or more seed creators, hashtags, or posts
2. expand through related accounts, tagged mentions, repeated collaborators, or creator clusters
3. enrich candidate profiles
4. filter and shortlist

### `mixed`

Use when discovery needs multiple passes.

Example:

1. content-first to get real active creators
2. graph-first to expand around the best seeds
3. handle-first to enrich the final shortlist

## Routing Heuristics

If the user strongly cares about `follower range`:

- do not default to keyword-only profile search
- prefer `content-first` or `graph-first`
- widen recall before tightening shortlist

If the user strongly cares about `content relevance`:

- collect content before ranking creators

If the user strongly cares about `audience fit`:

- do not trust bios alone
- use recent content patterns, language, and repeated framing as evidence

If the user strongly cares about `creator type`:

- classify candidates before final shortlist
- separate:
  - `individual creator`
  - `brand/product account`
  - `educator/consultant`
  - `aggregator`

If the user already has seeds:

- use `handle-first`

If the user wants contact-ready leads:

- collect first
- enrich second
- score third
- only then use `creator-outreach`

## Platform Handoff

Use the narrowest useful platform skill:

- TikTok data -> `skills/tiktok-research`
- Instagram accounts -> `skills/instagram-account-research`
- X accounts -> `skills/x-research`
- Outreach prep -> `skills/creator-outreach`

Do not use public web search as the primary route for platform creator discovery unless platform collection is blocked.

## Default Output

Return:

- chosen discovery mode
- why this route was chosen
- collection plan by platform
- filtering logic:
  - recall range
  - follower range
  - relevance signals
  - creator type rules
  - exclusion rules
- whether the next skill should be collection, enrichment, or outreach

When returning creator candidates, normalize them into the shared candidate schema in `references/candidate-schema.md`.

Keep:

- a stable core schema across platforms
- optional fields for platform-specific or request-specific extensions

Do not let each platform return a completely different downstream shape if the outputs are meant to be merged.

## Good Brief

Use the shared brief shape in `references/brief-schema.md`.

If the user gives a vague request, infer the smallest sufficient brief and proceed.

If the request is ambiguous in a way that changes the route, ask one short question.

Examples:

- `你是更希望我先从最近在发这类内容的人里找，还是先从你已有名单和竞品名单里找？`
- `你这次更在意达人粉丝量级，还是更在意内容和目标受众的贴合度？`

## Failure Pattern To Avoid

Bad route:

- user asks for `5k-10k AI tools creators`
- agent runs keyword-based user search
- agent filters follower counts afterward
- result quality is poor and sparse

Better route:

- recognize that follower band plus niche fit needs `content-first`
- collect relevant content first
- extract and enrich authors
- classify creator type before final shortlist
- apply follower and fit filters after author expansion

When telling the user this plan, translate it into plain language:

- first find people who are already posting the right content
- then补主页和公开资料
- then按粉丝量、内容贴合度和账号类型筛 shortlist

## Default Filtering Pattern

Unless the user explicitly requires strict first-pass filtering:

1. use a wider recall band such as `3k-15k`
2. score relevance and creator type
3. tighten to the target band such as `5k-10k`
4. return:
   - `research pool`
   - `outreach-ready shortlist`

Do not collapse these into one list.

## Iteration Rule

Do not assume one collection pass is enough.

Creator discovery is an iterative loop:

1. collect a small but valid dataset
2. evaluate the result quality
3. diagnose where the failure or weakness is
4. change one or two key variables
5. run the next pass

Typical variables to change:

- route
- queries
- recall range
- creator type filters
- platform
- seed set

Do not change everything at once unless the current route is clearly invalid.

After each pass, decide whether the next step is:

- `continue on the same platform`
- `change route on the same platform`
- `expand from seeds`
- `switch or add platform`
- `stop and synthesize`

Use `references/iteration-loop.md` for the evaluation and optimization checklist.
