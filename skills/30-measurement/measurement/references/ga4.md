# GA4: identify the property before explaining the result

Use this reference for behavior **on the user's website or app**. Sessions,
users, events and key events answer different questions. Before calculating a
change, identify the business event (for example an accepted lead rather than
a submit-button click), the property, website stream, timezone, currency and
comparison window. Configuration proves neither event receipt nor an actual
sale.

## Find the property and event definition

Use the active `ga4` connection and toolkit `google_analytics`. If the user
has not supplied a verified property, discover it with
`GOOGLE_ANALYTICS_LIST_ACCOUNT_SUMMARIES` using `{}`. Continue from
`nextPageToken` with `pageToken`; inspect `accountSummaries[]` and nested
`propertySummaries[]`. For an account-specific search,
`GOOGLE_ANALYTICS_LIST_PROPERTIES_FILTERED` accepts
`{"filter":"parent:accounts/<account-id>"}`. Do not treat a stream's `G-...`
measurement ID as a property ID.

For a candidate numeric property, save these separate requests:

```json
{"name":"properties/123456789"}
```

```json
{"parent":"properties/123456789","pageSize":100}
```

The first is for `GOOGLE_ANALYTICS_GET_PROPERTY`; read `displayName`,
`timeZone` and `currencyCode`. The second is for
`GOOGLE_ANALYTICS_LIST_DATA_STREAMS`; confirm the intended website using the
web stream's `defaultUri` and `measurementId`, and continue stream pagination.
For a key-event question, call `GOOGLE_ANALYTICS_LIST_KEY_EVENTS` with
`{"parent":"properties/123456789"}` and inspect the actual `eventName`,
counting method and default value. A configured default value is not order
revenue. If the site or property is ambiguous, resolve it before reporting.

```sh
postplus channels tools show GOOGLE_ANALYTICS_GET_PROPERTY --json
postplus channels tools run GOOGLE_ANALYTICS_GET_PROPERTY --connection "$GA4_CONNECTION" --input-file ga4-property.json --wait --json > ga4-property-result.json
postplus channels tools show GOOGLE_ANALYTICS_LIST_DATA_STREAMS --json
postplus channels tools run GOOGLE_ANALYTICS_LIST_DATA_STREAMS --connection "$GA4_CONNECTION" --input-file ga4-streams.json --wait --json > ga4-streams-result.json
```

These requests, and all examples below, contain illustrative IDs. Replace
them with the selected account's own property. `channels tools show` is the
current source for tool availability, required fields and enums.

## Ask a compatible report question

Get the property's current field dictionary with
`GOOGLE_ANALYTICS_GET_METADATA` and
`{"name":"properties/123456789/metadata"}`. Read the actual
`dimensions[].apiName` and `metrics[].apiName`, including custom fields. Check
`metrics[].blockedReasons` for every selected metric. If nonempty, report that
metric as unavailable for this user; a returned zero is not observed activity. For
“Which sources brought engaged sessions?”, check the complete combination:

<!-- tool-input: GOOGLE_ANALYTICS_CHECK_COMPATIBILITY -->
```json
{
  "property":"properties/123456789",
  "dimensions":[{"name":"date"},{"name":"sessionSourceMedium"}],
  "metrics":[{"name":"sessions"},{"name":"engagedSessions"}]
}
```

```sh
postplus channels tools show GOOGLE_ANALYTICS_GET_METADATA --json
postplus channels tools run GOOGLE_ANALYTICS_GET_METADATA --connection "$GA4_CONNECTION" --input-file ga4-metadata.json --wait --json > ga4-metadata-result.json
postplus channels tools show GOOGLE_ANALYTICS_CHECK_COMPATIBILITY --json
postplus channels tools run GOOGLE_ANALYTICS_CHECK_COMPATIBILITY --connection "$GA4_CONNECTION" --input-file ga4-compatibility.json --wait --json > ga4-compatibility-result.json
```

Compare every requested field against `dimensionCompatibilities[]` and
`metricCompatibilities[]` by `apiName`; proceed only when all are present and
`COMPATIBLE`. A schema-valid field combination is not necessarily compatible.
Do not filter out incompatible fields and silently answer a weaker question.
For a key-event or purchase question, select the actual event and metrics from
metadata, include the proposed filters in the compatibility check, and name
that event in the eventual report. Session source, first-user source and
attributed event source are different dimensions.

Then save `ga4-report.json`:

<!-- tool-input: GOOGLE_ANALYTICS_RUN_REPORT -->
```json
{
  "property":"properties/123456789",
  "dateRanges":[{"startDate":"2026-09-14","endDate":"2026-09-20"}],
  "dimensions":[{"name":"date"},{"name":"sessionSourceMedium"}],
  "metrics":[{"name":"sessions"},{"name":"engagedSessions"}],
  "limit":10000,
  "offset":0,
  "orderBys":[
    {"desc":false,"dimension":{"dimensionName":"date"}},
    {"desc":false,"dimension":{"dimensionName":"sessionSourceMedium"}}
  ],
  "returnPropertyQuota":true
}
```

```sh
postplus channels tools show GOOGLE_ANALYTICS_RUN_REPORT --json
postplus channels tools run GOOGLE_ANALYTICS_RUN_REPORT --connection "$GA4_CONNECTION" --input-file ga4-report.json --operation-id "$GA4_REPORT_OPERATION_ID" --wait --json > ga4-report-result.json
```

Use dates in the selected property timezone. Map `dimensionHeaders[]` and
`metricHeaders[]` by name to each row's `dimensionValues[]` and
`metricValues[]`; numeric values arrive as strings. Verify headers are the
fields requested. Page with increasing `offset` until collected rows match
`rowCount`, preserving filters and ordering; an empty next page or changing
count is incomplete evidence. Inspect thresholding, data-loss, sampling,
restriction and empty-reason metadata when present. Zero rows do not establish
zero real-world visits or a broken tag.

If a report's result changes or removes a requested field, disclose that
instead of assigning the old label to new data. Never sum unique users across
overlapping groups or interpret these sessions as attributed ad conversions.

Metric access semantics: [Google Analytics MetricMetadata](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/MetricMetadata).
