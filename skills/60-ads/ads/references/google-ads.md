# Google Ads task index

Use this platform index for the selected Google customer and campaign type. Read only the matching task topic and this entry point's channel execution reference. Current schemas and availability own tool parameters; synthetic examples are not account recommendations.

| Task | Topic |
| --- | --- |
| Resolve customer, plan keywords, read search terms and judge intent | [Search planning](google/search-planning.md) |
| Create paused Search objects or recover their identities | [Build and review](google/build-and-review.md) |
| Prepare negatives, state/budget repairs or native experiments | [Optimization and tests](google/optimization-and-tests.md) |
| Inspect/select goals or import authorized customer outcomes | [Conversion feedback](google/conversion-feedback.md) |

## Strategy field lookup

Use [strategy execution](strategy-execution.md) for formulas and rule evaluation.
`B = output.result.data`. `GOOGLEADS_SEARCH_STREAM_GAQL` requires `query`;
always bind the selected child `customer_id` explicitly. Its `B.results[]`
rows are open objects: GAQL uses snake_case, returned resources use camelCase.
Use the account/timezone and dated query recipes in the selected topic; select compatible fields
from `customer`, `campaign`, `ad_group`, or `ad_group_ad` for the intended scope.
Tool schema validation cannot validate a GAQL string's field compatibility.

| Metric | Tool | Field / interpretation |
| --- | --- | --- |
| Spend | `GOOGLEADS_SEARCH_STREAM_GAQL` | `metrics.cost_micros` → `B.results[].metrics.costMicros`; divide by 1,000,000 for account currency. |
| Impressions; platform clicks | `GOOGLEADS_SEARCH_STREAM_GAQL` | `metrics.impressions`, `metrics.clicks` → corresponding `B.results[].metrics` keys. |
| All CTR; link CTR; link CPC; CPM | `GOOGLEADS_SEARCH_STREAM_GAQL` | Platform-click CTR/CPC and CPM use those totals. Meta all-click/link-click distinctions have no automatic equivalent; require the chosen click definition before evaluating those labels. |
| Event count; event value; event cost; ROAS | `GOOGLEADS_SEARCH_STREAM_GAQL` | `metrics.conversions`, `metrics.conversions_value` → `metrics.conversions`, `metrics.conversionsValue` in each row. Value is account currency, count may be fractional. Verify conversion action and campaign goal in the conversion-feedback topic; do not relabel mixed conversions as purchases/leads. Join event-specific counts/value to separately queried spend without duplicating spend. |
| Frequency | `GOOGLEADS_SEARCH_STREAM_GAQL` | `metrics.average_impression_frequency_per_user` → `metrics.averageImpressionFrequencyPerUser`; campaign-level Display/Video/Discovery/App only, ≤92 days, non-additive. Unsupported scope is unknown. [Field definition](https://developers.google.com/google-ads/api/fields/v26/metrics#metrics.average_impression_frequency_per_user). |
| Daily budget | `GOOGLEADS_SEARCH_STREAM_GAQL` | Query the linked `campaign_budget`: `amount_micros`, `period`, `reference_count`, `resource_name` → `B.results[].campaignBudget.{amountMicros,period,referenceCount,resourceName}`. `amountMicros` is daily only for `DAILY`; `totalAmountMicros` is a different period. Convert micros; retain resource identity. |
| Bid amount | `GOOGLEADS_SEARCH_STREAM_GAQL` | For applicable Manual CPC, `ad_group.cpc_bid_micros` → `B.results[].adGroup.cpcBidMicros`, in micros. Confirm bidding strategy; this is not every campaign's effective bid. [Ad-group fields](https://developers.google.com/google-ads/api/fields/v26/ad_group). |
| Age | User creation evidence | Unknown without a verified creation timestamp; a campaign start date is not its creation time. |
| Active child counts | `GOOGLEADS_SEARCH_STREAM_GAQL` | Read unsegmented `ad_group.id/status/campaign` or `ad_group_ad.resource_name/status/ad_group`; returned objects are `adGroup`/`adGroupAd`. Verify parent and agreed active state, deduplicate complete results; configured `ENABLED` alone does not establish delivery. [Ad fields](https://developers.google.com/google-ads/api/fields/v26/ad_group_ad). |
| CAC/CPL/Target CPA; custom conversion rate | User configuration | User business targets/formula; a platform bidding target is not automatically the business limit. |

Keep one customer timezone, currency and conversion definition across comparisons.
Query the exact full window for frequency; do not average daily frequencies.
Use [campaign changes](google/optimization-and-tests.md#pause-a-campaign-without-changing-its-budget) or
[budget changes](google/optimization-and-tests.md#change-one-verified-budget-amount) only for that actual object.
PostPlus rejects budget amounts shared by multiple campaigns; do not transfer an
ad-group budget rule to a campaign budget without the user's scope choice.


<!-- strategy-parameters:generated:start -->
## Prompt parameter bindings

These bindings are generated from the same internal parameter source as copied Strategy prompts. Use only the required metrics, dependencies, target and campaign type. These are semantic bindings, not replacement tool schemas.

When platform and campaign type match, use embedded parameters directly. Read this section only for a platform change, missing/inapplicable binding or actual tool conflict. Preserve user rules and thresholds; explain unsupported scope/actions and let the user choose an adjustment.

| Context | Parameters |
| --- | --- |
| report | GOOGLEADS_SEARCH_STREAM_GAQL(customer_id=selected child customer,query): FROM customer/campaign/ad_group/ad_group_ad for the exact scope, WHERE segments.date BETWEEN resolved dates. GAQL snake_case → B.results[] camelCase; preserve customer timezone and attribution. Open query strings do not prove field compatibility. |
| event | Select the actual conversion_action.resource_name/category/type matching the user event; filter segments.conversion_action. Query spend separately without conversion segmentation and join by exact scope/window; never duplicate spend across conversion rows. |

| Metric / target / campaign type | Binding |
| --- | --- |
| CAC | User-set acquisition-cost ceiling, in account currency/customer; reuse the approved customer definition and value. |
| CPL | User-set lead-cost ceiling, in account currency/lead; distinct from observed Cost per lead. |
| Target CPA | User-set target acquisition cost in account currency/conversion; do not substitute the bidding target. |
| Conversion Rate | User-defined numerator/denominator and percent-or-ratio convention. Reuse the supplied formula; if absent, propose and confirm it before evaluation. |
| Time | Evaluation clock in the rule timezone; preserve explicit timezone and whole-week execution hours. |
| CBO Dynamic Budget | Target CPA × Active ad sets in campaign, in account currency; preserve the rule multiplier and budget owner. Inputs: Target CPA; Active ad sets in campaign. |
| Spend | metrics.cost_micros → B.results[].metrics.costMicros / 1000000; account currency. Context: report. |
| Impressions | metrics.impressions → B.results[].metrics.impressions; count. Context: report. |
| _clicks | metrics.clicks → B.results[].metrics.clicks; platform clicks. Confirm the requested click definition; no automatic Meta all/link equivalent. Context: report. |
| Frequency | metrics.average_impression_frequency_per_user → B.results[].metrics.averageImpressionFrequencyPerUser; campaign Display/Video/Discovery/App only, ≤92 days, non-additive; unsupported scope remains unknown. Context: report. |
| CTR | 100 × _clicks / Impressions; percentage points; verify all-click intent. Inputs: _clicks; Impressions. |
| CTR (Link clicks) | 100 × _clicks / Impressions only when the confirmed click definition matches link clicks; otherwise unknown. Inputs: _clicks; Impressions. |
| CPC (Link) | Spend / _clicks only for the confirmed link-click definition; account currency/click. Inputs: Spend; _clicks. |
| CPM | 1000 × Spend / Impressions; currency/1000 impressions. Inputs: Spend; Impressions. |
| Purchases | metrics.conversions → B.results[].metrics.conversions for the verified purchase conversion action; count may be fractional, never mixed conversions. Inputs: Event: Purchases. Context: report. |
| Website purchases | metrics.conversions → B.results[].metrics.conversions for the verified website purchase conversion action; count may be fractional, never mixed conversions. Inputs: Event: Website purchases. Context: report. |
| Leads | metrics.conversions → B.results[].metrics.conversions for the verified lead conversion action; count may be fractional, never mixed conversions. Inputs: Event: Leads. Context: report. |
| Mobile app purchases | metrics.conversions → B.results[].metrics.conversions for the verified in-app purchase conversion action; count may be fractional, never mixed conversions. Inputs: Event: Mobile app purchases. Context: report. |
| Mobile app installs | metrics.conversions → B.results[].metrics.conversions for the verified app install conversion action; count may be fractional, never mixed conversions. Inputs: Event: Mobile app installs. Context: report. |
| Cost per purchase | Spend / Purchases; account currency/event. Inputs: Spend; Purchases. |
| Cost per website purchase | Spend / Website purchases; account currency/event. Inputs: Spend; Website purchases. |
| Cost per lead | Spend / Leads; account currency/event. Inputs: Spend; Leads. |
| Cost per mobile app purchase | Spend / Mobile app purchases; account currency/event. Inputs: Spend; Mobile app purchases. |
| Cost per mobile app install | Spend / Mobile app installs; account currency/event. Inputs: Spend; Mobile app installs. |
| Purchase ROAS | metrics.conversions_value → B.results[].metrics.conversionsValue for the same action as Purchases, divided by Spend; value is account currency, ROAS is a ratio. Missing monetary value is unknown. Inputs: Spend; Event: Purchases. Context: report; event. |
| Website purchase ROAS | metrics.conversions_value → B.results[].metrics.conversionsValue for the same action as Website purchases, divided by Spend; value is account currency, ROAS is a ratio. Missing monetary value is unknown. Inputs: Spend; Event: Website purchases. Context: report; event. |
| Mobile app purchase ROAS | metrics.conversions_value → B.results[].metrics.conversionsValue for the same action as Mobile app purchases, divided by Spend; value is account currency, ROAS is a ratio. Missing monetary value is unknown. Inputs: Spend; Event: Mobile app purchases. Context: report; event. |
| ROAS (Leads) | metrics.conversions_value → B.results[].metrics.conversionsValue for the same action as Leads, divided by Spend; value is account currency, ROAS is a ratio. Missing monetary value is unknown. Inputs: Spend; Event: Leads. Context: report; event. |
| Leads value | metrics.conversions_value → B.results[].metrics.conversionsValue for the verified lead conversion action; account currency, not lead count. Inputs: Event: Leads. Context: report; event. |
| Daily budget / campaign | Read campaign.campaign_budget → B.results[].campaign.campaignBudget, then query that campaign_budget resource: amount_micros/period/reference_count/resource_name → B.results[].campaignBudget.amountMicros/period/referenceCount/resourceName. amountMicros/1000000 is currency/day only for DAILY; shared budgets (referenceCount>1) cannot be written. Context: report. |
| Daily budget / adset | Google ad groups have no independent daily budget. A parent campaign_budget is a different object; explain and ask the user to choose scope. |
| Daily budget / ad | Google ads have no independent daily budget; ask the user to choose a supported budget owner. |
| Daily budget / selected | Resolve the chosen campaign and linked campaign_budget; do not infer a group-owned budget. |
| Bid amount | For applicable Manual CPC: ad_group.cpc_bid_micros → B.results[].adGroup.cpcBidMicros/1000000, currency/click. Current GOOGLEADS_MUTATE_AD_GROUPS update has no bid field; do not invent one. Context: report. |
| Hours since creation | Creation timestamp requires verified creation evidence/export; campaign start_date is not creation time. Unknown until supplied. |
| Ads in ad set | Unsegmented ad_group_ad.resource_name/ad_group/status → B.results[].adGroupAd.resourceName/adGroup/status; count distinct resources under exact parent; require complete coverage. Context: report. |
| Active ads in ad set | Unsegmented ad_group_ad.resource_name/ad_group/status → B.results[].adGroupAd.resourceName/adGroup/status; count distinct resources under exact parent using the agreed active definition (ENABLED alone is configured state); require complete coverage. Context: report. |
| Active ad sets in campaign | Unsegmented ad_group.id/campaign/status → B.results[].adGroup.id/campaign/status; count unique children under the campaign and agreed active definition; complete coverage required. Context: report. |
| Event: Purchases | Bind the actual purchase conversion_action.resource_name/category/type and filter segments.conversion_action; reuse the chosen action, not mixed goals. Context: event. |
| Event: Website purchases | Bind the actual website purchase conversion_action.resource_name/category/type and filter segments.conversion_action; reuse the chosen action, not mixed goals. Context: event. |
| Event: Leads | Bind the actual lead conversion_action.resource_name/category/type and filter segments.conversion_action; reuse the chosen action, not mixed goals. Context: event. |
| Event: Mobile app purchases | Bind the actual in-app purchase conversion_action.resource_name/category/type and filter segments.conversion_action; reuse the chosen action, not mixed goals. Context: event. |
| Event: Mobile app installs | Bind the actual app install conversion_action.resource_name/category/type and filter segments.conversion_action; reuse the chosen action, not mixed goals. Context: event. |

| Action / target / campaign type | Binding |
| --- | --- |
| Notify | Return matching values here; external delivery requires the user-selected destination and sending capability. |
| Duplicate | No verified exact-duplication binding for this target. Preserve source/copy count and let the user choose manual duplication or another supported operation; creation alone is not duplication. |
| Pause / campaign | GOOGLEADS_MUTATE_CAMPAIGNS_V2(customer_id,operations=[{operation_type:update,update:{resource_name,status:paused},update_mask:status}],partial_failure=false,validate_only); read back exact campaign via GAQL. |
| Pause / adset | GOOGLEADS_MUTATE_AD_GROUPS(customer_id,operations=[{update:{resource_name,status:PAUSED}}],partial_failure=false,validate_only); read back exact ad_group via GAQL. |
| Pause / ad | GOOGLEADS_MUTATE_AD_GROUP_ADS(customer_id,operations=[{update:{resource_name,status:PAUSED},update_mask:status}],partial_failure=false,validate_only); verify eligible campaign type and read back exact ad_group_ad via GAQL. |
| Pause / selected | No verified AI-direct Pause binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Start / campaign | GOOGLEADS_MUTATE_CAMPAIGNS_V2(customer_id,operations=[{operation_type:update,update:{resource_name,status:enabled},update_mask:status}],partial_failure=false,validate_only); read back exact campaign via GAQL. |
| Start / adset | GOOGLEADS_MUTATE_AD_GROUPS(customer_id,operations=[{update:{resource_name,status:ENABLED}}],partial_failure=false,validate_only); read back exact ad_group via GAQL. |
| Start / ad | GOOGLEADS_MUTATE_AD_GROUP_ADS(customer_id,operations=[{update:{resource_name,status:ENABLED},update_mask:status}],partial_failure=false,validate_only); verify eligible campaign type and read back exact ad_group_ad via GAQL. |
| Start / selected | No verified AI-direct Start binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase budget / campaign | GOOGLEADS_MUTATE_CAMPAIGN_BUDGETS: customer_id, operations=[{update:{resource_name:linked budget,amount_micros:positive integer string(final currency amount×1000000)},update_mask:amount_micros}], partial_failure=false, validate_only. DAILY only, referenceCount≤1; confirm same budget readback. validate_only=true does not execute. |
| Increase budget / adset | No verified AI-direct Increase budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase budget / ad | No verified AI-direct Increase budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase budget / selected | No verified AI-direct Increase budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Decrease budget / campaign | GOOGLEADS_MUTATE_CAMPAIGN_BUDGETS: customer_id, operations=[{update:{resource_name:linked budget,amount_micros:positive integer string(final currency amount×1000000)},update_mask:amount_micros}], partial_failure=false, validate_only. DAILY only, referenceCount≤1; confirm same budget readback. validate_only=true does not execute. |
| Decrease budget / adset | No verified AI-direct Decrease budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Decrease budget / ad | No verified AI-direct Decrease budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Decrease budget / selected | No verified AI-direct Decrease budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Set budget / campaign | GOOGLEADS_MUTATE_CAMPAIGN_BUDGETS: customer_id, operations=[{update:{resource_name:linked budget,amount_micros:positive integer string(final currency amount×1000000)},update_mask:amount_micros}], partial_failure=false, validate_only. DAILY only, referenceCount≤1; confirm same budget readback. validate_only=true does not execute. |
| Set budget / adset | No verified AI-direct Set budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Set budget / ad | No verified AI-direct Set budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Set budget / selected | No verified AI-direct Set budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / campaign | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / adset | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / ad | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / selected | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Add to name / campaign | GOOGLEADS_MUTATE_CAMPAIGNS_V2: customer_id, operations[].operation_type=update, update.{resource_name,name}, update_mask=name; partial_failure=false, validate_only. Read/modify marker once and read back exact campaign. |
| Add to name / adset | GOOGLEADS_MUTATE_AD_GROUPS: customer_id, operations[].update.{resource_name,name}, partial_failure=false, validate_only; change marker once and read back exact ad_group. |
| Add to name / ad | No verified AI-direct Add to name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Add to name / selected | No verified AI-direct Add to name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Remove from name / campaign | GOOGLEADS_MUTATE_CAMPAIGNS_V2: customer_id, operations[].operation_type=update, update.{resource_name,name}, update_mask=name; partial_failure=false, validate_only. Read/modify marker once and read back exact campaign. |
| Remove from name / adset | GOOGLEADS_MUTATE_AD_GROUPS: customer_id, operations[].update.{resource_name,name}, partial_failure=false, validate_only; change marker once and read back exact ad_group. |
| Remove from name / ad | No verified AI-direct Remove from name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Remove from name / selected | No verified AI-direct Remove from name binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
<!-- strategy-parameters:generated:end -->
