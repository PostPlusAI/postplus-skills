# Meta optimization events and customer-outcome feedback

Name the real success event, pixel/dataset, campaign objective, ad-set
optimization event and attribution window. Read
[ad measurement](../measurement.md) for actual supported pixel, custom-conversion
and event-stat reads. Measurement owns site triggers, duplicate send diagnosis
and comparison with confirmed orders/CRM; this topic owns the ad-side choice
and authorized platform event submission.

METAADS_LIST_AD_ACCOUNT_PIXELS and METAADS_LIST_CUSTOM_CONVERSIONS establish
configuration. METAADS_GET_PIXEL_EVENT_STATS establishes only returned receipt
statistics and its observed scope. Insights establishes platform-attributed
outcomes. Keep browser/server counts and their deduplication rules distinct;
do not add overlapping action types or relabel all lead events as qualified.

## Repair or prepare the actual mismatch

If a reviewed new campaign uses the wrong website event, correct the paused
build plan through [build and preview](build-and-preview.md) and verify the
actual supported creation/configuration path. Existing status/name or amount
tools cannot change an optimization event. Inspect the exact requested field's
availability before promising a live change; do not silently create a new
campaign or change the business event to fit an available schema.

If real outcomes are missing or duplicated, inspect the site/server path using
Measurement before sending more events. METAADS_SEND_CONVERSION_EVENTS sends
events; a test_event_code is not a general dry-run flag. Establish authorized
event identity, data source, destination, time, value/currency, consent and
deduplication identity first. A fabricated customer or order is not a valid
audit probe. Secure identifiers belong in the configured secure input path,
not chat or public reports.

## Acceptance and recovery

Preserve the first business response and operation identity. Interpret accepted
and rejected event evidence separately; receipt or match quality is not proof
of campaign attribution or business quality. For an unknown send, inspect the
original operation and actual destination evidence rather than resend it.
An event already sent cannot be undone by reverting a local payload.

Return the event map, observed configured/received/attributed/business stages,
actual fix or precise preparation gap, and the next check. Account-side changes
and event submissions stay within existing authorization. Hand only confirmed,
comparable outcomes to [delivery optimization](delivery-and-optimization.md).
