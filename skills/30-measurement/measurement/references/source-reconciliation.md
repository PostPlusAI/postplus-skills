# Reconcile reported sources without pretending their events are identical

Read this only when the user asks why two sources disagree or whether one is
broken. Use the GA4 or Search Console reference for its executable read path;
use the advertising task for an ad-platform report or conversion setting.
This reference owns the **comparison decision**, not another copy of each
platform's request schema.

Start by writing down what each number counts. For example:

| Source | Counted observation | Commonly different from |
| --- | --- | --- |
| Google/Meta/TikTok/Reddit/Pinterest Ads report | Its stated ad click, spend or attributed conversion at the selected object and attribution window | Website session, settled order, qualified lead or organic search click. |
| GA4 `GOOGLE_ANALYTICS_RUN_REPORT` | A defined session, user, event or key event for the chosen property and dimension | Advertising-platform credited conversion and Search Console click. |
| GSC `GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY` | Organic Google search impression or click on a selected property/search type | Paid ad click and onsite GA4 session. |

Build a comparison sheet before interpreting a gap: exact account/property/site,
selected page or campaign, date boundaries and timezone, available currency,
metric name, event name, filters, attribution window, conversion lag, consent
and possible missing rows. Compare like with like where possible; if events
remain fundamentally different, explain the relationship instead of forcing
equality.

For “paid campaign clicks exceed GA4 sessions”, use the ad platform's exact
campaign and period read plus GA4 `GOOGLE_ANALYTICS_GET_PROPERTY`, metadata,
compatibility and `GOOGLE_ANALYTICS_RUN_REPORT`. Confirm the GA4 session source
dimension, campaign identity and landing site. Potential explanations include
multiple clicks in one session, a session that never starts, consent or tag
behavior, redirects, cross-domain journeys, blocked/late events and attribution
differences. State each as a hypothesis until an actual page, tag, event or
report proves it. Never relabel all Meta clicks as landing-page visits.

For “Search Console organic clicks exceed GA4 organic sessions”, use
`GOOGLE_SEARCH_CONSOLE_LIST_SITES` and
`GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY` with the exact property,
`search_type`, dates and page dimensions, then the corresponding GA4 property
and session-source report. First eliminate property/subdomain mismatches and
incomplete dates. A GSC click is not guaranteed to start a new GA4 session.
Inspect a particular URL with `GOOGLE_SEARCH_CONSOLE_INSPECT_URL` only when
the user's question is about that URL's indexing/canonical evidence; a missing
analytics row by itself is not a reason to claim it was deindexed.

For “platform conversions exceed real customers”, identify the selected
conversion action, key event, counting rule, default value and attribution
window; compare mature cohorts with order/payment or CRM evidence supplied by
the user. A received event is not automatically a qualified lead or settled
sale. If business-outcome evidence is absent, stop at the observable discrepancy
and the precise missing evidence. A measurement diagnosis alone does not
authorize sending conversion events, editing tags, changing campaign goals or
changing the website.

Return the aligned comparison, verified reasons for differences, unresolved
causes and the next smallest read or inspection that would distinguish them.
