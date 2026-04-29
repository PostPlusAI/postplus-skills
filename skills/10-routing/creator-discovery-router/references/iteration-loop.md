# Iteration Loop

Use this file after each creator-discovery pass.

The goal is not to keep searching forever.
The goal is to make bounded improvements based on what the previous pass actually returned.

## 1. Evaluate The Pass

After each pass, ask:

- Was recall sufficient?
- Was quality sufficient?
- Did the results match the requested follower band?
- Did the results match the requested topic?
- Did the results match the requested creator type?
- Did the platform ranking bias the results?

## 2. Classify The Failure

Most failures fall into one of these buckets:

### `recall-too-narrow`

Symptoms:

- too few candidates
- target follower band has almost no hits

Typical fixes:

- widen recall band
- add one more collection pass
- switch to content-first if still using account-first

### `recall-too-noisy`

Symptoms:

- too many irrelevant accounts
- results dominated by large accounts, aggregators, or brand pages

Typical fixes:

- tighten topic language
- add creator type filters
- switch from account-first to content-first

### `query-language-mismatch`

Symptoms:

- keywords are too abstract
- results do not sound like real creator language

Typical fixes:

- replace topic nouns with real content expressions
- mine seeds for repeated hashtags and phrases

### `creator-type-mismatch`

Symptoms:

- too many product pages
- too many agencies or consultants
- too many aggregators

Typical fixes:

- classify creator type earlier
- split pool into:
  - individual creators
  - brand/product
  - educator/consultant
  - aggregator

### `platform-mismatch`

Symptoms:

- the platform does not surface the desired creator band well
- results are structurally weak even after route changes

Typical fixes:

- add or switch platform
- keep only the strongest evidence from the weaker platform

## 3. Change Only A Small Number Of Variables

Default rule:

- change one major variable
- optionally change one minor variable

Examples:

- major: `account-first -> content-first`
- major: `TikTok only -> TikTok + Instagram`
- minor: query rewrite
- minor: recall band adjustment

Avoid changing route, platform, query style, and creator type rules all at once unless the current pass is clearly unusable.

## 4. Separate Pools

Do not force one list to serve every purpose.

Keep separate outputs when useful:

- `research pool`
- `expanded pool`
- `outreach-ready shortlist`

## 5. Stop Conditions

Stop iterating when one of these is true:

- enough strong candidates exist for the user's goal
- marginal gains from another pass are low
- platform limitations are now clear
- another platform is clearly a better next step

## 6. Example

Request:

- `find 5k-10k AI tools creators for overseas students`

Pass 1:

- route: `account-first`
- result: too many large accounts, weak fit

Diagnosis:

- `recall-too-noisy`
- `query-language-mismatch`

Pass 2 changes:

- switch to `content-first`
- rewrite queries into real creator language

Pass 2 result:

- better fit
- more creators in target band

Pass 3 changes:

- widen recall to `3k-15k`
- classify creator type

This is the intended loop.
