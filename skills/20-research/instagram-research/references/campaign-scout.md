# Instagram Campaign Scout

Use when the user wants bounded public Instagram campaign evidence: branded
hashtags, campaign names, launch phrases, brand/competitor posts, sampled UGC,
watchlists, or creator leads from campaign activity.

Apply `shared-contract.md` for public surface, collection key semantics, bounds,
evidence labeling, and output discipline.

## User Jobs

- Check public evidence for a campaign hashtag, slogan, launch phrase, event, or
  product term.
- Review brand-owned or competitor-owned campaign posts.
- Sample public UGC tied to campaign hashtags or search terms.
- Build a watchlist of hashtags, accounts, posts, or campaign phrases.
- Find creator leads only when they are tied to campaign evidence.
- Identify noisy, sparse, or ambiguous campaign signals before deeper work.

## Alignment

Infer whether the user wants owned posts, hashtag/search samples, UGC examples,
creator leads, campaign themes, or a watchlist. Ask only when the output would
change.

Use this question when needed:

`Should I prioritize brand-owned posts, hashtag/search samples, UGC examples, creator leads, or a watchlist?`

## Inputs

Minimum: campaign hashtag, campaign name, slogan, event/product term, brand
account, known campaign post, competitor account, competitor campaign seed, or
brand/category plus a clear campaign-scout goal.

Ask once only when needed:

| Situation | Ask |
| --- | --- |
| No seed | `Send one campaign hashtag, campaign name, brand handle, competitor account, or example post to start.` |
| Generic campaign name | `Which brand or product line should I pair with this campaign name?` |
| UGC ambiguity | `Do you mean brand-owned posts, hashtag/search samples, or the account tagged tab? Tagged tab is not currently supported.` |
| Watchlist ambiguity | `Should the watchlist prioritize hashtags, creator accounts, competitor posts, or campaign search terms?` |

## Run

| Seed | Key | Rule |
| --- | --- | --- |
| Explicit hashtag | `instagram-hashtags` | Sample posts/authors; no full spread claim. |
| Campaign name / phrase | `instagram-search` | Recall candidate posts/accounts/hashtags. |
| Brand/competitor account | `instagram-posts` | Sample owned public posts. |
| Known campaign post URLs | `instagram-posts` | Analyze selected posts. |

Optional: profile-enrich narrowed authors with `instagram-profiles`; route to
`creator-discovery.md` if campaign authors become outreach candidates.

## Route-Specific Evidence

- Label evidence as hashtag sample, search recall, owned-account posts, or
  direct post sample.
- Hashtag/search samples are not tagged-tab coverage.
- Brand-owned posts are not third-party UGC.
- Campaign authors are leads only when tied to source campaign evidence.

If results are noisy or sparse, ask for a stronger seed or one narrowing axis;
do not fill gaps with guesses.

## Output Focus

Return the decision supported, campaign scope, seed type, evidence table with
URLs/accounts/hashtags/authors, themes, notable examples, watchlist or creator
leads when supported, gaps, and next action.

## HTML Artifact Focus

Make the HTML useful as a campaign evidence board:

- evidence table grouped by hashtag sample, search recall, owned-account post,
  or direct post sample
- notable examples with URL, account/author, campaign term, and source type
- themes, watchlist seeds, and creator leads linked to campaign evidence
- noise, sparse results, and unsupported surfaces shown as gaps
