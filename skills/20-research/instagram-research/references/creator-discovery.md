# Instagram Creator Discovery

Use when the user wants Instagram creators, influencers, KOLs, KOCs, UGC makers,
affiliates, niche accounts, similar accounts, or outreach-ready shortlists.

Apply `shared-contract.md` for public surface, collection key semantics, bounds,
evidence labeling, and output discipline.

## User Jobs

- Discover creators, influencers, KOLs, KOCs, UGC makers, affiliates, or niche
  accounts from a public seed.
- Find accounts similar to a brand, competitor, creator, hashtag, or campaign.
- Rank an existing candidate list for collaboration fit.
- Build an outreach-ready shortlist with public evidence and cautions.
- Enrich public contact signals only after a shortlist exists.

## Alignment

Separate recall seeds from ranking constraints. Niche, hashtag, competitor,
product, audience, account, or post can recall candidates. Region, language,
follower band, creator type, and budget usually rank candidates after recall.

Ask only when the user gives ranking constraints without a recall seed.

Use this question when needed:

`Those constraints can help rank candidates; what should I use as the recall seed: niche, hashtag, competitor, product, audience, account, or post?`

## Inputs

Minimum: Instagram is clear and one discovery seed exists:

- niche/category/product/customer type
- hashtag/campaign term
- brand, competitor, or creator account
- public post/Reel URL
- existing candidate handles

Ask once only when needed:

| Situation | Ask |
| --- | --- |
| Platform missing | `Which platform should I use first?` |
| Instagram clear but no seed | `Give one starting point: niche, category, hashtag, competitor account, product direction, or target customer.` |
| Only region/language/follower band/type | `That can rank candidates, but it cannot recall them. Give one niche, hashtag, competitor, product, or audience seed.` |
| Contact request before shortlist | `Should I first build a creator shortlist, then enrich public contacts only for selected candidates?` |

## Run

| Seed | Recall | Enrich |
| --- | --- | --- |
| Niche/category/customer/query | `instagram-search` | `instagram-profiles`, optional `instagram-posts` |
| Hashtag/campaign tag | `instagram-hashtags` | `instagram-profiles` for authors |
| Competitor/brand account | `instagram-profiles`, optional `instagram-posts` | `instagram-search` for similar creators |
| Candidate handles | none | `instagram-profiles`, optional `instagram-posts` |
| Post/Reel URLs | `instagram-posts` | profile authors |

Contact enrichment: run `instagram-email-search` only for a narrowed shortlist.

## Route-Specific Evidence

- Search and hashtag results are candidate recall, not confirmed profile facts.
- Ranking needs at least one public fit reason per creator.
- Follower band, geography, language, and creator type are ranking constraints
  unless the selected collection path can apply them directly.
- Public contact signal is not guaranteed deliverability, willingness, or hidden
  email ownership.

If tagged-tab UGC is requested, offer hashtag/search/content samples only after
the user accepts the narrower scope.

## Output Focus

Return the decision supported, recall seeds, collection path, creator shortlist
table, evidence URL or handle for each candidate, reason, caution, missing
evidence, and contact status only when contact enrichment ran.

## HTML Artifact Focus

Make the HTML useful as a creator shortlist workspace:

- creator table with handle, source seed, fit reason, evidence URL, caution, and
  missing evidence
- grouped sections for recalled candidates, verified profiles, and enriched
  public contact signals
- ranking constraints shown separately from recall seeds
- selected candidates easy to copy into outreach or deeper account audit
