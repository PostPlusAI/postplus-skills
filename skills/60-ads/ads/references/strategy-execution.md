# Execute an Ad Strategy

Use this reference for a strategy copied from the PostPlus Ad Strategy library.
The copied prompt supplies initial goals, conditions, actions and cadence.
Use it to prepare recommendations, then execute the user's final configuration
through their selected mode. Reading this reference does not install automation.

[Channel execution](channel-execution.md) owns connection selection, tool
discovery, current input/output schemas, target binding, operation identity and
recovery. The selected platform reference owns metric interpretation, object hierarchy,
supported changes and amount-unit limitations. [Performance reporting](performance-report.md)
owns comparable windows, aggregation and incomplete-data handling. Read those
contracts as needed rather than inventing a second tool schema from a strategy.

## Select the platform reference

Compare the actual task platform to the prompt before execution. The user's latest
explicit platform choice wins; otherwise retain the prompt platform. A connection
to another platform is never permission to switch. Reuse the campaign-type choice;
if missing, recommend from known account context and resolve it before type-specific calls.

When platform/type match and embedded parameters apply, use them directly without
rereading field documents. Still verify account, campaign type, budget ownership
and needed tool interfaces. On a platform change, read only the new target's relevant
metric/action sections and remap, preserving user logic, thresholds and object scope.
Do not carry over old platform fields. Read the corresponding reference only when
parameters are missing, inapplicable to the actual type, or conflict with the tool.
Explain unsupported levels/operations and let the user choose an adjustment; never
silently substitute a parent or another operation.
A template's intermediate group is an ad set on Meta and an ad group elsewhere;
that vocabulary mapping does not prove equivalent budget ownership or operations.
Keep the selected IDs and hierarchy. Never silently replace a group action with
its campaign or apply Smart+ tools to manual campaigns.

| Platform / connection | Reference for remapping or binding conflicts |
| --- | --- |
| Meta / `meta-ads` | [Meta field lookup](meta-ads.md#strategy-field-lookup) |
| Google / `google-ads` | [Google field lookup](google-ads.md#strategy-field-lookup) |
| TikTok / `tiktok-ads` | [TikTok field lookup](tiktok-ads.md#strategy-field-lookup); distinguish manual, Smart+ and GMV Max. |
| Reddit / `reddit-ads` | [Reddit field lookup](reddit-ads.md#strategy-field-lookup) |
| Pinterest / `pinterest-ads` | [Pinterest field lookup](pinterest-ads.md#strategy-field-lookup) |

Copied prompts carry only the relevant concrete fields, event definitions, formulas,
units and action parameters, generated from the same internal parameter source as the platform references.
Each platform's generated Prompt parameter bindings section uses the same source.
Binding labels are not API parameters. If the prompt already supplies applicable
bindings, use them; the reference supplies remapping and conflict resolution. Inspect `tools show` on first use of each
needed tool/version; reuse that inspection within the task. Refresh when the tool,
version, parameter branch or returned contract changes. Runtime availability and
account permission still govern the call. A free-form query/metric string does
not validate its vocabulary or combination: use the platform's documented recipe
and verify actual returned keys and scope. Do not search the full tool directory
when the reference already identifies the operation.

## Work from the requested outcome

1. Reuse supplied inputs, exports, account context, authorization and mode.
   Identify whether the user wants configuration, rule evaluation or execution,
   and the intended goal, objects and scope. Ask only for consequential gaps.
2. Check the selected mode's coverage before fetching data: use
   [AI-direct coverage](#check-ai-direct-action-coverage) for direct actions and
   platform support for manual steps. Preserve dependencies and resolve any
   necessary mode change; an unsupported write does not block independent advice.
3. Connect only when live data or an authorized connected operation is needed,
   following [channel execution](channel-execution.md). Strategy discussion and
   sufficient supplied exports do not require OAuth. Read only the missing
   fields, objects and periods needed for the requested decision or action.
4. Evaluate the evidence and propose any useful adjustments. Let the user set
   the final configuration and mode; reuse existing choices and authorization.
   Recommendations do not overwrite user-set values or require repeated approval.
5. Execute the authorized final configuration or provide the selected manual
   handoff. Configuration or evaluation alone does not authorize a write.
6. Read back the affected IDs and fields, then report the actual operator,
   evidence and remaining work using the compact handoffs below.

Treat the template as initial values. The user's final goals, thresholds,
AND/OR grouping, object scope, cadence and limits are authoritative. AI
recommendations must not silently replace them or restore template values.
Record the chosen execution mode and cadence separately: AI-direct or platform-manual
execution, with a single pass, user-initiated reviews, or unattended recurrence.
Manual platform operation is a valid mode. A missing AI write API blocks the
affected AI-direct action only when that mode is selected; it does not make the
whole strategy unavailable. Do not silently switch modes. Explain the exact gap
and obtain the user's mode change if needed.

## Preserve the finalized rules

Resolve the following from the user's final configuration and account context.
Ask only for missing or conflicting facts that change the requested action.

- Keep the selected goal: purchases, leads, app purchases or another explicitly
  supplied event. Do not combine other goal variants of the same strategy.
- Keep every rule and task, its AND/OR groups, comparison operators, thresholds,
  exclusions, active-only filters, name filters, ranking cohort and action order.
  A date phrase such as “between 11 am and 12 pm” is one time condition.
- Resolve each task's action **and target**: campaign, ad set or ad, account ID,
  exact object IDs and parent IDs. Separate the metric's scope from the object's
  action scope: account ROAS can be a guard for an ad-set action. A title alone
  does not establish the target. Resolve conflicts between prose and conditions
  before a write rather than guessing which instruction to discard.
- Retain the finalized evaluation period, execution hours, cadence, cooldown,
  lifetime limits, budget caps, spend limits and custom metrics. Do not discard
  these to fit a tool. For a manual review, check prior actions when a cooldown
  or lifetime limit affects eligibility; this does not require an automated runner.
- Reuse authorization for the exact account, objects, action and spend scope.
  A copied template does not by itself authorize changes. If the user has already
  authorized the requested execution, do not request the same approval again.

For example, `(A OR B) AND C` must keep `C` as a guard on both branches. Two
separate pause tasks remain separately evaluated tasks; do not merge them into
one flattened expression. Evaluate ranking rules over their complete eligible
cohort, including zero values only when the rule says to do so. Resolve tie
handling if it changes which objects receive an action.

## Bind metrics before evaluating conditions

Use applicable embedded field selections and calculations first. Consult only the
selected platform's relevant mapping when a binding is missing, inapplicable or
conflicts with the actual tool. Binding guidance is not a new tool schema; never
send binding labels or rule conditions as invented inputs.
If a declared binding points to missing installed Skill guidance, follow the
existing PostPlus update/recovery instructions and reload the Skill when
required. If the binding remains unavailable, name the gap and leave dependent
conditions unknown; do not guess. Missing user event/formula definitions instead
need that information, not an installation repair.

Record the exact source, formula, unit, object level, date range and attribution
for each metric. Use account currency and record both the rule timezone and report timezone. If the report uses a fixed timezone, prove alignment or leave the comparison unresolved; do not relabel its dates. A `$` amount in a template
must be resolved to an approved amount in that account's currency; do not
silently apply it to another currency.

| Strategy input | Required binding |
| --- | --- |
| Purchases, leads, mobile app purchases or installs | One verified platform event or conversion action matching the selected business event; never combine overlapping events or treat mixed conversions as purchases. |
| Purchase/lead/app value or ROAS | The matching event value and its attribution definition; ROAS = selected attributed value / spend. Lead count is not lead value. Missing value or CRM joins remain unknown. |
| CPP, CPL, cost per install or another event cost | Spend / the selected event count at the same scope, dates and attribution. Keep a target cost distinct from the observed cost. |
| CTR, CPC, CPM | CTR = 100 × matching clicks / impressions (1% = 1); CPC = spend / matching clicks; CPM = 1,000 × spend / impressions. Keep all-click and link-click metrics distinct; do not substitute one for a missing field. |
| CAC, target CPA, ROAS (Leads), custom timeframe or a named custom metric | CAC, CPL and target CPA are user-selected business targets, not observed costs. Resolve custom formulas, constants, sources and periods from supplied definitions. A `customMetric` marker or metric name is not a formula. Customer acquisition cost needs the agreed customer definition, not an assumed platform lead. |
| Dynamic CBO | Apply the supplied formula, such as target CPA × current active ad-set count, with the specified account/campaign filters. Confirm the multiplier and what “active” means. Calculating a proposed amount does not resolve the budget-write contract. |
| Creation age, current status, number of ads/ad sets, budget or bid | Read actual object settings at the required level. No delivery in a period is not proof of creation time; a first listing page is not an object count. Retain raw budget values until their units are verified. |

Preserve each named window exactly, including “incl. today”, “incl. current
hour”, previous complete days, lifetime, custom ranges and comparison periods.
For Last N days including today use today minus N−1 through today; without today use the previous N complete days. Today/yesterday and their combined window retain those exact dates. Maximum needs explicit available start/end dates; it is not an invented lifetime preset. Resolve relative dates once in the rule timezone, record the fetch time and keep the
same attribution selection across comparable queries. Daily data cannot prove
“last 2 hours” or an exact rolling 24-hour condition. If the supported report
cannot supply the required granularity, mark that condition unevaluable; do not
silently substitute yesterday. Likewise, do not turn a three-day total into a
daily average unless the rule defines that calculation.

Use the selected platform report at the verified object/level pairing. Continue supported pagination without changing filters,
fields or attribution. Report incomplete coverage when a listing or report
cannot expose the full cohort. Compute ratios from compatible totals; unique
reach and frequency require the appropriate aggregate query. Missing or
suppressed values, unavailable fields and zero denominators are unknown or not
calculable, never invented zeros. Preserve true / false / unknown conditions;
do not write when unresolved inputs could change which objects qualify.

## Check AI-direct action coverage

This table covers AI-direct actions, not whether the strategy can be executed
manually on the platform. [Channel execution](channel-execution.md) owns current
tool discovery, availability, schema inspection and submission. Tool coverage
and account permission are separate requirements; never invent an operation,
call the provider directly or substitute a broader target to bypass a gap.

For Pause/Start, name markers, budgets, bids and duplication, use the selected
embedded operation binding at the exact object level; consult its platform reference
only for a missing/inapplicable binding or a tool conflict.
A read field is not evidence that the corresponding field is writable. Verify
budget ownership and shared-resource impact, bidding mode, amount units and
same-object readback. A missing write path does not invalidate a user-chosen
manual mode; it does not authorize switching modes or editing another object.

Notify returns matching conditions here unless the user selected an external
destination. Unattended recurrence needs a real scheduler and durable state;
a single pass or user-initiated review does not. Creating a new object does not
implement exact duplication; verify source and every new copy separately.

For an explicitly requested Slack notification, route to the
[Channel Messaging Skill](../../../50-publishing/channel-messaging/SKILL.md)
with the approved destination and alert content. Its connection and tool schema
own delivery. An email destination needs its own available sending capability;
do not substitute Slack or this conversation for a requested email delivery.

## Record the final configuration

Keep one compact handoff in the current task; no extra document is required.
For each field give its value and basis: `user-set`, `suggested` or `missing`.
Keep these distinct; a suggestion is not a final setting or an authorization.
Use the user's language for these labels. This is a handoff, not an API payload.

| Field | Record |
| --- | --- |
| Goal / request | Selected conversion goal; configure, evaluate or execute. |
| Target | Account, campaign/ad-set/ad level, exact IDs and parents; metric scope if different. |
| Event / formula / attribution | Exact event binding, custom formula/constants and attribution selection. |
| Time / currency | Evaluation and comparison windows, timezone, partial-period status, currency and units. |
| Condition | Exact AND/OR groups, operators, thresholds, filters and ranking cohort. |
| Action / mode / cadence | Final change, AI-direct or platform-manual, single pass/user reviews/unattended recurrence, limits and authorization scope. |

## Execute the selected mode and verify the same objects

For platform-manual execution, give precise steps with the account, object
level and IDs, parent context, current and final values, action order and scope.
For budget edits, verify the platform UI's displayed currency and amount for
that same object. Do not infer a conversion from ambiguous API budget values or
claim that a raw API amount independently verifies the change while its unit
remains unresolved. Label the platform evidence and its source accurately.
The user performs the platform changes. Verify the same object IDs and fields
through a supported read or ID-bearing platform evidence. For duplication,
record the source ID and each new copy ID; compare their parents and relevant
settings with the final configuration. Reading the source alone does not prove a copy
was created. For other creation, capture and verify the new IDs and parents.
A user report of completion without readable resulting state remains unverified.
Record the result as user-performed, never as an AI-executed write.

Execute authorized AI-direct tasks whose final conditions are met through
[channel execution](channel-execution.md), including its result retention and
state/recovery contract. Keep current/final values and operation evidence, and
independently read back the same objects and fields. If an earlier task changed
inputs used by a later task, re-read those inputs before evaluating that task.

Only unattended recurring execution requires a scheduler, persistent rule
state, deduplication, cancellation and recovery support. Verify those before
calling that mode installed. One-time execution and manual reviews have no such
infrastructure gate; retain any user-selected timing and eligibility conditions.

Internal acceptance follows the chosen mode: AI-direct execution needs a
consistent Strategy → Ads Skill → CLI → hosted tool path, a successful action
and same-object readback; manual execution needs the exact user-performed action
and verified resulting state. Contract tests establish code coverage, not a
live account result. Neither mode waits for advertising performance or
non-blocking presentation refinements. External effectiveness claims need their
own evidence.

## Return per-rule results

Use one compact row per rule, referencing the final configuration instead of
repeating its shared fields:

`Rule | Target IDs | Action / mode / operator | Condition + observed values | Execution status | Receipt / readback source | Remaining need`

- Condition: `true`, `false` or `unknown`. Missing bindings/data remain unknown;
  a true condition indicates eligibility, not that the action ran.
- Execution: `not executed`, `awaiting manual action`, `awaiting readback`,
  `verified`, `failed` or `unknown`. Use `not executed` for configuration-only
  work, no matches or unmet prerequisites, and state the reason. A submitted
  nonterminal action remains unfinished; follow channel recovery to resolve it.
- Record readback IDs, observed values and evidence source. `verified` requires
  that evidence; handing over manual steps means `awaiting manual action`.
  Execution `unknown` means the outcome is uncertain, not a false condition.

A verified one-time action can be complete while explicitly requested recurrence
remains unfinished. State both without calling the whole strategy unavailable
or substituting a report for requested execution.
