# TikTok Ads: scoped performance reviews

Use this reference for GMV Max, Smart+ material, ad benchmark, video-performance reviews, supported Smart+ delivery changes, and the specific campaign and budget operations below. These are distinct product families. The current channel tools do not provide a general integrated advertiser report or a general manual-campaign creation tool. For those requests, describe the missing coverage and use an authorized Ads Manager export or browser inspection if available.

Read [channel execution](channel-execution.md) for connections, target binding, operation status, and write authorization. The channel is `tiktok-ads`; the tool directory is `tiktok_ads`. Organic TikTok research does not expose the advertiser's account metrics. `B` below is `output.result.data` in the first successful CLI response.

## Strategy field lookup

Use [strategy execution](strategy-execution.md) for formulas. Select the actual
report family first: **manual campaigns**, **Smart+ materials**, or **GMV Max**.
Automation types `MANUAL`, `SMART_PLUS`, `UPGRADED_SMART_PLUS` describe a separate
structure distinction; do not infer one from a report label.

`TIKTOK_ADS_GET_SMART_PLUS_MATERIAL_REPORT` requires `report_type`,
`advertiser_id`, `dimensions`; `BREAKDOWN` additionally needs `start_date` and
`end_date`, with no `query_lifetime`. Its `B.rows[]` are open objects: inspect
actual keys, never assume a nested metrics path. Material totals are not an
arbitrary campaign/ad-group total.
`TIKTOK_ADS_GET_GMV_MAX_REPORT` requires `advertiser_id`, exactly one `store_ids`
entry, `dimensions`, `metrics`, `start_date`, `end_date`; read
`B.rows[].dimensions` and `B.rows[].metrics`. Manual campaign totals need an
authorized Ads Manager export when these reports do not cover the question.

| Metric | Tool | Field / interpretation |
| --- | --- | --- |
| Spend; impressions; clicks | `TIKTOK_ADS_GET_SMART_PLUS_MATERIAL_REPORT` | Request `spend`, `impressions`, `clicks`; map actual row keys, confirm currency/unit and material scope. |
| All CTR; link CTR; link CPC; CPM | `TIKTOK_ADS_GET_SMART_PLUS_MATERIAL_REPORT` | `ctr`, `cpc`, `cpm` exist, but Meta click definitions are not implied. Use verified click totals and units for common formulas; unresolved all/link distinction is unknown. |
| Event count; event cost; event value; ROAS | `TIKTOK_ADS_GET_SMART_PLUS_MATERIAL_REPORT` | Candidates include `conversion`, `complete_payment`, `purchase`, `form`, `sales_lead`, `app_install`, `total_purchase_value`, `complete_payment_roas`, and matching `cost_per_*` fields. Select the verified business event and matching attribution/value family; do not pair fields merely because both contain “purchase”. |
| GMV Max spend; orders; value; ROI | `TIKTOK_ADS_GET_GMV_MAX_REPORT` | `cost`, `orders`, `cost_per_order`, `gross_revenue`, `roi`; ROI can include organic/affiliate orders. `product_impressions`/`product_clicks` are product metrics, not general ad totals. Never relabel GMV Max ROI as paid-only ROAS. |
| Frequency | Export | Unknown in these report schemas; do not derive from impressions alone. |
| Budget; bid | `TIKTOK_ADS_LIST_CAMPAIGNS`, `TIKTOK_ADS_LIST_AD_GROUPS` | Require `advertiser_id`; `B.campaigns[].budget/budget_mode`, `B.ad_groups[].budget/budget_mode/bid_price/conversion_bid_price`. Verify units, budget period and bidding applicability before comparing/writing. |
| Age; active child counts | `TIKTOK_ADS_LIST_CAMPAIGNS`, `TIKTOK_ADS_LIST_AD_GROUPS`, `TIKTOK_ADS_LIST_ADS` | `B.campaigns[]`, `B.ad_groups[]`, `B.ads[]`: `create_time`, IDs, parents, `operation_status`, `secondary_status`. Count complete distinct children under the chosen parent and active-state definition; preserve pagination. |
| CAC/CPL/Target CPA; custom conversion rate | User configuration | Business targets/formula stay user-controlled; provider optimization goals are not substitutes. |

GMV Max dates use advertiser timezone; video report times use UTC and its curves
are not daily conversion totals. Keep each report's verified time/attribution
scope; resolve unknown Smart+ reporting timezone before comparing local days.
Use only [Smart+ delivery changes](#supported-smart-delivery-changes) for eligible
resources. [Upgraded Smart+ budgets](#change-the-budget-of-an-exact-upgraded-smart-ad-group)
distinguish immediate total budget from next-day daily budget; neither covers a
general manual campaign or Business Center spend control.

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

<!-- strategy-parameters:generated:start -->
## Prompt parameter bindings

These bindings are generated from the same internal parameter source as copied Strategy prompts. Use only the required metrics, dependencies, target and campaign type. These are semantic bindings, not replacement tool schemas.

When platform and campaign type match, use embedded parameters directly. Read this section only for a platform change, missing/inapplicable binding or actual tool conflict. Preserve user rules and thresholds; explain unsupported scope/actions and let the user choose an adjustment.

| Context | Parameters |
| --- | --- |
| smart | TIKTOK_ADS_GET_SMART_PLUS_MATERIAL_REPORT: advertiser_id, report_type=BREAKDOWN, dimensions, metrics, start_date/end_date; omit query_lifetime. B.rows[] has open keys, no assumed metrics wrapper. Verify reporting timezone/currency. Material scope is not a campaign/group aggregate. |
| gmv | TIKTOK_ADS_GET_GMV_MAX_REPORT: advertiser_id, exactly one store_ids entry, dimensions, metrics, start_date/end_date in advertiser timezone. Read B.rows[].metrics and dimensions; verify account-currency units. Orders/value include organic/affiliate contributions; not paid-only ROAS. |

| Metric / target / campaign type | Binding |
| --- | --- |
| CAC | User-set acquisition-cost ceiling, in account currency/customer; reuse the approved customer definition and value. |
| CPL | User-set lead-cost ceiling, in account currency/lead; distinct from observed Cost per lead. |
| Target CPA | User-set target acquisition cost in account currency/conversion; do not substitute the bidding target. |
| Conversion Rate | User-defined numerator/denominator and percent-or-ratio convention. Reuse the supplied formula; if absent, propose and confirm it before evaluation. |
| Time | Evaluation clock in the rule timezone; preserve explicit timezone and whole-week execution hours. |
| CBO Dynamic Budget | Target CPA × Active ad sets in campaign, in account currency; preserve the rule multiplier and budget owner. Inputs: Target CPA; Active ad sets in campaign. |
| Spend / smart-plus | Request spend; bind actual B.rows[] key, verified account-currency amount. Context: smart. |
| Spend / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Spend definition, scope, dates and units. |
| Spend / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Spend; read only that family’s relevant mapping. |
| Spend / gmv-max | cost → B.rows[].metrics.cost; GMV Max cost in verified currency units. Context: gmv. |
| Impressions / smart-plus | Request impressions; bind actual B.rows[] key, count. Context: smart. |
| Impressions / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Impressions definition, scope, dates and units. |
| Impressions / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Impressions; read only that family’s relevant mapping. |
| Impressions / gmv-max | No verified paid-ad Impressions mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| _clicks / smart-plus | Request clicks; bind actual B.rows[] key; verify all/link-click meaning. Context: smart. |
| _clicks / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact _clicks definition, scope, dates and units. |
| _clicks / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding _clicks; read only that family’s relevant mapping. |
| _clicks / gmv-max | No verified paid-ad _clicks mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| Frequency / smart-plus | No verified Smart+ material frequency field; require whole-window export. |
| Frequency / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Frequency definition, scope, dates and units. |
| Frequency / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Frequency; read only that family’s relevant mapping. |
| Frequency / gmv-max | No verified paid-ad Frequency mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| CTR / smart-plus | 100 × _clicks / Impressions for confirmed all-click scope; percentage points. Inputs: _clicks; Impressions. |
| CTR / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact CTR definition, scope, dates and units. |
| CTR / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding CTR; read only that family’s relevant mapping. |
| CTR / gmv-max | No verified paid-ad CTR mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| CTR (Link clicks) / smart-plus | 100 × _clicks / Impressions only for confirmed link-click scope; percentage points. Inputs: _clicks; Impressions. |
| CTR (Link clicks) / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact CTR (Link clicks) definition, scope, dates and units. |
| CTR (Link clicks) / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding CTR (Link clicks); read only that family’s relevant mapping. |
| CTR (Link clicks) / gmv-max | No verified paid-ad CTR (Link clicks) mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| CPC (Link) / smart-plus | Spend / _clicks only for verified link clicks; currency/click. Inputs: Spend; _clicks. |
| CPC (Link) / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact CPC (Link) definition, scope, dates and units. |
| CPC (Link) / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding CPC (Link); read only that family’s relevant mapping. |
| CPC (Link) / gmv-max | No verified paid-ad CPC (Link) mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| CPM / smart-plus | 1000 × Spend / Impressions; currency/1000 impressions. Inputs: Spend; Impressions. |
| CPM / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact CPM definition, scope, dates and units. |
| CPM / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding CPM; read only that family’s relevant mapping. |
| CPM / gmv-max | No verified paid-ad CPM mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| Purchases / smart-plus | Request complete_payment for web completed payments or purchase for the verified app event; resolve the selected event before use, never combine them; bind actual B.rows[] key and attribution; count. Context: smart. |
| Purchases / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Purchases definition, scope, dates and units. |
| Purchases / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Purchases; read only that family’s relevant mapping. |
| Purchases / gmv-max | orders → B.rows[].metrics.orders; includes attributed organic/affiliate orders. Use only if this order definition matches user intent; otherwise ask before replacing paid purchases. Context: gmv. |
| Website purchases / smart-plus | Request complete_payment, website completed-payment event; bind actual B.rows[] key and attribution; count. Context: smart. |
| Website purchases / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Website purchases definition, scope, dates and units. |
| Website purchases / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Website purchases; read only that family’s relevant mapping. |
| Website purchases / gmv-max | No verified paid-ad Website purchases mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| Mobile app purchases / smart-plus | Request purchase, verified app-purchase event; bind actual B.rows[] key and attribution; count. Context: smart. |
| Mobile app purchases / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Mobile app purchases definition, scope, dates and units. |
| Mobile app purchases / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Mobile app purchases; read only that family’s relevant mapping. |
| Mobile app purchases / gmv-max | No verified paid-ad Mobile app purchases mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| Mobile app installs / smart-plus | Request app_install, app-install event; bind actual B.rows[] key and attribution; count. Context: smart. |
| Mobile app installs / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Mobile app installs definition, scope, dates and units. |
| Mobile app installs / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Mobile app installs; read only that family’s relevant mapping. |
| Mobile app installs / gmv-max | No verified paid-ad Mobile app installs mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| Leads / smart-plus | Request form for the verified form event or sales_lead for the verified lead event; resolve the actual event, never combine them; bind actual B.rows[] key and attribution; count. Context: smart. |
| Leads / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Leads definition, scope, dates and units. |
| Leads / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Leads; read only that family’s relevant mapping. |
| Leads / gmv-max | No verified paid-ad Leads mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| Cost per purchase / smart-plus | Spend / Purchases; currency/event at matching material scope. Inputs: Spend; Purchases. |
| Cost per purchase / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Cost per purchase definition, scope, dates and units. |
| Cost per purchase / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Cost per purchase; read only that family’s relevant mapping. |
| Cost per purchase / gmv-max | cost_per_order → B.rows[].metrics.cost_per_order, or cost/orders; currency/order, only when the user accepts the GMV Max order definition. Inputs: Spend; Purchases. Context: gmv. |
| Cost per website purchase / smart-plus | Spend / Website purchases; currency/event at matching material scope. Inputs: Spend; Website purchases. |
| Cost per website purchase / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Cost per website purchase definition, scope, dates and units. |
| Cost per website purchase / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Cost per website purchase; read only that family’s relevant mapping. |
| Cost per website purchase / gmv-max | No verified paid-ad Cost per website purchase mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| Cost per lead / smart-plus | Spend / Leads; currency/event at matching material scope. Inputs: Spend; Leads. |
| Cost per lead / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Cost per lead definition, scope, dates and units. |
| Cost per lead / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Cost per lead; read only that family’s relevant mapping. |
| Cost per lead / gmv-max | No verified paid-ad Cost per lead mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| Cost per mobile app purchase / smart-plus | Spend / Mobile app purchases; currency/event at matching material scope. Inputs: Spend; Mobile app purchases. |
| Cost per mobile app purchase / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Cost per mobile app purchase definition, scope, dates and units. |
| Cost per mobile app purchase / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Cost per mobile app purchase; read only that family’s relevant mapping. |
| Cost per mobile app purchase / gmv-max | No verified paid-ad Cost per mobile app purchase mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| Cost per mobile app install / smart-plus | Spend / Mobile app installs; currency/event at matching material scope. Inputs: Spend; Mobile app installs. |
| Cost per mobile app install / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Cost per mobile app install definition, scope, dates and units. |
| Cost per mobile app install / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Cost per mobile app install; read only that family’s relevant mapping. |
| Cost per mobile app install / gmv-max | No verified paid-ad Cost per mobile app install mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| Website purchase ROAS / smart-plus | Request complete_payment_roas; bind actual B.rows[] key, ratio for the verified completed-payment attribution; no daily averaging. Context: smart. |
| Website purchase ROAS / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Website purchase ROAS definition, scope, dates and units. |
| Website purchase ROAS / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Website purchase ROAS; read only that family’s relevant mapping. |
| Website purchase ROAS / gmv-max | No verified paid-ad Website purchase ROAS mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| Purchase ROAS / smart-plus | For a verified web-payment goal use complete_payment_roas; app-value requires a matching app-purchase attribution/value family. Do not pair total_purchase_value with purchase merely by name. Unresolved event scope needs confirmation. Context: smart. |
| Purchase ROAS / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Purchase ROAS definition, scope, dates and units. |
| Purchase ROAS / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Purchase ROAS; read only that family’s relevant mapping. |
| Purchase ROAS / gmv-max | roi → B.rows[].metrics.roi, gross_revenue/cost. This is organic-inclusive GMV Max ROI, not paid-only ROAS; preserve threshold and ask user whether to change the metric definition. Inputs: Spend. Context: gmv. |
| Mobile app purchase ROAS / smart-plus | Request total_purchase_value only with a verified matching app-purchase count/attribution family, then divide account-currency value by Spend. Do not assume it matches purchase; unresolved family remains unknown. Inputs: Spend; Mobile app purchases. Context: smart. |
| Mobile app purchase ROAS / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Mobile app purchase ROAS definition, scope, dates and units. |
| Mobile app purchase ROAS / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Mobile app purchase ROAS; read only that family’s relevant mapping. |
| Mobile app purchase ROAS / gmv-max | No verified paid-ad Mobile app purchase ROAS mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| Leads value / smart-plus | Use approved CRM/monetary lead value for the same event and attribution; no fixed lead-value field in this mapping. Inputs: Leads. |
| Leads value / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact Leads value definition, scope, dates and units. |
| Leads value / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding Leads value; read only that family’s relevant mapping. |
| Leads value / gmv-max | No verified paid-ad Leads value mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| ROAS (Leads) / smart-plus | Leads value / Spend; ratio. Inputs: Leads value; Spend. |
| ROAS (Leads) / manual | No integrated manual-campaign metric report in this directory; use an authorized Ads Manager export with exact ROAS (Leads) definition, scope, dates and units. |
| ROAS (Leads) / unspecified | Resolve actual manual/Smart+/GMV Max campaign type before binding ROAS (Leads); read only that family’s relevant mapping. |
| ROAS (Leads) / gmv-max | No verified paid-ad ROAS (Leads) mapping for GMV Max; product totals/organic-inclusive ROI cannot replace this metric. Explain the mismatch and ask the user before changing event/scope. |
| Daily budget / campaign | TIKTOK_ADS_LIST_CAMPAIGNS(advertiser_id): B.campaigns[].budget/budget_mode; verify currency units and daily period. |
| Daily budget / adset | TIKTOK_ADS_LIST_AD_GROUPS(advertiser_id): B.ad_groups[].budget/budget_mode; verify units, period and CBO ownership. Upgraded Smart+ needs TIKTOK_ADS_LIST_SMART_PLUS_ADGROUPS with exact adgroup_ids for current/scheduled controls. |
| Daily budget / ad | No ad-owned daily budget; ask user to resolve budget owner. |
| Daily budget / selected | Resolve actual budget-owning campaign/ad group before selecting budget and budget_mode. |
| Bid amount | TIKTOK_ADS_LIST_AD_GROUPS(advertiser_id): B.ad_groups[].bid_price/conversion_bid_price; choose only the applicable bidding event/mode, verify units. No general bid-write binding. |
| Hours since creation | TIKTOK_ADS_LIST_CAMPAIGNS/LIST_AD_GROUPS/LIST_ADS(advertiser_id): B.campaigns[]/ad_groups[]/ads[].create_time for the exact object; resolve timezone, then (now−creation)/3600 hours. |
| Ads in ad set | TIKTOK_ADS_LIST_ADS(advertiser_id): count distinct B.ads[] IDs under exact parent; complete pagination, never count a partial first page. |
| Active ads in ad set | TIKTOK_ADS_LIST_ADS(advertiser_id): count distinct B.ads[] IDs under exact parent; use agreed operation_status/secondary_status active definition; complete pagination, never count a partial first page. |
| Active ad sets in campaign | TIKTOK_ADS_LIST_AD_GROUPS(advertiser_id): count distinct B.ad_groups[] IDs under exact parent; use agreed operation_status/secondary_status active definition; complete pagination, never count a partial first page. |

| Action / target / campaign type | Binding |
| --- | --- |
| Notify | Return matching values here; external delivery requires the user-selected destination and sending capability. |
| Duplicate | No verified exact-duplication binding for this target. Preserve source/copy count and let the user choose manual duplication or another supported operation; creation alone is not duplication. |
| Pause / campaign / smart-plus | TIKTOK_ADS_SET_SMART_PLUS_DELIVERY_STATUS(advertiser_id,resource_type=CAMPAIGN,resource_ids=[exact IDs],operation_status=DISABLE); independently list the same resource type and verify operation_status. |
| Pause / campaign / manual | No general manual-campaign status operation; explain and ask user to select manual execution, preserving exact target. |
| Pause / campaign / gmv-max | Smart+ delivery status does not establish GMV Max support. Verify relevant GMV Max operation or ask for manual execution; never substitute Smart+. |
| Pause / campaign / unspecified | Resolve campaign type before status-tool selection; no generic TikTok status action is established. |
| Pause / adset / smart-plus | TIKTOK_ADS_SET_SMART_PLUS_DELIVERY_STATUS(advertiser_id,resource_type=ADGROUP,resource_ids=[exact IDs],operation_status=DISABLE); independently list the same resource type and verify operation_status. |
| Pause / adset / manual | No general manual-campaign status operation; explain and ask user to select manual execution, preserving exact target. |
| Pause / adset / gmv-max | Smart+ delivery status does not establish GMV Max support. Verify relevant GMV Max operation or ask for manual execution; never substitute Smart+. |
| Pause / adset / unspecified | Resolve campaign type before status-tool selection; no generic TikTok status action is established. |
| Pause / ad / smart-plus | TIKTOK_ADS_SET_SMART_PLUS_DELIVERY_STATUS(advertiser_id,resource_type=AD,resource_ids=[exact IDs],operation_status=DISABLE); independently list the same resource type and verify operation_status. |
| Pause / ad / manual | No general manual-campaign status operation; explain and ask user to select manual execution, preserving exact target. |
| Pause / ad / gmv-max | Smart+ delivery status does not establish GMV Max support. Verify relevant GMV Max operation or ask for manual execution; never substitute Smart+. |
| Pause / ad / unspecified | Resolve campaign type before status-tool selection; no generic TikTok status action is established. |
| Pause / selected | No verified AI-direct Pause binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Start / campaign / smart-plus | TIKTOK_ADS_SET_SMART_PLUS_DELIVERY_STATUS(advertiser_id,resource_type=CAMPAIGN,resource_ids=[exact IDs],operation_status=ENABLE); independently list the same resource type and verify operation_status. |
| Start / campaign / manual | No general manual-campaign status operation; explain and ask user to select manual execution, preserving exact target. |
| Start / campaign / gmv-max | Smart+ delivery status does not establish GMV Max support. Verify relevant GMV Max operation or ask for manual execution; never substitute Smart+. |
| Start / campaign / unspecified | Resolve campaign type before status-tool selection; no generic TikTok status action is established. |
| Start / adset / smart-plus | TIKTOK_ADS_SET_SMART_PLUS_DELIVERY_STATUS(advertiser_id,resource_type=ADGROUP,resource_ids=[exact IDs],operation_status=ENABLE); independently list the same resource type and verify operation_status. |
| Start / adset / manual | No general manual-campaign status operation; explain and ask user to select manual execution, preserving exact target. |
| Start / adset / gmv-max | Smart+ delivery status does not establish GMV Max support. Verify relevant GMV Max operation or ask for manual execution; never substitute Smart+. |
| Start / adset / unspecified | Resolve campaign type before status-tool selection; no generic TikTok status action is established. |
| Start / ad / smart-plus | TIKTOK_ADS_SET_SMART_PLUS_DELIVERY_STATUS(advertiser_id,resource_type=AD,resource_ids=[exact IDs],operation_status=ENABLE); independently list the same resource type and verify operation_status. |
| Start / ad / manual | No general manual-campaign status operation; explain and ask user to select manual execution, preserving exact target. |
| Start / ad / gmv-max | Smart+ delivery status does not establish GMV Max support. Verify relevant GMV Max operation or ask for manual execution; never substitute Smart+. |
| Start / ad / unspecified | Resolve campaign type before status-tool selection; no generic TikTok status action is established. |
| Start / selected | No verified AI-direct Start binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase budget / campaign | No verified AI-direct Increase budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase budget / adset / smart-plus | TIKTOK_ADS_UPDATE_SMART_PLUS_ADGROUP_BUDGETS(advertiser_id,scheduled_budget=[{adgroup_id,scheduled_budget:final amount}]) changes next-day daily budget, not immediate daily budget. Upgraded Smart+ only; CBO needs existing min/max controls and may mean maximum control. Verify units and user timing/ownership choice. Read same IDs via LIST_SMART_PLUS_ADGROUPS. |
| Increase budget / adset / manual | No general manual ad-group budget write; preserve exact calculated amount and ask user to choose manual execution. |
| Increase budget / adset / gmv-max | No verified GMV Max ad-group daily-budget write in this mapping; do not apply Upgraded Smart+ controls. |
| Increase budget / adset / unspecified | Resolve campaign type, budget owner, unit and effective date before choosing a budget action. |
| Increase budget / ad | No verified AI-direct Increase budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase budget / selected | No verified AI-direct Increase budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Decrease budget / campaign | No verified AI-direct Decrease budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Decrease budget / adset / smart-plus | TIKTOK_ADS_UPDATE_SMART_PLUS_ADGROUP_BUDGETS(advertiser_id,scheduled_budget=[{adgroup_id,scheduled_budget:final amount}]) changes next-day daily budget, not immediate daily budget. Upgraded Smart+ only; CBO needs existing min/max controls and may mean maximum control. Verify units and user timing/ownership choice. Read same IDs via LIST_SMART_PLUS_ADGROUPS. |
| Decrease budget / adset / manual | No general manual ad-group budget write; preserve exact calculated amount and ask user to choose manual execution. |
| Decrease budget / adset / gmv-max | No verified GMV Max ad-group daily-budget write in this mapping; do not apply Upgraded Smart+ controls. |
| Decrease budget / adset / unspecified | Resolve campaign type, budget owner, unit and effective date before choosing a budget action. |
| Decrease budget / ad | No verified AI-direct Decrease budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Decrease budget / selected | No verified AI-direct Decrease budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Set budget / campaign | No verified AI-direct Set budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Set budget / adset / smart-plus | TIKTOK_ADS_UPDATE_SMART_PLUS_ADGROUP_BUDGETS(advertiser_id,scheduled_budget=[{adgroup_id,scheduled_budget:final amount}]) changes next-day daily budget, not immediate daily budget. Upgraded Smart+ only; CBO needs existing min/max controls and may mean maximum control. Verify units and user timing/ownership choice. Read same IDs via LIST_SMART_PLUS_ADGROUPS. |
| Set budget / adset / manual | No general manual ad-group budget write; preserve exact calculated amount and ask user to choose manual execution. |
| Set budget / adset / gmv-max | No verified GMV Max ad-group daily-budget write in this mapping; do not apply Upgraded Smart+ controls. |
| Set budget / adset / unspecified | Resolve campaign type, budget owner, unit and effective date before choosing a budget action. |
| Set budget / ad | No verified AI-direct Set budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Set budget / selected | No verified AI-direct Set budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / campaign | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / adset | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / ad | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / selected | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Add to name / campaign | No verified AI-direct Add to name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Add to name / adset | No verified AI-direct Add to name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Add to name / ad | No verified AI-direct Add to name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Add to name / selected | No verified AI-direct Add to name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Remove from name / campaign | No verified AI-direct Remove from name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Remove from name / adset | No verified AI-direct Remove from name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Remove from name / ad | No verified AI-direct Remove from name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Remove from name / selected | No verified AI-direct Remove from name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
<!-- strategy-parameters:generated:end -->
