# Partner Discovery

Use for partner, creator, affiliate, community, local-business, or organizer
shortlist work: broad public discovery plus page verification and enrichment.

## Align

Likely user needs:

- "Who should we partner with?"
- "Which pages or communities are relevant?"
- "Which organizers or local businesses fit this campaign?"
- "Can you turn this shortlist into prioritized leads?"

Ask only if there are no usable seeds:

`Give a niche or keyword to search, or 3-10 public pages, groups, or competitors to verify.`

## Run

Discover, then verify:

| Step | Collection key | First pass |
| --- | --- | --- |
| Broad public discovery from a query | `facebook-search` | 1 query, small result bound |
| Page identity, category, activity, content fit | `facebook-pages` | `1-5` page URLs |

Run discovery first, then verify the returned page URLs. Verify independent
leads in parallel. Do not scrape members or private contacts.

## Read Fields

Use the fields present in the result: search result title and URL, page name,
category, description, activity signal, and any visible website, contact, or CTA
field. Do not invent fields the result does not contain.

## Score

Score from public evidence:

- topical fit
- audience and context fit
- recent activity
- collaboration relevance
- visible website, contact, or CTA when present
- disqualifiers: stale, private, spammy, off-topic, or no source

## Output

Create `result.json` and `evidence.html`. Show a ranked shortlist with source
rows, score reasons, disqualifiers, visible contact/CTA status, and next step.

Chat format:

- criteria and seed count
- top leads and why each fits
- disqualifiers and gaps
- artifact paths
- next outreach action

## Stop

Stop for member scraping, hidden contact extraction, private profiles, login
automation, exact audience targeting, or guaranteed contact availability.
