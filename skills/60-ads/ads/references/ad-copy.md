# Ad Copy and Testable Variations

Use this reference to write or improve ads from approved product facts,
audience evidence, and a clear next action. Pure copywriting needs no account
connection, paid research, or remote draft. Use supplied material first.

## Establish what the ad can promise

Capture the product, intended buyer/problem, offer, destination, language,
placement, desired action, and proof. Reuse facts already present in the task.
Ask only for missing information that changes the promise or prevents a usable
deliverable; an unknown final URL need not stop wording drafts, but must remain
a visible blocker to submission.

Maintain a short claim map: `claim | source | permitted wording | limitation`.
Product functionality supports a demonstration; it does not automatically
support a measured improvement. A customer quote needs its actual wording and
appropriate permission. Do not invent testimonials, customer counts, discounts,
deadlines, clinical outcomes, or performance percentages to fill a template.

Use [creative-research](creative-research.md) when a specific evidence gap
justifies collection. Use `benchmark-to-brief` when validated research already
exists; adapt the mechanism and buyer problem instead of reproducing a
competitor's copy or visual identity.

## Choose a message that earns the next line

| Buyer situation | Useful construction | Proof and failure check |
| --- | --- | --- |
| Recognizes a recurring problem | Concrete friction → consequence → product mechanism → next action | State a real cost of the problem without shaming or invented fear |
| Needs to understand a change | Present workflow → better workflow → visible bridge | Make the bridge something the product actually does |
| Doubts the claim | Specific case/quote → relevant mechanism → invitation to inspect | Keep case conditions and attribution; never generalize one result into a guarantee |
| Knows the category | Capability → practical benefit → difference from the current alternative | Name the difference precisely rather than adding generic superlatives |
| Is ready to act | Offer → important conditions → clear action | Urgency and scarcity require a genuine source and end condition |

For search, echo the intended query naturally and immediately establish
relevance. For social, make the opening understandable without a click. A
curiosity hook must resolve into the actual product benefit. Choose a CTA
that matches the commitment: inspect an example, read a case, start a trial,
or book a demo only when that path exists.

Illustrative product fact: "Approvers can see the current version and decision
history." A defensible line is "Keep the current version and every approval
decision together." "Cut approval time by 80%" needs separate measured evidence.

## Google responsive search ads

### Supply a complete, reviewable copy set

For a full RSA pack, aim for 15 distinct headlines and four descriptions when
the product supports that variety. A narrower user request may use a smaller
valid set; do not pad with duplicate promises. Group headlines by search
relevance, benefit, differentiator, proof, and action. Make each asset useful
on its own and in different combinations.

Current platform constraints, checked 2026-09-27:

| Field | Requirement |
| --- | --- |
| Headlines | 3–15; each at most 30 character units |
| Descriptions | 2–4; each at most 90 character units |
| Display paths | Up to two; each at most 15 character units |
| Final URL | A real, approved landing destination; check its promise against the ad |
| Enabled RSAs | At most three per ad group; check existing ads before enabling another |

Spaces and punctuation count. Double-width characters such as Chinese,
Japanese, and Korean count as two units. Count the final strings, not draft
placeholders or UTF-8 bytes. Mixed scripts and inserted dynamic text need
particular care; use the platform validator for ambiguous cases. See Google's
[RSA requirements](https://support.google.com/google-ads/answer/7684791?hl=en)
and [API overview](https://developers.google.com/google-ads/api/docs/responsive-search-ads/overview).

Show the count beside each delivered asset. For example, `Reports Ready to
Review` is 23 units; `审批进度一目了然` is 16 units. Revise overlength text before
delivery. State pinning explicitly; keep assets unpinned unless a genuine
message-order requirement justifies reducing combinations. Do not use dynamic
keyword insertion until eligible queries, replacement length, and wording
are checked.

Deliver in this order so the user can evaluate the intent before the text:

1. Ad group and search-intent theme; the keywords/match types if supplied or
   included in scope. Map each RSA to one group.
2. Final destination, offer, and exclusions. If search-term evidence supports
   negative keywords, propose their scope and reason; no arbitrary minimum
   quota and no automatic exclusions from copy alone.
3. RSA headlines/descriptions with counts, paths, pinning, and claim sources.
4. Relevant supporting assets when requested or needed for launch: distinct
   sitelink destinations, concise callouts, and useful snippet categories.
   Do not fabricate four destinations when the site has only one relevant page.
5. Validation status and unresolved submission facts.

Pinning, advertising policies, asset-specific limits, and regulated claims
must be checked for the actual market and format when they matter. Do not
apply a copied jurisdiction-specific banned-word list to every advertiser.

### Prepare execution without duplicating the platform recipe

[Google Ads](google-ads.md) owns the exact
`GOOGLEADS_MUTATE_AD_GROUP_ADS` input, validation, object identifiers, and
readback. Transfer the approved assets and destination to that recipe; do not
invent a second request format here. Local copy validation, remote validation,
paused creation, and enabled delivery are separate outcomes. User approval of
wording does not by itself authorize activating spend.

## Meta and other social copy

Return primary text, headline, CTA, destination, and the visual proof the copy
requires. For a useful first pass, draft a concise opening that carries the
message even when the rest is collapsed, and add a longer version only when
the objection needs explanation. A roughly 125-character opening and
40-character headline can be drafting targets, not universal platform limits
or a promise of visibility in every placement. Check the selected placement
and current creative requirements before submission. Do not carry forward a
universal "20% image text" rule.

Make the claim and the first visible frame reinforce one another. If copy
promises an easier setup, show that process instead of an unrelated product
beauty shot. For professional audiences, name the job and useful business
result; professional tone need not mean abstract language.

Use [Meta Ads](meta-ads.md) for `METAADS_CREATE_AD_CREATIVE` and
`METAADS_CREATE_AD`, including required page/account/ad-set IDs and accepted
creative structure. Copy completion does not imply creation succeeded. An
existing ad's text cannot be changed using a tool that only changes a creative
name or status. For LinkedIn or another unsupported publishing path, deliver
the copy and exact manual setup handoff; do not substitute organic posting.

## Make variants interpretable

Start with the uncertainty most likely to change the decision: audience
problem/angle, hook, benefit, proof, or action. Keep one main variable between
the comparison versions. For a broad concept test, explicitly label the
whole concept as the variable; do not then claim the headline caused the lift.

Record `variant | hypothesis | changed element | held constant | source |
business outcome | review window | decision condition`. Keep audience, offer,
placement, landing page, and spend context visible where relevant. Ad delivery
is often uneven and RSA asset combinations are adaptive; ordinary variants
are not automatically randomized experiments.

Before recommending an ad or destination change, trace the same promise across
the opening line, first visible asset, landing-page headline, supporting proof,
and CTA. If the ad offers a comparison but the page only asks for a demo, name
that mismatch and prepare an aligned destination or a different offer. Check
the real page and form path when available; a copy draft alone cannot certify
them. If the destination changes during a test, record it as a separate
variable and judge qualified outcomes after the relevant lag. Higher CTR with
an unchanged or worse qualified rate is a reason to inspect fit, not proof
that the new wording won.

Example: compare an approval-visibility opening with a version-control opening,
using the same demo, offer, audience and destination. Read qualified demo
outcomes when available, alongside click and form rates. If one version gets
more clicks but worse qualified outcomes, improve message-to-offer fit before
calling it the winner. See [B2B growth](b2b-growth.md) for quality and lag.

The final copy package must identify observed facts, hypotheses, checks passed,
and whether it is wording only, a prepared request, or an actually created
object. Hand image/video production to the existing creative Skills with the
approved copy and proof requirement, not an instruction to publish.
