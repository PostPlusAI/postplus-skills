# Reddit Ads: discover, measure, then change the exact campaign

Use this reference for a Reddit **paid** advertising account. Public Reddit
posts and comments are separate research evidence; organic posting uses the
Reddit social connection, not `reddit-ads`. Read [channel execution](channel-execution.md)
for authorization, operation recovery, and `B = output.result.data`. Inspect
each tool with `postplus channels tools show <slug> --json` before using it;
the examples below use synthetic IDs and dates, not a live-account assertion.

## Strategy field lookup

Use [strategy execution](strategy-execution.md) for formulas.
`B = output.result.data`. `REDDIT_ADS_GET_A_REPORT` requires `ad_account_id`
and `data.{starts_at,ends_at,fields}`. Read the open metric objects at
`B.data.metrics[]`; actual keys and units must be inspected. Use
`data.breakdowns` (`CAMPAIGN`, `AD_GROUP`, `AD`) and `data.filter` to keep the
intended object scope. Time boundaries are UTC ISO timestamps; reconcile
`data.time_zone_id` with the selected account's `time_zone_id`. Page using
literal `page.size`/`page.token` keys as described below.

| Metric | Tool | Field / interpretation |
| --- | --- | --- |
| Spend; impressions; platform clicks | `REDDIT_ADS_GET_A_REPORT` | Request `SPEND`, `IMPRESSIONS`, `CLICKS`; bind actual `B.data.metrics[]` keys. The schema does not establish the `SPEND` unit; verify before money comparisons. |
| All CTR; link CTR; link CPC; CPM | `REDDIT_ADS_GET_A_REPORT` | Request vocabulary includes `CTR`, `CPC`, `CPM`. Confirm the click meaning and rate/money units, or use verified totals. These are not automatically Meta all-click/link-click equivalents. |
| Event count; event cost; event value; ROAS | `REDDIT_ADS_GET_A_REPORT` | `CONVERSIONS` is documented, but event-specific/value keys remain open. Verify event, attribution and returned keys or use an export. Mixed conversions cannot stand for purchases/leads; missing value leaves ROAS unknown. |
| Frequency | Verified report/export | No typed frequency key in this contract; require an established whole-window metric, not an invented field. |
| Campaign budget | `REDDIT_ADS_LIST_CAMPAIGNS` | Require `ad_account_id`; read `B.data[].goal_type`, `goal_value`, `spend_cap`, `is_campaign_budget_optimization`. Daily/lifetime goal and lifetime spend cap differ; there is no `daily_budget` property. Read units are unspecified; campaign write `goal_value`/`spend_cap` use micros, with `goal_value` restricted to CBO. Verify source units before conversion. |
| Ad-group budget; bid | `REDDIT_ADS_LIST_AD_GROUPS` | Require `ad_account_id`; `B.data[].goal_type/goal_value/bid_value/bid_type/bid_strategy`. Budget units need verification. This read describes `bid_value` in cents; campaign writes describe their own `bid_value` in microcurrency. Never copy across objects/units. |
| Campaign bid | `REDDIT_ADS_LIST_CAMPAIGNS` | `B.data[].bid_value/bid_type/bid_strategy`; read unit unspecified. Verify unit and CBO applicability before a campaign bid update. |
| Age; active child counts | `REDDIT_ADS_LIST_CAMPAIGNS`, `REDDIT_ADS_LIST_AD_GROUPS`, `REDDIT_ADS_LIST_ADS` | Campaign/ad-group `B.data[]` have `created_at`, IDs, parents, `configured_status`, `effective_status`, `delivery_status`. Ad rows are open: establish those keys before counting. Complete pagination and parent matching are required; Max campaigns expose only one ad through `LIST_ADS`. |
| CAC/CPL/Target CPA; custom conversion rate | User configuration | User business targets/formula; `goal_value` is spend configuration, not acquisition cost. |

For status changes use [the exact campaign procedure](#pause-or-resume-one-confirmed-campaign).
`REDDIT_ADS_UPDATE_CAMPAIGN` requires `campaign_id` and `data`; campaign
`goal_value`/`bid_value` changes depend on CBO and existing configuration.
Do not replace a child action with a parent campaign action. If an intended
field/unit is unresolved, keep that evaluation unknown and provide the exact
manual/export requirement; other covered rules can still be evaluated.

## Select the business, account, and campaign

Use an active `reddit-ads` connection from `postplus channels list --json`.
If absent, use `postplus channels connect reddit-ads --json` and wait for the
returned connection ID. The connection, business ID, ad account ID, and
campaign ID are four different identities.

Start with businesses accessible to this connection:

<!-- tool-input: REDDIT_ADS_LIST_MY_BUSINESSES -->
```json
{"page_size":50}
```

```sh
postplus channels tools show REDDIT_ADS_LIST_MY_BUSINESSES --json
postplus channels tools run REDDIT_ADS_LIST_MY_BUSINESSES --connection "$ADS_REDDIT_CONNECTION" --input-file reddit-businesses.json --wait --json > reddit-businesses-result.json
```

Read `B.data[]`. For each relevant business ID, list
its accounts; use `B.pagination.next_url` to extract the returned
`page_token` when another page exists. Never treat the first page as complete.

<!-- tool-input: REDDIT_ADS_LIST_AD_ACCOUNTS_BY_BUSINESS -->
```json
{"business_id":"t2_business123","page_size":50}
```

```sh
postplus channels tools run REDDIT_ADS_LIST_AD_ACCOUNTS_BY_BUSINESS --connection "$ADS_REDDIT_CONNECTION" --target-id "$ADS_BUSINESS_ID" --target-path business_id --input-file reddit-accounts.json --wait --json > reddit-accounts-result.json
```

Choose an account using `B.data[].id`, `business_id`, name, currency,
and `time_zone_id`. If the user's intended account is ambiguous, resolve it
before running a report or changing anything. List campaigns under exactly
that account:

<!-- tool-input: REDDIT_ADS_LIST_CAMPAIGNS -->
```json
{"ad_account_id":"a2_account123","page_size":100}
```

```sh
postplus channels tools run REDDIT_ADS_LIST_CAMPAIGNS --connection "$ADS_REDDIT_CONNECTION" --target-id "$ADS_ACCOUNT_ID" --target-path ad_account_id --input-file reddit-campaigns.json --wait --json > reddit-campaigns-result.json
```

Read `B.data[]` and the `B.pagination.next_url` token. Retain the exact
campaign ID, `ad_account_id`, name, objective, `configured_status`,
`effective_status`, and `delivery_status`. Configured active does not mean
delivering. An empty account means there is no performance verdict to make.

## Get a dated report before making a diagnosis

Choose a complete, explicit UTC window; reconcile it with the account's
timezone before comparing a local business day. The pinned report tool needs
top-level `ad_account_id` and `data`, with `starts_at`, `ends_at`, and
`fields` inside `data`. Its pagination keys are literally `page.size` and
`page.token` at the top level, not nested objects.

<!-- tool-input: REDDIT_ADS_GET_A_REPORT -->
```json
{
  "ad_account_id":"a2_account123",
  "data":{
    "starts_at":"2026-09-14T00:00:00Z",
    "ends_at":"2026-09-20T23:59:59Z",
    "fields":["IMPRESSIONS","CLICKS","SPEND"],
    "breakdowns":["DATE","CAMPAIGN"],
    "time_zone_id":"UTC"
  },
  "page.size":100
}
```

```sh
postplus channels tools show REDDIT_ADS_GET_A_REPORT --json
postplus channels tools run REDDIT_ADS_GET_A_REPORT --connection "$ADS_REDDIT_CONNECTION" --target-id "$ADS_ACCOUNT_ID" --target-path ad_account_id --input-file reddit-report.json --wait --json > reddit-report-result.json
```

Read `B.data.metrics[]`, `B.data.metrics_updated_at`, and
`B.pagination.next_url`. Follow every page with the same range, fields,
and breakdowns, adding the returned `page.token`; stop if the token is
missing or repeats. Verify each returned `CAMPAIGN` is in the selected account
and each `DATE` is in the intended window. The raw `SPEND` unit must be
confirmed from the returned data/tool schema before converting it; do not
silently call it dollars. Missing metric values are not zero. A click or
conversion diagnosis also needs the campaign objective, destination and
event-quality evidence, not just the cheapest click.

For creative or community fit, use the applicable public Reddit research
route after the paid report: discover current posts, then inspect the real
comments of selected threads. Keep public discussion separate from the
account's paid delivery and never infer a targetable community ID from a
comment alone.

## Pause or resume one confirmed campaign

First re-read the exact campaign, using the campaign ID filter on the selected
account and checking that exactly one row has the expected ID, account, name,
and `configured_status`:

<!-- tool-input: REDDIT_ADS_LIST_CAMPAIGNS -->
```json
{"ad_account_id":"a2_account123","id":["2451508441785140582"],"page_size":100}
```

`REDDIT_ADS_UPDATE_CAMPAIGN` accepts many unrelated fields, including budget
and lifecycle changes. For a status request, send **only**
`data.configured_status` as `PAUSED` or `ACTIVE`; never send `ARCHIVED` or
`DELETED` to approximate a pause. `ACTIVE` may resume spending under the
existing budget. Confirm that the user's authorization covers this exact
campaign and consequence.

<!-- tool-input: REDDIT_ADS_UPDATE_CAMPAIGN -->
```json
{"campaign_id":"2451508441785140582","data":{"configured_status":"PAUSED"}}
```

```sh
postplus channels tools show REDDIT_ADS_UPDATE_CAMPAIGN --json
postplus channels tools run REDDIT_ADS_UPDATE_CAMPAIGN --connection "$ADS_REDDIT_CONNECTION" --target-id "$ADS_CAMPAIGN_ID" --target-path campaign_id --input-file reddit-pause.json --operation-id "$ADS_UPDATE_OPERATION_ID" --wait --json > reddit-pause-result.json
```

Check `B.data`: its ID, `ad_account_id`, and
`configured_status` must match. Then make a **new read**, not a duplicate
write, with `REDDIT_ADS_LIST_CAMPAIGNS` filtered by the same account and
campaign ID; compare its configured and effective/delivery statuses. The
write receipt alone is not independent verification. For an `unknown` result,
query `postplus channels tools run --status "$ADS_UPDATE_OPERATION_ID" --json`
and inspect the same campaign; do not submit a new write ID. The tool has no
compare-and-swap field: a matching pre-read cannot prevent a concurrent edit.
If the readback differs from the requested state, report the conflict rather
than applying another write automatically.

<!-- strategy-parameters:generated:start -->
## Prompt parameter bindings

These bindings are generated from the same internal parameter source as copied Strategy prompts. Use only the required metrics, dependencies, target and campaign type. These are semantic bindings, not replacement tool schemas.

When platform and campaign type match, use embedded parameters directly. Read this section only for a platform change, missing/inapplicable binding or actual tool conflict. Preserve user rules and thresholds; explain unsupported scope/actions and let the user choose an adjustment.

| Context | Parameters |
| --- | --- |
| report | REDDIT_ADS_GET_A_REPORT: ad_account_id, data.{starts_at,ends_at,fields,breakdowns,filter,time_zone_id}; UTC ISO boundaries aligned with account timezone; breakdown CAMPAIGN/AD_GROUP/AD for scope. B.data.metrics[] has open keys; bind returned keys, paginate literal page.size/page.token. |

| Metric / target / campaign type | Binding |
| --- | --- |
| CAC | User-set acquisition-cost ceiling, in account currency/customer; reuse the approved customer definition and value. |
| CPL | User-set lead-cost ceiling, in account currency/lead; distinct from observed Cost per lead. |
| Target CPA | User-set target acquisition cost in account currency/conversion; do not substitute the bidding target. |
| Conversion Rate | User-defined numerator/denominator and percent-or-ratio convention. Reuse the supplied formula; if absent, propose and confirm it before evaluation. |
| Time | Evaluation clock in the rule timezone; preserve explicit timezone and whole-week execution hours. |
| CBO Dynamic Budget | Target CPA × Active ad sets in campaign, in account currency; preserve the rule multiplier and budget owner. Inputs: Target CPA; Active ad sets in campaign. |
| Spend | Request SPEND; bind its actual key in B.data.metrics[] and verify currency/unit before comparison (no declared unit). Context: report. |
| Impressions | Request IMPRESSIONS; bind actual B.data.metrics[] key; count. Context: report. |
| _clicks | Request CLICKS; bind actual B.data.metrics[] key and click definition; not automatically all/link equivalents. Context: report. |
| CTR | 100 × _clicks / Impressions; percentage points only when all-click definition matches. Inputs: _clicks; Impressions. |
| CTR (Link clicks) | 100 × _clicks / Impressions only when the returned click definition matches link clicks; otherwise unknown. Inputs: _clicks; Impressions. |
| CPC (Link) | Spend / _clicks only for verified link clicks; currency/click after unit verification. Inputs: Spend; _clicks. |
| CPM | 1000 × Spend / Impressions; currency/1000 impressions after unit verification. Inputs: Spend; Impressions. |
| Purchases | CONVERSIONS is mixed; no fixed event-specific returned key for Purchases in this contract. Verify the exact event/count key and attribution in the relevant report section or supplied export; unresolved count stays unknown. Context: report. |
| Website purchases | CONVERSIONS is mixed; no fixed event-specific returned key for Website purchases in this contract. Verify the exact event/count key and attribution in the relevant report section or supplied export; unresolved count stays unknown. Context: report. |
| Leads | CONVERSIONS is mixed; no fixed event-specific returned key for Leads in this contract. Verify the exact event/count key and attribution in the relevant report section or supplied export; unresolved count stays unknown. Context: report. |
| Mobile app purchases | CONVERSIONS is mixed; no fixed event-specific returned key for Mobile app purchases in this contract. Verify the exact event/count key and attribution in the relevant report section or supplied export; unresolved count stays unknown. Context: report. |
| Mobile app installs | CONVERSIONS is mixed; no fixed event-specific returned key for Mobile app installs in this contract. Verify the exact event/count key and attribution in the relevant report section or supplied export; unresolved count stays unknown. Context: report. |
| Cost per purchase | Spend / Purchases; verified currency/event. Inputs: Spend; Purchases. |
| Cost per website purchase | Spend / Website purchases; verified currency/event. Inputs: Spend; Website purchases. |
| Cost per lead | Spend / Leads; verified currency/event. Inputs: Spend; Leads. |
| Cost per mobile app purchase | Spend / Mobile app purchases; verified currency/event. Inputs: Spend; Mobile app purchases. |
| Cost per mobile app install | Spend / Mobile app installs; verified currency/event. Inputs: Spend; Mobile app installs. |
| Leads value | No fixed event-value key; bind approved lead monetary value from the actual report/export with matching attribution; unknown if absent. Inputs: Leads. |
| Purchase ROAS | Verified monetary value for the same event as Purchases / Spend; ratio. Event-specific value key is unresolved in the open report schema; never use count as value. Inputs: Spend; Purchases. |
| Website purchase ROAS | Verified monetary value for the same event as Website purchases / Spend; ratio. Event-specific value key is unresolved in the open report schema; never use count as value. Inputs: Spend; Website purchases. |
| Mobile app purchase ROAS | Verified monetary value for the same event as Mobile app purchases / Spend; ratio. Event-specific value key is unresolved in the open report schema; never use count as value. Inputs: Spend; Mobile app purchases. |
| ROAS (Leads) | Verified monetary value for the same event as Leads / Spend; ratio. Event-specific value key is unresolved in the open report schema; never use count as value. Inputs: Spend; Leads. |
| Frequency | No typed frequency key; require verified same-scope whole-window report/export frequency. |
| Daily budget / campaign | REDDIT_ADS_LIST_CAMPAIGNS(ad_account_id): B.data[].goal_type/goal_value/is_campaign_budget_optimization; daily only for the verified daily goal type. Read amount units unspecified; spend_cap is a lifetime cap, not daily_budget. |
| Daily budget / adset | REDDIT_ADS_LIST_AD_GROUPS(ad_account_id): B.data[].goal_type/goal_value; confirm daily goal and raw unit. No daily_budget property. |
| Daily budget / ad | No ad-owned daily budget; resolve budget owner with user. |
| Daily budget / selected | Resolve campaign/group owner, goal_type and goal_value units before selecting a budget. |
| Bid amount / campaign | REDDIT_ADS_LIST_CAMPAIGNS: B.data[].bid_value/bid_type/bid_strategy; read unit unspecified; verify CBO applicability. |
| Bid amount / adset | REDDIT_ADS_LIST_AD_GROUPS: B.data[].bid_value is cents; divide by 100, currency/bid event. Verify bid_type/bid_strategy; never copy into campaign micros. |
| Bid amount / ad | No verified ad bid binding; do not substitute group bid. |
| Bid amount / selected | Resolve exact bid-owning object and unit. |
| Hours since creation | REDDIT_ADS_LIST_CAMPAIGNS/LIST_AD_GROUPS(ad_account_id): B.data[].created_at; (now−timestamp)/3600 hours. Ad rows are open; verify creation key before use. |
| Ads in ad set | REDDIT_ADS_LIST_ADS(ad_account_id): count distinct B.data[] IDs under exact parent; complete pagination.next_url pages. Ad rows are open and Max campaigns expose one ad only; verify coverage. |
| Active ads in ad set | REDDIT_ADS_LIST_ADS(ad_account_id): count distinct B.data[] IDs under exact parent; use configured_status/effective_status/delivery_status for agreed active definition; complete pagination.next_url pages. Ad rows are open and Max campaigns expose one ad only; verify coverage. |
| Active ad sets in campaign | REDDIT_ADS_LIST_AD_GROUPS(ad_account_id): count distinct B.data[] IDs under exact parent; use configured_status/effective_status/delivery_status for agreed active definition; complete pagination.next_url pages. Ad rows are open and Max campaigns expose one ad only; verify coverage. |

| Action / target / campaign type | Binding |
| --- | --- |
| Notify | Return matching values here; external delivery requires the user-selected destination and sending capability. |
| Duplicate | No verified exact-duplication binding for this target. Preserve source/copy count and let the user choose manual duplication or another supported operation; creation alone is not duplication. |
| Pause / campaign | REDDIT_ADS_UPDATE_CAMPAIGN(campaign_id,data={configured_status:PAUSED}); independently read same campaign with REDDIT_ADS_LIST_CAMPAIGNS(ad_account_id,id=[campaign_id]). |
| Pause / adset | No verified AI-direct Pause binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Pause / ad | No verified AI-direct Pause binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Pause / selected | No verified AI-direct Pause binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Start / campaign | REDDIT_ADS_UPDATE_CAMPAIGN(campaign_id,data={configured_status:ACTIVE}); independently read same campaign with REDDIT_ADS_LIST_CAMPAIGNS(ad_account_id,id=[campaign_id]). |
| Start / adset | No verified AI-direct Start binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Start / ad | No verified AI-direct Start binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Start / selected | No verified AI-direct Start binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase budget / campaign | REDDIT_ADS_UPDATE_CAMPAIGN(campaign_id,data={goal_value:final currency amount×1000000}); only verified CBO daily goal_type. Verify read units separately; spend_cap is lifetime. LIST_CAMPAIGNS readback at same ID. |
| Increase budget / adset | No verified AI-direct Increase budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase budget / ad | No verified AI-direct Increase budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase budget / selected | No verified AI-direct Increase budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Decrease budget / campaign | REDDIT_ADS_UPDATE_CAMPAIGN(campaign_id,data={goal_value:final currency amount×1000000}); only verified CBO daily goal_type. Verify read units separately; spend_cap is lifetime. LIST_CAMPAIGNS readback at same ID. |
| Decrease budget / adset | No verified AI-direct Decrease budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Decrease budget / ad | No verified AI-direct Decrease budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Decrease budget / selected | No verified AI-direct Decrease budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Set budget / campaign | REDDIT_ADS_UPDATE_CAMPAIGN(campaign_id,data={goal_value:final currency amount×1000000}); only verified CBO daily goal_type. Verify read units separately; spend_cap is lifetime. LIST_CAMPAIGNS readback at same ID. |
| Set budget / adset | No verified AI-direct Set budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Set budget / ad | No verified AI-direct Set budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Set budget / selected | No verified AI-direct Set budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / campaign | REDDIT_ADS_UPDATE_CAMPAIGN(campaign_id,data={bid_value:final currency amount×1000000}); verify CBO and bid type/strategy, campaign read unit, then LIST_CAMPAIGNS readback. Ad-group bid cents are not campaign micros. |
| Increase bid / adset | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / ad | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / selected | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Add to name / campaign | REDDIT_ADS_UPDATE_CAMPAIGN(campaign_id,data={name:final name}); modify only requested marker, then LIST_CAMPAIGNS(ad_account_id,id) readback. |
| Add to name / adset | No verified AI-direct Add to name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Add to name / ad | No verified AI-direct Add to name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Add to name / selected | No verified AI-direct Add to name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Remove from name / campaign | REDDIT_ADS_UPDATE_CAMPAIGN(campaign_id,data={name:final name}); modify only requested marker, then LIST_CAMPAIGNS(ad_account_id,id) readback. |
| Remove from name / adset | No verified AI-direct Remove from name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Remove from name / ad | No verified AI-direct Remove from name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Remove from name / selected | No verified AI-direct Remove from name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
<!-- strategy-parameters:generated:end -->
