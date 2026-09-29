---
name: measurement
description: Investigate website behavior in GA4, Google search visibility in Search Console, and differences between those reports and ad-platform results using the user's connected properties.
metadata:
  postplus:
    familyId: measurement
    familyName: Website and Search Measurement
---

# Measurement

Answer the user's actual measurement question with the smallest defensible set
of reports. Establish the intended website or property, date range, business
event and comparison before selecting a tool. A supplied export can be analyzed
without connecting an account. Do not turn a missing row into a zero or a
tracking failure.

| User request | Read |
| --- | --- |
| Website sessions, engagement, events, key events, traffic sources or property configuration | [GA4](references/ga4.md). |
| Organic Google search clicks, impressions, queries, pages or a particular URL's indexing evidence | [Search Console](references/search-console.md). |
| “Why do Ads, GA4 and Search Console disagree?” | The relevant reports above, then [source reconciliation](references/source-reconciliation.md). |

An advertising-platform conversion setting or campaign change belongs to the
Ads task. This skill can identify which additional advertising evidence is
needed, but a report request does not authorize changing a tag, goal, campaign
or website. A GA4 property, a Search Console site, an Ads customer and a web
stream measurement ID are different identities.

When connected data is necessary, use `postplus channels list --json` and the
user's existing `ga4` or `gsc` connection. If absent, run
`postplus channels connect ga4 --json` or `postplus channels connect gsc --json`,
present the returned authorization link and wait on that same connection with
`postplus channels wait <connection-id> --json`. Resume the original question
only after authorization is active. A connection does not prove which property
is intended or that this account can read it.

Discover the relevant operations before choosing a report:

```sh
postplus channels tools list --toolkit google_analytics --query report --limit 20 --json
postplus channels tools list --toolkit google_search_console --query analytics --limit 20 --json
```

Use `--offset` to continue a truncated tool list. This discovers toolkit
operations, not which dimensions a particular GA4 property can combine or
whether this connection may run them. For GA4, metadata and compatibility
checks in [GA4](references/ga4.md) answer the property-specific question.
Before a report, inspect the selected tool with `postplus channels tools show
<tool-slug> --json` and use its current input schema. Submit each JSON request
with `postplus channels tools run <tool-slug> --connection <connection-id>
--input-file <request.json> --operation-id <new-id> --wait --json > <result.json>`.
Save the first response: it contains business data that the operation-status
receipt does not replay. If the outcome is pending or unknown, query
`postplus channels tools run --status <same-id> --json`; do not reissue an
uncertain operation as though its first result were empty. A separate read can
be justified if a read result was lost, with its scope and possible cost stated.

Report what was actually measured: property or site, timezone, dates,
dimensions, metric definition, filters, coverage or pagination limits, and
relevant data freshness. Keep observed results, plausible explanations and
unresolved evidence separate. For a cross-source comparison, never present
different event types as a failed one-to-one reconciliation.
