# Facebook Shared Contract

Read this before every route. Keep the run public, small, source-grounded, and
useful to the growth decision.

## Released Source Keys

The released Facebook surface exposes exactly three hosted source keys. Every
collection runs through `postplus research scrape <sourceKey>` as documented in
the skill entrypoint; use `postplus research schema --json` only when
constructing or repairing an unknown request shape.

| Evidence need | Source key | First pass |
| --- | --- | --- |
| Public page/profile recent posts | `facebook-profile-posts` | `1-5` page/profile URLs, small per-source post bound |
| Direct public post evidence | `facebook-post-by-url` | `1-10` post URLs |
| Public group recent posts | `facebook-group-posts` | `1-3` public groups |

Anything outside these three keys is not on the released public surface: page
metadata (followers, category, website, contact fields), a dedicated
reels/video lane, comments, the ads library, events, marketplace, and broad
Facebook search are not supported. When the decision needs one of those
surfaces, say so and stop. Do not improvise another collection path, provider,
or tool.

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

Parallelize independent lanes:

- posts across multiple pages/profiles
- competitor pages
- group posts across multiple groups
- direct posts across multiple post URLs

Do not parallelize dependent work, such as direct-post evidence before the
source post URLs exist.

## Evidence Rules

- Public samples are snapshots, not complete Facebook truth.
- Separate page/profile posts, direct posts, and group posts as distinct
  evidence lanes.
- Engagement fields rank items inside the sample only.
- Group posts are public visible discussion only, not full sentiment.
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
