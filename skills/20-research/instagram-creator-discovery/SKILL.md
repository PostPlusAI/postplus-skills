---
name: instagram-creator-discovery
description: Discover Instagram creators through search, hashtags, tagged mentions, posts, and Reels, then enrich and rank them into research pools and shortlists.
---

# Instagram Creator Discovery

Follow shared release-shell rules in:

- `postplus-shared` release-shell rules

Use this skill when the user wants to:

- find Instagram creators or influencers in a niche
- search under follower-band constraints such as `5k-20k`
- find creators based on what they post, not only on bio keywords
- build creator pools for outreach or partnership research
- compare creators surfaced from search, hashtag, tagged, or content evidence

Read these references before implementation:

- `postplus-shared` research preferences
- `skills/10-routing/creator-discovery-router/references/candidate-schema.md`
- `skills/10-routing/creator-discovery-router/references/instagram-candidate-mapping.md`
- `skills/20-research/instagram-references/actor-selection.md`
- `skills/20-research/instagram-references/normalized-schema.md`
- `skills/20-research/instagram-references/tool-contracts.md`

## Core Rule

Do not default Instagram creator search to profile lookup only.

If the request cares about:

- follower bands
- recent activity
- topical fit
- audience fit

prefer content-first or mixed discovery:

1. collect matching posts / Reels / hashtag results / tagged posts
2. extract candidate usernames from the matched content
3. enrich candidate profiles
4. optionally enrich recent posts for stronger evidence
5. rank creators by profile + content evidence
6. return a research pool plus shortlist

## Primary Hosted Collection Keys

- `instagram-search`
- `instagram-hashtags`
- `instagram-profiles`
- `instagram-posts`

Released enrichment:

- hosted collection key `instagram-email-search`

## Local Tools

- `skills/20-research/instagram-tools/scripts/build_instagram_actor_input.mjs`
- `skills/20-research/instagram-tools/scripts/run_instagram_actor.mjs`
- `skills/20-research/instagram-tools/scripts/normalize_instagram_dataset.mjs`
- `skills/20-research/instagram-tools/scripts/extract_instagram_candidate_usernames.mjs`
- `skills/20-research/instagram-tools/scripts/rank_instagram_creators.mjs`

## Route Guidance

Use `handle-first` when:

- the user already has handles
- the user has competitor account lists
- the user wants profile enrichment more than discovery

Use `content-first` when:

- the user wants active niche creators
- the user cares about follower bands
- the user cares about audience fit from actual content

Use `mixed` when:

- you need search or hashtag recall first
- then need profile enrichment and creator scoring

## V1 Workflow

### 1. Build actor input from a brief

```bash
node ${CLAUDE_SKILL_DIR}/../instagram-tools/scripts/build_instagram_actor_input.mjs \
  --brief <work-folder>/.postplus/instagram-brief.json \
  --actor instagram-search \
  --output <work-folder>/.postplus/instagram-search-input.json
```

### 2. Run the collection actor

```bash
node ${CLAUDE_SKILL_DIR}/../instagram-tools/scripts/run_instagram_actor.mjs \
  --collection-key instagram-search \
  --input <work-folder>/.postplus/instagram-search-input.json \
  --output <work-folder>/.postplus/instagram-search-raw.json
```

### 3. Normalize the dataset

```bash
node ${CLAUDE_SKILL_DIR}/../instagram-tools/scripts/normalize_instagram_dataset.mjs \
  --input <work-folder>/.postplus/instagram-search-raw.json \
  --actor instagram-search \
  --dataset-type posts \
  --output <work-folder>/.postplus/instagram-search-normalized.json
```

### 4. Extract candidate usernames

```bash
node ${CLAUDE_SKILL_DIR}/../instagram-tools/scripts/extract_instagram_candidate_usernames.mjs \
  --input <work-folder>/.postplus/instagram-search-normalized.json \
  --route content-first \
  --output <work-folder>/.postplus/instagram-candidate-usernames.json
```

### 5. Enrich profiles

```bash
node ${CLAUDE_SKILL_DIR}/../instagram-tools/scripts/run_instagram_actor.mjs \
  --collection-key instagram-profiles \
  --input <work-folder>/.postplus/instagram-profile-input.json \
  --output <work-folder>/.postplus/instagram-profiles-raw.json
```

Then normalize:

```bash
node ${CLAUDE_SKILL_DIR}/../instagram-tools/scripts/normalize_instagram_dataset.mjs \
  --input <work-folder>/.postplus/instagram-profiles-raw.json \
  --actor instagram-profiles \
  --dataset-type profiles \
  --output <work-folder>/.postplus/instagram-profiles-normalized.json
```

### 6. Rank creators

```bash
node ${CLAUDE_SKILL_DIR}/../instagram-tools/scripts/rank_instagram_creators.mjs \
  --profiles <work-folder>/.postplus/instagram-profiles-normalized.json \
  --content <work-folder>/.postplus/instagram-search-normalized.json \
  --candidates <work-folder>/.postplus/instagram-candidate-usernames.json \
  --route content-first \
  --output <work-folder>/.postplus/instagram-creator-ranking.json
```

## Good Output

Return:

- `research_pool`
- `shortlist`
- why each top creator was surfaced
- creator type estimate
- topical fit
- audience fit
- follower band fit
- public contact signals if available

## Handoff

Escalate to `instagram-account-research` when:

- the user already has a stable shortlist and wants deeper account snapshots

Escalate to `instagram-content-benchmark` when:

- the user wants deeper analysis of the strongest posts or Reels

Escalate to `instagram-audience-voice` when:

- the user wants comment-language extraction from the shortlisted content
