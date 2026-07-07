# Shops And Marketplace

Use for public Facebook Marketplace listings, local commerce clues, product
pricing, supply and demand signals, and lightweight category research.

## Align

Likely user needs:

- "What products are listed around this category?"
- "What price points show up locally?"
- "Are people selling alternatives?"
- "What local commerce language can inform positioning?"

Ask only if no marketplace seed exists:

`Send a Marketplace search or category URL, or give the product and location to turn into one.`

## Run

| Evidence need | Collection key | First pass |
| --- | --- | --- |
| Listings by search or category | `facebook-marketplace` | 1 search/category URL, up to `10` listings |

Do not use marketplace listings as a proxy for complete sales volume.

## Read Fields

Use the fields present in the result: listing URL, title, price, location,
listing status (live, sold, pending), delivery or pickup clue, primary photo,
category, and seller display field. Do not invent fields the result does not
contain.

## Analyze

Extract:

- product and category clusters
- visible price bands
- location pattern
- listing status mix
- delivery or pickup clues
- positioning language from listing titles

## Output

Create `result.json` and `evidence.html`. Show listing cards with title, price,
status, location, photo when available, and source link.

Chat format:

- marketplace URL and listing count
- price and category patterns
- local demand clues
- unreliable or unsupported claims
- artifact paths

## Stop

Stop for private seller data, messaging sellers, purchase automation, hidden
inventory, exact sales volume, or off-platform personal data enrichment.
