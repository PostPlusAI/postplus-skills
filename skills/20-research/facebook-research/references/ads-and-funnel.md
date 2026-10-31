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

## Resolve advertiser identity

For a named brand, use existing discovery and page collection before ad collection:

1. Take Facebook links from the official site when available. If there is no
   direct Facebook link, check the official social profiles linked by that site
   (for example a YouTube About page) for a Facebook link before paying for a
   broad name search. Preserve the official-site → social-profile → Facebook
   link chain and verify the candidate below; a matching name alone is not proof.
   If those first-party links do not resolve identity, search the brand name,
   aliases or former names with `facebook-search`. Its
   `categories` input is a list of free-text search terms, not a taxonomy or a
   brand filter. Search results supply candidate page URLs, not verified identity.
   Prefer a candidate's `pageUrl` or page-specific `url`; a `facebookUrl` that
   names the search page is search provenance, not the candidate page.
2. Read candidate URLs with `facebook-pages`. Preserve returned `pageId` and
   `facebookId` separately from `pageAdLibrary.id`, alongside `pageUrl` and
   `website`. Keep numeric IDs as strings. Do not invent a missing ID from the
   page name or ask the user to find it.
3. Verify the association using sourced first-party evidence, such as the brand's
   official site linking to that Facebook page, or a page website linked to the
   verified product. A matching name or matching returned Page ID alone does not
   verify the brand. Distinguish namesakes, regional pages, former names and
   agency-managed pages; record which pages belong to the requested market and
   why. Destination domains may legitimately be regional, redirected, affiliated
   or agency-managed: investigate the relationship rather than requiring exact
   domain equality or accepting every similar domain.
4. Use the verified `pageAdLibrary.id` as the advertiser ID for ad collection
   when returned. `pageId` or `facebookId` may be profile IDs that differ from
   the ad-library advertiser ID; do not substitute them when they differ. If no
   ad-library ID is returned, use an existing numeric Page ID only with sourced evidence
   associating it with the requested brand.
5. Collect ads by that verified advertiser ID within scope. Compare returned
   advertiser Page IDs with the requested ID; preserve a mismatch as a source
   error and do not attribute those ads to the requested advertiser. A brand
   mention in another advertiser's copy is comparison evidence, not that brand's
   own advertising.

If grounded discovery cannot establish identity, report **identity unresolved**
with the candidates and missing association evidence. Continue other independent
verified sources; do not replace identity verification with a broad keyword ad
collection and label its hits as the brand's ads. Ask for business context only
when it can resolve a real ambiguity, not for internal IDs or permission to continue.

For competitor requests, first establish the seed product and explain each
candidate's competing product, audience and use case. Then use this identity chain.
For category requests, search product/problem/offer terms directly and review
records against that category; no advertiser identity is required to begin.

The CLI uses the same discovery chain. `--category` carries a search term:

```bash
postplus research run facebook-search --category "Example Brand" --category "Example former name" --limit 20 --wait --output candidates.json
postplus research run facebook-pages --url https://www.facebook.com/examplebrand --wait --output pages.json
postplus research run facebook-ads-library --page-id 123456789 --sort most_recent --country ALL --status all --limit 150 --wait --output ads.json
```

Replace the example URL and ID with actual discovered and verified values before
running each dependent step. Choose the user's market/status; search candidates
and returned IDs alone are not proof of brand identity.

## Collect fresh evidence

Inspect `postplus research run facebook-ads-library --help` when needed for the
current supported inputs and bounds. Use either `--page-id` or `--query`, never
both. A URL passed as a keyword does not select an advertiser.

For a verified numeric advertiser Page ID, use `--page-id` and
`--sort most_recent`. Choose country and status from the question; `ALL` and
`all` cover both active and inactive ads across countries when no narrower scope
was requested. Check returned Page IDs against the verified target and assess
destination relationships before assigning ads to a brand. Keyword ads support
category inspiration and comparison discovery; they do not resolve brand identity.
Combine grounded names/aliases and problem/offer phrases in separate queries. Request substantial batches appropriate to the remaining evidence need,
within the command's supported limit, rather than tiny five- or ten-ad probes.

The research route accepts larger explicit result limits but has no public
continuation cursor. Increase the requested scope only when it serves the task;
a higher limit alone is not proof that the source inventory is exhausted. Stored-library `--offset` is not research pagination.
Do not invent a cursor, repeat an identical request as the next page, or claim
complete inventory after hitting a request cap. Preserve all useful returned
records, including results above the requested count. If supported retrieval
cannot establish exhaustion, report partial coverage and the limit reached.

Prepare independent advertiser/query requests from verified inputs, then run
the existing execution calls concurrently within existing authorization. Retain
each original operation; do not invent a batch execution API. Shared auth, balance
or service failures stop new submissions while already submitted sources still
need their results collected. Inspect relevance and unique-video yield, then
expand promising brands, aliases, use cases, or supported country/status scopes. Do not silently
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
- **Identity unresolved:** the brand-to-page association is not verified. This
  is an identity gap, not empty ad inventory.
- **Partial coverage:** useful records exist, but request limits, unavailable
  media, missing dates, or unexplored sources prevent an exhaustive claim.

Continue in the same turn after successful sparse/noisy results while grounded
new searches add useful evidence. A displayed pending gallery does not finish
the task. Follow each original operation and its returned recovery action until
its business outcome is final and its charge is settled, or an explicit
unrecoverable error blocks further progress; report any unresolved cost status.
Do not wait for the user to say "continue" or "are you done?". Ads have no
mechanical two-follow-up limit. Stop when the requested evidence outcome is met, supported exact-advertiser retrieval is
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

Read each saved result's compact summary for source outcomes, advertiser counts
and coverage, then inspect its complete saved `output.items` and actual media for
the requested relevance/creative judgments. The summary is not an item-level
review. Keep reviewed original ad IDs, relevance reasons and observed media scope
in the accompanying analysis. A video field alone is not visual or playback
evidence.

Keep each complete JSON result and generate the standard browsable report:

```bash
postplus ad-library report --input result.json --input more-results.json --output evidence.html
```

Pass all collected result files, including failed envelopes, so the report retains
both useful ads and coverage gaps. Re-run it as batches complete; do not replace
it with an ad hoc gallery or feed it a five-ad highlights subset. Its advertiser
navigation and cards expose logos, status/observation dates, ad IDs, start dates,
platforms, copy, media, and CTA when supplied. Missing fields stay unknown.
The CLI report preserves **all collected** evidence; it does not accept a
reviewed-selection flag or default to only reviewed IDs. Keep the qualified
reference list and its reasons in the accompanying analysis without rewriting
raw JSON or filtering report inputs. Zero relevant ads stays zero in that
analysis while the full evidence remains browsable.
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
