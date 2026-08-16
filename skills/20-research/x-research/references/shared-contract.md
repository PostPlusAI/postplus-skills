# X Shared Contract

This is the single source of truth for X public scope, collection-key
semantics, request cards, first-pass bounds, and evidence discipline.

## Public Surface

Use only public X evidence:

- public posts from one query, hashtag, handle, profile URL, post URL, or list URL
- public replies found through a conversation query
- public profile facts for known accounts
- public user-search recall from a keyword
- user-provided exports, labeled as supplied evidence

Current released collection keys:

| Evidence need | Collection key | Rule |
| --- | --- | --- |
| Posts, profile timeline, direct post, list, or replies | `x-posts` | One seed per request; primary post-level evidence. |
| Known account facts | `x-profiles` | Direct verification only; not follower/following extraction. |
| Keyword-based account recall | `x-user-search` | Candidate recall only; verify selected accounts with `x-profiles`. |

Stop or re-scope for protected accounts, login-only content, DMs, hidden
analytics, complete follower/following graphs, exhaustive monitoring, exact
reach, conversion, spend, targeting, or ROAS.

## Human Alignment

Infer whether the user needs to diagnose, compare, discover, extract, plan, or
verify. Ask one question only when the answer changes route, sample, output,
public/private boundary, or first-pass scope.

## Request Cards

The request file is the raw collection input object, not an execution envelope.

### Post Search Or Account Timeline

Use one query per request. Advanced X search syntax may express account,
hashtag, mention, language, date, media, or engagement constraints.

```json
{
  "searchTerms": ["from:OpenAI -filter:retweets"],
  "sort": "Latest",
  "maxItems": 20
}
```

For a topic, replace the query with a keyword or hashtag. Use `Top` only when
the decision needs visibly high-engagement examples; use `Latest` for recency.

### Direct Post, Article, Profile, Or List URL

```json
{
  "startUrls": ["https://x.com/OpenAI"],
  "maxItems": 20
}
```

A direct post/article URL can cost more than a standard search. Keep it to one
URL and use it only when exact content is required.

### Thread Replies

Extract the numeric post id from a selected public post URL.

```json
{
  "searchTerms": ["conversation_id:1890000000000000000"],
  "sort": "Latest",
  "maxItems": 20
}
```

### Known Profiles

```json
{
  "twitterHandles": ["OpenAI"],
  "maxItems": 20
}
```

The product boundary disables followers, following, retweeters, unavailable
users, extended account-history lookup, and custom output code.

### User Search Recall

```json
{
  "searchTerms": ["AI researcher"],
  "maxItems": 20
}
```

Run `x-user-search`, then verify only selected handles through `x-profiles`.

## Common Chains

- Account audit: `x-profiles`, then one `x-posts` account query when content is needed.
- Organic benchmark: one `x-posts` query per seed.
- Audience voice: shortlist `1-3` posts, then one reply query per thread.
- Creator discovery: one content or user-search recall, then verify `5-15` profiles.
- Campaign scout: run `1-3` separately labeled post queries.
- Localization: run `2-4` separately labeled market/language queries.

Do not parallelize dependent chains such as recall -> profile verification or
post shortlist -> replies. Independent seeds may run in parallel with separate
request and output files.

## First-Pass Bounds

| Route | Bound |
| --- | --- |
| Post search / timeline | one seed per request, `20` posts; expand once to `40` after inspection |
| Direct URL | one URL per request |
| Audience voice | `1-3` selected threads, `20` replies per thread |
| Known profiles | one handle per request, up to `15` separately labeled accounts |
| User-search recall | one keyword, `20` candidates; expand once to `40` |
| Creator verification | `5-15` shortlisted accounts, one handle per request |
| Campaign scout | `1-3` separate post seeds |
| Localization | `2-4` separately labeled lanes, `10-20` posts each |

## Evidence Contract

- Separate post facts, profile facts, recalled candidates, interpretation, and gaps.
- Search results are samples; user-search rows are candidates until verified.
- Replies represent participants in selected threads, not all followers, users, or buyers.
- Public counts are current snapshots, not growth, reach, conversion, or audience quality.
- Preserve source URLs and the query/seed that produced each evidence set.
- Empty, sparse, private, unavailable, malformed, or low-signal output is a gap.

When item-level evidence is collected, keep JSON as source of truth and create
a compact HTML evidence view when local file output is available.
