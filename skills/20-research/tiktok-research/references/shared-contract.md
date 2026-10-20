# TikTok Shared Contract

## Complete the research

Use the user's decision as the completion criterion. For broad content or
competitor discovery, aim for roughly **100–150 relevant distinct reviewable
items**; for creator discovery, roughly **20–30 evidence-backed creators**.
These are adjustable research goals, not request limits or guaranteed inventory.
A narrow account audit, exact URLs, explicit small sample, time limit, or budget
wins. Do not broaden an exact-object request to fill a quota.

Start with grounded product, problem, use-case, competitor, and hashtag
queries. Inspect completed results; expand promising authors, brands, phrases,
and tags rather than fixing a tiny seed list. Continue successful sparse/noisy
searches while grounded changed searches add useful evidence. Do not hand the
research back to the user after a small first pass or two follow-ups.

Stop when the requested outcome is met, an explicit limit is reached, grounded
new directions cease adding useful distinct material, or a hard execution error
blocks progress. Report actual coverage and the gap, not invented completeness.
Do not repeat identical requests as pagination or bypass a failed/pending run.
Preserve completed evidence when a later batch fails. Follow the returned recovery
action for that operation; a terminal failure does not prohibit a separate,
evidence-grounded research direction. Do not claim that all directions are
exhausted because one batch failed.
Reuse existing explicit spending authorization that covers the work; do not ask
for approval again for already-authorized batches.

## Platform details and quantities

- `tiktok-videos --query "portable espresso review"` finds content;
  `--handle example` collects an account's videos. Use `tiktok-profiles` for
  profile facts, not as a substitute for account video collection.
- Optional `--sort relevant|liked|latest` and
  `--time-range all|day|week|month|3months|6months` apply only to query search.
  Use them for explicit recency/ranking needs, not by default; these filters
  can add collection cost. Check returned dates before claiming date coverage.
- `--country` selects collection proxy location, not creator nationality,
  viewer geography, or a guaranteed local audience. Language and market clues
  require content evidence; audience demographics stay unknown.
- Video limits apply per query/profile/hashtag, not globally. Comments use a
  per-post total limit including replies; `--include-replies true` requests at
  most five replies per top-level comment, false requests none.
- Paid `tiktok-ads-top` accepts a quantity, not category/brand/region filters.
  Keep paid examples separate; do not promise targeted paid search. Shop, LIVE,
  hidden contacts, sales, conversion, retention, and private metrics are outside
  this surface.

A request limit is not a global research cap. Plan multi-seed requests using the
route's per-seed semantics; report requested scopes, raw rows, distinct items,
relevant items, and actual CLI-reported costs separately. Never estimate actual
spend from row count alone. Preserve results above a requested count.

## Evidence and progress

Keep original JSON, source URLs, observation dates, batch statuses, and reported
costs. Deduplicate by platform identity/canonical URL, retaining all search
sources. Missing metrics are unknown, not zero. Separate direct/relevant,
adjacent, irrelevant, and uncertain material; only relevant usable items count
toward the primary target. Keep useful non-video formats in their own category.

Initial filtering can use captions, returned fields, and profiles. Claims about
visual openings, shots, sound, and proof moments require `media-analysis` on
selected media; captions alone cannot establish them. Audience pain points need
actual comments, not captions or engagement counts. An unavailable video or
missing comment set is a recorded gap. Public samples do not establish sales,
causality, audience demographics, or platform-wide rankings.

During longer work, report completed scope, relevant distinct counts,
duplicates/missing media, and the next evidence gap. Save and update artifacts
incrementally. A short chat summary must not truncate the underlying evidence.

## Fixed report and user corrections

Generate the standard report from every supported content/profile/comment result
file, including failed, empty, and pending envelopes; never hand-build a random
HTML gallery. Paid `tiktok-ads-top` results remain separate raw evidence; do not pass
that unsupported route to the report.

```bash
postplus research report --input batch-01.json --input batch-02.json --output research.html
postplus research report --analysis-schema
```

The first report exposes stable evidence IDs; the schema defines analysis input.
Use those IDs and the returned schema to write `findings.json`, then regenerate:

```bash
postplus research report --input batch-01.json --input batch-02.json --analysis findings.json --output research.html
```

Raw evidence must remain browsable without analysis. Normal research delivery
adds relevance, recommendation reasons, criterion judgments, and source
references using the supported schema. Never invent fields or reference IDs.
Keep all useful evidence, with a concise recommended selection. Rebuild as new
batches arrive. For a user's chat correction, reuse IDs and prior evidence,
revise the relevant criteria/selection, and collect only the missing evidence.
Do not imply the static page automatically saves user feedback.

For comment browsing, include both the source video batches and their comment
batches with repeated `--input`. If the source video is missing, use
`postplus research run tiktok-videos --url "<original-video-url>" --wait --output source-video.json` through the
normal quoted collection flow. The report displays saved comments and replies;
opening a detail does not fetch more. An uncollected comment set is not zero
comments. Keep creator profile and representative-work batches together when
delivering a creator shortlist.

## Deliver and continue appropriately

Deliver scope, actual counts, key findings, unknowns, reported cost, and artifact
paths. Include criterion evidence for recommendations. Complete requested
analysis/brief/script work using the relevant downstream skill; do not stop at
search when the original request includes that work.

Reuse saved evidence and completed analyses. Read only the downstream skill
needed for the current decision:

- `media-analysis`: selected original URLs plus the precise visual/audio question.
- `reddit-search`: product/problem hypotheses and existing evidence when long-form
  discussion is requested or needed by the original research scope.
- `benchmark-to-brief`: product facts, patterns, source references, and uncertainties.
- `reference-decode`: selected references and existing media analysis for reusable
  structure; then the requested creative skill when scripts are in scope.
- Creator/account audit: shortlisted handles, content evidence, explicit criteria,
  and unresolved conditions. Contacting creators requires explicit authorization.

At the end, offer **one concrete next action with its corresponding PostPlus
skill**. Do not offer a menu or automatically begin a new goal. For example,
“Analyze the three selected review videos' openings with `media-analysis`.”
