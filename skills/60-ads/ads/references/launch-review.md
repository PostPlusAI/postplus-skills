# Review a campaign before launch

Use this for launch readiness or configuration audits. Start with the campaign's
intended business event, offer, audience, geography, budget period, and launch
window. Inspect the parts that can prevent that outcome or cause avoidable loss.
Do not penalize a campaign for lacking an irrelevant platform feature.

## Record evidence, not checklist completion

For each applicable question record the exact account/object, evidence source
and observation time, observed condition, consequence, and next action. Use
`verified`, `needs correction`, `not observed`, or `not applicable`.
An unread page or inaccessible configuration is not a failed configuration.
Separate the coverage of an audit from the health of the checks actually seen.

Prioritize an incorrect destination, wrong event, wrong account, unintended
spend, rejected creative, or broken checkout above cosmetic improvements. A
large number of minor verified items cannot compensate for unknown purchase
tracking or an unchecked budget. Give a release decision for the observed scope;
avoid a universal percentage score that hides a decisive gap.

## Inspect the path from account to customer outcome

| Area | Evidence to obtain | How it changes the next step |
| --- | --- | --- |
| Account and access | Intended account identity, active connection, actual object permissions; billing/verification if observable | An active connection alone does not establish launch eligibility. Resolve access or account ambiguity before a write. |
| Objective and event | Selected optimization event, business definition, event destination, and counting/value behavior | An inexpensive button click is not a substitute for an order or qualified lead. Fix mismatched goals before interpreting CPA. |
| Audience and geography | Actual conditions, exclusions, location intent, languages, placements, and relevant eligibility | Align with acquisition/retention intent; check for accidental exclusions or unavailable targeting. |
| Offer and creative | Approved product facts, current offer, required rights, usable assets, destination consistency, platform review state | Correct unsupported claims, expired offers, or disapproved assets. A generated asset is not platform-approved creative. |
| Budget and schedule | Amount, currency, daily/lifetime period, linked objects, bidding constraints, dates and account timezone | Highlight the exact spend exposure. A lifetime budget is not a daily amount; a future start is not delivery failure. |
| Destination | Actual ad URL and redirects, mobile experience, readable offer, form/checkout path, confirmation | Identify where the user cannot complete the intended next step. Do not claim speed or functionality from a screenshot alone. |
| Measurement | Correct website/property/pixel, consent behavior where relevant, received events and duplicate handling, report definitions | Configuration, event receipt, attribution, and a financial sale need different evidence. |
| Reporting | Confirmed IDs, currency/timezone, business event, chosen comparison window, result files and known gaps | Preserve a baseline for comparison; do not aggregate incompatible conversion totals. |

### Google: follow the intended campaign type

Use [Google Ads](google-ads.md) to discover the customer and read the selected
campaign, budget, ads, search terms and conversion actions. Use
[measurement](measurement.md) for website event evidence. Check each applicable
item below; lack of a supported tool is `not observed`, not an implicit pass.

| Check | Evidence and decision |
| --- | --- |
| Account and spend | Confirm the actual customer is a spending account rather than a manager; record currency, timezone, payment/verification evidence, campaign dates, daily or total budget, shared-budget users, and who can change each object. A discovered ID alone proves none of these. |
| Goal and attribution | Match the campaign's selected goal to a real lead or sale, counting rule, value source, GA4 link or Google tag, and event receipt. A tag snippet or primary conversion-action flag alone does not prove a purchase is captured. |
| Search traffic | Check query intent, keyword/ad-group promise, location presence versus interest, language, network expansion, negative scope, ad policy and final URL. If there is no search-term report, the suitability of proposed negatives is unknown; never insert a generic list. |
| Shopping and Performance Max | Check eligible products, feed freshness, identifiers, price/availability, destination, shipping promises, product approval and Merchant Center diagnostics; distinguish advisory audience signals from actual restrictions. Use actual Merchant Center evidence, not a Search query, for feed health. |
| Demand Gen and assets | Match format, placement and visible proof to the intended destination. Check available creative and policy status for each used format; a campaign-level total cannot certify every creative or placement. |
| Landing and reporting | Follow the ad through its redirect to the mobile page and form/checkout; preserve campaign IDs and tagging. Confirm a baseline and conversion lag before interpreting the first report. |

Merchant Center, billing, account-level auto-tagging and some placements may
need an authorized platform view or user export. State the exact screen or
artifact needed; never claim `GOOGLEADS_SEARCH_STREAM_GAQL` observed a setting
it did not return. Search findings do not describe all Performance Max traffic.

### Meta: inspect the entire delivery chain

Use [Meta Ads](meta-ads.md) for the actual account, campaign, ad set, ad and
creative. `METAADS_GET_OBJECT`, `METAADS_LIST_CAMPAIGNS`, `METAADS_READ_ADSETS`
and `METAADS_LIST_ADS` expose different scopes. When pagination is not
re-enterable, label the sampled list incomplete.

| Check | Evidence and decision |
| --- | --- |
| Account readiness | Check the intended business/ad account, payment and permissions, currency/timezone and applicable restricted-category declaration in an authorized account view. Connection success does not prove ads can serve. |
| Objective and events | Match the campaign objective, ad-set optimization event and actual customer outcome. Inspect pixel/dataset association, event receipt, browser/server deduplication and selected attribution window; an event count alone is not attributed revenue. |
| Audience and delivery | Read geographic and audience conditions, applicable exclusions, configured versus effective parent/child states, schedule, review and learning evidence. An active campaign can contain an undeliverable ad. |
| Spend exposure | Identify the level that owns the budget, its daily/lifetime period, dates and proposed maximum loss. Do not infer the writable budget unit from account-currency spend. |
| Creative and destination | Inspect the actual Page/identity, approved image or video, allowed partnership usage, message and CTA, placement fit, landing offer and mobile journey. A created ad is not proof of approval or delivery. |
| First measurement | Check that IDs, tagged destination, selected conversion type, saved baseline and review date will let the user separate platform leads from qualified leads. |

Use `METAADS_LIST_AD_ACCOUNT_PIXELS`, `METAADS_LIST_CUSTOM_CONVERSIONS` and
`METAADS_GET_PIXEL_EVENT_STATS` only for the facts their outputs establish.
Inspect billing, domain or other settings through an authorized platform view
when the fixed tools cannot read them. Do not submit a fake event to make the
check pass; do not change a Meta budget amount while its unit remains unverified.

### LinkedIn, TikTok and another unsupported ads account

For LinkedIn, [audience planning](audience-planning.md) can discover targeting
entities and estimate audience size. To approve a launch, separately check the
intended Company Page, billing and access, job/function/company conditions,
audience exclusions, Insight Tag and conversion definition, lead-form privacy
and destination, budget period, creative format and reporting baseline. The
current channel tools do not expose full paid campaign state, so use an
authorized Campaign Manager view or export for those items. Organic page
statistics and an audience-size estimate cannot substitute for paid delivery.

For TikTok, first resolve advertiser and manual versus Smart+ campaign; only
then check payment/access, actual audience conditions, goal and pixel/event
receipt, schedule/budget period, video proof and sound rights, mobile
destination, review state, and a relevant baseline. Shop/GMV Max checks apply
only when the account actually has that setup. [TikTok Ads](tiktok-ads.md)
provides specialty reports, not a generic full-account audit. If the task is
another platform such as X Ads, inspect its real platform view or user export;
do not infer readiness from an unrelated PostPlus social connection.

## Check the real journey when authorized

Use the available browser for a supplied page or the observed ad destination.
Follow redirects, inspect the mobile layout, and identify the requested next
action. Reading a form differs from submitting it. Do not place an order, send
a lead, upload contacts, or transmit a conversion event merely to complete an
audit; establish that the specific test and its effects are authorized.

Read [measurement](measurement.md) for GA4 property/data-stream/key-event checks
and for the distinction between configuration, validation and event receipt.
Do not ask the user to paste secrets into the conversation to unlock a check.
If a necessary check cannot be done with the available access, name the exact
missing evidence and the supported way to obtain it.

## Deliver a bounded launch decision

Return the campaign scope and intended outcome, material verified facts,
blocking corrections with their consequence, unobserved critical items, and
the next supported action. For example: “The ad and landing-page offer match;
purchase attribution remains unverified, so spend efficiency cannot yet be
judged.” Do not claim readiness across platforms that were not inspected.

An audit is not authorization to launch. For an explicitly requested change,
use [channel execution](channel-execution.md) and the relevant platform recipe,
preserving the exact object and existing approval. After a launch, distinguish
accepted configuration from actual delivery and business results.
