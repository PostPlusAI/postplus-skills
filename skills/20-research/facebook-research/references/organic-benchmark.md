# Organic Benchmark

Use for competitor organic examples, hooks, formats, topics, offers, and
public post patterns.

## Align

Likely user needs:

- "What content patterns are competitors using?"
- "Which hooks or offers show up repeatedly?"
- "What should we post next?"
- "Which examples are worth saving?"

Ask only if the benchmark set is unclear:

`Which 2-5 public pages, groups, or posts should define the benchmark?`

If the user asks for paid ad examples, say the ads library is not on the
current public surface and stop that lane.

## Run

| Source | Source key | Input |
| --- | --- | --- |
| Competitor page/profile posts | `facebook-profile-posts` | `1-5` page/profile URLs, up to `10` posts each |
| Public group posts | `facebook-group-posts` | `1-3` public group URLs, up to `10` posts each |
| Specific posts | `facebook-post-by-url` | `1-10` post URLs |

Run independent competitors in parallel. Keep page/profile, group, and
direct-post lanes separate in the JSON and HTML.

## Analyze

Extract:

- hook/opening line
- topic/category
- format: image, video, link, text, offer
- CTA or ask
- visible engagement fields
- repeated angle or promise
- source URL

Do not infer causality. Rank examples only inside the collected sample.

## Output

Create `result.json` and `evidence.html`.

Chat format:

- benchmark set and sample size
- top patterns
- strongest examples with source links
- content opportunities
- gaps and caveats
- artifact paths

## Stop

Stop for backend performance, exact reach, conversion, paid delivery, hidden
targeting, share of voice, or full competitor history.
