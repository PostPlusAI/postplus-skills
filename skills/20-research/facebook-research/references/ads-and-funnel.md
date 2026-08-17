# Ads And Funnel

Use for public Facebook ad-library evidence: active ad examples, paid creative
patterns, competitor offers, CTA patterns, landing-page clues, and funnel review.

## Align

Likely user needs:

- "What ads are competitors running?"
- "What offers and CTAs show up?"
- "What landing pages do ads point to?"
- "What paid angles should we test?"

Ask only if no paid seed exists:

`Which brand, page, keyword, or ad-library link should anchor the first pass?`

If the user asks for exact spend, targeting, ROAS, clicks, or conversions, say
this route only supports public ad and funnel evidence.

## Run

| Evidence need | Collection key | First pass |
| --- | --- | --- |
| Ads by keyword or advertiser | `facebook-ads-library` | 1 keyword or advertiser page, up to `10` ads |

Keep ads, landing pages, organic posts, and supplied exports as separate
evidence lanes. Organic posts add context but never prove paid delivery.

### Seed discovery before collection

When the user supplies an exact brand, advertiser page, domain, or ad-library
URL, use that entity directly. When the user supplies only a category, problem,
or product type, do not assume one literal category query is enough:

1. Use a small current public-web discovery pass to identify `3-8` concrete
   products or brands in scope. Prefer official product sites and first-party
   App Store or Google Play listings when they exist.
2. Record each candidate's product name, brand, official domain, known page name
   or URL, aliases, market, and offer wording. This is entity discovery, not
   Facebook ad evidence.
3. Build separate attributable lanes:
   - up to two category/problem phrases for recall;
   - one query per verified product or brand;
   - advertiser page or ad-library URLs when verified; and
   - offer or landing-domain wording only when the first records justify it.
4. Start with the smallest lanes most likely to answer the decision. Do not run
   every discovered entity automatically or silently multiply cost.

## Read Fields

Use the ad-level fields present in the result: ad id and library link, advertiser
page name, active status, run dates, creative text, media, publisher surface,
disclosed country coverage, and landing URL. Treat any disclosed spend or reach
band as a public transparency field only. Do not invent fields the result does
not contain.

## Analyze

Extract:

- repeated offers, hooks, and CTAs
- creative angle and format
- landing-page clue when present
- advertiser and active status
- audience or geography clue from disclosed fields

Rank examples only inside the collected sample. Do not infer causality.

Classify every candidate as `direct`, `relevant`, `adjacent`, `irrelevant`, or
`uncertain` using advertiser identity, creative text, offer, destination domain,
market, and active status. Main findings require direct or relevant ads;
adjacent records may only guide recovery.

If a supported pass is empty or low-quality, apply the shared research-quality
recovery loop. Change one axis at a time: category phrase -> verified entity,
brand -> advertiser page, alias -> official product name, or broad market -> one
specified country/status scope. Inspect landing destinations when present. Stop
after at most two changed passes or when the approved cost bound is reached, and
report the attempted lanes when useful evidence remains unavailable.

## Output

Create `result.json` and `evidence.html`. Group ads by advertiser, offer, CTA,
surface, and landing URL.

Chat format:

- paid seed and country/status filter
- ad count and advertisers
- repeated angles, offers, and CTAs
- landing clues when present
- unsupported metrics
- artifact paths

## Stop

Stop for ad account access, exact targeting, ROAS, billing, conversion, private
audiences, or requests to bypass platform controls.
