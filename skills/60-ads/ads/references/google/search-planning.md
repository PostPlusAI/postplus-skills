# Google search planning and evidence

Read [channel execution](../channel-execution.md) for this entry point.

Read the current tool schema before preparing each request. Keyword discovery
uses `GOOGLEADS_GENERATE_KEYWORD_IDEAS`; historical volume, competition and bid
metrics use `GOOGLEADS_GENERATE_KEYWORD_HISTORICAL_METRICS`; hypothetical clicks,
cost and conversions use `GOOGLEADS_GENERATE_KEYWORD_FORECAST_METRICS`.
Resolve one seed form, language, geography, network and forecast dates. Continue
returned page tokens within the same scope. Planning does not create an ad;
forecasts are estimates rather than promised traffic or revenue. Use
`GOOGLEADS_SEARCH_GOOGLE_ADS_FIELDS` to check current field compatibility when
constructing a report, rather than guessing fields from an older API version.


## Find the advertising customer

The connection is the PostPlus identity; `customer_id` is the Google account.
Use a canonical 10-digit customer ID without hyphens in requests and target
flags. Do not substitute a manager account for a child advertising account.

```sh
postplus channels tools show GOOGLEADS_LIST_ACCESSIBLE_CUSTOMERS --json
postplus channels tools run GOOGLEADS_LIST_ACCESSIBLE_CUSTOMERS --connection "$ADS_GOOGLE_CONNECTION" --input-file google-customers.json --wait --json > google-customers-result.json
```

`google-customers.json`:

<!-- tool-input: GOOGLEADS_LIST_ACCESSIBLE_CUSTOMERS -->
```json
{}
```

After a successful result, `B = output.result.data`. Read `B.resourceNames[]`.
This is the directly accessible set, not a complete manager hierarchy. Passing
a `customer_id` to this listing does not filter it. If the selected identity is
a manager, use `GOOGLEADS_LIST_SUB_ACCOUNTS` with that manager's `customer_id`;
read `B.sub_accounts[]` and pass `B.next_page_token` as the next `page_token`.
This lists direct children; follow the relevant manager child when necessary.

Read the selected customer's identity, timezone and currency before reporting.
Save as `google-account.json`:

<!-- tool-input: GOOGLEADS_SEARCH_STREAM_GAQL -->
```json
{
  "customer_id": "1234567890",
  "query": "SELECT customer.id, customer.descriptive_name, customer.manager, customer.currency_code, customer.time_zone FROM customer LIMIT 2"
}
```

```sh
postplus channels tools show GOOGLEADS_SEARCH_STREAM_GAQL --json
postplus channels tools run GOOGLEADS_SEARCH_STREAM_GAQL --connection "$ADS_GOOGLE_CONNECTION" --target-id 1234567890 --target-path customer_id --input-file google-account.json --wait --json > google-account-result.json
```

Read `B.results[0].customer.id`, `descriptiveName`, `manager`, `currencyCode`
and `timeZone`. No results or a manager where a spending customer was expected
requires resolving the scope, not guessing another account. The tool has no
`login_customer_id` input; do not invent one to repair an access failure.


## Read performance and search terms

`google-performance.json` gives daily campaign totals. Derive both report and
comparison ranges from the same reporting scope:

<!-- tool-input: GOOGLEADS_SEARCH_STREAM_GAQL -->
```json
{
  "customer_id": "1234567890",
  "query": "SELECT customer.id, customer.currency_code, customer.time_zone, campaign.id, campaign.name, segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value FROM campaign WHERE segments.date BETWEEN '2026-09-14' AND '2026-09-20' ORDER BY segments.date ASC, campaign.id ASC LIMIT 10001"
}
```

```sh
postplus channels tools run GOOGLEADS_SEARCH_STREAM_GAQL --connection "$ADS_GOOGLE_CONNECTION" --target-id 1234567890 --target-path customer_id --input-file google-performance.json --operation-id "$ADS_REPORT_OPERATION_ID" --wait --json > google-performance-result.json
```

Read `B.results[].campaign`, `segments.date`, and `metrics`. Cost is
`metrics.costMicros / 1,000,000`; preserve integer/decimal precision.
`metrics.conversions` may be fractional. `metrics.conversionsValue` is an
account-currency value, not micros. Never fill a missing field with zero.

GAQL has no page token or automatic truncation flag here. The example uses a
10,001-row sentinel for a 10,000-row working bound. Reaching that limit means the
report may be incomplete: split into non-overlapping dates or objects within
the task's scope. Output size can also limit a response before that count;
reduce the query and disclose the failed/incomplete part. A date-segmented
query can omit zero-metric rows; absence alone does not prove tracking failed.

For a ready report shape, use `GOOGLEADS_GET_RMF_REPORT`. Available templates
are `CUSTOMER`, `CAMPAIGN`, `AD_GROUP_AD`, `KEYWORD`, `SEARCH_TERM`,
`DYNAMIC_SEARCH_AD_SEARCH_TERM`, and `BIDDING_STRATEGY`. Provide explicit dates;
do not rely on its default period. `optional_metrics` adds compatible metrics,
not arbitrary dimensions.

`google-search-terms.json`:

<!-- tool-input: GOOGLEADS_GET_RMF_REPORT -->
```json
{
  "customer_id": "1234567890",
  "report": "SEARCH_TERM",
  "start_date": "2026-09-14",
  "end_date": "2026-09-20",
  "max_rows": 1000
}
```

```sh
postplus channels tools show GOOGLEADS_GET_RMF_REPORT --json
postplus channels tools run GOOGLEADS_GET_RMF_REPORT --connection "$ADS_GOOGLE_CONNECTION" --target-id 1234567890 --target-path customer_id --input-file google-search-terms.json --wait --json > google-search-terms-result.json
```

Inspect `B.columns`, `required_columns` and `date_range`, then interpret
`B.results`. Check `B.truncated`. `max_rows` is 1–10,000; there is no `page_token`.
A truncated search-term sample cannot establish total wasted spend. Search-term
visibility is incomplete, and an ad-group search-term view does not cover all
Performance Max search information.


### Search intent and account structure

Separate branded demand, high-intent category searches, competitor comparison,
and problem exploration when their economics or messages differ. Search captures
existing demand; weak category search demand may call for upstream education
rather than forcing broader keywords. Do not assume every business needs every
campaign type.

Brand conversion rates can mask weak acquisition. Read brand and non-brand
separately and check budget allocation. A brand pause experiment, if requested,
needs total paid-plus-organic outcomes and a defined observation window; losing
paid conversions alone cannot measure incrementality. A shared budget is not
inherently wrong, but inspect which campaigns consume it before reallocating.

Group keywords by a common intent, promise and landing page. Split when those
need to differ; consolidate when fragmentation prevents useful evidence. Do not
apply a fixed keyword count or monthly conversion minimum as an eligibility
rule. Check Search Partners, Display expansion, location presence/interest and
language settings against the actual market instead of switching everything
without evidence. Overlapping keywords can fragment analysis and routing;
do not claim that the account literally bids against itself in every auction.

### Search-term decisions

Review actual queries for three outcomes: clear mismatch, relevant demand worth
expanding, and ambiguous demand needing more evidence. For each proposed negative,
record its source query, spend, relevant outcomes, match type, affected scope and
why the business cannot serve that intent. Check converting queries and useful
close variants before blocking. A few non-converting clicks are not enough to
prove waste when the sales cycle is long.

No search-term evidence means no invented account-specific negative list. Do not
apply generic words such as “free”, “jobs” or “template” to every business.
Negative broad requires all words, negative phrase depends on phrase order, and
negative exact is narrow; negatives do not automatically cover every close
variant. Choose the smallest sufficient scope and examine examples of valuable
queries the proposed rule would also block.

Expansion and broad-match tests need trustworthy goal signals, relevant query
history, negative controls, budget and a measurement plan. A rigid progression
or a universal conversion threshold is not a substitute for campaign evidence.
