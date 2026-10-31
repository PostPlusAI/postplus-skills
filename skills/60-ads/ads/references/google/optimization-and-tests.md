# Diagnose and repair Google delivery and search performance

Read [channel execution](../channel-execution.md) before an authorized mutation and [search planning](search-planning.md) for customer and query evidence. Examples are synthetic.

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
quality using [b2b-growth.md](../b2b-growth.md), not the cheapest form fill.

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
brand-controlled claim. Use [launch-review.md](../launch-review.md) for the final
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
operation and readback process in [channel-execution.md](../channel-execution.md).


## Other Google tool families

Discover current schemas for asset groups/assets, shared negative lists,
audiences, customer management and experiments from the same channel catalog.
Asset-group operations alone do not establish a complete PMax launch; use the
batch tool when linked assets must be created together and verify all required
assets and campaign settings. Scheduling or ending an experiment can affect
live delivery and requires authorization for that exact experiment.


## Experiment setup and acceptance

Use [experiment design](../experiments.md) before configuring the platform. Discover GOOGLEADS_CREATE_EXPERIMENT and GOOGLEADS_CREATE_EXPERIMENT_ARMS; create the reviewed control/treatment definition, preserve returned identities, and inspect GOOGLEADS_GET_EXPERIMENT / GOOGLEADS_GET_EXPERIMENT_ARM before scheduling. GOOGLEADS_SCHEDULE_EXPERIMENT is a separate delivery-affecting action requiring the authorized experiment and spend scope. Follow its actual asynchronous result rather than treat scheduling acceptance as a completed experiment. Never invent an equal-allocation or result contract from a tool name.

For a confirmed irrelevant search term, prepare the exact negative and scope, validate when supported, apply within authorization and read the same criterion back. For a budget or state correction, use the inspected current values and smallest matching operation, preserve the prior value and verify the exact object. An expensive but immature query is not a confirmed defect. Report applied, verified and still-pending outcomes separately.
