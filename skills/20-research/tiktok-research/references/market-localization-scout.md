# TikTok Market Localization Scout

Use when the user wants to compare TikTok public evidence across markets,
regions, languages, or buyer contexts for cross-border marketing or ecommerce
localization.

Apply `shared-contract.md` for public surface, collection key semantics, bounds,
evidence labeling, and output discipline.

## User Jobs

- Compare how a category, product, problem, or competitor is framed in different
  markets or languages.
- Find local hooks, usage scenes, creator styles, objections, and offer cues.
- Decide which market should get the first content test or deeper research.
- Avoid pretending samples prove market size, sales, or audience demographics.

## Alignment

Infer whether the user needs market comparison, language adaptation, content
angle localization, creator style, or launch priority. Ask only when the output
would change.

Use this question when needed:

`Should I compare markets for content angles, language adaptation, creator style, objections, or launch priority?`

## Inputs

Minimum: product/category/topic plus one market/language, or `2-4`
markets/languages to compare.

Ask once only when needed:

| Situation | Ask |
| --- | --- |
| No market/language | `Which market or language should I compare first?` |
| Too many markets | `Which 2-4 markets or languages should define the first pass?` |
| Needs sales proof | `I can compare public content evidence, not sales, GMV, or conversion. Should I continue?` |

## Run

| Source | Key | Rule |
| --- | --- | --- |
| Market/category query | `tiktok-videos` | One bounded request per market/language seed. |
| Competitor/profile in market | `tiktok-videos` or `tiktok-profiles` | Profile context plus content sample when needed. |
| Comment language | `tiktok-comments` | Only after local video shortlist exists. |
| Paid local examples | `tiktok-ads-top` | Paid lane only when scope is clear. |

If schema supports region/language fields, use them. If not, encode market in
the query and label it as query-scoped recall. Run independent market samples in
parallel with separate output files.

## Route-Specific Evidence

- Compare only fields returned in each market sample.
- Do not force metric parity when one market has weaker or noisier evidence.
- Region/language constraints are request filters only when schema supports
  them; otherwise they are query terms.
- Public samples do not prove market size, purchase power, or conversion.

## Stop

Stop for exact market demand, demographic truth, GMV, TikTok Shop rank, ad
account metrics, or unsupported region/language filters. Report the gap and
recommend a narrower market or supplied dataset.

## Output Focus

Return markets compared, seeds, sample counts, local hooks, usage scenes,
objections, creator styles, paid/organic differences when collected, gaps, and
next action.

## HTML Artifact Focus

Make the HTML easy to compare by market:

- market tabs or grouped sections with seeds, counts, and evidence quality
- comparison table for hook, demo, offer, objection, creator style, and source
  URLs
- evidence cards grouped by market and lane
- gaps where a market lacks comparable evidence
