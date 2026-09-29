# B2B Growth and Account Experiments

Use this reference when paid acquisition produces weak leads, sales cycles are
long, or the user wants to influence named accounts. Optimize the business
stage that is constrained, using the evidence available at that stage.

## Name the outcome before selecting a channel

Map the buyer's situation to a useful task. These motions can coexist; do not
force a new business into a fixed budget split or launch sequence.

| Motion | Buyer situation and offer | Early evidence | Business outcome |
| --- | --- | --- | --- |
| Create interest | Recognize a problem; educational example or useful point of view | Relevant content consumption, returning visits, target-account engagement | New qualified demand over an appropriate observation window |
| Capture active demand | Evaluate solutions; product demo, trial or consultation | Relevant visits, completed requests, attended demos | Qualified opportunities and new customers |
| Advance an evaluation or trial | Needs proof, stakeholder support or product activation | Proof consumption, activated use, buying-group participation | Stage progression, trial conversion, time to decision |
| Reopen a stalled decision | Earlier constraint may have changed | Renewed engagement and an actual reason to reconsider | Requalified opportunity or win |
| Grow an existing account | Has another relevant use case or team | Adoption and interest from the eligible account | Expansion contribution and retention |

Existing customers, trials, and open opportunities can be useful starting
points when eligible audiences and relevant offers exist. They are not always
large enough for ads, and they should not be mixed into new-customer CAC.
Choose channels by reachable buyers, intent, creative fit, marginal economics,
and measurement capability. Review marketplaces or sponsorships can be options
without being executable PostPlus channel tools. A channel test needs its own
authorized scope and budget; no automatic fixed-dollar campaign.

## Diagnose the full lead chain

Define stages with the sales owner rather than assuming an industry label:

`ad exposure → destination visit → form submitted → contactable lead →
qualified lead → opportunity → won customer → collected contribution`

For every stage, retain the qualifying rule, source, timestamp, stable record
ID, and period. Read advertising costs from [performance-report](performance-report.md)
and platform references; read website behavior through [measurement](measurement.md).
CRM stage history, won revenue, and cash receipts require a real user export
or a separately verified available integration. There is no universal
`postplus crm` command in this workflow.

Separate the date of lead acquisition from the date it became an opportunity
or customer. Compare cohorts at a similar age, account for sales-cycle and
conversion-reporting lag, and report incomplete cohorts as incomplete.
Reconcile platform-attributed counts with deduplicated business records; record
discrepancies instead of forcing them to agree. One lead may submit multiple
forms, and an opportunity can include multiple people.

| Observed change | Check before recommending a change |
| --- | --- |
| Click cost falls, qualified leads do not improve | Query/audience relevance, landing-page promise, spam/duplicate rules, and attribution |
| Forms increase, qualification rate falls | Offer incentives, form questions, source/ad mix, definition changes, and sales review coverage |
| Qualification is strong, opportunities stall | Response delay, attendance, buying roles, proof gaps, timing, and actual sales capacity |
| Pipeline grows, wins do not yet follow | Cohort maturity, stage age, loss reasons, close probability, and revenue quality |
| Frequency rises while new accounts reached flatten | Audience concentration, creative response, overlap, and remaining eligible accounts |

### Read actual Meta form leads when necessary

Use [channel-execution](channel-execution.md) for identity, result status, and
recovery. `source_object_id` is an actual **ad or lead form ID**; an account,
campaign, ad set, Page or individual lead ID cannot replace it. Start with
identifiers and attribution fields. Request `field_data` only when the task
needs submitted answers and the user has authorized access to that data.

Save this as `meta-leads.json`, replacing the illustrative source ID with the
verified ad or form:

<!-- tool-input: METAADS_LIST_LEADS -->
```json
{
  "source_object_id": "23851234567890123",
  "fields": ["id", "created_time", "ad_id", "campaign_id", "form_id", "is_organic"],
  "limit": 25
}
```

```bash
postplus channels tools show METAADS_LIST_LEADS --json
postplus channels tools run METAADS_LIST_LEADS \
  --connection "$ADS_META_CONNECTION" \
  --target-id 23851234567890123 --target-path source_object_id \
  --input-file meta-leads.json --operation-id "$ADS_OPERATION_ID" \
  --wait --json > meta-leads-result.json
```

Replace both copies of the source ID together. After confirmed success, let
`B = output.result.data`; leads are `B.data[]`. Use
`B.paging.cursors.after` as the next request's `after` when more pages exist,
keeping the original fields/source. Save each response. This tool has no date
filter parameter: restrict by returned `created_time` locally, continue needed
pages within the authorized bound, and state if the requested window remains
incomplete. Do not call a provider `paging.next` URL directly.

Deduplicate lead IDs; keep organic leads separate when the field is present,
and mark missing origin as unknown. `field_data` contains form answers, not
independently verified budget, qualification or revenue. Keep personal details
out of the aggregate report unless the task requires them. Join to CRM records
only through a verified shared identifier or documented mapping, never by row
position or a guessed name match.

## Build a quality signal the team can trust

Use a shared rubric for fit, urgency, and buying readiness. One possible
working scale is 0–3 per dimension, with an explicit description for each
score. Treat unassessed as unknown, not zero. Log who reviewed, when, and why;
use sales-confirmed evidence rather than an Agent's guess from a job title.

Report qualified count/rate, disqualification reasons, score distribution, and
reviewed fraction beside CPL. A small score average does not justify automatic
scale or pause, and no universal score cutoff is reliable. A more mature
downstream event may be useful for optimization only when its definition,
timeliness, volume, and feedback path are dependable.

Illustrative same-maturity cohorts:

| Campaign | Spend | Forms | Qualified leads | CPL | Cost per qualified lead |
| --- | ---: | ---: | ---: | ---: | ---: |
| A | $1,000 | 50 | 5 | $20 | $200 |
| B | $1,000 | 20 | 8 | $50 | $125 |

B has fewer, more expensive forms but a lower qualified-lead cost in this
sample. Recommend checking reviewed coverage and later opportunity outcomes
before shifting budget. Do not infer wins or profit from those eight leads.

For a repeatable stop/review rule, use the agreed allowable CPL from
[payback](payback.md), mature conversion lag, and an explicit loss bound.
For example, reaching 2–3 times target CPL with zero leads can trigger review
of a new test; it is a heuristic, not statistical proof or automatic pause
authorization. Check tracking and delivery first. When replacing an active
producer, prepare the replacement and its measurement before disrupting it.

Closing the feedback loop requires real stage changes, consent/identity
handling, and an actually supported destination. Google's conversion-action
configuration tool does not upload offline sales. Meta event submission is a
separate real write; use [measurement](measurement.md) only for an explicit,
supported request, never to fabricate conversions during an audit.

## Design named-account experiments

Start with an agreed account list, buying roles, stage, value at stake, reason
ads might help, and sales follow-up owner. If the audience is too small to
serve or economics do not support it, recommend a different contact/content
motion; do not pad or duplicate records to imply a usable audience.

1. Choose account-specific, a small similar cluster, or a broader named list
   based on the value and creative work justified. Separate materially
   different company sizes, markets, and stages when concentration would hide
   under-served priority accounts; avoid needless fragmentation.
2. Convert the hypothesis to available targeting through
   [audience-planning](audience-planning.md). LinkedIn can discover facets,
   find target entities, and estimate audience counts. Its current tools here
   do not provide a paid performance report, campaign mutation or list upload.
   Estimates are not actual reached accounts.
3. Match proof to the buying stage: evaluation needs demonstration and fit;
   procurement may need implementation/risk evidence; a stalled deal needs a
   changed reason to reconsider. Avoid asking an existing evaluator to book
   the same introductory demo again.
4. Coordinate a relevant sales response using the team's existing process.
   Reporting does not authorize messages to prospects or colleagues. No
   messaging application is mandatory.
5. Define account-level outcomes and an observation period aligned to the
   sales cycle. If feasible, assign comparable accounts to a holdout before
   delivery, preserve the assignment, and assess uncertainty and contamination.
   Do not label an exposed/unexposed observational comparison as causal lift.

For LinkedIn plans, inspect job-function/seniority versus title precision,
audience concentration, regional costs, expansion/network settings, and
landing-page clicks rather than all social actions. Propose a controlled
comparison, not a guaranteed bid discount or fixed audience-size benchmark.
For Meta, strict named-account targeting is not native company targeting;
validate eligible first-party audiences and expansion behavior in the actual
platform. Do not invent enrichment or upload support. Public comments are
not a contact source for customer-list targeting.

Cross-channel retargeting depends on actual tags, consent, traffic, audience
rules, and supported configuration. Consistent UTM values help describe the
journey but do not by themselves create an audience or prove attribution.
Record the creation date and real coverage of remarketing pools; do not
assume historic visitors have been collected.

## Expand the constraint that is actually limiting growth

Before proposing more spend, identify the stage with enough mature evidence
to be a constraint and check how much additional volume the team can handle:

| Observed constraint | First test to consider | Check before spending more |
| --- | --- | --- |
| Too few relevant buyers reached | Adjacent eligible segment, market, or message angle | Size and buyer fit, exclusions, platform eligibility, and whether the new cohort can be measured separately. |
| Visits rise but qualified requests do not | Offer, proof, page promise or qualification path | Tracking, traffic intent, form completion, and reviewed lead quality; more reach may amplify waste. |
| Qualified requests arrive but opportunities stall | Sales response, buying-role proof, or a stage-specific follow-up offer | Response time, capacity, account ownership, and cohort age; ads alone may not remove the constraint. |
| Opportunities progress but contribution is weak | Deal mix, pricing or acquisition cost bound | Mature wins, margin and payback; platform-attributed pipeline is not collected return. |

Write one bounded test with baseline, spend exposure, owner, leading signal,
business outcome and review date. If the limiting stage or its measurement is
unknown, resolve that before specifying a larger budget. Any channel write
must use its supported operation and authorization route; a strategic test
card is not a generic command to launch a LinkedIn campaign.

## Deliver the next decision

Produce a stage table with source/count/age/coverage, the most consequential
constraint, and one or two test cards: hypothesis, eligible audience, offer,
proof, channel, authorized spend bound, early indicator, downstream outcome,
review date/lag, and decision condition. Name missing CRM or finance evidence.
Show what can be read or prepared now and what needs an unsupported platform
step. Plans, reporting, and favorable economics do not authorize new spending.
