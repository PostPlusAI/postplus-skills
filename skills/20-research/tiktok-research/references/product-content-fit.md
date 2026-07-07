# TikTok Product Content Fit

Use when the user wants to know how a product, offer, or ecommerce category
should show up on TikTok: demos, hooks, objections, buyer language, competitor
proof, or ad/organic angle fit.

Apply `shared-contract.md` for public surface, collection key semantics, bounds,
evidence labeling, and output discipline.

## User Jobs

- Decide whether a product has TikTok-friendly demo, problem, transformation,
  comparison, or impulse-buy angles.
- Find hooks, proof moments, objections, and FAQ for a product page, ad brief,
  or creator seeding brief.
- Compare organic examples, public comments, and paid examples without mixing
  evidence lanes.
- Identify what public TikTok evidence cannot prove about sales, GMV, or ROAS.

## Alignment

Infer whether the user needs product positioning, creative angles, landing-page
copy, ad brief, creator brief, or launch risk. Ask only when the output would
change.

Use this question when needed:

`Should I optimize for creative angles, ad brief, product page copy, creator brief, or launch risk?`

## Inputs

Minimum: product name/category, product URL or description, target customer,
competitor, hashtag/query, brand profile, paid-ad scope, or example videos.

Ask once only when needed:

| Situation | Ask |
| --- | --- |
| Product unclear | `What product, audience, market, or offer should I test against TikTok evidence?` |
| Broad category | `Which product variant or buyer problem should I sample first?` |
| Wants sales proof | `I can assess public content fit, but not GMV, conversion, or ROAS. Should I continue with public evidence?` |

## Run

| Evidence lane | Key | Rule |
| --- | --- | --- |
| Organic demos/examples | `tiktok-videos` | Use product, problem, competitor, or hashtag seeds. |
| Comment objections | `tiktok-comments` | Only after `3-8` source videos exist. |
| Paid creative examples | `tiktok-ads-top` | Paid lane only. |
| Brand/competitor profile context | `tiktok-profiles` | Optional context; not content proof. |

Run independent organic and paid lanes in parallel only when both scopes are
clear and bounded. Collect comments after the video shortlist exists.

## Route-Specific Evidence

- Organic videos support demos, usage scenes, hooks, creator style, and visible
  public engagement fields when returned.
- Comments support objections, FAQ, buyer language, and proof gaps.
- Paid ads support creative claims and CTA patterns, not delivery or ROAS.
- Treat product-market fit as an inference, not a fact.

## Stop

Stop for TikTok Shop GMV, order data, affiliate performance, exact conversion,
private ad metrics, hidden creator contacts, or unsupported product filters.

## Output Focus

Return the decision supported, evidence lanes, product angle map, demo ideas,
buyer objections, paid/organic differences, weak evidence, and next action.

## HTML Artifact Focus

Make the HTML useful as a product evidence board:

- overview with product, audience, market, seeds, lanes, and counts
- angle table with hook, demo/proof moment, evidence links, and confidence
- objection/FAQ section tied to comment rows
- paid and organic examples kept in separate grouped tables
- gaps for missing sales, Shop, ROAS, or backend evidence
