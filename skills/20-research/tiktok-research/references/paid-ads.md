# TikTok Paid Ads

Use when the user wants TikTok paid ad examples, hooks, CTAs, offers, creative
angles, regions/objectives when public fields allow, or paid-vs-organic creative
comparison.

Apply `shared-contract.md` for public surface, collection key semantics, bounds,
evidence labeling, and output discipline.

## User Jobs

- Find public paid TikTok ad examples for a category, competitor, region,
  language, objective, keyword, hook, or offer.
- Compare paid creative language with organic TikTok examples while keeping
  evidence lanes separate.
- Turn paid examples into a creative brief, hook list, offer map, or CTA review.
- Identify which paid metrics or filters are absent from the public sample
  instead of inventing them.

## Alignment

Infer whether the user needs ad examples, competitor paid messaging, hook/CTA
patterns, offer analysis, region/objective comparison, or paid-vs-organic
synthesis. Ask only when the output would change.

Use this question when needed:

`Should I organize the paid examples by hook, offer, CTA, competitor, region/language, or objective?`

## Inputs

Minimum: category, competitor, brand, product, keyword, region/language,
objective, creative angle, or ad sample goal.

Ask once only when needed:

| Situation | Ask |
| --- | --- |
| No paid scope | `What paid scope should I sample: category, competitor, region/language, objective, hook, offer, or keyword?` |
| Paid vs organic requested but one lane lacks seed | `What seed should I use for the missing lane?` |
| Backend metric request | `I can sample public ad examples, but not spend, targeting, ROAS, billing, or conversion. Should I continue with public creative evidence?` |

## Run

Use `tiktok-ads-top` for the paid lane. Keep organic evidence separate through
`organic-benchmark.md` when the user asks for paid-vs-organic.

Build a narrow first-pass request around the category, country/region,
language, objective, competitor, keyword, hook, offer, or product scope when the
schema supports those fields.

Bounds: one clear paid scope, usually `10-30` ads when schema allows.

Run paid and organic lanes in parallel only when both scopes are clear and the
outputs remain separate. Do not replace failed paid collection with organic
content.

## Route-Specific Evidence

- Paid examples are public creative evidence, not delivery proof.
- Visible paid fields can support advertiser, creative, hook, offer, CTA,
  region/language, objective, duration, and metric statements only when present.
- Do not infer exact targeting, spend, ROAS, clicks, conversions, billing, or
  private account performance.
- Paid and organic lanes stay separate; shared patterns must be labeled as
  synthesis, not direct proof.

## Stop

Stop for exact spend, targeting, ROAS, clicks, conversions, billing, ad account
access, private audience, or unsupported filters. Do not use organic content as
paid evidence.

## Output Focus

Return the decision supported, paid scope, ad count, examples, hooks, CTAs,
offers, creative patterns, visible metadata, absent metrics, limits, and next
action.

## HTML Artifact Focus

Make the HTML useful as a paid creative evidence board:

- ad table with advertiser/brand, URL or id, hook, offer, CTA, objective,
  region/language, and visible metrics when present
- grouped sections for hook, offer, CTA, competitor, objective, and region
- paid-vs-organic comparison only when both lanes were collected and labeled
- unsupported spend, targeting, ROAS, billing, or conversion requests kept as
  visible gaps
