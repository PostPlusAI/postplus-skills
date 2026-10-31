# Meta Ads task index

Use one exact account and object scope, and load only the topic needed. Campaign, ad set, ad and creative are distinct objects. The selected schema and actual PostPlus management tools own writable fields; an accepted state is not evidence of delivery.

| Task | Topic |
| --- | --- |
| Create, revise, copy or preview paused image/video objects | [Build and preview](meta/build-and-preview.md) |
| Diagnose delivery/performance or correct exact state and budget | [Delivery and optimization](meta/delivery-and-optimization.md) |
| Resolve targeting conditions, exclusions and expansion | [Audiences](meta/audiences.md) |
| Match optimization events and customer-outcome feedback | [Conversion feedback](meta/conversion-feedback.md) |

## Strategy field lookup

For a copied Strategy, read only the rows needed by its lookup keys. `B` is
`output.result.data`. Common formulas, business targets and window rules live in
[strategy execution](strategy-execution.md#bind-metrics-before-evaluating-conditions).

| Metric | Tool | Returned fields | Interpretation |
| --- | --- | --- | --- |
| Account context | `METAADS_GET_AD_ACCOUNTS` | `B.data[].id`, `B.data[].account_id`, `B.data[].currency`, `B.data[].timezone_name` | Input `fields` is CSV; select the actual account, currency and timezone. |
| Spend; impressions; CTR; CPM | `METAADS_GET_INSIGHTS` | `B.data[].spend`, `B.data[].impressions`, `B.data[].clicks` | Numeric strings; spend in account currency; clicks means all clicks. |
| CTR (Link clicks); CPC (Link) | `METAADS_GET_INSIGHTS` | `B.data[].inline_link_clicks` | Combine with impressions or spend; do not replace with all clicks. |
| Frequency | `METAADS_GET_INSIGHTS` | `B.data[].frequency` | Exact scope/window aggregate, never daily averages. |
| Purchases; website/app purchases; installs; leads; event costs | `METAADS_GET_INSIGHTS` | `B.data[].actions` | Match one verified `action_type`, parse its `value`; event cost uses spend. `cpp` is cost per 1,000 people reached. |
| Purchase/app/lead ROAS; leads value | `METAADS_GET_INSIGHTS` | `B.data[].action_values` | Match the event's monetary value; ROAS also needs spend. Leads require an approved value source. |
| Identity, parents, name and state | `METAADS_GET_OBJECT` | `B.id`, `B.account_id`, `B.campaign_id`, `B.adset_id`, `B.name`, `B.status`, `B.effective_status` | Input `object_id`, `fields` array; request fields applicable to that object. |
| Hours since creation | `METAADS_GET_OBJECT` | `B.created_time` | Evaluation instant minus creation instant in hours, not first delivery. |
| Campaign daily budget | `METAADS_GET_OBJECT` | `B.daily_budget` | Raw amount; verify units before comparison/write. |
| Ad-set budget/bid; active ad sets in campaign | `METAADS_READ_ADSETS` | `B.data[].id`, `B.data[].campaign_id`, `B.data[].daily_budget`, `B.data[].bid_amount`, `B.data[].bid_strategy`, `B.data[].status`, `B.data[].effective_status` | Input `ad_account_id`, enum-array `fields`; match parent and agreed active state. |
| Ads/active ads in ad set; ad bid | `METAADS_LIST_ADS` | `B.data[].id`, `B.data[].adset_id`, `B.data[].bid_amount`, `B.data[].status`, `B.data[].effective_status` | Input `ad_account_id`, CSV `fields`; count unique matching IDs, not first-page rows. |

Insights requires `object_id`; set matching `level`, array `fields`, explicit
`time_range.since/until` and selected `action_attribution_windows`. Omit
`date_preset` for explicit dates; Maximum is not a supported preset. Date-only
increments cannot prove hourly rules. Parent/account metrics require separate
scope reads. Use the [delivery read recipes](meta/delivery-and-optimization.md) for pagination; READ_ADSETS/LIST_ADS
cannot accept their output continuation, so truncated counts remain unknown.

CAC/CPL/Target CPA, Conversion Rate, Time and CBO Dynamic Budget use the common
business definitions; CBO uses final Target CPA × complete active ad-set count.
For manual amount changes, verify the platform-displayed currency and amount.
A readable bid does not establish an AI bid-write operation.


## Strategy action coverage

| Requested action and target | Current AI-direct execution mapping |
| --- | --- |
| Pause, resume or rename a campaign, ad set or ad | Discover `POSTPLUS_METAADS_INSPECT_OBJECT` and `POSTPLUS_METAADS_UPDATE_OBJECT`. Inspect the exact object, retain its snapshot, then change only authorized status/name. The result verifies configured state, not delivery. If these tools are absent, campaign status/name still use the exact `METAADS_UPDATE_CAMPAIGN` and independent readback; do not substitute a campaign for an ad set or ad. |
| Add/remove a name marker | Read the current name and change only the agreed marker through the exact object update. Do not append a marker twice. |
| Unsupported object update | When the exact PostPlus object tool is absent, explain the missing action. A campaign update or creative update is not an equivalent ad/ad-set operation. |
| Change a campaign or ad-set budget amount | Use `POSTPLUS_METAADS_UPDATE_BUDGET` with explicit major-unit amount, currency, period and the inspection snapshot. It changes an existing budget amount and performs independent readback. Never send raw `METAADS_UPDATE_CAMPAIGN` budget fields. |
| Enable one shared campaign budget | `POSTPLUS_METAADS_SET_CAMPAIGN_BUDGET` is a separate structural change. Use `apply:false` when only validation is requested. An authorized `apply:true` already validates before applying. Applying requires authorization for the whole affected campaign and a current inspection snapshot; it validates again before applying. Do not promise the account will allow migration from existing lifetime ad-set budgets. |
| Increase a bid amount | No matching bid-amount update path is available. A campaign `bid_strategy` field selects a strategy; it cannot implement a numeric bid increase or its cap. |
| Duplicate a paused ad, ad set or campaign | Use POSTPLUS_METAADS_READ_BUILD_OBJECT then POSTPLUS_METAADS_DUPLICATE_PAUSED_OBJECT with its snapshot and the requested name. Native copies preserve the hierarchy; verify paused objects and IDs. This one-time action does not install recurring or lifetime-once rule state. |
| Notify | Return the matched conditions in the current conversation for this evaluation. External delivery requires the user's requested destination and an available authorized messaging path. Neither is an installed recurring notification. |
| Unattended recurring execution through Ads/Channels | This path has no strategy scheduler, durable rule state or cadence/cooldown executor. That mode needs these capabilities; one-time execution and user-performed reviews do not. A one-time call does not install recurrence. |

New image or video website-conversion campaigns use [paused build and preview](meta/build-and-preview.md), including explicit currency/amount, a creative ID handoff and native preview. Existing generic creation tools retain only their inspected schema; raw budget fields are rejected. Creation does not authorize activation.


<!-- strategy-parameters:generated:start -->
## Prompt parameter bindings

These bindings are generated from the same internal parameter source as copied Strategy prompts. Use only the required metrics, dependencies, target and campaign type. These are semantic bindings, not replacement tool schemas.

When platform and campaign type match, use embedded parameters directly. Read this section only for a platform change, missing/inapplicable binding or actual tool conflict. Preserve user rules and thresholds; explain unsupported scope/actions and let the user choose an adjustment.

| Context | Parameters |
| --- | --- |
| report | METAADS_GET_INSIGHTS: object_id=exact scoped ID, level=account/campaign/adset/ad matching that ID, fields=[only needed fields], time_range={since,until}; omit date_preset. Reuse action_attribution_windows (1d_click/7d_click/1d_view); do not add overlapping windows. Read numeric strings at B.data[]. |

| Metric / target / campaign type | Binding |
| --- | --- |
| CAC | User-set acquisition-cost ceiling, in account currency/customer; reuse the approved customer definition and value. |
| CPL | User-set lead-cost ceiling, in account currency/lead; distinct from observed Cost per lead. |
| Target CPA | User-set target acquisition cost in account currency/conversion; do not substitute the bidding target. |
| Conversion Rate | User-defined numerator/denominator and percent-or-ratio convention. Reuse the supplied formula; if absent, propose and confirm it before evaluation. |
| Time | Evaluation clock in the rule timezone; preserve explicit timezone and whole-week execution hours. |
| CBO Dynamic Budget | Target CPA × Active ad sets in campaign, in account currency; preserve the rule multiplier and budget owner. Inputs: Target CPA; Active ad sets in campaign. |
| Spend | spend → B.data[].spend; account currency. Context: report. |
| Impressions | impressions → B.data[].impressions; count. Context: report. |
| _allClicks | clicks → B.data[].clicks; all-click count. Context: report. |
| _linkClicks | inline_link_clicks → B.data[].inline_link_clicks; link-click count. Context: report. |
| Frequency | frequency → B.data[].frequency; same-scope whole-window time_increment=all_days, not averaged daily frequency. Context: report. |
| CTR | 100 × _allClicks / Impressions; percentage points (1%=1). Inputs: _allClicks; Impressions. |
| CTR (Link clicks) | 100 × _linkClicks / Impressions; percentage points (1%=1). Inputs: _linkClicks; Impressions. |
| CPC (Link) | Spend / _linkClicks; currency/link click. Inputs: Spend; _linkClicks. |
| CPM | 1000 × Spend / Impressions; currency/1000 impressions. Inputs: Spend; Impressions. |
| Purchases | actions → B.data[].actions[action_type=the bound event].value; parse numeric strings as event counts. Inputs: Event: Purchases. Context: report. |
| Website purchases | actions → B.data[].actions[action_type=the bound event].value; parse numeric strings as event counts. Inputs: Event: Website purchases. Context: report. |
| Mobile app purchases | actions → B.data[].actions[action_type=the bound event].value; parse numeric strings as event counts. Inputs: Event: Mobile app purchases. Context: report. |
| Mobile app installs | actions → B.data[].actions[action_type=the bound event].value; parse numeric strings as event counts. Inputs: Event: Mobile app installs. Context: report. |
| Leads | actions → B.data[].actions[action_type=the bound event].value; parse numeric strings as event counts. Inputs: Event: Leads. Context: report. |
| Cost per purchase | Spend / Purchases; account currency/event. Inputs: Spend; Purchases. |
| Cost per website purchase | Spend / Website purchases; account currency/event. Inputs: Spend; Website purchases. |
| Cost per mobile app purchase | Spend / Mobile app purchases; account currency/event. Inputs: Spend; Mobile app purchases. |
| Cost per mobile app install | Spend / Mobile app installs; account currency/event. Inputs: Spend; Mobile app installs. |
| Cost per lead | Spend / Leads; account currency/event. Inputs: Spend; Leads. |
| Purchase ROAS | action_values → B.data[].action_values[action_type=same event as Purchases].value / Spend; currency/currency ratio, not percent. Inputs: Spend; Event: Purchases. Context: report. |
| Website purchase ROAS | action_values → B.data[].action_values[action_type=same event as Website purchases].value / Spend; currency/currency ratio, not percent. Inputs: Spend; Event: Website purchases. Context: report. |
| Mobile app purchase ROAS | action_values → B.data[].action_values[action_type=same event as Mobile app purchases].value / Spend; currency/currency ratio, not percent. Inputs: Spend; Event: Mobile app purchases. Context: report. |
| Leads value | action_values → B.data[].action_values[action_type=same verified lead event].value; account currency. Use approved CRM value if supplied; missing value is unknown, not lead count. Inputs: Event: Leads. Context: report. |
| ROAS (Leads) | Leads value / Spend; currency/currency ratio. Inputs: Leads value; Spend. |
| Hours since creation | METAADS_GET_OBJECT(object_id,fields=[id,created_time]): (evaluation timestamp − B.created_time)/3600 seconds; hours since actual creation. |
| Daily budget / campaign | METAADS_GET_OBJECT(object_id=campaign ID,fields=[daily_budget]): B.daily_budget; currency/day after verifying raw units. |
| Daily budget / adset | METAADS_READ_ADSETS(ad_account_id,fields=[id,campaign_id,daily_budget]): B.data[].daily_budget for the exact ad-set ID; verify raw units and ABO/CBO owner. |
| Daily budget / ad | No ad-owned daily budget. Resolve budget ownership with the user; do not substitute its parent. |
| Daily budget / selected | Resolve the exact budget-owning object and units before choosing a budget field. |
| Bid amount / adset | METAADS_READ_ADSETS(ad_account_id,fields=[id,bid_amount,bid_strategy]): B.data[].bid_amount for the exact ad-set ID; verify raw units and bidding applicability. |
| Bid amount / ad | METAADS_LIST_ADS(ad_account_id,fields=CSV id,bid_amount): B.data[].bid_amount for the exact ad ID; verify raw units and bidding applicability. |
| Bid amount / campaign | No campaign bid-amount binding; do not substitute an ad-set bid. |
| Bid amount / selected | Resolve the exact bid-owning object and unit before using bid_amount. |
| Ads in ad set | METAADS_LIST_ADS(ad_account_id,fields=CSV id,adset_id,status,effective_status): count distinct B.data[].id matching the parent adset_id. Incomplete pagination means unknown. |
| Active ads in ad set | METAADS_LIST_ADS(ad_account_id,fields=CSV id,adset_id,status,effective_status): count distinct B.data[].id matching the parent adset_id and agreed active status/effective_status. Incomplete pagination means unknown. |
| Active ad sets in campaign | METAADS_READ_ADSETS(ad_account_id,fields=[id,campaign_id,status,effective_status]): count distinct B.data[].id under the exact campaign and agreed active definition; incomplete pagination means unknown. |
| Event: Purchases | action_type=omni_purchase (all purchase channels; verify this matches the chosen business scope). Verify this event in the returned data and reuse its attribution; never add overlapping action types. |
| Event: Website purchases | action_type=offsite_conversion.fb_pixel_purchase (website purchase). Verify this event in the returned data and reuse its attribution; never add overlapping action types. |
| Event: Mobile app purchases | action_type=app_custom_event.fb_mobile_purchase (in-app purchase). Verify this event in the returned data and reuse its attribution; never add overlapping action types. |
| Event: Mobile app installs | action_type=mobile_app_install (app install). Verify this event in the returned data and reuse its attribution; never add overlapping action types. |
| Event: Leads | action_type=lead (aggregate lead; verify website/instant-form scope against the chosen event). Verify this event in the returned data and reuse its attribution; never add overlapping action types. |

| Action / target / campaign type | Binding |
| --- | --- |
| Notify | Return matching values here; external delivery requires the user-selected destination and sending capability. |
| Duplicate | For an explicitly authorized one-time paused copy, POSTPLUS_METAADS_READ_BUILD_OBJECT supplies snapshot; POSTPLUS_METAADS_DUPLICATE_PAUSED_OBJECT(ad_account_id,object_id,object_kind=campaign/adset/ad,expected_snapshot,name) uses native copies and verifies the paused hierarchy. Preserve source/copy identities; never retry an unknown copy. Recurring/lifetime-once rule execution remains unsupported. |
| Pause / campaign | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=campaign); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=campaign,status=PAUSED). Verify the exact object; configured status is not delivery. |
| Pause / adset | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=adset); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=adset,status=PAUSED). Verify the exact object; configured status is not delivery. |
| Pause / ad | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=ad); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=ad,status=PAUSED). Verify the exact object; configured status is not delivery. |
| Pause / selected | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=exact campaign/adset/ad); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=exact campaign/adset/ad,status=PAUSED). Verify the exact object; configured status is not delivery. |
| Start / campaign | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=campaign); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=campaign,status=ACTIVE). Verify the exact object; configured status is not delivery. |
| Start / adset | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=adset); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=adset,status=ACTIVE). Verify the exact object; configured status is not delivery. |
| Start / ad | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=ad); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=ad,status=ACTIVE). Verify the exact object; configured status is not delivery. |
| Start / selected | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=exact campaign/adset/ad); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=exact campaign/adset/ad,status=ACTIVE). Verify the exact object; configured status is not delivery. |
| Increase budget / campaign | Inspect the exact campaign with POSTPLUS_METAADS_INSPECT_OBJECT. POSTPLUS_METAADS_UPDATE_BUDGET(account_id,object_id,object_type=campaign,expected_snapshot,amount=authorized major-unit decimal string,currency=account currency,period=existing daily/lifetime). Preserve budget owner/type; no raw provider units or rounding. Independently verify the same object. |
| Increase budget / adset | Inspect the exact adset with POSTPLUS_METAADS_INSPECT_OBJECT. POSTPLUS_METAADS_UPDATE_BUDGET(account_id,object_id,object_type=adset,expected_snapshot,amount=authorized major-unit decimal string,currency=account currency,period=existing daily/lifetime). Preserve budget owner/type; no raw provider units or rounding. Independently verify the same object. |
| Increase budget / ad | No verified AI-direct Increase budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase budget / selected | Resolve the exact existing campaign/adset budget owner with POSTPLUS_METAADS_INSPECT_OBJECT before using POSTPLUS_METAADS_UPDATE_BUDGET; ads have no owned budget. Never silently replace the requested owner. |
| Decrease budget / campaign | Inspect the exact campaign with POSTPLUS_METAADS_INSPECT_OBJECT. POSTPLUS_METAADS_UPDATE_BUDGET(account_id,object_id,object_type=campaign,expected_snapshot,amount=authorized major-unit decimal string,currency=account currency,period=existing daily/lifetime). Preserve budget owner/type; no raw provider units or rounding. Independently verify the same object. |
| Decrease budget / adset | Inspect the exact adset with POSTPLUS_METAADS_INSPECT_OBJECT. POSTPLUS_METAADS_UPDATE_BUDGET(account_id,object_id,object_type=adset,expected_snapshot,amount=authorized major-unit decimal string,currency=account currency,period=existing daily/lifetime). Preserve budget owner/type; no raw provider units or rounding. Independently verify the same object. |
| Decrease budget / ad | No verified AI-direct Decrease budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Decrease budget / selected | Resolve the exact existing campaign/adset budget owner with POSTPLUS_METAADS_INSPECT_OBJECT before using POSTPLUS_METAADS_UPDATE_BUDGET; ads have no owned budget. Never silently replace the requested owner. |
| Set budget / campaign | Inspect the exact campaign with POSTPLUS_METAADS_INSPECT_OBJECT. POSTPLUS_METAADS_UPDATE_BUDGET(account_id,object_id,object_type=campaign,expected_snapshot,amount=authorized major-unit decimal string,currency=account currency,period=existing daily/lifetime). Preserve budget owner/type; no raw provider units or rounding. Independently verify the same object. |
| Set budget / adset | Inspect the exact adset with POSTPLUS_METAADS_INSPECT_OBJECT. POSTPLUS_METAADS_UPDATE_BUDGET(account_id,object_id,object_type=adset,expected_snapshot,amount=authorized major-unit decimal string,currency=account currency,period=existing daily/lifetime). Preserve budget owner/type; no raw provider units or rounding. Independently verify the same object. |
| Set budget / ad | No verified AI-direct Set budget binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Set budget / selected | Resolve the exact existing campaign/adset budget owner with POSTPLUS_METAADS_INSPECT_OBJECT before using POSTPLUS_METAADS_UPDATE_BUDGET; ads have no owned budget. Never silently replace the requested owner. |
| Increase bid / campaign | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / adset | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / ad | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Increase bid / selected | No verified AI-direct Increase bid binding at this exact level. Explain the limitation and ask the user to choose an adjustment or manual operation; do not substitute a parent. |
| Add to name / campaign | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=campaign); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=campaign,name=final authorized name; add/remove only the agreed marker once). Verify the exact object; configured status is not delivery. |
| Add to name / adset | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=adset); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=adset,name=final authorized name; add/remove only the agreed marker once). Verify the exact object; configured status is not delivery. |
| Add to name / ad | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=ad); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=ad,name=final authorized name; add/remove only the agreed marker once). Verify the exact object; configured status is not delivery. |
| Add to name / selected | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=exact campaign/adset/ad); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=exact campaign/adset/ad,name=final authorized name; add/remove only the agreed marker once). Verify the exact object; configured status is not delivery. |
| Remove from name / campaign | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=campaign); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=campaign,name=final authorized name; add/remove only the agreed marker once). Verify the exact object; configured status is not delivery. |
| Remove from name / adset | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=adset); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=adset,name=final authorized name; add/remove only the agreed marker once). Verify the exact object; configured status is not delivery. |
| Remove from name / ad | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=ad); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=ad,name=final authorized name; add/remove only the agreed marker once). Verify the exact object; configured status is not delivery. |
| Remove from name / selected | POSTPLUS_METAADS_INSPECT_OBJECT(account_id,object_id,object_type=exact campaign/adset/ad); pass its returned snapshot as expected_snapshot in POSTPLUS_METAADS_UPDATE_OBJECT(account_id,object_id,object_type=exact campaign/adset/ad,name=final authorized name; add/remove only the agreed marker once). Verify the exact object; configured status is not delivery. |
<!-- strategy-parameters:generated:end -->

Paused draft copy/image/video edits and audience/schedule revisions use the shared [build and revision method](meta/build-and-preview.md). Use native paginated `POSTPLUS_METAADS_LIST_OBJECTS` for complete object discovery. Ordinary amount updates have no fixed wait; structural shared-budget setup reports its approximately 31-second Meta interval before execution.
