# Instagram Shared Contract

This contract is the single source of truth for public Instagram human
alignment, collection scope, collection key semantics, first-pass bounds, and
evidence discipline. Each workflow reference adds only route-specific method.

## Public Surface

Use only public Instagram evidence:

- public profiles / handles
- public posts, carousels, and direct Reel-like URLs when post-level fields are
  enough
- public comments from known post/Reel URLs or a bounded shortlist
- explicit hashtag and campaign hashtag samples
- Instagram search recall for brands, accounts, creators, topics, and campaigns
- public contact-signal enrichment for a narrowed shortlist

Stop or re-scope for paid ads, Meta Ads Library, Stories, Shop, LIVE, DMs,
private/login-only data, tagged-tab coverage, mention graphs, follower lists,
follower history, full Reels analytics, related hashtag graph, share of voice,
backend analytics, or full campaign spread.

## Human Alignment

Before collecting, infer the decision the user is trying to make:

- diagnose: understand account, content, campaign, or audience problems
- compare: benchmark competitors, examples, creators, or campaigns
- discover: build a shortlist of posts, accounts, creators, or campaign leads
- extract: turn comments or public content into language, hooks, or objections
- plan: produce a creative brief, outreach list, watchlist, or next action
- verify: check whether public evidence supports a claim or candidate

Ask one question only when the answer changes route, sample, output mode,
public/private boundary, or first-pass scope. When the goal is clear enough,
choose the smallest useful first pass and state the assumption.

Do not ask for implementation details such as collection keys, credentials,
private exports, hidden filters, retries, or execution strategy.

## Collection Key Routing

Use the narrowest released key. Direct identifiers beat recall.

| Input / evidence need | Key | Rule |
| --- | --- | --- |
| Known handles/profile URLs | `instagram-profiles` | Profile facts only; not content or history. |
| Direct post/Reel/carousel URLs or account recent posts | `instagram-posts` | Post-level evidence only; not comments or Reels analytics. |
| Comments | `instagram-comments` | Requires post/Reel URLs first. |
| Explicit hashtags/campaign tags | `instagram-hashtags` | Sample only; not graph, volume, or full spread. |
| Brand/category/topic/creator/campaign query | `instagram-search` | Recall only; not confirmed facts. |
| Public contacts for shortlist | `instagram-email-search` | Shortlist only; never broad lead scraping. |

## Request Field Shapes

Each request is the raw collection input object. Send it directly to
`postplus research collect <collectionKey> --skill instagram-research --request <input.json>`;
never wrap it in a hosted envelope or a `{ "schemaVersion": 1, "input": ... }`
shape, and never add fields the collection does not define. Use
`postplus research schema --collection-key <collectionKey> --json` only when
constructing or repairing an unknown shape. Watch the account-field split:
`instagram-posts` takes `username` (array), while `instagram-profiles` and
`instagram-email-search` take `usernames`. These first-pass examples are mirrored
by the local-dev paradigm fixtures and must stay in sync with them.

### instagram-profiles

```json
{
  "resultsLimit": 3,
  "usernames": ["duolingo", "quizlet", "coursera"]
}
```

### instagram-posts

```json
{
  "resultsLimit": 3,
  "username": ["duolingo", "quizlet", "coursera"]
}
```

### instagram-comments

```json
{
  "directUrls": ["https://www.instagram.com/p/CuLQxEfrjA0/"],
  "resultsLimit": 5
}
```

### instagram-hashtags

```json
{
  "hashtags": ["studytok", "aitutor"],
  "resultsLimit": 3
}
```

### instagram-search

```json
{
  "searchLimit": 3,
  "searchTerms": ["Paradigm AI tutor course", "Clover AI tutor learning"],
  "searchType": "user"
}
```

### instagram-email-search

```json
{
  "usernames": ["studywithsoy", "studyquill"]
}
```

## Common Chains

- Account audit: `instagram-profiles`, then `instagram-posts` only when content
  evidence is needed.
- Organic benchmark: direct post/account/hashtag evidence first; use
  `instagram-search` only for candidate recall.
- Audience voice: build a `3-8` post shortlist, then collect
  `instagram-comments`.
- Creator discovery: `instagram-search` or `instagram-hashtags`, then
  `instagram-profiles`, optional `instagram-posts`, optional
  `instagram-email-search` after shortlist.
- Campaign scout: `instagram-hashtags`, `instagram-search`, or
  `instagram-posts`; enrich authors only after campaign evidence exists.

## First-Pass Bounds

| Route | Bound |
| --- | --- |
| Account audit | `1-15` profiles; add `6-12` posts only when useful |
| Organic benchmark | `10-15` items per theme/account/hashtag/query; max `3-5` broad seeds |
| Audience voice | direct URLs `1-10`; generated shortlist `3-8` posts/Reels |
| Creator discovery | `3-8` queries/hashtags; enrich `5-15` profiles |
| Contact enrichment | `5-20` shortlisted creators/accounts |
| Campaign scout | `1-3` hashtags, `1-5` handles/posts, or `1-5` campaign terms |

## Evidence Contract

- Separate direct facts, search recall, inferred interpretation, and gaps.
- Label each evidence set by source type: profile, post, comment, hashtag
  sample, search recall, owned-account post, direct post sample, or public
  contact signal.
- Search and hashtag results are candidate recall until profile/post evidence
  verifies them.
- Hashtag/search samples are not tagged-tab coverage, full spread, volume,
  related hashtag graph, or share of voice.
- Public counts are current snapshots, not growth or backend performance.
- Public contact signal is not guaranteed deliverability, willingness, or hidden
  ownership.
- Empty, unavailable, private, login-gated, disabled, spam-heavy, or low-signal
  data produces a gap, not a fabricated insight.

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
- evidence: sortable or grouped cards/tables for profiles, posts, comments,
  hashtags, search recall, or public contact signals
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
