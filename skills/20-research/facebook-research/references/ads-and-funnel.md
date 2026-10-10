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

## Stored discovery first

For competitor discovery or visual-format examples, search the public PostPlus
library before starting fresh collection. These reads require no login or credits:

```bash
postplus ad-library categories --json
postplus ad-library formats --json
postplus ad-library search --query "AI meeting" --limit 10 --output result.json
```

Use returned slugs for `--brand`, `--category`, `--subcategory`, and
`--visual-format`. Add `--product-type software|hardware` or
`--status active|inactive|unknown` when relevant. One value per filter; different
filters combine with AND. Follow `nextOffset` with `--offset` only when needed.

These are stored snapshots, not a fresh Meta check. Cite `source_url`,
`observed_at`, country, and status together. Empty coverage does not prove the
brand has no ads. Read format `description` and `how_to_apply`; distinguish
its general guidance from ad-specific format evidence. Do not infer that an
unclassified ad lacks a format or that a visual format proves performance.

Create a compact HTML gallery from the JSON, grouped by brand and visual format,
with media, copy, evidence, source links, and observation dates. Escape all
source text and use supplied media URLs only; do not execute ad content.

If snapshots answer the question, stop. For an explicitly fresh/current research
request or an uncovered scope requiring collection, use the bounded hosted route
below under the user's existing credit authorization. Never silently replace a
failed library request with paid collection.

## Run

| Evidence need | Route | First pass |
| --- | --- | --- |
| Recent ads from an exact advertiser Page | `facebook-ads-library --page-id <numeric ID> --sort most_recent` | 1 verified Page, up to `5` ads |
| Fresh ads by keyword | `facebook-ads-library` | 1 brand keyword, up to `10` ads |

Keep ads, landing pages, organic posts, and supplied exports as separate
evidence lanes. Organic posts add context but never prove paid delivery.

### Seed discovery before collection

When the user supplies an exact brand, advertiser page, domain, or ad-library
URL, retain it as identity evidence. For an exact numeric advertiser Page ID, use
`--page-id` with `--sort most_recent --country ALL --status all --limit 5`.
Use either `--page-id` or `--query`, never both. `--query` remains a keyword
search; passing a URL as a query does not select that advertiser. Verify returned
Page IDs, dates, and destination domains before attributing ads to the brand.
The exact-Page path enforces a small provider charge ceiling and stops if the
current pricing model cannot honor it; do not bypass that failure. Providers may
return a batch larger than the requested sample, so select at most the requested
number after identity checks and deduplication, ordered by actual ad start date.
Missing dates or partial results cannot prove a complete latest-ad inventory.
When the user supplies only a category, problem,
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
   - verified advertiser page or ad-library URLs as attribution evidence; and
   - offer or landing-domain wording only when the first records justify it.
4. Start with the smallest lanes most likely to answer the decision. Do not run
   every discovered entity automatically or silently multiply credit use.

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
brand -> verified official name, alias -> official product name, or broad market -> one
specified country/status scope. Inspect landing destinations when present. Stop
after at most two changed passes or when the approved PostPlus credit bound is reached, and
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
