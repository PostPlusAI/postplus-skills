# Acquisition Economics and Payback

Use this reference to assess an affordable acquisition cost, compare customer
segments, or model how long acquisition cash is tied up. Work from supplied
reports and finance data first. A calculation does not need an advertising
connection or a new paid collection when the inputs already exist.

## Define the costs, customers, and clock

State the currency, segment/plan, acquisition cohort, observation cutoff, cost
allocation, and outcome definitions before calculating. An acquisition cohort
is a group brought in during a defined period; follow that group forward.
Do not divide this month's marketing cost by old leads that happened to close
this month without explaining the timing mismatch.

| Input | Definition to establish | Common error |
| --- | --- | --- |
| Media cost | Actual advertising spend for the scope | Treating the budget cap as actual cost |
| Acquisition cost | Media plus allocated creative, agency, sales and other acquisition costs | Calling media-only CAC fully loaded CAC |
| New customers | Deduplicated new paying customers from the cohort | Counting leads, free users, repeat orders or expansion as new customers |
| Revenue | Agreed revenue basis, net of relevant refunds/discounts; exclude collected taxes | Treating platform conversion values or pipeline value as collected revenue |
| Contribution | Revenue less agreed delivery/servicing and transaction costs, counted once | Using revenue alone as profit, or deducting costs twice |
| Cash | Actual receipts and cash outflows by date | Treating recognized revenue, an invoice, or annual contract value as cash today |
| Retention | Observed surviving customers or cohort revenue by age | Multiplying every month by one annual retention rate |

Get missing ad spend using [performance-report](performance-report.md) and
the relevant platform recipe: `GOOGLEADS_SEARCH_STREAM_GAQL` /
`GOOGLEADS_GET_RMF_REPORT` or `METAADS_GET_INSIGHTS`, invoked through
`postplus channels tools run`. Preserve source files, dates, currency, and
conversion definitions. Do not sum overlapping attributed revenue from
Google, Meta, and analytics. GA4 can corroborate measured events but is not
the finance ledger. There is no inferred CRM or revenue-download command.

## Calculate the quantity that answers the question

```text
Media CAC = media cost / new paying customers
Fully loaded CAC = total allocated acquisition cost / new paying customers
CPL = media cost / leads
Cost per qualified lead = media cost / qualified leads
```

All denominators must match the numerator's segment and cohort. With zero
customers, CAC is undefined and observed payback has not been established;
do not report zero CAC. Missing customers are unknown, not zero.

For a stable subscription with no material delay or churn in the modeled
window, a simple approximation is:

```text
Monthly contribution per customer = monthly net revenue × gross margin
Simple contribution payback (months) = CAC / monthly contribution per customer
```

Use this only when the margin definition includes the relevant cost of service;
otherwise calculate contribution directly. This is a contribution-payback
approximation, not net-profit payback or a cash forecast. Revenue-only
`CAC / monthly revenue` is a revenue recovery ratio and generally overstates
how quickly costs are recovered. The margin-adjusted convention is explained
in [Stripe's CAC payback guide](https://stripe.com/resources/more/what-is-the-cac-payback-period).

### Example: plan-level economics matter

Illustrative inputs: CAC $300 for each plan, gross margin 80%, no delay/churn
in this simple model. These are not PostPlus prices or benchmarks.

| Plan | Monthly revenue | Monthly contribution | Simple contribution payback |
| --- | ---: | ---: | ---: |
| Starter | $9 | $7.20 | 41.7 months |
| Pro | $99 | $79.20 | 3.8 months |
| Enterprise | $999 | $799.20 | 0.38 months |

The last number is a fractional monthly approximation; with monthly billing
it is not proof that cash comes back after 11 days. Enterprise sales/onboarding
costs may also make equal CAC unrealistic. Compare actual cohort costs before
recommending a segment. A short modeled payback does not establish demand,
capacity, retention, or permission to raise spend.

## Model cohort retention and collection timing

When churn, payment delay, annual billing or expansion matters, use monthly
cash/contribution flows rather than one blended formula:

```text
Cumulative contribution at month m = sum of cohort contribution in months 1..m
Contribution payback = first month cumulative contribution covers acquisition cost

Cumulative cash at month m = cumulative customer receipts
                            - acquisition cash outflows
                            - service and other included cash outflows
Cash payback = first month this balance reaches zero or above
```

Specify the start of the clock: acquisition spending, customer activation, or
first payment. For observed cohorts use actual flows. For a forecast label
each retention, expansion, margin and collection assumption; do not fill
future months as if observed. Annual cash prepayment can improve early cash
while service obligations continue. Show the projected cash path afterward,
not only the first crossing.

Illustrative monthly cohort, 100 original customers and $30,000 acquisition
cost, $100 net monthly revenue per surviving customer, 80% contribution
margin, no expansion or payment delay:

| Month | Paying survivors | Monthly contribution | Cumulative contribution |
| --- | ---: | ---: | ---: |
| 1 | 100 | $8,000 | $8,000 |
| 2 | 90 | $7,200 | $15,200 |
| 3 | 80 | $6,400 | $21,600 |
| 4 | 75 | $6,000 | $27,600 |
| 5 | 70 | $5,600 | $33,200 |

Contribution payback is observed in month 5 under these stated inputs. The
flat no-churn approximation gives 3.75 months and misses the slower recovery.
If only three months have elapsed, report "not yet recovered; $21,600 of
$30,000 covered" and keep months 4–5 as a separate forecast.

"Discounted payback" requires an explicit time-value discount rate applied
to dated cash flows, for example `cash flow at month t / (1 + monthly rate)^t`.
Retention adjustment alone is not discounting. Do not substitute annual
retention into the denominator and call the result a discounted payback.

## Translate customer economics into media limits

Choose an acceptable contribution/cash recovery horizon with the business.
There is no universal three-to-twelve-month gate for every plan or company.
Use observed conversion rates from mature, comparable cohorts and show their
sample sizes.

```text
Allowable media CAC = acquisition contribution allowance
                      - non-media acquisition cost per customer
Allowable CPL = allowable media CAC × lead-to-paying-customer rate
Allowable CPC = allowable CPL × click-to-lead rate
```

The acquisition contribution allowance is what the business is prepared to
spend within its chosen horizon, after the desired contribution reserve. It
is not automatically the full contract value. Keep the lead definition in the
close rate identical to the definition used for CPL. A negative available
media allowance means the stated economics cannot support additional paid
acquisition; do not hide it by clamping to zero.

Illustrative decision: forecast contribution within the chosen horizon is
$1,200 per customer. Reserve $300, and allow $200 for non-media acquisition.
That leaves allowable media CAC of $700. With a 10% lead-to-customer rate,
allowable CPL is $70. With a 5% click-to-lead rate, allowable CPC is $3.50.
If the close rate is only 5%, those limits fall to $35 and $1.75. These are
assumption-based spending limits, not guaranteed break-even outcomes.

For one-time purchases, model net order contribution after returns and
variable costs and the probability/timing of repeat purchases. A recurring
revenue denominator is inappropriate. For existing-account expansion, show
incremental cost and contribution separately from new-customer acquisition.

## Deliver a decision with uncertainty

Return a compact input table with source, period, unit and observed/assumed
status; the formulas and result per segment; contribution and cash views when
both matter; and sensitivity to the variables that can reverse the decision.
At minimum test a plausible worse CAC, retention/close rate and margin when
those are uncertain. If there is insufficient data, deliver the calculation
structure and the specific missing inputs, not invented revenue.

Recommend hold, bounded test, stop/review, or consider scale against the user's
horizon and cash constraint. State which assumption the decision depends on.
Revisit the cohort as it matures and compare marginal CAC at higher spend to
historical average CAC. Keep LTV estimates as a separate long-horizon view;
they do not remove the need to check when cash returns.

Any actual campaign, bid, or budget change follows the selected platform
reference and [channel-execution](channel-execution.md). A favorable spreadsheet
is not spending authorization, and ad-platform ROAS is not net profit.
