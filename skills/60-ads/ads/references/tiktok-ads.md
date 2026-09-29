# TikTok Ads: scoped performance reviews

Use this reference for GMV Max, Smart+ material, ad benchmark, video-performance reviews, supported Smart+ delivery changes, and the specific campaign and budget operations below. These are distinct product families. The current channel tools do not provide a general integrated advertiser report or a general manual-campaign creation tool. For those requests, describe the missing coverage and use an authorized Ads Manager export or browser inspection if available.

Read [channel execution](channel-execution.md) for connections, target binding, operation status, and write authorization. The channel is `tiktok-ads`; the tool directory is `tiktok_ads`. Organic TikTok research does not expose the advertiser's account metrics. `B` below is `output.result.data` in the first successful CLI response.

## Choose the question and establish the account

Choose the smallest report that answers the actual business question:

| Question | Suitable source | What it cannot establish |
| --- | --- | --- |
| How are a particular shop's GMV Max campaigns performing? | `TIKTOK_ADS_GET_GMV_MAX_REPORT` | Ordinary paid-only ROAS or all advertiser activity. |
| Which Smart+ materials deserve another test? | `TIKTOK_ADS_GET_SMART_PLUS_MATERIAL_REPORT` | A causal creative winner across unequal delivery, or manual campaign totals. |
| How does a selected ad group/campaign/ad compare with a benchmark? | `TIKTOK_ADS_GET_AD_BENCHMARK_REPORT` | A universal target or evidence of profitability. |
| Where does a video lose attention? | `TIKTOK_ADS_GET_VIDEO_PERFORMANCE_REPORT` plus the actual video | A daily conversion report or proof of why a viewer left. |

Begin with known authorized IDs. If discovery is needed, call `TIKTOK_ADS_LIST_BUSINESS_CENTERS`, then `TIKTOK_ADS_LIST_BUSINESS_CENTER_ADVERTISERS` with a returned `business_center_id`. The first response contains `B.business_centers[].bc_info.bc_id`; the second contains `B.advertiser_accounts[].asset_id`. Access is scoped to those Business Centers, not proof that every advertiser belonging to the user was found. These discovery lists accept `page_size` up to 50 and return `has_more`/`next_cursor`.

`TIKTOK_ADS_GET_ADVERTISER_ACCOUNTS` requires `advertiser_ids`; it is not an empty-input account discovery tool. Save `tiktok-account.json`:

<!-- tool-input: TIKTOK_ADS_GET_ADVERTISER_ACCOUNTS -->
```json
{
  "advertiser_ids": ["7000000000000000001"],
  "fields": ["advertiser_id", "name", "currency", "timezone", "status"]
}
```

```sh
postplus channels tools show TIKTOK_ADS_GET_ADVERTISER_ACCOUNTS --json
postplus channels tools run TIKTOK_ADS_GET_ADVERTISER_ACCOUNTS --connection "<connection-id>" --input-file tiktok-account.json --operation-id "<account-operation-id>" --wait --json > tiktok-account-result.json
```

Read `B.advertiser_accounts[]` to verify name, currency, time zone, and status. All identifiers and dates here are format examples; replace them before use. List structures with `TIKTOK_ADS_LIST_CAMPAIGNS`, `TIKTOK_ADS_LIST_AD_GROUPS`, and `TIKTOK_ADS_LIST_ADS`, each with `advertiser_id`. Outputs are respectively `B.campaigns[]`, `B.ad_groups[]`, and `B.ads[]`.

Keep `MANUAL`, `SMART_PLUS`, and `UPGRADED_SMART_PLUS` scopes distinct using `campaign_automation_type` where appropriate. Record actual IDs, parents, objective, configured `operation_status`, and delivery/review `secondary_status`. A free-form `fields` input does not prove every requested field will be returned. Read pagination from `has_more` and pass `next_cursor` unchanged; preserve the other filters. A missing cursor while more rows are claimed is incomplete coverage, not an excuse to infer the rest. For Upgraded Smart+ ad-level IDs, `LIST_ADS` uses `current_ad_ids`, not the legacy creative-ID `ad_ids`; do not supply both.

## GMV Max: a shop-scoped business result

Use only with a verified GMV-Max-eligible Shop and exactly one `store_ids` entry. Confirm whether the task concerns Product or LIVE; do not infer shop access from advertiser access. Save `tiktok-gmv.json`:

<!-- tool-input: TIKTOK_ADS_GET_GMV_MAX_REPORT -->
```json
{
  "advertiser_id": "7000000000000000001",
  "store_ids": ["7000000000000000002"],
  "dimensions": ["campaign_id", "stat_time_day"],
  "metrics": ["cost", "orders", "gross_revenue", "roi"],
  "start_date": "2026-09-14",
  "end_date": "2026-09-20",
  "filtering": {"gmv_max_promotion_types": ["PRODUCT"]},
  "enable_total_metrics": true,
  "page_size": 100
}
```

```sh
postplus channels tools show TIKTOK_ADS_GET_GMV_MAX_REPORT --json
postplus channels tools run TIKTOK_ADS_GET_GMV_MAX_REPORT --connection "<connection-id>" --target-id 7000000000000000001 --target-path advertiser_id --input-file tiktok-gmv.json --operation-id "<gmv-operation-id>" --wait --json > tiktok-gmv-result.json
```

The inclusive dates use the ad-account time zone. Read `B.rows[].dimensions` and `B.rows[].metrics`; numeric values may be strings. Preserve metric names: this request uses `cost`, not `spend`. Follow `B.has_more`/`B.next_cursor`. `B.total_metrics`, when returned, covers all matching pages; do not add it again for every page or combine it with the same rows' totals.

GMV Max ROI can include applicable organic and affiliate orders. Label the result with that attribution scope; never present it as ordinary paid-only ROAS or incremental revenue. Compare cost, orders, revenue, and ROI within the same shop/promotion family and comparable windows. A high ROI alongside falling orders may reflect reduced scale; rising gross revenue does not establish contribution margin after returns, discounts, commissions, and product costs. Link profitability questions to [payback](payback.md).

If diagnosing individual products, live rooms, or creatives, inspect `show` for that report's compatible dimensions and metrics first. A product-level metric is not automatically meaningful for LIVE. Do not blend `all_shops_*` figures with one-shop totals.

## Smart+ materials: distinguish opportunity from quality

Use the combined `TIKTOK_ADS_GET_SMART_PLUS_MATERIAL_REPORT`; its `report_type` selects `OVERVIEW` or `BREAKDOWN`. Do not use older separate overview/breakdown tools. Save `tiktok-materials.json`:

<!-- tool-input: TIKTOK_ADS_GET_SMART_PLUS_MATERIAL_REPORT -->
```json
{
  "report_type": "BREAKDOWN",
  "advertiser_id": "7000000000000000001",
  "dimensions": ["main_material_id", "stat_time_day"],
  "campaign_ids": ["7000000000000000003"],
  "metrics": ["spend", "impressions", "clicks", "conversion", "cost_per_conversion"],
  "start_date": "2026-09-14",
  "end_date": "2026-09-20",
  "page_size": 100
}
```

```sh
postplus channels tools show TIKTOK_ADS_GET_SMART_PLUS_MATERIAL_REPORT --json
postplus channels tools run TIKTOK_ADS_GET_SMART_PLUS_MATERIAL_REPORT --connection "<connection-id>" --target-id 7000000000000000001 --target-path advertiser_id --input-file tiktok-materials.json --operation-id "<material-operation-id>" --wait --json > tiktok-materials-result.json
```

`BREAKDOWN` needs start/end dates and forbids `query_lifetime`, even `false`; `page_size` is at most 100. `OVERVIEW` has different dimension/metric rules; inspect its branch before changing the report type. Do not add Meta attribution-window fields to this request.

The output promises `B.rows[]`, but individual rows are open objects. Inspect and document the actual keys before parsing; do not assume GMV Max's nested `dimensions`/`metrics` shape. Preserve absent values as unknown. Follow `has_more`/`next_cursor` and retain any `page_info` as completeness evidence. `conversion` is the reported event scope; it is not automatically a purchase, a qualified lead, or a unique customer.

Use the material table to separate three decisions:

1. **Insufficient exposure:** a material with little spend or few impressions has not had the same opportunity as a top-spend material. Report it as untested or weakly tested, not a proven loser.
2. **Attention problem:** adequate exposure with weak comparable click/watch results suggests inspecting the opening, clarity, or visual pacing. Verify the actual media before assigning a cause.
3. **Downstream problem:** acceptable attention with weak mature outcomes suggests offer, destination, audience fit, or event problems. Join to the destination and measurement evidence rather than automatically rewriting the hook.

Group by real material ID before comparing variants. Document repeated use across ads and campaigns; a material's aggregated performance may reflect several audiences or destinations. Use matched objectives and conversion definitions and the weighted ratios in [performance reporting](performance-report.md). Do not average row CPAs, and do not treat an algorithmic ranking as a randomized experiment.

## Benchmarks and video curves have different response shapes

`TIKTOK_ADS_GET_AD_BENCHMARK_REPORT` needs `advertiser_id`, `dimensions`, and `filtering` with exactly one ID scope: `ad_ids`, `adgroup_ids`, or `campaign_ids`. Some dimension and metric fields remain open vocabularies. Use only values established by the current tool or a successful response; never invent a full benchmark taxonomy. Inspect `B.code` and `B.message` before reading `B.data.list`, which may be an object or an array. Its `B.data.page_info` controls page iteration. Preserve the comparison date/window and peer scope; an unattributed benchmark cannot set the user's allowable acquisition cost.

For a bounded video query, save `tiktok-video.json`:

<!-- tool-input: TIKTOK_ADS_GET_VIDEO_PERFORMANCE_REPORT -->
```json
{
  "advertiser_id": "7000000000000000001",
  "report_type": "VIDEO",
  "filtering": {
    "video_ids": ["verified-video-id"],
    "lifetime": false,
    "start_time": "2026-09-14 00:00:00",
    "end_time": "2026-09-20 23:59:59"
  },
  "page": 1,
  "page_size": 100
}
```

```sh
postplus channels tools show TIKTOK_ADS_GET_VIDEO_PERFORMANCE_REPORT --json
postplus channels tools run TIKTOK_ADS_GET_VIDEO_PERFORMANCE_REPORT --connection "<connection-id>" --target-id 7000000000000000001 --target-path advertiser_id --input-file tiktok-video.json --operation-id "<video-operation-id>" --wait --json > tiktok-video-result.json
```

These video date filters are UTC, unlike the GMV Max account-date window. Only `VIDEO` mode supports the bounded times and `lifetime`; `AD` mode does not. The optional sort enum is `ASC` or `DES`, not `DESC`. Inspect `B.code`/`B.message`, then `B.data.list` and its `info`/`metrics`. Metric arrays describe in-second performance, not daily totals; preserve the returned metric name and time positions rather than summing the curve. Follow `B.data.page_info` with `page` increments. If a nonzero code, missing shape, or unsupported field is returned, report the exact failure without changing the query silently.

To turn a curve into a creative brief, examine the actual video at the drop point, identify the visible/audible change, and propose one test. A fall during the opening can motivate an earlier demonstration; a later drop may motivate shorter explanation or earlier proof. Record this as a hypothesis, with the next video's comparable metric and observation window. Cross-platform video view definitions differ; do not align them into a single completion-rate column without matching definitions.

## Supported Smart+ delivery changes

For a requested status change, verify advertiser ownership, Smart+ type, actual resource IDs, present status, and desired status. The supported tool is `TIKTOK_ADS_SET_SMART_PLUS_DELIVERY_STATUS`, with `resource_type` `CAMPAIGN`, `ADGROUP`, or `AD`, 1–20 `resource_ids`, and `operation_status` `DISABLE`/`ENABLE`.

Example `tiktok-disable.json`, only after the exact campaign change is authorized:

<!-- tool-input: TIKTOK_ADS_SET_SMART_PLUS_DELIVERY_STATUS -->
```json
{
  "advertiser_id": "7000000000000000001",
  "resource_type": "CAMPAIGN",
  "resource_ids": ["7000000000000000003"],
  "operation_status": "DISABLE"
}
```

```sh
postplus channels tools show TIKTOK_ADS_SET_SMART_PLUS_DELIVERY_STATUS --json
postplus channels tools run TIKTOK_ADS_SET_SMART_PLUS_DELIVERY_STATUS --connection "<connection-id>" --target-id 7000000000000000001 --target-path advertiser_id --input-file tiktok-disable.json --operation-id "<disable-operation-id>" --wait --json > tiktok-disable-result.json
```

Inspect `B.code`, `B.message`, and any per-resource outcome in `B.data`; do not infer that every requested ID changed from an empty object. Independently read each same-type resource through its corresponding list tool with the precise ID filters and verify `operation_status`. Keep delivery/review state separate. An unknown operation is resolved by status lookup and readback, not a new write identity. Enabling later cannot undo missed delivery while disabled.

This is not a general manual-campaign status tool. Do not use a parent campaign to approximate an unsupported child change. Do not repurpose Business Center advertiser-budget controls as campaign budgets.

## Create a reviewed Smart+ campaign

`TIKTOK_ADS_CREATE_SMART_PLUS_CAMPAIGN` creates a **disabled** Smart+ campaign;
it is not a general manual-campaign creator. Confirm the advertiser, objective,
name, destination, applicable app/catalog prerequisites, and any campaign
budget with the user. Use an actual `objective_type` supported by `show`; do
not invent a generic conversion objective. This minimal lead-generation
example omits optional budget because an unspecified amount is not spending
authorization:

<!-- tool-input: TIKTOK_ADS_CREATE_SMART_PLUS_CAMPAIGN -->
```json
{"advertiser_id":"7000000000000000001","campaign_name":"<approved name>","objective_type":"LEAD_GENERATION","operation_status":"DISABLE","request_id":"<stable provider request ID>"}
```

```sh
postplus channels tools show TIKTOK_ADS_CREATE_SMART_PLUS_CAMPAIGN --json
postplus channels tools run TIKTOK_ADS_CREATE_SMART_PLUS_CAMPAIGN --connection "<connection-id>" --target-id 7000000000000000001 --target-path advertiser_id --input-file tiktok-smart-create.json --operation-id "<create-operation-id>" --wait --json > tiktok-smart-create-result.json
```

The provider `request_id` and CLI `--operation-id` are distinct; retain both
for this one logical creation. Inspect the first response's `B.request_id` and
open `B.data` for the returned campaign ID and state. Independently call
`TIKTOK_ADS_LIST_SMART_PLUS_CAMPAIGNS` with the same advertiser and a precise
`filtering.campaign_ids` when an ID is returned. If there is no ID, a name
search may be ambiguous: do not claim creation verified or issue another
create under a new ID. Disabled creation is not authority to enable the
campaign; enabling is a separate action with its own spending consequence.

GMV Max creation is a different task and requires a verified Shop. The fixed
`TIKTOK_ADS_CREATE_GMV_MAX_CAMPAIGN` input requires `advertiser_id`,
`campaign_name`, `store_id`, `store_authorized_bc_id`, `shopping_ads_type`
(`PRODUCT` or `LIVE`), `optimization_goal`, `deep_bid_type`, `schedule_type`,
`schedule_start_time`, and a stable provider `request_id`. For the current
contract, `optimization_goal` is `VALUE` and `deep_bid_type` is
`VO_MIN_ROAS`; budget, ROAS bid, product selection and schedule end depend on
the actual Shop and user-approved plan. For a verified PRODUCT Shop campaign,
the schema shape is:

<!-- tool-input: TIKTOK_ADS_CREATE_GMV_MAX_CAMPAIGN -->
```json
{"advertiser_id":"7000000000000000001","campaign_name":"<approved name>","store_id":"7000000000000000002","store_authorized_bc_id":"7000000000000000005","shopping_ads_type":"PRODUCT","optimization_goal":"VALUE","deep_bid_type":"VO_MIN_ROAS","schedule_type":"SCHEDULE_START_END","schedule_start_time":"2026-10-01 00:00:00","schedule_end_time":"2026-10-08 00:00:00","request_id":"<stable provider request ID>"}
```

These dates and IDs are synthetic; replace them with provider-valid times in
the advertiser's timezone and actual authorized Shop identities. Inspect
`postplus channels tools show TIKTOK_ADS_CREATE_GMV_MAX_CAMPAIGN --json`
before preparing any budget, bid, product or identity fields. Unlike Smart+
creation, this tool does not guarantee a disabled initial state. Do not
submit until the intended initial delivery/spend behavior, Shop authorization,
all required values and the user's approval are established. Then preserve
one provider `request_id` and one CLI operation ID:

```sh
postplus channels tools show TIKTOK_ADS_CREATE_GMV_MAX_CAMPAIGN --json
postplus channels tools run TIKTOK_ADS_CREATE_GMV_MAX_CAMPAIGN --connection "<connection-id>" --target-id 7000000000000000001 --target-path advertiser_id --input-file tiktok-gmv-create.json --operation-id "<gmv-create-operation-id>" --wait --json > tiktok-gmv-create-result.json
```

If the response returns an ID, use
`TIKTOK_ADS_GET_GMV_MAX_CAMPAIGN_INFO` with that `campaign_id` and advertiser
for an independent read; a create receipt alone is not evidence of delivery.

## Change the budget of an exact Upgraded Smart+ ad group

For “change this ad group's budget,” first read the exact ID with
`TIKTOK_ADS_LIST_SMART_PLUS_ADGROUPS` using `advertiser_id` and
`adgroup_ids`. Confirm campaign ownership, `budget_optimize_on`, current
budget mode/amount, account currency and the requested new total. The pinned
`TIKTOK_ADS_UPDATE_SMART_PLUS_ADGROUP_BUDGETS` has two different branches:
`budget` changes an **immediate total budget**; `scheduled_budget` changes a
**next-day daily budget**. Do not swap them. For CBO, scheduled changes have
additional min/max prerequisites. A Business Center's
`TIKTOK_ADS_UPDATE_ADVERTISER_BUDGETS` changes account-level spend controls,
not this ad group's budget. It requires a verified Business Center,
`advertiser_budgets[]` entries, `budget_mode`, and a specified
`budget_update_type` such as `UPDATE`; `RESET`, `INCREMENTAL_UPDATE`, and
`ONE_CLICK_SET` have different consequences. Only choose that tool for an
explicit **advertiser-level** spend-control request after reading the current
control and approved account-level amount. If the current value or unit cannot
be verified, stop rather than substitute an ad-group update.

After the user authorizes the exact amount and consequence, save a one-object
request. The number below is only a schema example, not a recommended amount:

<!-- tool-input: TIKTOK_ADS_UPDATE_SMART_PLUS_ADGROUP_BUDGETS -->
```json
{"advertiser_id":"7000000000000000001","budget":[{"adgroup_id":"7000000000000000004","budget":100}]}
```

```sh
postplus channels tools show TIKTOK_ADS_UPDATE_SMART_PLUS_ADGROUP_BUDGETS --json
postplus channels tools run TIKTOK_ADS_UPDATE_SMART_PLUS_ADGROUP_BUDGETS --connection "<connection-id>" --target-id 7000000000000000004 --target-path budget.0.adgroup_id --input-file tiktok-smart-budget.json --operation-id "<budget-operation-id>" --wait --json > tiktok-smart-budget-result.json
```

Inspect every returned result inside the open `B.data`, then re-read that
same ad group with `TIKTOK_ADS_LIST_SMART_PLUS_ADGROUPS`. Report configured
budget and effective delivery separately. A changed budget can alter spend;
an unknown result must be resolved under the original operation ID and exact
ad group, never by automatically sending a second update.

## Review output and remaining checks

Deliver the named report family, account/shop and object scope, dates/time zone, currency, conversion/revenue definition, pagination coverage, observed results, hypotheses, and the smallest next test. Include request/result files and change readbacks when applicable. Before proposing a launch, use [launch review](launch-review.md) for real asset rights, mobile destination, event evidence, schedule, and payment/account readiness; a connected account alone proves none of these.

Keep export jobs out of routine reporting unless explicitly needed. MMM and changelog exports create separate remote jobs whose readiness needs their own check/download calls; `--wait` completes one channel invocation, not the export's entire business lifecycle. Missing general metrics, failed permissions, and unsupported report combinations are explicit limitations, not zeros to fill in a report.
