# Google conversion goals and customer-outcome feedback

Read [channel execution](../channel-execution.md) and resolve the exact advertising and conversion customers. Measurement owns website trigger/receipt diagnosis; this topic owns ad-side configuration and authorized imports.

Before selecting conversion goals, read
`customer.conversion_tracking_setting.google_ads_conversion_customer`,
`campaign_conversion_goal` and `conversion_goal_campaign_config` for the exact
campaign. Creating a conversion action or setting `primary_for_goal` does not
select that action for this campaign. `GOOGLEADS_BATCH_MUTATE` supports
`campaign_conversion_goal_operation`,
`conversion_goal_campaign_config_operation`, `customer_conversion_goal_operation`
and `custom_conversion_goal_operation`. The first three system-generated
resources support update only. Custom goals can be created, updated or removed.
Read their current schemas and use explicit update masks with
`partial_failure:false`. Campaign/config resources belong to the advertising
customer; account/custom goals and conversion actions belong to the verified
conversion customer. If those customers differ, use separate correctly scoped
requests rather than moving ownership or inventing another account ID. Goal
updates are independently read back; a mismatch remains an unknown write.
Installing website tags and verifying real event receipt remain separate tasks.


## Establish what a conversion means

Inspect the goal definitions before comparing reported conversions with a
purchase or qualified-lead target. Save as `google-conversions.json` and use the
same GAQL command with a separate result filename:

<!-- tool-input: GOOGLEADS_SEARCH_STREAM_GAQL -->
```json
{
  "customer_id": "1234567890",
  "query": "SELECT conversion_action.resource_name, conversion_action.id, conversion_action.name, conversion_action.type, conversion_action.category, conversion_action.status, conversion_action.counting_type, conversion_action.primary_for_goal, conversion_action.click_through_lookback_window_days, conversion_action.view_through_lookback_window_days, conversion_action.value_settings.always_use_default_value, conversion_action.value_settings.default_value, conversion_action.value_settings.default_currency_code, conversion_action.attribution_model_settings.attribution_model FROM conversion_action LIMIT 1001"
}
```

Read `B.results[].conversionAction`. Confirm the business event, counting rule,
value source, lookback window and whether the campaign actually uses that goal.
Read `conversionAction.valueSettings.alwaysUseDefaultValue`, `defaultValue`,
and `defaultCurrencyCode`, plus
`conversionAction.attributionModelSettings.attributionModel`. A configured
default value is not observed order revenue; when defaults are only a fallback,
the actual supplied event values still need separate evidence. These fields
are selectable in the [Google conversion-action field reference](https://developers.google.com/google-ads/api/fields/v26/conversion_action);
the query still needs a successful response for this account.
`primaryForGoal` alone cannot establish campaign goal selection when custom
goals are involved. `metrics.conversions` and `metrics.all_conversions` are not
interchangeable. Mixed goals must retain their real labels.

If the decision requires one event, obtain an event-specific conversion view
using supported conversion-action segmentation/filtering, separately from spend.
Join by the same campaign and dates; do not repeat campaign spend for each
conversion action and then sum it. When goal selection cannot be verified,
report the mixed scope and leave the target comparison unresolved.


## Offline outcome ingestion

For new offline conversion integrations, prefer the supported Data Manager
`GOOGLEADS_INGEST_CONVERSION_EVENTS` path. The older
`GOOGLEADS_UPLOAD_CLICK_CONVERSIONS` tool is restricted to existing allowlisted
upload integrations. Ingestion, adjustments and audience changes require the
actual authorized data and scope. An accepted asynchronous ingestion returns a
`request_id`, not a completed conversion import. Preserve that ID and use
`GOOGLEADS_GET_CONVERSION_INGESTION_STATUS`, respecting returned
`polling_guidance`; inspect each destination's terminal status, errors and
warnings. Never re-ingest the same batch to obtain a status or treat partial
success as complete. Do not install a recurring monitor unless requested.


Before importing, resolve the real business event, destination conversion action, source identifiers, timestamps, values, currency, consent and duplicate policy from the authorized dataset. Never create synthetic customer results to fill a report. Inspect GOOGLEADS_LIST_DATA_MANAGER_CONVERSION_ACTIONS and the ingestion schema for actual destination eligibility. A validate_only request validates without ingestion; an applied request is a distinct authorized write.

For a confirmed wrong campaign goal, save current goal/configuration, use the applicable supported update operation and verify those fields by a new read. Configuration repair cannot install a website tag. For an import, verify every destination's terminal result and retain the request ID, accepted/rejected counts and errors. A request ID alone is not acceptance of the events or proof of ad attribution. Do not promise that event ingestion can be rolled back by deleting a local file.
