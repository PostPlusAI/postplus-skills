# Google Ads: inspect, decide, then change the exact resource

Use for Google account reporting, Search optimization, an audit, RSA submission,
or a specified campaign or budget change. Read
[channel-execution.md](channel-execution.md) for execution and authorization,
[performance-report.md](performance-report.md) for comparisons, and
[ad-copy.md](ad-copy.md) for the wording and character checks of an RSA.

Examples use synthetic IDs and dates. Replace them with verified account data;
example keywords, budgets and ads are not recommendations for a real account.
The current tool schema and availability returned by `show` govern execution.

## Strategy field lookup

Use [strategy execution](strategy-execution.md) for formulas and rule evaluation.
`B = output.result.data`. `GOOGLEADS_SEARCH_STREAM_GAQL` requires `query`;
always bind the selected child `customer_id` explicitly. Its `B.results[]`
rows are open objects: GAQL uses snake_case, returned resources use camelCase.
Use the account/timezone and dated query recipes below; select compatible fields
from `customer`, `campaign`, `ad_group`, or `ad_group_ad` for the intended scope.
Tool schema validation cannot validate a GAQL string's field compatibility.

| Metric | Tool | Field / interpretation |
| --- | --- | --- |
| Spend | `GOOGLEADS_SEARCH_STREAM_GAQL` | `metrics.cost_micros` → `B.results[].metrics.costMicros`; divide by 1,000,000 for account currency. |
| Impressions; platform clicks | `GOOGLEADS_SEARCH_STREAM_GAQL` | `metrics.impressions`, `metrics.clicks` → corresponding `B.results[].metrics` keys. |
| All CTR; link CTR; link CPC; CPM | `GOOGLEADS_SEARCH_STREAM_GAQL` | Platform-click CTR/CPC and CPM use those totals. Meta all-click/link-click distinctions have no automatic equivalent; require the chosen click definition before evaluating those labels. |
| Event count; event value; event cost; ROAS | `GOOGLEADS_SEARCH_STREAM_GAQL` | `metrics.conversions`, `metrics.conversions_value` → `metrics.conversions`, `metrics.conversionsValue` in each row. Value is account currency, count may be fractional. Verify conversion action and campaign goal below; do not relabel mixed conversions as purchases/leads. Join event-specific counts/value to separately queried spend without duplicating spend. |
| Frequency | `GOOGLEADS_SEARCH_STREAM_GAQL` | `metrics.average_impression_frequency_per_user` → `metrics.averageImpressionFrequencyPerUser`; campaign-level Display/Video/Discovery/App only, ≤92 days, non-additive. Unsupported scope is unknown. [Field definition](https://developers.google.com/google-ads/api/fields/v23/metrics#metrics.average_impression_frequency_per_user). |
| Daily budget | `GOOGLEADS_SEARCH_STREAM_GAQL` | Query the linked `campaign_budget`: `amount_micros`, `period`, `reference_count`, `resource_name` → `B.results[].campaignBudget.{amountMicros,period,referenceCount,resourceName}`. `amountMicros` is daily only for `DAILY`; `totalAmountMicros` is a different period. Convert micros; retain resource identity. |
| Bid amount | `GOOGLEADS_SEARCH_STREAM_GAQL` | For applicable Manual CPC, `ad_group.cpc_bid_micros` → `B.results[].adGroup.cpcBidMicros`, in micros. Confirm bidding strategy; this is not every campaign's effective bid. [Ad-group fields](https://developers.google.com/google-ads/api/fields/v23/ad_group). |
| Age | User creation evidence | Unknown without a verified creation timestamp; a campaign start date is not its creation time. |
| Active child counts | `GOOGLEADS_SEARCH_STREAM_GAQL` | Read unsegmented `ad_group.id/status/campaign` or `ad_group_ad.resource_name/status/ad_group`; returned objects are `adGroup`/`adGroupAd`. Verify parent and agreed active state, deduplicate complete results; configured `ENABLED` alone does not establish delivery. [Ad fields](https://developers.google.com/google-ads/api/fields/v23/ad_group_ad). |
| CAC/CPL/Target CPA; custom conversion rate | User configuration | User business targets/formula; a platform bidding target is not automatically the business limit. |

Keep one customer timezone, currency and conversion definition across comparisons.
Query the exact full window for frequency; do not average daily frequencies.
Use [campaign changes](#pause-a-campaign-without-changing-its-budget) or
[budget changes](#change-one-verified-budget-amount) only for that actual object.
PostPlus rejects budget amounts shared by multiple campaigns; do not transfer an
ad-group budget rule to a campaign budget without the user's scope choice.

## Find the advertising customer

The connection is the PostPlus identity; `customer_id` is the Google account.
Use a canonical 10-digit customer ID without hyphens in requests and target
flags. Do not substitute a manager account for a child advertising account.

```sh
postplus channels tools show GOOGLEADS_LIST_ACCESSIBLE_CUSTOMERS --json
postplus channels tools run GOOGLEADS_LIST_ACCESSIBLE_CUSTOMERS --connection "$ADS_GOOGLE_CONNECTION" --input-file google-customers.json --wait --json > google-customers-result.json
```

`google-customers.json`:

<!-- tool-input: GOOGLEADS_LIST_ACCESSIBLE_CUSTOMERS -->
```json
{}
```

After a successful result, `B = output.result.data`. Read `B.resourceNames[]`.
This is the directly accessible set, not a complete manager hierarchy. Passing
a `customer_id` to this listing does not filter it. If the selected identity is
a manager, use `GOOGLEADS_LIST_SUB_ACCOUNTS` with that manager's `customer_id`;
read `B.sub_accounts[]` and pass `B.next_page_token` as the next `page_token`.
This lists direct children; follow the relevant manager child when necessary.

Read the selected customer's identity, timezone and currency before reporting.
Save as `google-account.json`:

<!-- tool-input: GOOGLEADS_SEARCH_STREAM_GAQL -->
```json
{
  "customer_id": "1234567890",
  "query": "SELECT customer.id, customer.descriptive_name, customer.manager, customer.currency_code, customer.time_zone FROM customer LIMIT 2"
}
```

```sh
postplus channels tools show GOOGLEADS_SEARCH_STREAM_GAQL --json
postplus channels tools run GOOGLEADS_SEARCH_STREAM_GAQL --connection "$ADS_GOOGLE_CONNECTION" --target-id 1234567890 --target-path customer_id --input-file google-account.json --wait --json > google-account-result.json
```

Read `B.results[0].customer.id`, `descriptiveName`, `manager`, `currencyCode`
and `timeZone`. No results or a manager where a spending customer was expected
requires resolving the scope, not guessing another account. The tool has no
`login_customer_id` input; do not invent one to repair an access failure.

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
are selectable in the [Google conversion-action field reference](https://developers.google.com/google-ads/api/fields/v23/conversion_action);
the query still needs a successful response for this account.
`primaryForGoal` alone cannot establish campaign goal selection when custom
goals are involved. `metrics.conversions` and `metrics.all_conversions` are not
interchangeable. Mixed goals must retain their real labels.

If the decision requires one event, obtain an event-specific conversion view
using supported conversion-action segmentation/filtering, separately from spend.
Join by the same campaign and dates; do not repeat campaign spend for each
conversion action and then sum it. When goal selection cannot be verified,
report the mixed scope and leave the target comparison unresolved.

## Read performance and search terms

`google-performance.json` gives daily campaign totals. Derive both report and
comparison ranges from the same reporting scope:

<!-- tool-input: GOOGLEADS_SEARCH_STREAM_GAQL -->
```json
{
  "customer_id": "1234567890",
  "query": "SELECT customer.id, customer.currency_code, customer.time_zone, campaign.id, campaign.name, segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value FROM campaign WHERE segments.date BETWEEN '2026-09-14' AND '2026-09-20' ORDER BY segments.date ASC, campaign.id ASC LIMIT 10001"
}
```

```sh
postplus channels tools run GOOGLEADS_SEARCH_STREAM_GAQL --connection "$ADS_GOOGLE_CONNECTION" --target-id 1234567890 --target-path customer_id --input-file google-performance.json --operation-id "$ADS_REPORT_OPERATION_ID" --wait --json > google-performance-result.json
```

Read `B.results[].campaign`, `segments.date`, and `metrics`. Cost is
`metrics.costMicros / 1,000,000`; preserve integer/decimal precision.
`metrics.conversions` may be fractional. `metrics.conversionsValue` is an
account-currency value, not micros. Never fill a missing field with zero.

GAQL has no page token or automatic truncation flag here. The example uses a
10,001-row sentinel for a 10,000-row working bound. Reaching that limit means the
report may be incomplete: split into non-overlapping dates or objects within
the task's scope. Output size can also limit a response before that count;
reduce the query and disclose the failed/incomplete part. A date-segmented
query can omit zero-metric rows; absence alone does not prove tracking failed.

For a ready report shape, use `GOOGLEADS_GET_RMF_REPORT`. Available templates
are `CUSTOMER`, `CAMPAIGN`, `AD_GROUP_AD`, `KEYWORD`, `SEARCH_TERM`,
`DYNAMIC_SEARCH_AD_SEARCH_TERM`, and `BIDDING_STRATEGY`. Provide explicit dates;
do not rely on its default period. `optional_metrics` adds compatible metrics,
not arbitrary dimensions.

`google-search-terms.json`:

<!-- tool-input: GOOGLEADS_GET_RMF_REPORT -->
```json
{
  "customer_id": "1234567890",
  "report": "SEARCH_TERM",
  "start_date": "2026-09-14",
  "end_date": "2026-09-20",
  "max_rows": 1000
}
```

```sh
postplus channels tools show GOOGLEADS_GET_RMF_REPORT --json
postplus channels tools run GOOGLEADS_GET_RMF_REPORT --connection "$ADS_GOOGLE_CONNECTION" --target-id 1234567890 --target-path customer_id --input-file google-search-terms.json --wait --json > google-search-terms-result.json
```

Inspect `B.columns`, `required_columns` and `date_range`, then interpret
`B.results`. Check `B.truncated`. `max_rows` is 1–10,000; there is no `page_token`.
A truncated search-term sample cannot establish total wasted spend. Search-term
visibility is incomplete, and an ad-group search-term view does not cover all
Performance Max search information.

## Diagnose the business before selecting an operation

### Search intent and account structure

Separate branded demand, high-intent category searches, competitor comparison,
and problem exploration when their economics or messages differ. Search captures
existing demand; weak category search demand may call for upstream education
rather than forcing broader keywords. Do not assume every business needs every
campaign type.

Brand conversion rates can mask weak acquisition. Read brand and non-brand
separately and check budget allocation. A brand pause experiment, if requested,
needs total paid-plus-organic outcomes and a defined observation window; losing
paid conversions alone cannot measure incrementality. A shared budget is not
inherently wrong, but inspect which campaigns consume it before reallocating.

Group keywords by a common intent, promise and landing page. Split when those
need to differ; consolidate when fragmentation prevents useful evidence. Do not
apply a fixed keyword count or monthly conversion minimum as an eligibility
rule. Check Search Partners, Display expansion, location presence/interest and
language settings against the actual market instead of switching everything
without evidence. Overlapping keywords can fragment analysis and routing;
do not claim that the account literally bids against itself in every auction.

### Search-term decisions

Review actual queries for three outcomes: clear mismatch, relevant demand worth
expanding, and ambiguous demand needing more evidence. For each proposed negative,
record its source query, spend, relevant outcomes, match type, affected scope and
why the business cannot serve that intent. Check converting queries and useful
close variants before blocking. A few non-converting clicks are not enough to
prove waste when the sales cycle is long.

No search-term evidence means no invented account-specific negative list. Do not
apply generic words such as “free”, “jobs” or “template” to every business.
Negative broad requires all words, negative phrase depends on phrase order, and
negative exact is narrow; negatives do not automatically cover every close
variant. Choose the smallest sufficient scope and examine examples of valuable
queries the proposed rule would also block.

Expansion and broad-match tests need trustworthy goal signals, relevant query
history, negative controls, budget and a measurement plan. A rigid progression
or a universal conversion threshold is not a substitute for campaign evidence.

### Bidding, creative and landing pages

Compare targets with mature realized outcomes, margin and conversion lag.
An aggressive target can constrain delivery; a budget-limited campaign and an
Ad Rank-limited campaign need different fixes. Read Search impression-share
losses by budget/rank where compatible, rather than assuming all lost coverage
can be bought with more budget. Smart Bidding strategy and campaign type may
ignore or disallow some bid modifiers; do not prescribe a device multiplier
without checking applicability.

Use Quality Score components as keyword diagnostics, not as a business outcome:
expected response, relevance and landing-page experience point to different
work. Follow the query → ad promise → page headline → proof → CTA → confirmed
action. Form length trades volume against qualification; validate downstream
quality using [b2b-growth.md](b2b-growth.md), not the cheapest form fill.

A strong asset score or high CTR does not prove an ad creates profitable demand.
Read actual text and policy status alongside outcomes. Check disapprovals before
blaming bidding. Use a supported GAQL `ad_group_ad` query for ID, policy summary,
status and campaign/ad-group identity when investigating delivery; inspect the
returned policy topics rather than guessing the reason.

### Ecommerce and broader campaign audits

For Shopping or Performance Max, investigate eligible product coverage, feed
accuracy, disapprovals, title clarity, useful images, current price/availability,
shipping promises, promotions and ratings. Verify product-level economics and
brand contribution before interpreting blended return. Signals are not guaranteed
audience restrictions. Thin data is a reason to simplify the experiment, not to
promise that Performance Max will manufacture demand.

Use an audit record for each material product group or campaign:

| Question | Evidence to collect | Decision if the evidence holds |
| --- | --- | --- |
| Can the advertised products serve and fulfill the promise? | Merchant Center eligibility, disapproval reasons, feed title/image, live price, stock, shipping and destination, checked against the actual catalog | Repair the proven product/feed or destination mismatch before changing bids. A Google Ads performance row alone cannot answer Merchant Center eligibility. |
| Which products create contribution? | Product/group cost, attributed purchases or value, margin and returns from the business source, with dates and coverage | Separate high-margin, low-margin and unmeasured groups when that changes the allowable acquisition cost. Blended ROAS is not a margin verdict. |
| Is brand demand inflating the apparent result? | Search-term and brand evidence where available, campaign scope, existing brand activity and comparable periods | Report brand and non-brand contribution separately where the evidence permits; do not assert incrementality from a single attributed report. |
| Is Performance Max aligned to the actual goal? | Selected conversion actions, objective, relevant asset/product grouping, audience-signal intent, observed delivery and value quality | Correct a verified goal or feed defect first. Treat audience signals as inputs to delivery rather than guaranteed eligibility filters. |
| Is another format needed? | Search demand, image/video assets, eligible audience, landing-page step and measurement for a Shopping, Search or Demand Gen hypothesis | Propose one bounded format test with its own success event; do not treat Demand Gen as an automatic fix for thin Shopping data or invent a build operation. |

For every row, mark **verified**, **needs correction**, **not observed**, or
**not applicable**, and link the specific query, export, or authorized UI
inspection. When campaign data is available through GAQL, use the actual
resource and fields supported by the current account. Merchant Center feed
state, placement previews, store returns and site fulfillment need their own
evidence; do not infer them from ad spend or an asset score. Keep the test's
offer, landing page, conversion event and review window together so a format
comparison can be interpreted.

Merchant Center, product eligibility, unsupported placements and some campaign
settings need current UI evidence or a user export when no suitable tool is
available. Mark them unknown; do not substitute the Search report. A missing
quiz, advertorial or competitor page is an optional test opportunity, not an
account defect. Never propose a disguised “independent” review page for a
brand-controlled claim. Use [launch-review.md](launch-review.md) for the final
configuration and journey checks.

## Prepare an exact, reviewable change

Record the customer, resource name, current value, proposed value, evidence,
expected effect, affected objects, cost exposure, verification query and recovery
step. Follow existing user authorization; a diagnosis alone does not authorize
a change. Restore configuration where possible, but do not promise to undo
spend, impressions, learning changes or irreversible removal.

Read `show` for each mutation. Open `create`/`update` objects permit payloads;
they do not prove every nested field or policy rule was locally checked.
Use `validate_only:true` where supported and appropriate to the authorized task;
validation is a remote call and may have costs. Validation and a later mutation
have different inputs and must use different operation IDs. Never change the
payload attached to an already-dispatched ID.

### An evidenced negative keyword

Save as `google-negative-validation.json`. This synthetic text demonstrates a
format only. Replace it with the reviewed query and scope:

<!-- tool-input: GOOGLEADS_MUTATE_AD_GROUP_CRITERIA -->
```json
{
  "customer_id": "1234567890",
  "operations": [{"create": {
    "ad_group": "customers/1234567890/adGroups/2345678901",
    "negative": true,
    "keyword": {"text": "unrelated sample query", "match_type": "EXACT"}
  }}],
  "partial_failure": false,
  "validate_only": true,
  "response_content_type": "RESOURCE_NAME_ONLY"
}
```

```sh
postplus channels tools show GOOGLEADS_MUTATE_AD_GROUP_CRITERIA --json
postplus channels tools run GOOGLEADS_MUTATE_AD_GROUP_CRITERIA --connection "$ADS_GOOGLE_CONNECTION" --target-id 1234567890 --target-path customer_id --input-file google-negative-validation.json --operation-id "$ADS_VALIDATION_OPERATION_ID" --wait --json > google-negative-validation-result.json
```

Do not attach bids or final URLs to a negative keyword. Campaign-level exclusions
use `GOOGLEADS_MUTATE_CAMPAIGN_CRITERIA` with the actual campaign resource and its
own schema, not the ad-group payload. After an authorized creation, capture
`B.results[].resource_name` and query that criterion's text, match type, negative
flag and parent. Removal of the created criterion is a possible configuration
recovery, not recovery of missed auctions.

### A paused RSA

Prepare the approved copy with [ad-copy.md](ad-copy.md). This minimal structural
example is not a complete creative recommendation. Save as
`google-rsa-validation.json`:

<!-- tool-input: GOOGLEADS_MUTATE_AD_GROUP_ADS -->
```json
{
  "customer_id": "1234567890",
  "operations": [{"create": {
    "ad_group": "customers/1234567890/adGroups/2345678901",
    "status": "PAUSED",
    "ad": {
      "final_urls": ["https://example.com/demo"],
      "responsive_search_ad": {
        "headlines": [{"text": "Explore Our Product"}, {"text": "Compare Available Plans"}, {"text": "Book a Product Demo"}],
        "descriptions": [{"text": "Explore the product and review the available plans."}, {"text": "Book a demo to discuss your requirements with our team."}],
        "path1": "product",
        "path2": "demo"
      }
    }
  }}],
  "partial_failure": false,
  "validate_only": true,
  "response_content_type": "RESOURCE_NAME_ONLY"
}
```

```sh
postplus channels tools show GOOGLEADS_MUTATE_AD_GROUP_ADS --json
postplus channels tools run GOOGLEADS_MUTATE_AD_GROUP_ADS --connection "$ADS_GOOGLE_CONNECTION" --target-id 1234567890 --target-path customer_id --input-file google-rsa-validation.json --operation-id "$ADS_RSA_VALIDATION_OPERATION_ID" --wait --json > google-rsa-validation-result.json
```

Creating a paused ad is still a remote write. Validate destination, product
claims, supported asset counts and existing ad-group capacity before submission.
After creation, read the exact `ad_group_ad` resource, text, URL, status and
policy summary. An accepted creation is neither approval nor proof of delivery.
Enabling requires the relevant authorization and a separate request.

### Pause a campaign without changing its budget

Save as `google-campaign-validation.json`:

<!-- tool-input: GOOGLEADS_MUTATE_CAMPAIGNS_V2 -->
```json
{
  "customer_id": "1234567890",
  "operations": [{
    "operation_type": "update",
    "update": {"resource_name": "customers/1234567890/campaigns/4567890123", "status": "paused"},
    "update_mask": "status"
  }],
  "partial_failure": false,
  "validate_only": true
}
```

```sh
postplus channels tools show GOOGLEADS_MUTATE_CAMPAIGNS_V2 --json
postplus channels tools run GOOGLEADS_MUTATE_CAMPAIGNS_V2 --connection "$ADS_GOOGLE_CONNECTION" --target-id 1234567890 --target-path customer_id --input-file google-campaign-validation.json --operation-id "$ADS_CAMPAIGN_VALIDATION_OPERATION_ID" --wait --json > google-campaign-validation-result.json
```

This tool accepts lowercase `paused` / `enabled`; RSA status uses uppercase.
Do not transfer enum casing between tools. Campaign V2 creation supports its
specified Search/Display shapes, not a generic complete PMax/Shopping builder.
After a real mutation, use `GOOGLEADS_GET_CAMPAIGN_BY_ID` or an exact GAQL resource
query to verify the configured state. The former returns `B.result`; GAQL returns
`B.results[]`. Inspect the actual nested fields in the chosen response. Do not pause a whole campaign when the user's
scope was one ad or ad group.

### Change one verified budget amount

Save as `google-budget-validation.json`:

<!-- tool-input: GOOGLEADS_MUTATE_CAMPAIGN_BUDGETS -->
```json
{
  "customer_id": "1234567890",
  "operations": [{
    "update": {
      "resource_name": "customers/1234567890/campaignBudgets/3456789012",
      "amount_micros": "50000000"
    },
    "update_mask": "amount_micros"
  }],
  "partial_failure": false,
  "validate_only": true,
  "response_content_type": "RESOURCE_NAME_ONLY"
}
```

```sh
postplus channels tools show GOOGLEADS_MUTATE_CAMPAIGN_BUDGETS --json
postplus channels tools run GOOGLEADS_MUTATE_CAMPAIGN_BUDGETS --connection "$ADS_GOOGLE_CONNECTION" --target-id 1234567890 --target-path customer_id --input-file google-budget-validation.json --operation-id "$ADS_BUDGET_VALIDATION_OPERATION_ID" --wait --json > google-budget-validation-result.json
```

This means 50 units of the account's currency, not necessarily USD. PostPlus
requires one amount update, a positive integer **string**, an exact customer
resource, `partial_failure:false`, and an update mask naming only that amount
field. `amount_micros` is for `DAILY`; `total_amount_micros` is for
`CUSTOM_PERIOD`. Do not switch fields to bypass a period mismatch.

PostPlus reads the budget before this operation. Budgets referenced by more
than one campaign are rejected; do not bypass that constraint or silently move
a campaign to a new budget. For a real amount change, the path reads again and
checks the amount. The pre-read, mutation and readback generally mean at least
three platform calls. Validation still performs a pre-read. This is not an
atomic comparison against the earlier user-reviewed snapshot; a concurrent
change remains possible.

After an authorized validation succeeds, prepare a distinct request with
`validate_only:false` and a new operation ID. Do not execute this transition
merely because the example validated. Inspect `output.execution.resultStatus`,
the budget verification receipt and any partial failure. For all other mutations,
plan an independent resource read. A returned resource name alone is not proof
that the intended final state exists. Unknown outcomes follow the original
operation and readback process in [channel-execution.md](channel-execution.md).

## Finish with a business receipt

State what was observed, what was prepared or changed, the exact affected IDs,
validation/execution/readback evidence, and the next meaningful checkpoint.
A saved draft, approved ad and delivering ad are distinct states. Configuration
of a conversion action does not upload offline revenue or install website tags;
use [measurement.md](measurement.md) for those boundaries. This reference does
not provide an offline-conversion upload tool.

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
