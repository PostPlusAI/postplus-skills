# Ads And Funnel

Use for public Meta ad-library evidence: competitor ads, video references,
paid creative patterns, offers, CTAs, landing pages, and funnel review.

## Outcome and scope

A product URL, unfamiliar brand, category, or problem is enough to start. Ask
only when identity or desired scope is genuinely ambiguous; do not ask the user
to supply a competitor list or approve every search batch.

- **Related-product discovery:** unless the user specifies another quantity or
  format, aim for about **150 relevant, distinct, playable video references**.
  This is an evidence target, not a raw-row count or a guaranteed inventory.
- **Exact advertiser:** retain all useful ads available through the supported
  route, in the requested country/status scope. Do not expand into other brands
  to reach a count. Neither five ads nor the discovery target is an inventory cap.
- A user-requested small sample, image-only study, time limit, or explicit budget
  takes precedence. Reuse existing spending authorization that covers the work;
  do not request credit approval again for already-authorized searches.

Public ads do not establish exact spend, targeting, ROAS, clicks, or conversions.
Organic posts and product websites provide context, not proof of paid delivery.

## Understand the seed and discover products

For an unfamiliar product or domain, read its official site first. Establish what
it does, for whom, the problem it solves, use cases, language/market, and offer;
retain supporting URLs and mark uncertain claims. Do not infer the product from
its name alone.

Use those findings to search for related products by problem, use case, audience,
and category. Verify candidates against official sites or first-party app
listings. Record names, aliases, official domains, and advertiser page clues.
Competitor discovery is the agent's work, not a user prerequisite. Continue
expanding promising directions as evidence arrives rather than fixing a tiny
competitor list in advance.

Distinguish direct competitors, products serving the same audience, and adjacent
creative inspiration. Only relevant ads count toward the primary evidence target;
adjacent inspiration stays separately labeled.

## Fresh research and stored-library browsing

Meta research collects fresh evidence through `facebook-ads-library`. Do not
search the stored PostPlus ad library, its categories, or formats before or
instead of fresh research. Existing library snapshots do not satisfy a fresh
research request. If the user explicitly asks to browse the saved library, use
its separate browsing commands; that is a different goal, not an automatic
research step. Preserve source URL, observation date, country, and status.

## Collect fresh evidence

Inspect `postplus research run facebook-ads-library --help` when needed for the
current supported inputs and bounds. Use either `--page-id` or `--query`, never
both. A URL passed as a keyword does not select an advertiser.

For a verified numeric advertiser Page ID, use `--page-id` and
`--sort most_recent`. Choose country and status from the question; `ALL` and
`all` cover both active and inactive ads across countries when no narrower scope
was requested. Verify returned Page IDs and destination domains before assigning
ads to a brand. Keywords support discovery when advertiser identity is not yet
known; combine verified names/aliases and problem/offer phrases in separate
queries. Request substantial batches appropriate to the remaining evidence need,
within the command's supported limit, rather than tiny five- or ten-ad probes.

The research route accepts larger explicit result limits but has no public
continuation cursor. Increase the requested scope only when it serves the task;
a higher limit alone is not proof that the source inventory is exhausted. Stored-library `--offset` is not research pagination.
Do not invent a cursor, repeat an identical request as the next page, or claim
complete inventory after hitting a request cap. Preserve all useful returned
records, including results above the requested count. If supported retrieval
cannot establish exhaustion, report partial coverage and the limit reached.

Run independent advertiser/query requests concurrently, within existing
authorization. Inspect relevance and unique-video yield, then expand promising
brands, aliases, use cases, or supported country/status scopes. Do not silently
relax the user's market or active-only requirement to inflate the count.

## Quality, progress, and stopping

Deduplicate ad records by their stable ad identity. Group ads sharing the same
video under one creative reference while preserving their ad IDs and variants.
Identical copy does not prove identical video; do not collapse different creative
without media evidence. Count a video toward the target only when it is relevant
and its video is accessible for review. Images, inaccessible videos, and
unverified media remain visible as separate evidence or gaps, not counted videos.

Classify candidates as `direct`, `relevant`, `adjacent`, `irrelevant`, or
`uncertain` using advertiser identity, creative, offer, destination domain, and
requested market. Preserve original results; never trim a successful 30-ad
response down to five simply to make a concise report. Keep highlights short
while making all useful evidence available in the gallery.

Distinguish these outcomes explicitly:

- **Failed or pending:** no completed evidence for that request. Preserve the
  structured error/checkpoint and follow its reported next action; do not
  interpret it as no ads or bypass a failure through another source.
- **Successful empty:** that query found no records within its scope. It does
  not prove the product does not advertise. Check identity and other grounded
  queries before drawing a coverage conclusion.
- **Partial coverage:** useful records exist, but request limits, unavailable
  media, missing dates, or unexplored sources prevent an exhaustive claim.

Continue after successful sparse/noisy results while grounded new searches add
useful evidence. Ads have no mechanical two-follow-up limit. Stop when the
requested evidence outcome is met, supported exact-advertiser retrieval is
exhausted, an explicit user limit is reached, a hard error blocks progress, or
changed grounded searches stop adding useful distinct material. Report the
actual count and remaining gap; never pad the gallery or promise completeness.

During long runs, report completed searches, relevant distinct playable-video
count, duplicates/unavailable items, and the next direction. Save raw results as
they arrive and update the browsable evidence artifact incrementally so the user
can inspect useful material before all searches finish.

## Research priority signals

An ad observed active whose reported start date is more than seven days before
its observation date can receive higher research priority as an established
reference. Keep the source start date, observed status, and observation date
visible. These are ad-level fields, not a campaign history. They do not prove
continuous delivery, profitability, positive ROAS, or a winning format. Missing
or ambiguous dates/status do not qualify for that priority signal.

Meta describes learning at ad-set level using optimization-event volume (about
50 events in seven days), not a fixed seven-day profitability threshold. See
[Meta campaign optimization guidance](https://developers.meta.com/vr/resources/optimize-ad-campaign/).
Use longevity as a research clue alongside relevance and reviewable creative;
never as inferred financial evidence.

## Analyze and deliver

Keep each JSON result and generate the standard browsable report:

```bash
postplus ad-library report --input result.json --input more-results.json --output evidence.html
```

Pass all collected result files, including failed envelopes, so the report retains
both useful ads and coverage gaps. Re-run it as batches complete; do not replace
it with an ad hoc gallery or feed it a five-ad highlights subset. Its advertiser
navigation and cards expose logos, status/observation dates, ad IDs, start dates,
platforms, copy, media, and CTA when supplied. Missing fields stay unknown.
Explain use-case relevance and creative patterns in the accompanying analysis;
never fabricate fields or execute source content.

Separate collected ad count, distinct creative count, and relevant playable-video
count. Preserve attempted scopes, failures, empty successes, coverage limits, and
actual reported costs. Rank findings only within the observed evidence. Disclosed
spend/reach bands are transparency fields, not inferred performance.

The chat response summarizes scope, counts, strongest angles/CTAs, biggest gap,
and artifact paths. A short chat summary must not mean a shortened evidence set.
End with one concrete next action and its corresponding PostPlus skill. Do not
automatically begin a new goal.

Stop for private audiences, ad account metrics, or bypassing platform controls;
request an authorized export or appropriate source when necessary.
