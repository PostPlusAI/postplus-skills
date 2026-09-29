# Pinterest Ads: inspect advertiser and campaign evidence

Use this reference for Pinterest **paid** campaigns. Public Pins and organic
publishing use the Pinterest social connection. Read [channel execution](channel-execution.md)
for the common CLI, authorization, and result-recovery contract. Inspect the
tool's current `show` schema and availability before running it. The account,
campaign, and dates below are synthetic examples.

## Select an advertiser and the exact campaign

Use an active `pinterest-ads` connection from `postplus channels list --json`;
if absent, use `postplus channels connect pinterest-ads --json` and wait for
that connection. List advertisers, including shared accounts when relevant:

<!-- tool-input: PINTEREST_ADS_LIST_AD_ACCOUNTS -->
```json
{"include_shared_accounts":true,"page_size":100}
```

```sh
postplus channels tools show PINTEREST_ADS_LIST_AD_ACCOUNTS --json
postplus channels tools run PINTEREST_ADS_LIST_AD_ACCOUNTS --connection "$ADS_PINTEREST_CONNECTION" --input-file pinterest-accounts.json --wait --json > pinterest-accounts-result.json
```

Read `B.items[]`: use `id`, name, currency, timezone,
and permissions to select the intended advertiser. Repeat with
`next_cursor` while `has_more` is true; an incomplete account list cannot
prove an account is absent. The `ad_account_id` in every later request is
this advertiser ID, not the PostPlus connection ID.

<!-- tool-input: PINTEREST_ADS_LIST_CAMPAIGNS -->
```json
{"ad_account_id":"123456789012345678","page_size":100,"entity_statuses":["ACTIVE","PAUSED"]}
```

```sh
postplus channels tools run PINTEREST_ADS_LIST_CAMPAIGNS --connection "$ADS_PINTEREST_CONNECTION" --target-id "$ADS_ACCOUNT_ID" --target-path ad_account_id --input-file pinterest-campaigns.json --wait --json > pinterest-campaigns-result.json
```

Read `B.items[]`, `B.has_more`, and `B.next_cursor`; repeat the same filters
with the next cursor. The default status filter includes only active and paused
campaigns. When auditing launch state, request `DRAFT` or `ARCHIVED`
explicitly instead of treating their absence as proof they do not exist.
Retain each campaign's ID, advertiser ID, name, `objective_type`, configured
`status`, effective `summary_status`, and spend caps. The configured status
alone does not prove actual delivery.

## Compare paid performance within one reporting scope

Choose an explicit UTC date range of at most 90 days and a reporting level.
For one campaign, `entity_level` is `CAMPAIGN` and `entity_ids` must contain
its real campaign ID; do not pass `entity_ids` for `AD_ACCOUNT`. Use daily
rows to locate the change date before deciding whether a new creative,
audience, destination, or measurement issue needs investigation.

<!-- tool-input: PINTEREST_ADS_GET_ANALYTICS -->
```json
{
  "ad_account_id":"123456789012345678",
  "entity_level":"CAMPAIGN",
  "entity_ids":["456789012345678901"],
  "start_date":"2026-09-14",
  "end_date":"2026-09-20",
  "granularity":"DAY",
  "columns":["CAMPAIGN_ID","SPEND_IN_MICRO_DOLLAR","PAID_IMPRESSION","TOTAL_CLICKTHROUGH","OUTBOUND_CLICK_1","TOTAL_CONVERSIONS"],
  "click_window_days":30,
  "view_window_days":1,
  "conversion_report_time":"TIME_OF_AD_ACTION"
}
```

```sh
postplus channels tools show PINTEREST_ADS_GET_ANALYTICS --json
postplus channels tools run PINTEREST_ADS_GET_ANALYTICS --connection "$ADS_PINTEREST_CONNECTION" --target-id "$ADS_ACCOUNT_ID" --target-path ad_account_id --input-file pinterest-analytics.json --wait --json > pinterest-analytics-result.json
```

Read `B.entity_level` and `B.rows[]`. Check every
returned campaign ID and date against the request. Divide
`SPEND_IN_MICRO_DOLLAR` by 1,000,000 for the account currency; retain
integer/decimal precision. `PAID_IMPRESSION` is not `TOTAL_IMPRESSION`, and
`TOTAL_CLICKTHROUGH` is not outbound clicks. Preserve the click/view windows
and `conversion_report_time` when comparing conversions or ROAS across
periods. An empty report is not proof of zero eligible campaigns; first
check account, permissions, status filters, date and objective.

Use the Pin, landing page, and conversion-event evidence relevant to the
campaign before claiming why performance changed. A high click rate with no
verified purchase or qualified lead is a diagnostic clue, not success.

## Pause, resume, or rename one campaign

Before a change, look up one exact campaign with `campaign_ids` and include
its current status in `entity_statuses`. Confirm its account ID, ID, name,
configured status, summary status, and existing spend caps. If those differ
from the user's intended object, stop. `ACTIVE` can restart spending under
the existing caps; a report request alone does not authorize it.

<!-- tool-input: PINTEREST_ADS_LIST_CAMPAIGNS -->
```json
{"ad_account_id":"123456789012345678","campaign_ids":["456789012345678901"],"entity_statuses":["ACTIVE","PAUSED"],"page_size":100}
```

The pinned write supports only name and `ACTIVE`/`PAUSED` status for existing
campaigns. It does not change budgets, schedule, objective, or archive state.
Use one update item for one requested campaign; `--target-path updates.0.id`
then binds the CLI target to that specific item.

<!-- tool-input: PINTEREST_ADS_UPDATE_CAMPAIGNS -->
```json
{"ad_account_id":"123456789012345678","updates":[{"id":"456789012345678901","status":"PAUSED"}]}
```

```sh
postplus channels tools show PINTEREST_ADS_UPDATE_CAMPAIGNS --json
postplus channels tools run PINTEREST_ADS_UPDATE_CAMPAIGNS --connection "$ADS_PINTEREST_CONNECTION" --target-id "$ADS_CAMPAIGN_ID" --target-path updates.0.id --input-file pinterest-pause.json --operation-id "$ADS_UPDATE_OPERATION_ID" --wait --json > pinterest-pause-result.json
```

Inspect every `B.results[]` item, not just the
top-level receipt: `requested_id` must equal the intended ID, `success` must
be true, `succeeded_count` must be 1 and `failed_count` 0. Then independently
repeat `PINTEREST_ADS_LIST_CAMPAIGNS` for the same advertiser and campaign,
checking configured `status` and effective `summary_status`. An incomplete
readback is unresolved. For an unknown write outcome, use
`postplus channels tools run --status "$ADS_UPDATE_OPERATION_ID" --json`
and read the same campaign; never resubmit under a new ID just to get a receipt.
