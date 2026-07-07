# Facebook Shared Contract

Read this before every route. Keep the run public, small, source-grounded, and
useful to the growth decision.

## Released Surface

The released Facebook surface has two lanes. The scrape lane pulls public
page/profile/group/post content through `postplus research scrape <sourceKey>`.
The collect lane pulls reels, comments, ads, events, marketplace, pages, posts,
and public search through `postplus research collect <collectionKey>`. Use
`postplus research schema --json` or
`postplus research schema --collection-key <collectionKey> --json` only when
constructing or repairing an unknown request shape.

Scrape lane (public content):

| Evidence need | Source key | First pass |
| --- | --- | --- |
| Public page/profile recent posts | `facebook-profile-posts` | `1-5` page/profile URLs, small per-source post bound |
| Direct public post evidence | `facebook-post-by-url` | `1-10` post URLs |
| Public group recent posts | `facebook-group-posts` | `1-3` public groups |

Collect lane (hosted collection):

| Evidence need | Collection key | First pass |
| --- | --- | --- |
| Ad-library creative, offers, CTAs | `facebook-ads-library` | 1 keyword or advertiser page, up to `10` ads |
| Post/reel comments | `facebook-comments` | `1-10` post/reel URLs, small comment bound |
| Public group discussion | `facebook-groups` | `1-3` group URLs, small post bound |
| Public events, local activations | `facebook-events` | 1 topic+location query or event URL, up to `10` events |
| Marketplace listings, price bands | `facebook-marketplace` | 1 marketplace search/category URL, up to `10` listings |
| Page identity, category, activity | `facebook-pages` | `1-5` page URLs |
| Page/profile posts (rich fields) | `facebook-posts` | `1-5` page/profile URLs, up to `10` posts each |
| Reels, short-form video | `facebook-reels` | `1-5` page/profile URLs, small reel bound |
| Broad public search discovery | `facebook-search` | 1 query, small result bound |

Anything outside these keys is not on the released public surface: private
profiles, hidden groups, member lists, Page Insights, ad account metrics,
targeting, spend, and ROAS are not supported. When the decision needs one of
those, say so and stop. Do not improvise another collection path, provider, or
tool.

## Human Alignment

Infer the user decision before collecting:

| Decision | Means |
| --- | --- |
| Audit | What should we fix, monitor, or stop doing? |
| Benchmark | What patterns are competitors using? |
| Voice | What words, objections, and questions appear in public group discussion? |
| Monitoring | What changed in the sources since the last pass? |

Ask one short question only when the current seed cannot support the decision.
If the route is clear, state the assumption and run the first pass.

## Parallel Rule

Parallelize independent seeds:

- posts across multiple pages/profiles
- competitor pages
- group posts or group discussion across multiple groups
- direct posts, reels, comments, or listings across multiple URLs
- ad-library, events, or search seeds that do not depend on each other

Do not parallelize dependent work, such as comment evidence before the source
post URLs exist, or page verification before discovery returns candidates.

## Evidence Rules

- Public samples are snapshots, not complete Facebook truth.
- Keep each source and collection type as its own evidence lane; do not merge a
  scrape sample with a collect sample or present one as the other.
- Engagement, play, response, and price fields rank items inside the sample only.
- Comments and group discussion are public visible text only, not full sentiment.
- Ad-library transparency fields are public disclosure only, never paid delivery.
- Supplied exports are valid only when labeled as user-provided.
- Empty, private, login-gated, sparse, or noisy data is a gap.

Stop for private profiles, hidden groups, member lists, private messages,
backend Page Insights, Business Manager, ad account access, exact targeting,
spend, ROAS, conversion, full historical archives, or login automation.

## HTML Artifact

When item-level evidence exists, produce:

- `result.json`: source of truth
- `evidence.html`: review surface over the JSON

The HTML must be compact and inspectable:

- header: user goal, route, seeds, source keys, run time, item counts
- finding rail: 3-7 supported findings, each linked to evidence rows
- evidence table/cards: source URL, text/title, date, public metrics, media
  fields, raw row id
- filters: source type, source key, keyword/text search, status when relevant
- gaps: private, empty, sparse, unsupported, noisy, or failed lanes
- next action: one concrete follow-up

The HTML must not invent fields or hide gaps. Every claim needs a row id, source
URL, or public item id.

## Chat Output

Keep chat short:

- scope and sources
- source keys run and counts
- artifact paths
- strongest supported finding
- biggest gap
- next action
