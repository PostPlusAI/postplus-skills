# Search Console: search visibility and URL evidence

Use for the user's **organic Google search** question. The site property is
part of the query: `sc-domain:example.com` includes subdomains and protocols;
`https://www.example.com/` is an exact URL-prefix property. Select the
intended property from `GOOGLE_SEARCH_CONSOLE_LIST_SITES`, including its
permission level. Do not silently substitute one for the other.

## Compare search performance on the same scope

Use the active `gsc` connection and toolkit `google_search_console`. List
sites with `{}`. For “Which pages lost clicks?”, query two comparable date
windows with the same property, search type, dimensions and freshness choice.
Prepare `gsc-pages.json` from the user's selected dates:

<!-- tool-input: GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY -->
```json
{
  "site_url":"sc-domain:example.com",
  "start_date":"2026-09-14",
  "end_date":"2026-09-20",
  "dimensions":["page","date"],
  "search_type":"web",
  "data_state":"final",
  "row_limit":1000,
  "start_row":0
}
```

```sh
postplus channels tools show GOOGLE_SEARCH_CONSOLE_LIST_SITES --json
postplus channels tools run GOOGLE_SEARCH_CONSOLE_LIST_SITES --connection "$GSC_CONNECTION" --input-file gsc-sites.json --wait --json > gsc-sites-result.json
postplus channels tools show GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY --json
postplus channels tools run GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY --connection "$GSC_CONNECTION" --input-file gsc-pages.json --operation-id "$GSC_REPORT_OPERATION_ID" --wait --json > gsc-pages-result.json
```

The sites request file contains `{}`. In the CLI's `output.result.data`, read
`rows[]`: `keys[]` follow the requested dimension order;
`clicks`, `impressions`, `ctr` and `position` are separate metrics. Preserve
the actual dimensions and search type when labeling a row. Search type `web`
does not include image, video, Discover or Google News traffic. CTR is a rate;
position is an impression-weighted average, not the rank of every query.

Continue with `start_row += <rows actually returned>` while a full page is
returned; use the current schema's row bound and report if coverage is
incomplete. Top-row reporting, privacy treatment and fresh-data delays can
leave legitimate activity unreported. A page absent from search analytics may
simply have no observed impression in the selected window. For recent periods,
inspect the response's `metadata.first_incomplete_date` or hour when present;
do not compare an incomplete day with a complete one without marking it.

For a query-specific or country/device question, change `dimensions` only as
the question requires. A dimension filter must use verified values and the
current `dimension_filter_groups` shape; an invalid or mismatched filter can
produce zero rows without a useful error. Verify the unfiltered scope first
when zero rows would drive a consequential conclusion. Do not add filtered
query rows and call that sum a complete site total.

## Check one URL separately

For “Is this page indexed?”, first confirm the fully qualified page URL lies
under the selected site property. Prepare `gsc-inspect.json`:

<!-- tool-input: GOOGLE_SEARCH_CONSOLE_INSPECT_URL -->
```json
{
  "site_url":"https://www.example.com/",
  "inspection_url":"https://www.example.com/product"
}
```

```sh
postplus channels tools show GOOGLE_SEARCH_CONSOLE_INSPECT_URL --json
postplus channels tools run GOOGLE_SEARCH_CONSOLE_INSPECT_URL --connection "$GSC_CONNECTION" --input-file gsc-inspect.json --operation-id "$GSC_INSPECT_OPERATION_ID" --wait --json > gsc-inspect-result.json
```

In `output.result.data`, read `inspectionResult.indexStatusResult`: `verdict`,
`coverageState`, fetch and indexing states, last crawl time, declared and
Google-selected canonical URLs. Keep each field's wording instead of reducing
the result to a guessed binary “indexed” value. Inspection may lag actual
changes. A Search Analytics row and an inspection verdict are different
evidence; neither can replace the other. Do not automatically request
indexing, change robots rules, or edit the site from a read-only diagnosis.
