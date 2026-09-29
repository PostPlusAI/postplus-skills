# Measurement: locate the break between action and outcome

Use when a conversion count is missing, inflated or inconsistent, when checking
tracking, or when preparing a launch. Read
[channel-execution.md](channel-execution.md) for execution and
[launch-review.md](launch-review.md) for the wider launch decision. A normal
measurement audit reads configuration and evidence; it does not install tags,
change bidding goals, or send conversion events without the requested scope.

## Separate four claims

| Claim | Evidence needed | What it does not establish |
| --- | --- | --- |
| The event is configured | Real tag/action/pixel/property, event rule, counting and value settings | That the page or server fires it. |
| The event is received | A known action matched to browser/server evidence and platform diagnostics | That an ad caused or was credited for the action. |
| The event is attributed | The correct account, selected conversion, attribution method/window and matching report | That the lead qualified, the order settled or revenue was profitable. |
| The outcome is real | Order/payment/CRM evidence, deduplication, refunds and the relevant dates | A unique causal contribution by each advertising platform. |

Start with the user's real success event. For a purchase, verify amount,
currency and a stable transaction identity after confirmed payment. For a lead,
verify a completed accepted submission; a click on the submit button is a
separate event. Do not turn a default conversion value into observed revenue.

Record an event map: business action → event name and trigger → stream/pixel or
conversion-action ID → value/currency/counting → destination → evidence. If
browser and server report the same action, inspect their shared deduplication
identity and resulting count. A second tag, imported GA4 goal and native Ads
goal can count the same outcome differently; inspect actual goal inclusion
before declaring either duplication or correctness.

## Google Ads: inspect definitions and get the actual tag

Use the conversion-action GAQL query in [google-ads.md](google-ads.md) to read
name, type, category, counting, status and lookback settings. Identify the
selected action by its real resource name and numeric ID. Follow campaign goal
selection separately when custom goals or multiple primary actions are present.

For an existing action, save `google-tag.json`:

<!-- tool-input: GOOGLEADS_GET_CONVERSION_ACTION_TAG_SNIPPETS -->
```json
{
  "customer_id": "1234567890",
  "conversion_action_id": "5678901234"
}
```

```sh
postplus channels tools show GOOGLEADS_GET_CONVERSION_ACTION_TAG_SNIPPETS --json
postplus channels tools run GOOGLEADS_GET_CONVERSION_ACTION_TAG_SNIPPETS --connection "$ADS_GOOGLE_CONNECTION" --target-id 1234567890 --target-path customer_id --input-file google-tag.json --wait --json > google-tag-result.json
```

After successful execution, `B = output.result.data`. Read
`B.conversion_action.tagSnippets[]`, including the returned `globalSiteTag`,
`eventSnippet`, type and page format. Preserve returned markup when handing it
to the actual site/tag-management task. A snippet response proves availability
of the snippet, not installation, firing, consent behavior or attribution.

`GOOGLEADS_MUTATE_CONVERSION_ACTIONS` can configure an action, but it does not
install JavaScript or upload offline sales. If a user requests a configuration
change, resolve the exact schema with `show`, capture current settings, assess
the effect on bidding/reporting and verify the action by a new read after the
authorized mutation. Do not add an invented offline-conversion upload command.

## GA4: bind the correct property and website

Connect using channel `ga4`; discover tools with toolkit `google_analytics`.
Reuse an already verified property. Otherwise use this discovery sequence:

| Tool | Input | Evidence in `B` |
| --- | --- | --- |
| `GOOGLE_ANALYTICS_LIST_ACCOUNT_SUMMARIES` | Optional `pageSize` / `pageToken` | `accountSummaries[].propertySummaries` and `nextPageToken`. |
| `GOOGLE_ANALYTICS_LIST_PROPERTIES_FILTERED` | `filter`, such as `parent:accounts/123456` | `properties[]`; select a real property from the results. |
| `GOOGLE_ANALYTICS_GET_PROPERTY` | `name: properties/<numeric-id>` | `displayName`, `timeZone`, `currencyCode`. |
| `GOOGLE_ANALYTICS_LIST_DATA_STREAMS` | `parent: properties/<numeric-id>` | `dataStreams[].webStreamData.defaultUri` / `measurementId`. |
| `GOOGLE_ANALYTICS_LIST_KEY_EVENTS` | Same `parent` | `keyEvents[].eventName`, `countingMethod`, `defaultValue`. |
| `GOOGLE_ANALYTICS_LIST_GOOGLE_ADS_LINKS` | Same `parent` | `googleAdsLinks[].customerId`; verify the intended Ads customer. |
| `GOOGLE_ANALYTICS_GET_ATTRIBUTION_SETTINGS` | `name: properties/<id>/attributionSettings` | `reportingAttributionModel` and lookback settings. |

List operations use `nextPageToken` as the subsequent `pageToken`. Keep other
filters unchanged. A web stream's `G-...` measurement ID is not a numeric
property ID. A configured link or key event is not evidence of received data.

`ga4-property.json`:

<!-- tool-input: GOOGLE_ANALYTICS_GET_PROPERTY -->
```json
{"name": "properties/123456789"}
```

`ga4-streams.json`:

<!-- tool-input: GOOGLE_ANALYTICS_LIST_DATA_STREAMS -->
```json
{"parent": "properties/123456789", "pageSize": 100}
```

```sh
postplus channels tools show GOOGLE_ANALYTICS_GET_PROPERTY --json
postplus channels tools run GOOGLE_ANALYTICS_GET_PROPERTY --connection "$ADS_GA4_CONNECTION" --input-file ga4-property.json --wait --json > ga4-property-result.json
postplus channels tools show GOOGLE_ANALYTICS_LIST_DATA_STREAMS --json
postplus channels tools run GOOGLE_ANALYTICS_LIST_DATA_STREAMS --connection "$ADS_GA4_CONNECTION" --input-file ga4-streams.json --wait --json > ga4-streams-result.json
```

Verify the returned site, timezone and currency before applying the dates or
assuming this property explains the ad account. For cross-domain checkout,
inspect the real journey and referral/session continuity; configuration alone
is insufficient.

## GA4: ask a compatible reporting question

Use metadata for the selected property, including its custom fields. Save as
`ga4-metadata.json`:

<!-- tool-input: GOOGLE_ANALYTICS_GET_METADATA -->
```json
{"name": "properties/123456789/metadata"}
```

```sh
postplus channels tools show GOOGLE_ANALYTICS_GET_METADATA --json
postplus channels tools run GOOGLE_ANALYTICS_GET_METADATA --connection "$ADS_GA4_CONNECTION" --input-file ga4-metadata.json --wait --json > ga4-metadata-result.json
```

Read `B.dimensions[].apiName` and `B.metrics[].apiName`, types and blocked reasons.
A field name existing does not make every combination valid. Check the exact
requested dimensions, metrics and filters together. Do not set a compatibility
filter that hides rejected fields.

`ga4-compatibility.json` checks a traffic-quality question:

<!-- tool-input: GOOGLE_ANALYTICS_CHECK_COMPATIBILITY -->
```json
{
  "property": "properties/123456789",
  "dimensions": [{"name": "date"}, {"name": "sessionSourceMedium"}, {"name": "sessionCampaignName"}],
  "metrics": [{"name": "sessions"}, {"name": "engagedSessions"}]
}
```

```sh
postplus channels tools show GOOGLE_ANALYTICS_CHECK_COMPATIBILITY --json
postplus channels tools run GOOGLE_ANALYTICS_CHECK_COMPATIBILITY --connection "$ADS_GA4_CONNECTION" --input-file ga4-compatibility.json --wait --json > ga4-compatibility-result.json
```

Read every requested field in `B.dimensionCompatibilities[]` and
`B.metricCompatibilities[]`, matching `dimensionMetadata.apiName` or
`metricMetadata.apiName`. Proceed only when the intended fields are present and
`compatibility` is `COMPATIBLE`. If incompatible, explain which question cannot
be answered with that combination and choose a different explicitly described
report; do not silently remove dimensions.

Then prepare `ga4-report.json`:

<!-- tool-input: GOOGLE_ANALYTICS_RUN_REPORT -->
```json
{
  "property": "properties/123456789",
  "dateRanges": [{"startDate": "2026-09-14", "endDate": "2026-09-20"}],
  "dimensions": [{"name": "date"}, {"name": "sessionSourceMedium"}, {"name": "sessionCampaignName"}],
  "metrics": [{"name": "sessions"}, {"name": "engagedSessions"}],
  "limit": 10000,
  "offset": 0,
  "orderBys": [
    {"desc": false, "dimension": {"dimensionName": "date"}},
    {"desc": false, "dimension": {"dimensionName": "sessionSourceMedium"}},
    {"desc": false, "dimension": {"dimensionName": "sessionCampaignName"}}
  ],
  "returnPropertyQuota": true
}
```

```sh
postplus channels tools show GOOGLE_ANALYTICS_RUN_REPORT --json
postplus channels tools run GOOGLE_ANALYTICS_RUN_REPORT --connection "$ADS_GA4_CONNECTION" --input-file ga4-report.json --operation-id "$ADS_GA4_REPORT_OPERATION_ID" --wait --json > ga4-report-result.json
```

This example measures sessions and engagement; it does not establish purchase
attribution. For an event question, select the confirmed event and compatible
metrics from metadata, include any event filter in the compatibility check,
and identify the event in the report. Session source, first-user source and
attributed event source answer different questions; do not rename one as another.

Interpret the response before drawing conclusions:

- Map `B.dimensionHeaders[].name` and `B.metricHeaders[].name/type` to each
  `B.rows[].dimensionValues[].value` and `metricValues[].value`. Numeric values
  are strings; parse by the actual metric type. Verify expected headers exist.
- Page until collected rows reach `B.rowCount`, increasing `offset` by the
  actual rows received. Preserve dimensions, filters and deterministic ordering.
  If the next page is unexpectedly empty or the count changes, report the
  incomplete result rather than looping or pretending completion.
- Inspect `B.metadata.subjectToThresholding`, `dataLossFromOtherRow`,
  `samplingMetadatas`, `schemaRestrictionResponse`, and `emptyReason` where
  present. Surface limitations that affect the decision.
- Read any execution notice accompanying the report. If fields were removed
  or the query changed, compare the actual headers with the requested question
  and do not claim the original report was fulfilled.
- Do not add unique users across overlapping dimensions or join two reports by
  row position. Use shared keys and compatible scopes. Zero rows do not prove
  that the real website had zero activity.

`GOOGLE_ANALYTICS_BATCH_RUN_REPORTS` groups up to five requests; each returned
`B.reports[]` still needs its own header, coverage and metadata checks.
`GOOGLE_ANALYTICS_RUN_FUNNEL_REPORT` returns `B.funnelTable` /
`B.funnelVisualization`, not the ordinary report row shape. Use it only with
verified steps, ordering and a defined open/closed funnel question. Separate
aggregate event totals alone cannot establish the same users passed every step.

## Meta: distinguish configured pixels from received events

Use the intended account and verify the pixel association:

| Tool | Request | Result and limitation |
| --- | --- | --- |
| `METAADS_LIST_AD_ACCOUNT_PIXELS` | `ad_account_id`, optional `limit` / `cursor` | `B.pixels[]`, `has_more`, `next_cursor`. |
| `METAADS_LIST_CUSTOM_CONVERSIONS` | `ad_account_id`, optional `fields` array / `cursor` | `B.custom_conversions[]`, `has_more`, `next_cursor`; inspect event and rule instead of guessing from the name. |
| `METAADS_GET_PIXEL_EVENT_STATS` | Real `pixel_id`; optional event and recent timestamps | `B.stats[]`, `has_more`, `next_cursor`; receipt statistics, not campaign attribution. |

For supported list/stats pagination, pass `next_cursor` as the next `cursor`.
The stats window is limited to seven recent days; `start_time` is inclusive and
`end_time` exclusive Unix seconds. Choose dates from the actual task instead of
reusing old timestamps. Optional `event_source` is `WEB_ONLY` or `SERVER_ONLY`;
compare those paths when diagnosing receipt, without adding them into a
supposedly deduplicated total.

For example, `meta-pixels.json`:

<!-- tool-input: METAADS_LIST_AD_ACCOUNT_PIXELS -->
```json
{"ad_account_id": "act_123456789", "limit": 100, "sort_by": "NAME"}
```

```sh
postplus channels tools show METAADS_LIST_AD_ACCOUNT_PIXELS --json
postplus channels tools run METAADS_LIST_AD_ACCOUNT_PIXELS --connection "$ADS_META_CONNECTION" --target-id act_123456789 --target-path ad_account_id --input-file meta-pixels.json --wait --json > meta-pixels-result.json
```

Use [meta-ads.md](meta-ads.md) for attributed outcomes from Insights, with the
same selected event and stated attribution window. Receiving Purchase events
is not proof that an ad was credited or that all events represent settled orders.

## Validate the real journey, not just the schema

When a site/browser inspection is available and within the task, follow the
actual landing page, navigation and confirmed conversion. Inspect mobile and
relevant checkout/subdomain paths, redirects, tracking parameters, duplicate
triggers, consent state and the values sent. Use the site's existing approved
consent behavior; do not disable it to make counts match. Do not place a real
order or send a customer message merely to complete a tracking checklist.

Use current platform diagnostics or tag-manager preview for missing evidence.
Do not prescribe copied tracking snippets with invented IDs, fixed “top eight
events” instructions, a universal match-quality score, or a spend threshold
that supposedly makes server tracking mandatory. Server-side tracking can
improve evidence, but it does not eliminate deduplication, consent or attribution
limits. Record what the current account and implementation actually support.

`GOOGLE_ANALYTICS_VALIDATE_EVENTS` is a parameter validator, not a production
sender. Its current input requires `measurement_id`, `api_secret`, `client_id`
and `events`; an OAuth connection alone does not supply those inputs. Do not
solicit a secret in the conversation or embed one in reports. If an approved
secure input path is not already available, mark this check unavailable and
use the platform's diagnostic UI. Empty `B.validationMessages` means the payload
passed that validation; it does not prove receipt, deduplication or attribution.

`METAADS_SEND_CONVERSION_EVENTS` actually sends events. A `test_event_code` is
not a general dry-run switch. Use it only for an explicitly requested event
submission with verified event identity, destination, values and authorization;
never call it as an automatic audit probe or re-send an uncertain submission.

## Reconcile differences and deliver a repair plan

Compare sources with explicit event definitions, identity rules, timezone,
interaction/conversion date convention, attribution windows, counting, consent,
delays and refund treatment. Platform-attributed purchases, GA4 purchases and
settled orders are expected to answer different questions. Quantify the gap
only after aligning what can be aligned; do not force agreement by changing
values or summing platform credit.

Return an event-by-event table: expected action, observed configuration,
receipt evidence, attribution evidence, business evidence, finding and next
step. Use unknown for checks lacking evidence. For each confirmed defect,
state the precise repair, affected destination, validation method and expected
reporting/bidding effect. Website code, tag-manager publication, goal changes
and event submission are distinct actions with distinct recovery limits.
