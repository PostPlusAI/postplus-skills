# Pinterest Ads: inspect advertiser and campaign evidence

Use this reference for Pinterest **paid** campaigns. Public Pins and organic
publishing use the Pinterest social connection. Read [channel execution](channel-execution.md)
for the common CLI, authorization, and result-recovery contract. Inspect the
tool's current `show` schema and availability before running it. The account,
campaign, and dates below are synthetic examples.

## Strategy field lookup

Use [strategy execution](strategy-execution.md) for formulas.
`B = output.result.data`. `PINTEREST_ADS_GET_ANALYTICS` requires `ad_account_id`,
`entity_level`, `start_date`, `end_date`, `columns`, `granularity`.
For `CAMPAIGN`, `AD_GROUP`, or `AD`, also supply real `entity_ids`; omit them
for `AD_ACCOUNT`. Read requested columns in open `B.rows[]` and retain IDs.
Dates are UTC; preserve `click_window_days`, `view_window_days` and
`conversion_report_time`. `HOUR` supplies no conversion metrics and has stricter
date limits; do not approximate an hourly conversion rule with daily totals.

| Metric | Tool | Field / interpretation |
| --- | --- | --- |
| Spend; impressions | `PINTEREST_ADS_GET_ANALYTICS` | `B.rows[].SPEND_IN_MICRO_DOLLAR` is account-currency micros; divide by 1,000,000. `PAID_IMPRESSION` differs from `TOTAL_IMPRESSION`. |
| All CTR; link CTR; link CPC; CPM | `PINTEREST_ADS_GET_ANALYTICS` | `TOTAL_CLICKTHROUGH` differs from `OUTBOUND_CLICK_1`; select the intended click/impression definitions before applying formulas. `CTR`/`OUTBOUND_CTR_1` are separate columns; Meta all/link labels are not automatic synonyms. `CPC_IN_MICRO_DOLLAR`/`CPM_IN_MICRO_DOLLAR` use micros; `COST_PER_OUTBOUND_CLICK_IN_DOLLAR` uses currency units. |
| Event count; event cost | `PINTEREST_ADS_GET_ANALYTICS` | Choose verified `TOTAL_WEB_CHECKOUT`, `TOTAL_CHECKOUT`, `TOTAL_LEAD`, or other supported event column in `B.rows[]`. Do not substitute mixed `TOTAL_CONVERSIONS` for purchases/leads; no app-install column is declared. Apply event cost only to matching spend scope. |
| Event value; ROAS | `PINTEREST_ADS_GET_ANALYTICS` | `TOTAL_WEB_CHECKOUT_VALUE_IN_MICRO_DOLLAR` is micros. Pair with verified web-checkout attribution; `CHECKOUT_ROAS` is checkout scope, not lead/app ROAS. Unavailable event value remains unknown. |
| Frequency | Export | No frequency/reach column in this schema; require verified whole-window frequency evidence. |
| Campaign budget | `PINTEREST_ADS_LIST_CAMPAIGNS` | Require `ad_account_id`; `B.items[].daily_spend_cap/lifetime_spend_cap` are microunits. A spend cap is not automatically the ad-group daily budget. |
| Ad-group budget; bid | `PINTEREST_ADS_LIST_AD_GROUPS` | Require `ad_account_id`; `B.items[].budget_in_micro_currency/budget_type/bid_in_micro_currency/billable_event`. Convert micros and verify daily/lifetime period and bidding event. |
| Age; active child counts | `PINTEREST_ADS_LIST_CAMPAIGNS`, `PINTEREST_ADS_LIST_AD_GROUPS`, `PINTEREST_ADS_LIST_ADS` | Require `ad_account_id`; `B.items[].created_time` is a Unix timestamp. Use exact `id`, parent IDs, configured `status` and effective `summary_status`; paginate via `has_more`/`next_cursor`, then count unique children under the agreed active definition. |
| CAC/CPL/Target CPA; custom conversion rate | User configuration | User business targets/formula; neither bid nor spend cap is the acquisition-cost target. |

For supported writes use [campaign updates](#pause-resume-or-rename-one-campaign).
`PINTEREST_ADS_UPDATE_CAMPAIGNS` requires `ad_account_id` and `updates[]`; each
item needs `id` and `name` or `status` (`ACTIVE`/`PAUSED`). It cannot update
budgets, bids, schedules, or child objects. For those user-selected actions,
prepare exact manual steps and read back the same object; do not invent write
fields because matching read fields exist.

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

<!-- strategy-parameters:generated:start -->
## Prompt parameter bindings

These bindings are generated from the same internal parameter source as copied Strategy prompts. Use only the required metrics, dependencies, target and campaign type. These are semantic bindings, not replacement tool schemas.

When platform and campaign type match, use embedded parameters directly. Read this section only for a platform change, missing/inapplicable binding or actual tool conflict. Preserve user rules and thresholds; explain unsupported scope/actions and let the user choose an adjustment.

| Context | Parameters |
| --- | --- |
| report | PINTEREST_ADS_GET_ANALYTICS: ad_account_id, entity_level=AD_ACCOUNT/CAMPAIGN/AD_GROUP/AD, entity_ids for non-account scope, start_date/end_date (UTC), columns=[needed fields], granularity. Retain click_window_days/view_window_days/conversion_report_time. B.rows[] is open; HOUR has no conversion metrics. |

| Metric / target / campaign type | Binding |
| --- | --- |
| CAC | User-set acquisition-cost ceiling, in account currency/customer; reuse the approved customer definition and value. |
| CPL | User-set lead-cost ceiling, in account currency/lead; distinct from observed Cost per lead. |
| Target CPA | User-set target acquisition cost in account currency/conversion; do not substitute the bidding target. |
| Conversion Rate | User-defined numerator/denominator and percent-or-ratio convention. Reuse the supplied formula; if absent, propose and confirm it before evaluation. |
| Time | Evaluation clock in the rule timezone; preserve explicit timezone and whole-week execution hours. |
| CBO Dynamic Budget | Target CPA × Active ad sets in campaign, in account currency; preserve the rule multiplier and budget owner. Inputs: Target CPA; Active ad sets in campaign. |
| Spend | SPEND_IN_MICRO_DOLLAR → B.rows[].SPEND_IN_MICRO_DOLLAR / 1000000; account currency. Context: report. |
| Impressions | PAID_IMPRESSION → B.rows[].PAID_IMPRESSION; paid count, not TOTAL_IMPRESSION. Context: report. |
| _clicks | TOTAL_CLICKTHROUGH → B.rows[].TOTAL_CLICKTHROUGH; clickthrough count, not all Meta clicks. Context: report. |
| _linkClicks | OUTBOUND_CLICK_1 → B.rows[].OUTBOUND_CLICK_1; outbound count; confirm this matches the intended link-click definition. Context: report. |
| CTR | 100 × _clicks / Impressions only for confirmed paid/clickthrough scope; percentage points. Inputs: _clicks; Impressions. |
| CTR (Link clicks) | 100 × _linkClicks / Impressions only for matching paid scope; percentage points. Inputs: _linkClicks; Impressions. |
| CPC (Link) | Spend / _linkClicks; currency/outbound click for matching paid scope. Inputs: Spend; _linkClicks. |
| CPM | 1000 × Spend / Impressions; currency/1000 paid impressions. Inputs: Spend; Impressions. |
| Purchases | TOTAL_CHECKOUT → B.rows[].TOTAL_CHECKOUT; checkout across the verified event scope count. Verify attribution, never use mixed TOTAL_CONVERSIONS. Context: report. |
| Website purchases | TOTAL_WEB_CHECKOUT → B.rows[].TOTAL_WEB_CHECKOUT; website checkout count. Verify attribution, never use mixed TOTAL_CONVERSIONS. Context: report. |
| Leads | TOTAL_LEAD → B.rows[].TOTAL_LEAD; lead count. Verify attribution, never use mixed TOTAL_CONVERSIONS. Context: report. |
| Mobile app purchases | No verified app-specific count binding in the current analytics contract; do not substitute total checkouts/conversions. Verify only the relevant event section or obtain matching export. |
| Mobile app installs | No verified app-specific count binding in the current analytics contract; do not substitute total checkouts/conversions. Verify only the relevant event section or obtain matching export. |
| Cost per purchase | Spend / Purchases; currency/event, unknown if the event binding is unavailable. Inputs: Spend; Purchases. |
| Cost per website purchase | Spend / Website purchases; currency/event, unknown if the event binding is unavailable. Inputs: Spend; Website purchases. |
| Cost per lead | Spend / Leads; currency/event, unknown if the event binding is unavailable. Inputs: Spend; Leads. |
| Cost per mobile app purchase | Spend / Mobile app purchases; currency/event, unknown if the event binding is unavailable. Inputs: Spend; Mobile app purchases. |
| Cost per mobile app install | Spend / Mobile app installs; currency/event, unknown if the event binding is unavailable. Inputs: Spend; Mobile app installs. |
| Purchase ROAS | CHECKOUT_ROAS → B.rows[].CHECKOUT_ROAS; ratio for verified checkout scope/attribution, not a lead/app ratio. Context: report. |
| Website purchase ROAS | TOTAL_WEB_CHECKOUT_VALUE_IN_MICRO_DOLLAR → B.rows[].TOTAL_WEB_CHECKOUT_VALUE_IN_MICRO_DOLLAR/1000000, divided by Spend; ratio using matching website-checkout attribution. Inputs: Spend. Context: report. |
| Leads value | No verified lead monetary-value column; use the approved CRM/export value and matching event, currency and attribution. Missing value stays unknown. Inputs: Leads. |
| ROAS (Leads) | Leads value / Spend; ratio. Inputs: Leads value; Spend. |
| Mobile app purchase ROAS | No verified app-specific monetary-value binding; require a matching export/value definition, never substitute CHECKOUT_ROAS. Inputs: Mobile app purchases; Spend. |
| Frequency | No frequency/reach column in this contract; require same-window frequency export. Impressions alone cannot establish frequency. |
| Daily budget / campaign | PINTEREST_ADS_LIST_CAMPAIGNS(ad_account_id): B.items[].daily_spend_cap/1000000, account-currency daily cap; lifetime_spend_cap is different. A cap is not automatically an allocated daily budget. |
| Daily budget / adset | PINTEREST_ADS_LIST_AD_GROUPS(ad_account_id): B.items[].budget_in_micro_currency/1000000, account currency; budget_type must be DAILY. |
| Daily budget / ad | No ad-owned budget; resolve the intended owner with the user. |
| Daily budget / selected | Resolve campaign cap versus ad-group budget ownership before comparison. |
| Bid amount | PINTEREST_ADS_LIST_AD_GROUPS(ad_account_id): B.items[].bid_in_micro_currency/1000000; currency per billable_event. Verify bidding applicability; no bid write tool. |
| Hours since creation | Use the matching PINTEREST_ADS_LIST_CAMPAIGNS/LIST_AD_GROUPS/LIST_ADS(ad_account_id): B.items[].created_time is Unix time; (now−created_time)/3600 hours. |
| Ads in ad set | PINTEREST_ADS_LIST_ADS(ad_account_id): count unique B.items[].id under the exact ad_group_id; page through has_more/next_cursor. |
| Active ads in ad set | PINTEREST_ADS_LIST_ADS(ad_account_id): count unique B.items[].id under the exact ad_group_id; filter agreed status/summary_status; page through has_more/next_cursor. |
| Active ad sets in campaign | PINTEREST_ADS_LIST_AD_GROUPS(ad_account_id): count unique B.items[].id under the exact campaign_id; filter agreed status/summary_status; page through has_more/next_cursor. |

| Action / target / campaign type | Binding |
| --- | --- |
| Notify | Return matching values here; external delivery requires the user-selected destination and sending capability. |
| Duplicate | No verified exact-duplication binding for this target. Preserve source/copy count and let the user choose manual duplication or another supported operation; creation alone is not duplication. |
| Pause / campaign | PINTEREST_ADS_UPDATE_CAMPAIGNS(ad_account_id,updates=[{id:campaign ID,status:PAUSED}]); inspect per-item success and read same campaign via LIST_CAMPAIGNS(campaign_ids). |
| Pause / adset | No verified AI-direct Pause binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Pause / ad | No verified AI-direct Pause binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Pause / selected | No verified AI-direct Pause binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Start / campaign | PINTEREST_ADS_UPDATE_CAMPAIGNS(ad_account_id,updates=[{id:campaign ID,status:ACTIVE}]); inspect per-item success and read same campaign via LIST_CAMPAIGNS(campaign_ids). |
| Start / adset | No verified AI-direct Start binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Start / ad | No verified AI-direct Start binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Start / selected | No verified AI-direct Start binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase budget / campaign | No verified AI-direct Increase budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase budget / adset | No verified AI-direct Increase budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase budget / ad | No verified AI-direct Increase budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase budget / selected | No verified AI-direct Increase budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Decrease budget / campaign | No verified AI-direct Decrease budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Decrease budget / adset | No verified AI-direct Decrease budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Decrease budget / ad | No verified AI-direct Decrease budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Decrease budget / selected | No verified AI-direct Decrease budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Set budget / campaign | No verified AI-direct Set budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Set budget / adset | No verified AI-direct Set budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Set budget / ad | No verified AI-direct Set budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Set budget / selected | No verified AI-direct Set budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / campaign | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / adset | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / ad | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / selected | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Add to name / campaign | PINTEREST_ADS_UPDATE_CAMPAIGNS(ad_account_id,updates=[{id:campaign ID,name:final name}]); modify marker once and read same campaign via LIST_CAMPAIGNS. |
| Add to name / adset | No verified AI-direct Add to name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Add to name / ad | No verified AI-direct Add to name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Add to name / selected | No verified AI-direct Add to name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Remove from name / campaign | PINTEREST_ADS_UPDATE_CAMPAIGNS(ad_account_id,updates=[{id:campaign ID,name:final name}]); modify marker once and read same campaign via LIST_CAMPAIGNS. |
| Remove from name / adset | No verified AI-direct Remove from name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Remove from name / ad | No verified AI-direct Remove from name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Remove from name / selected | No verified AI-direct Remove from name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
<!-- strategy-parameters:generated:end -->
