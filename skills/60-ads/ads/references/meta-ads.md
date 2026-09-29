# Meta Ads: evidence, diagnosis, and supported changes

Use this reference for Meta account reviews, creative decisions, and specific account operations. Use [channel execution](channel-execution.md) for connection, authorization, operation identity, and recovery; use [performance reporting](performance-report.md) for date windows, comparisons, and metric math. `B` below means the business data at `output.result.data` in the first successful CLI response.

## Establish the decision before collecting data

Record the account, currency, time zone, objective, optimization event, evaluation window, attribution window, and business target. Separate a platform lead from a qualified lead or customer. If qualification comes from a CRM, record its definition, join key, observation date, and unresolved records; see [B2B growth](b2b-growth.md). Without that evidence, report cost per platform lead and mark qualified-lead economics unknown.

For lead generation, define a target cost per qualified lead, `T`, from deal economics:

- `target customer acquisition cost × qualified-lead-to-customer rate`; or
- `target cost per attended demo × qualified-lead-to-attended-demo rate`.

The rate and denominator must refer to comparable, mature cohorts. Historical cost can inform a target, but an arbitrary 20% reduction is not an evidence-backed promise. For purchases, substitute the agreed purchase or contribution-margin target; do not reuse B2B qualification thresholds.

Keep tests fundable. A planning ceiling is `test budget over the evaluation window / planned spend per concept`. If a concept needs roughly `2–3 × T` before review, a budget that only supports four concepts cannot fairly evaluate twenty at once. This is a budget planning assumption, not Meta's required ad count. Distinguish concept tests from small execution variations.

## Read account context and objects

Save the following as `meta-accounts.json`. All IDs and dates in this reference are illustrative; replace them with verified task values.

<!-- tool-input: METAADS_GET_AD_ACCOUNTS -->
```json
{
  "fields": "id,account_id,name,currency,timezone_name,account_status",
  "limit": 100
}
```

```sh
postplus channels tools show METAADS_GET_AD_ACCOUNTS --json
postplus channels tools run METAADS_GET_AD_ACCOUNTS --connection "<connection-id>" --input-file meta-accounts.json --operation-id "<accounts-operation-id>" --wait --json > meta-accounts-result.json
```

Select from `B.data[]`; use the `act_` account ID for account requests. This discovery call uses the connection target, without `--target-id`. Its output can contain `B.paging`, but its input has no cursor: if more accounts exist, declare the discovery coverage incomplete. Do not fetch a returned external `next` URL outside PostPlus.

Discover objects using only the detail needed for this review:

| Tool | Request details | Result and completeness |
| --- | --- | --- |
| `METAADS_LIST_CAMPAIGNS` | `ad_account_id`; `fields` is an array; `limit`, optional `after` | `B.data[]`; continue with `B.paging.cursors.after` while a next page exists. |
| `METAADS_READ_ADSETS` | `ad_account_id`; `fields` is a fixed enum array, including `learning_stage_info`, `attribution_spec`, `targeting`, `effective_status` | `B.data[]`; a `paging_next` continuation cannot be supplied back through this tool. Mark incomplete rather than calling the first page exhaustive. |
| `METAADS_LIST_ADS` | `ad_account_id`; `fields` is a comma-separated string; `limit` up to 100 | `B.data[]`; output paging has no corresponding input cursor. Do not label the first 100 ads the entire account. |
| `METAADS_GET_OBJECT` | Real `object_id`; `fields` array appropriate to its type | Fields are directly on `B`, such as `B.id`, `B.creative`, `B.status`, `B.effective_status`. It is not a `B.data[]` list. |

Campaign request, saved as `meta-campaigns.json`:

<!-- tool-input: METAADS_LIST_CAMPAIGNS -->
```json
{
  "ad_account_id": "act_123456789",
  "fields": ["id", "name", "status", "effective_status", "objective"],
  "limit": 100
}
```

```sh
postplus channels tools show METAADS_LIST_CAMPAIGNS --json
postplus channels tools run METAADS_LIST_CAMPAIGNS --connection "<connection-id>" --target-id act_123456789 --target-path ad_account_id --input-file meta-campaigns.json --operation-id "<campaigns-operation-id>" --wait --json > meta-campaigns-result.json
```

Retain object IDs, parent IDs, names, configured state, and effective state. A configured active ad can still be unable to deliver because of its parent, review, payment, schedule, or another restriction. Check the actual reason before calling it a creative failure.

## Read performance at the correct scope

Save an account daily query as `meta-insights.json`:

<!-- tool-input: METAADS_GET_INSIGHTS -->
```json
{
  "object_id": "act_123456789",
  "level": "account",
  "time_range": {"since": "2026-09-14", "until": "2026-09-20"},
  "time_increment": 1,
  "action_attribution_windows": ["7d_click"],
  "fields": ["account_id", "account_name", "date_start", "date_stop", "spend", "impressions", "clicks", "reach", "frequency", "actions", "action_values"],
  "limit": 100
}
```

```sh
postplus channels tools show METAADS_GET_INSIGHTS --json
postplus channels tools run METAADS_GET_INSIGHTS --connection "<connection-id>" --target-id act_123456789 --target-path object_id --input-file meta-insights.json --operation-id "<insights-operation-id>" --wait --json > meta-insights-result.json
```

For an individual campaign, ad set, or ad, use its discovered ID and matching `level`: `campaign`, `adset`, or `ad`. Change the requested identifier fields to match. The current tool contract requires object type and level to match; do not assume an account request with `level: ad` is a verified shortcut. State the sampled objects and retrieval cost before expanding a review across many objects.

- Supply a custom `time_range` and omit `date_preset`; `null` is not accepted. `time_increment` supports integers 1–90, `monthly`, or `all_days`.
- This pinned tool accepts `1d_click`, `7d_click`, and `1d_view` in the array-item enum. The field description in `show` follows that same pinned contract; do not substitute legacy uppercase values or sum overlapping attribution results. Keep the exact selection consistent across comparison queries.
- Read `B.data[]`; parse numeric strings without converting a missing field into zero. `spend` is account-currency money, not Google micros. Select one explicitly named conversion `action_type` from `actions`, and its corresponding value from `action_values`. Never add overlapping purchase or lead action types.
- `clicks` includes all clicks. Use a verified outbound or landing-page metric when that is the question; do not rename all clicks as site visits. Fields are open strings, so schema acceptance alone does not prove availability.
- Continue using `after` from `B.paging.cursors.after` when the response indicates another page. Keep filters, fields, dates, and attribution unchanged, and save each page separately with its own request identity.
- A period's unique reach or frequency needs a same-scope `all_days` query. Summing daily reach or averaging frequency does not produce the period's unique audience. For monthly audience health, compare equal-length account windows, with spend and seasonality alongside reach.
- Placement, country, device, age, and gender breakdowns may be requested through `breakdowns`, not as metric fields. For example, `publisher_platform` and `platform_position` can answer placement questions. Actual metric/breakdown combinations still need a successful response. Unsupported combinations, missing values, or changed-query notices must be reported, not silently removed to make a report look complete.

## Diagnose in layers, then choose an action

Treat the numerical prompts below as review starting points to calibrate to this account. They do not authorize automatic changes and are not platform rules.

| Evidence pattern | Check before deciding | Useful next action |
| --- | --- | --- |
| Little or no delivery after a planned test window | Eligibility, schedule, parent status, audience size, learning, bid constraints, allocation, and available budget | Fix a proven delivery restriction. If an eligible concept consistently receives little opportunity, test a clearer hook or visual with protected test funding; lack of spend alone does not prove poor conversion quality. |
| Spend reaches the agreed review amount with few outcomes | Conversion delay and tracking integrity; compare mature outcomes to the business target | A gate near `3 × T` with zero qualified leads warrants review. Under a simple stable-rate model, zero at that spend is about 5% likely at target performance; delays, unequal allocation, and changing traffic invalidate that confidence claim. Do not automatically abandon the entire concept. |
| Many platform leads, few qualified leads | CRM coverage, qualification delay, duplicate leads, and whether the offer attracts the intended buyer | Add accurate buyer-fit language, review questions and offer, and compare form versus landing-page cohorts. Do not optimize for cheaper form fills alone. |
| Cost per qualified lead rises while qualified rate is stable | Auction cost, traffic mix, landing experience, and objective changes | Test the offer or destination; avoid blaming the visual from cost alone. |
| Frequency rises, reach stops growing, and CTR or qualified outcomes deteriorate | Same audience/window, enough observations, seasonality, and spend changes | Stage a new execution or audience test, then judge qualified outcomes. High frequency alone can be expected in small remarketing or named-account programs. |

Where there is no calibrated quality rule, propose one before applying it: for example, review a mature qualified rate below 40%, observe 40–60%, and consider a winner above 60% only when cost also meets target. Show counts beside percentages. Five qualified leads over at least 14 days, with one recent qualified lead and cost at or below `T`, is a candidate promotion gate, not proof that performance will persist.

Two additional creative checks are useful when the complete relevant ad cohort is available:

1. **Concentration:** highest-spend ad / total ad spend. Above roughly 60% prompts a test-allocation review, not an automatic pause of a profitable winner. Reconcile cohort spend to the account total; if listings were incomplete, label the concentration as sample-only.
2. **Weak engagement:** compare each ad's CTR with `sum(clicks) / sum(impressions)` for comparable objectives and placements. Below half that baseline can prompt inspection after enough exposure. Choose a minimum evidence gate in the account's currency and target economics; a universal `$50` threshold is inappropriate.

For fatigue reviews, changes such as a 20% CTR decline or 30% CPM rise can be investigation triggers when sample size and baseline are adequate. Join those signals to frequency, reach, qualified cost, and the creative's actual content. Do not state that a particular percentage budget change necessarily resets learning.

### Decide what the account can learn next

Work through this sequence for each campaign or ad set under review. Record the
scope, evidence, proposed decision, and condition that would reverse it.

1. **Can it deliver?** Compare configured and effective status, parent state,
   schedule, review/payment restrictions where visible, and actual spend. An
   eligible but under-served ad has not yet failed a conversion test. Check
   allocation and whether the planned test can receive enough spend before
   changing the message.
2. **Can outcomes be trusted?** Name the chosen event, attribution window,
   reporting lag, CRM review coverage, and mature cohort. Keep unreviewed leads
   unknown. If these are incomplete, repair measurement or wait for maturity;
   do not rank concepts by cheap form fills.
3. **Is the test economically informative?** Set `T` and a loss/review bound
   before comparing concepts. Calculate `fundable concepts = floor(test budget
   for the window / planned evidence spend per concept)`. Reduce concurrent
   concepts or extend the review window when this is smaller than the proposed
   test set. A review bound triggers diagnosis, not an automatic pause.
4. **What failed?** Separate low delivery, weak attention, a mismatch between
   click and landing promise, poor lead fit, and expensive but qualified
   outcomes. Change the relevant hook, proof, offer, destination or audience;
   do not call each one a "creative failure." State whether the change tests
   one variable or a whole new concept.
5. **Can a winner expand safely?** Require mature qualified outcomes at an
   acceptable cost, recent delivery, enough reachable audience, prepared
   replacements, and fulfillment capacity. Propose the next spend and review
   bound from this account's economics; no fixed percentage increase is a
   universal rule, and the current CLI budget-unit ambiguity blocks an
   automated Meta budget amount write.

For an account with rising frequency, compare equal-length period reach,
spend, CPM, response and qualified outcomes. If net-new reach is flattening,
test a distinct audience or an authorized creator partnership only if buyer
fit and rights are clear. A creator's follower count is not the expected
incremental reachable audience. Check content use and paid-ad permissions
before promising a new asset; distinguish a licensing proposal from an
executed agreement.

## Turn findings into controlled experiments

- Protect a test budget when mature winners consistently absorb delivery. An 80/20 established/test split is a proposal to model, not a required account structure; do not fragment a small budget into unfundable campaigns.
- Test one major uncertainty at a time. A destination test should hold persona, offer, and creative as constant as practical. Unequal algorithmic allocation means it is observational unless an actual controlled experiment was run.
- Use inexpensive static concepts where the promise can be conveyed in an image. Demonstrations, creator credibility, and movement may require video from the start. Route actual briefs to [ad copy](ad-copy.md) and [creative research](creative-research.md).
- Keep replacements prepared before rotating a productive ad. A loss limit, broken destination, or disallowed claim may justify stopping even without a replacement; never keep spending solely to satisfy a rotation schedule.
- For low-intent leads, propose a clear next-step confirmation and only the qualification friction needed for the business: a suitable form mode, work-email field when appropriate, or a few useful questions. Compare qualified acquisition cost, not form conversion rate alone.
- Creator partnerships require audience fit, actual usage permissions, and evidence from the content. They are an experiment in message and audience access, not a guaranteed source of incremental reach.
- Discuss scaling only when economics remain acceptable over mature windows and creative supply, audience capacity, and fulfillment support it. Meta budget amount writes are excluded below; deliver a specific budget proposal and the evidence needed to revisit it.

## Supported changes and exact limitations

Read [channel execution](channel-execution.md) before any remote change. A paused object is still a real object creation. Prepare the exact account/object, current value, requested value, rationale, expected effect, and recovery plan within the user's authorization.

For an explicitly authorized campaign pause, save `meta-pause-campaign.json`:

<!-- tool-input: METAADS_UPDATE_CAMPAIGN -->
```json
{
  "campaign_id": "238500000000002",
  "status": "PAUSED"
}
```

Then save an independent read as `meta-campaign-check.json`:

<!-- tool-input: METAADS_GET_OBJECT -->
```json
{
  "object_id": "238500000000002",
  "fields": ["id", "name", "status", "effective_status"]
}
```

```sh
postplus channels tools show METAADS_UPDATE_CAMPAIGN --json
postplus channels tools run METAADS_UPDATE_CAMPAIGN --connection "<connection-id>" --target-id 238500000000002 --target-path campaign_id --input-file meta-pause-campaign.json --operation-id "<pause-operation-id>" --wait --json > meta-pause-result.json
postplus channels tools run METAADS_GET_OBJECT --connection "<connection-id>" --target-id 238500000000002 --target-path object_id --input-file meta-campaign-check.json --operation-id "<readback-operation-id>" --wait --json > meta-campaign-check-result.json
```

The mutation returns `B.success`; the independent read returns `B.status` and `B.effective_status`, with no `B.success`. Record both. Transport success alone does not prove the requested external state. For pending or unknown results, query the original operation and inspect the object; do not create a second write identity to retry uncertainty.

The available creation tools are `METAADS_CREATE_CAMPAIGN`, `METAADS_CREATE_AD_SET`, `METAADS_CREATE_AD_CREATIVE`, and `METAADS_CREATE_AD`. Inspect the selected tool with `show` and the target prerequisites before use. Campaigns require `account_id`, `name`, `objective`; ad sets require `account_id`, `campaign_id`, `name`, `optimization_goal`, `billing_event`, and `targeting`, with objective-dependent conditions checked by the platform. Do not populate speculative settings simply to complete a template.

A paused image-ad request, `meta-image-ad.json`, demonstrates the current nested creative format. Replace the URL, Page, ad set, copy, and IDs with reviewed real assets before any creation.

<!-- tool-input: METAADS_CREATE_AD -->
```json
{
  "ad_account_id": "act_123456789",
  "ad_set_id": "238500000000003",
  "name": "Approved product explanation - image v1",
  "status": "PAUSED",
  "creative": {
    "type": "IMAGE",
    "page_id": "123456789012345",
    "message": "Explore the product and compare the available plans.",
    "website_url": "https://example.com/product",
    "image_url": "https://example.com/approved-product-image.jpg",
    "call_to_action": "LEARN_MORE"
  }
}
```

```sh
postplus channels tools show METAADS_CREATE_AD --json
postplus channels tools run METAADS_CREATE_AD --connection "<connection-id>" --target-id act_123456789 --target-path ad_account_id --input-file meta-image-ad.json --operation-id "<create-ad-operation-id>" --wait --json > meta-create-ad-result.json
```

Check `B.success` and `B.id`, then read the created ad and its parents. Creation is not proof of approval, correct rendering, or delivery. `METAADS_CREATE_AD_CREATIVE` separately accepts `account_id`, `name`, and a similar `creative` object, returning `B.id`/`B.success`; the current `CREATE_AD` input has no `creative_id` field, so do not invent a direct ID handoff between these two tools. A VIDEO creative needs a real `video_id` and thumbnail `image_url` or `image_hash`; local paths are not those values. Use the media rules in channel execution.

Current boundaries:

- Do not automate Meta budget amounts through this Skill. The fixed tool schema exposes numeric `daily_budget`, `lifetime_budget`, and `spend_cap` inputs described only as "account currency"; it does not establish whether to pass major or minor currency units. Campaign inspection retains budget values as raw platform strings and marks conversion unverified. The generic tool path does not add a Meta amount preflight or independent budget readback. Prepare a concrete proposal, but require verified input-unit semantics and a readback path before executing it; never assume multiplication by 100 or reuse the `spend` metric's parsing rule.
- There is no general `UPDATE_AD` or `UPDATE_AD_SET` operation here. A request to pause one ad must not become a campaign pause. `METAADS_UPDATE_AD_CREATIVE` changes name/status, not the ad's copy or delivery state.
- Creative preview is not an available execution path. Review the actual asset and use an authorized platform UI inspection when a placement preview is needed.
- `METAADS_LIST_LEADS` requires an ad or lead-form `source_object_id`, not an account/campaign/ad-set ID, and exact target binding to that field. Request `field_data` only if answers are needed. Follow `after` pagination and keep lead data out of public deliverables.
- Pixel setup and event receipt use [measurement](measurement.md). Never send fabricated conversion events to make an audit pass. Activity logs are partial platform evidence, not a complete record of PostPlus actions.

## Deliverable

Provide an object-level table containing ID/name, window, spend, chosen conversion definition, observed result, business target, evidence coverage, diagnosis, proposed action, and review date. Attach the saved request/result files and any exact change receipt. Name missing CRM joins, incomplete listings, untested field combinations, or unsupported operations explicitly. A clear partial review is useful; a falsely complete account verdict is not.
