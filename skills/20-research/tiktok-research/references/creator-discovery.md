# TikTok Creator Discovery

Use when the user wants TikTok creators, UGC makers, affiliates, KOL/KOC lists,
profile enrichment, or outreach-ready creator shortlists from public TikTok
evidence.

Apply `shared-contract.md` for public surface, collection key semantics, bounds,
evidence labeling, and output discipline.

## User Jobs

- Discover creators, UGC makers, KOLs, KOCs, affiliates, or niche accounts from
  a public content seed.
- Rank creators for collaboration, seeding, affiliate, or outreach fit.
- Enrich known handles or candidates with public profile facts and content
  evidence.
- Separate creator recall from ranking constraints such as follower band,
  region, language, format, or audience.
- Build a shortlist that can be handed to outreach without claiming hidden
  contact access.

## Alignment

Separate recall seeds from ranking constraints. Niche, hashtag, competitor,
product, audience, profile, or video can recall candidates. Region, language,
follower band, creator type, and budget usually rank candidates after recall.

Ask only when the user gives ranking constraints without a recall seed.

Use this question when needed:

`Those constraints can help rank candidates; what should I use as the recall seed: niche, hashtag, competitor, product, audience, profile, or video?`

## Inputs

Minimum: TikTok is clear and one discovery seed exists:

- niche/category/product/customer type
- hashtag or query
- brand, competitor, creator, or profile
- public video URL
- existing candidate handles

Ask once only when needed:

| Situation | Ask |
| --- | --- |
| Platform missing | `Which platform should I use first?` |
| TikTok clear but no seed | `Give one TikTok niche, product, hashtag, competitor, customer type, video URL, or collaboration goal.` |
| Only region/language/follower band/type | `That can rank candidates, but it cannot recall them. Give one content or account seed too.` |
| Too many creators requested | `Which first batch should I use: seed group, market, language, follower band, hashtag set, or batch size?` |

## Run

Prefer content-first discovery:

| Seed | Recall | Enrich |
| --- | --- | --- |
| Niche, category, customer, or query | `tiktok-videos` | extract authors, then `tiktok-profiles` |
| Hashtag | `tiktok-videos` | profile authors |
| Strong seed video | `tiktok-related-videos` | profile authors |
| Known handles | none | `tiktok-profiles` |
| Names-only account lookup | `tiktok-users` | optional `tiktok-profiles` after handles are confirmed |

Bounds: collect enough videos to identify candidates, then enrich `10-30`
profiles. Related expansion only after strong seed videos.

Run profile enrichments in parallel only after candidate handles are known. Do
not parallel content recall -> author extraction -> profile enrichment as if the
handles already exist.

## Route-Specific Evidence

- Creator ranking needs content evidence plus profile facts when possible.
- `tiktok-users` is account recall, not creator fit proof.
- Follower band, region, language, and format preference are ranking constraints
  unless schema supports them as filters.
- Public profile facts do not prove authenticity, audience quality, willingness,
  deliverability, or private contact access.

## Stop

Stop for all creators, full market coverage, hidden contacts, private followers,
audience demographics, affiliate performance, GMV, conversion, Shop/LIVE
metrics, or impossible filters. If recall is weak, ask for a stronger seed.

## Output Focus

Return the decision supported, seed path, collection path, shortlisted creators,
evidence video/profile links, fit reason, caution, missing evidence, and next
action.

## HTML Artifact Focus

Make the HTML useful as a creator shortlist workspace:

- creator table with handle, source seed, fit reason, evidence URL, caution,
  and missing evidence
- grouped sections for recalled candidates and verified profiles
- ranking constraints shown separately from recall seeds
- selected candidates easy to copy into outreach or deeper account audit
