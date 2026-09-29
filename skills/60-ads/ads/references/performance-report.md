# Performance reports that support a decision

Use this reference for a daily or weekly account report, a period comparison,
or a performance anomaly. Use supplied exports when they answer the question;
a report does not require a connection or a new fetch by default. Live reporting
uses read operations only. Follow [channel-execution.md](channel-execution.md)
for connection selection, result capture, costs, and incomplete operations.

## Establish one reporting scope

Record the platform, actual account ID, account timezone, currency, date range,
comparison range, business conversion event, attribution window, and source
files. Reuse confirmed context rather than asking for it again. If several
accounts fit, resolve which account matters before fetching a large report.

A purchase, an enquiry, a qualified lead, and a button click measure different
outcomes. Name the event in every conversion or cost column. If the mapping is
unknown, show the platform's metric name and state what remains unresolved;
do not compare that count with a target defined for paying customers.

Derive dates once in the account timezone:

| Request | Analysis window | Comparison and context |
| --- | --- | --- |
| Daily, no date supplied | Yesterday, one complete calendar day | Previous day for movement; preceding 7 complete days for a working baseline. Add a 14-day baseline only when it helps assess noise. |
| Weekly, no dates supplied | Last complete Monday–Sunday | The preceding Monday–Sunday. Respect a different business week if already specified. |
| Historical report | The requested period | Comparable preceding period; never add a current-day alert to a historical report. |
| Today / in progress | Explicitly partial | Compare matching elapsed hours only if the tool supplies them; otherwise show progress without a full-day percentage comparison. |

Exclude the day being evaluated from its own rolling baseline. Preserve
weekday, promotion, seasonality, and conversion-lag differences in the
interpretation. Recent conversion counts can mature after the report; record
when the data was fetched and avoid presenting an immature cohort as final.

## Fetch the smallest sufficient evidence

Start with account totals and date × campaign performance. Drill into expensive
or changing objects, then relevant dimensions. Do not collect every dimension
on every run. Reuse the original results when writing recommendations.

| Platform | Account and core evidence | Relevant follow-up |
| --- | --- | --- |
| Google Ads | `GOOGLEADS_LIST_ACCESSIBLE_CUSTOMERS`, then `GOOGLEADS_SEARCH_STREAM_GAQL` or `GOOGLEADS_GET_RMF_REPORT` | Search terms, keywords, device, geography, conversion definitions, policy and campaign settings. Use the resource and fields appropriate to the question in [google-ads.md](google-ads.md). |
| Meta Ads | `METAADS_GET_AD_ACCOUNTS`, `METAADS_GET_INSIGHTS` | Campaign/ad set/ad identity, attribution settings, creative association and supported breakdowns in [meta-ads.md](meta-ads.md). |
| Website | `GOOGLE_ANALYTICS_RUN_REPORT` after field and compatibility checks | Traffic quality, event receipt and attribution differences in [measurement.md](measurement.md). Website sessions are not ad clicks. |
| TikTok Ads | Only the applicable GMV Max, Smart+ material or video report | Use [tiktok-ads.md](tiktok-ads.md). State its exact coverage; these tools do not supply a universal account report. |
| Reddit Ads | Business → ad account → campaigns, then `REDDIT_ADS_GET_A_REPORT` | Use [reddit-ads.md](reddit-ads.md). Preserve UTC/account-timezone mapping, `page.token`, and `metrics_updated_at`; confirm the returned SPEND unit before conversion. |
| Pinterest Ads | Advertiser → campaigns, then `PINTEREST_ADS_GET_ANALYTICS` at the requested entity level | Use [pinterest-ads.md](pinterest-ads.md). `SPEND_IN_MICRO_DOLLAR` is a micro-unit; distinguish paid impressions, total clicks and outbound clicks. |

For example, after preparing the account-specific JSON described in the Google
reference, save the first successful response:

```sh
postplus channels tools show GOOGLEADS_SEARCH_STREAM_GAQL --json
postplus channels tools run GOOGLEADS_SEARCH_STREAM_GAQL --connection "$ADS_GOOGLE_CONNECTION" --target-id "$ADS_CUSTOMER_ID" --target-path customer_id --input-file google-performance.json --operation-id "$ADS_REPORT_OPERATION_ID" --wait --json > google-performance-result.json
```

`$ADS_CUSTOMER_ID` must exactly match `customer_id` in that file. Read the
execution status before interpreting the data. In a normal successful CLI
response, `B = output.result.data` is the business result. A status query returns
an execution receipt, not a second download of the report.

| Source | Read and interpret |
| --- | --- |
| Google GAQL | `B.results[]`; requested objects usually use lower camel case, such as `metrics.costMicros`. Divide cost micros by 1,000,000 using reliable decimal/integer handling. `conversions` can be fractional; `conversionsValue` is already a currency value. |
| Google RMF | Inspect `B.columns`, `B.required_columns`, `B.date_range`, and then `B.results`. Check `B.truncated`; there is no page token. |
| Meta Insights | `B.data[]`; `spend` is an account-currency amount, often a string. Select the agreed `actions[].action_type` and matching `action_values`; do not sum overlapping purchase categories. |
| GA4 | Match `B.dimensionHeaders` / `B.metricHeaders` to each row's value arrays. Honor the metric type and report metadata. There is no fixed universal column order. |
| Reddit Ads | Read `B.data.metrics[]`, `B.data.metrics_updated_at`, and `B.pagination.next_url`; preserve breakdowns and follow every page. |
| Pinterest Ads | Read `B.entity_level` and `B.rows[]`; retain conversion windows and report time before comparison. |

## Prove coverage before calculating

- Complete the available pagination while preserving filters and dates. A first
  page, top-spend sample, truncated response, or failed source is not a full
  account. If scope must be reduced, name the actual included objects and dates.
- Match periods by stable IDs, not names or row order. An object missing from a
  ranked historical page may have been below the limit. Re-query its ID before
  calling it newly launched. No prior impressions only establishes no observed
  delivery in that window, not its creation date.
- Missing data is not zero. Separate confirmed zero metrics, omitted zero rows,
  empty filters, insufficient permission, privacy suppression, and execution
  failure. Verify scope and status before concluding there was no spend.
- Do not combine currencies without an explicit conversion source and date.
  Keep platform-attributed conversions and revenue side by side; the same order
  may appear in multiple platforms. A deduplicated total needs transaction or
  CRM evidence.

## Calculate from compatible totals

Use a platform-derived ratio when its event, units, scope and window match the
question. When deriving a metric locally, disclose its numerator and denominator:

| Metric | Formula for the same scope and period |
| --- | --- |
| CTR | Clicks / impressions × 100; label which click type. |
| CPC | Spend / the same click count. |
| CPM | Spend / impressions × 1,000. |
| Cost per selected outcome | Spend / selected outcome count. |
| ROAS | Selected attributed revenue / spend; this is not profit or payback. |
| Period change | (Current − comparison) / comparison × 100. |

Zero denominator means `not calculable`, not infinity, NaN, or an invented zero.
Never average daily CPA, CTR or ROAS: divide the corresponding range totals.
For a daily count baseline, divide by calendar days and label it. Use active-day
averages only with daily delivery evidence and show the denominator; do not
infer active days from a returned row count. Keep a newly started campaign's
short history visible rather than comparing it to an imaginary full week.

Reach, unique users, and frequency cannot be added across days or campaigns to
produce an account-period total. Request an aggregate at the needed scope.
Likewise, a demographic or placement breakdown may omit or overlap data; do not
force it to reconcile by assigning missing values to a made-up bucket.

## Explain movement without inventing causes

For each material change, follow the chain:

1. **What changed?** Name the object, window, value, baseline and contribution to
   the account change. Show counts alongside ratios so small samples remain visible.
2. **Which explanation fits the evidence?** Separate auction cost, click response,
   landing-page conversion, tracking, audience mix and delayed outcomes. A higher
   CPA alone does not identify any one of them.
3. **What observation would distinguish alternatives?** Fetch only that evidence,
   or identify the exact setting, export or page journey still needed.
4. **What should happen next?** State the smallest useful action or experiment,
   the expected result, the observation window and how to judge it.

Creative spend concentration is a test-allocation signal, not proof of fatigue:
show the leading ad's share and the share of spend whose creative IDs are known.
Compare CTR within a similar objective, format, audience and placement, using
impression-weighted totals. Frequency rising alongside sustained CTR and outcome
rate deterioration supports a fatigue hypothesis; concentration or one low-CTR
day alone does not. Inspect actual assets before diagnosing their message.

Use the account's own comparable periods or experiments before external
benchmarks. Name a benchmark's source, cohort, objective, geography and date;
platform/vendor case studies are not independent guarantees. Do not use a
universal dollar threshold, conversion minimum or CPA multiple to pause ads.

## Deliver the report

Lead with the business result and the most useful next decision. Scale detail
to the request; a daily check should not become an exhaustive account audit.

A useful report contains:

1. **Scope and limitations:** account, timezone, currency, date and comparison,
   selected outcome and attribution, fetch time, sources and missing coverage.
2. **Outcome summary:** spend, selected outcomes, cost per outcome or revenue
   return, and material change against the matching target/baseline.
3. **Drivers:** campaign IDs/names, amounts and ratios for each period, changes,
   sample counts and explanatory evidence. Show both the numerator and outcome
   definition when a cost ratio is central to the decision.
4. **Relevant breakdowns:** only those answering a real question; mark unsupported
   or unavailable evidence explicitly instead of silently omitting it.
5. **Next actions:** object, evidence, proposed action, expected effect, checkpoint
   and verification metric. Weekly reports also allocate next week's experiments
   and distinguish prospecting from demand capture.

Audit findings can use verified / issue / unknown / not applicable, but coverage
and account quality remain separate. An inaccessible pixel is unknown, not
broken. Report counts of checked and applicable items; do not turn a narrow
performance sample into an overall account-health score. See
[launch-review.md](launch-review.md) for launch evidence.

A report request does not authorize account changes. Continue into the platform
reference only when the user asks to implement a specific change, retaining
existing authorization and all unresolved evidence.
