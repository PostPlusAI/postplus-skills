# Diagnose, repair and verify technical search problems

Use actual response headers, rendered content, source implementation and Search
Console evidence where available. Record the affected URLs and observation time.
An empty Search Analytics result does not establish an indexing defect; inspect
the URL separately through Measurement. Inspection may reflect an earlier crawl.
Prioritize a blocked valuable page, wrong destination or missing usable content
before cosmetic metadata changes.

## Common repair procedures

| Confirmed condition | Repair within the authorized editing surface | Acceptance and recovery |
| --- | --- | --- |
| Sitemap emits deleted, redirected or deliberately excluded URLs | Fix the site's existing route/content filter and regenerate the sitemap; preserve intended locale and canonical rules | Parse the generated XML, verify affected URLs and representative unchanged routes. Revert the filter patch if valid routes disappear. Submission requires the actual supported action and authorization. |
| A broken internal link points to an identifiable current page | Correct the owning content/template link to the verified destination | Check response, final destination and rendered link; check other uses of the template. Preserve the prior link in the patch. Do not invent a redirect or new destination from a guessed slug. |
| Canonical points to the wrong product, language or hostname | Establish the intended primary URL and inspect shared template logic before correcting that specific rule | Inspect rendered HTML/headers and representative related pages. Compare with sitemap and actual redirects; check GSC later. A self-canonical on every URL is not a universal repair. |
| An indexable product page accidentally emits noindex or is blocked | Confirm the intended indexing policy and whether the rule is deliberate, then prepare its exact removal/change | Check effective robots rules, headers and rendered metadata. Keep private, test and campaign-only exclusions. Apply an indexing-policy change only under authorization; do not globally remove restrictions. |
| Important product content is absent from the fetched/rendered page | Repair the existing rendering/data path so the intended public text is available, using the site's framework | Build and inspect the actual route, loading/error states and relevant locales. Preserve authentication boundaries; do not expose private data for crawling. |
| Metadata or structured facts contradict the approved page facts | Fix the existing metadata/data owner, preserving current supported markup | Inspect final HTML and parse JSON-LD; compare price, availability and identifiers with visible content. Validate applicable supported search features separately. Revert the specific source patch if incorrect. |

Before editing, identify the page implementation and baseline. Use existing
framework routes, content data and tests. A requested local fix includes making
the patch and running proportionate build/render/link checks. Do not add a new
SEO service or parallel content store to repair one template.

Without an authorized editor, provide the exact affected URL, current evidence,
replacement patch or rule, and acceptance steps. MCP does not imply filesystem,
shell, browser or website publication access. Use only surfaces actually offered
by the host; preserve prepared/applied/verified as distinct results.

## Verify the intended outcome

Check local correctness first, then an approved preview or deployed response
when available. Publication and Google recrawling are separate steps. Record
the deployment scope, inspect the exact URLs later and compare mature search
windows; a successful build cannot prove indexing or a ranking improvement.
Do not generate traffic or submit real forms merely to make a check pass.

Keep language/region, redirects, sitemap, canonical and visible content
consistent. Read Google's current requirements when a requested feature depends
on them: [Search Essentials](https://developers.google.com/search/docs/essentials),
[canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
and [structured data support](https://developers.google.com/search/docs/appearance/structured-data/search-gallery).
Valid Schema.org syntax alone does not establish Google feature eligibility.
