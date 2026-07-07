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
