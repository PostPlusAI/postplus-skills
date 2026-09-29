# Audience planning: from buyer evidence to platform conditions

Use this reference to turn a business audience into conditions the selected platform actually supports. Read [channel execution](channel-execution.md) when using account tools and [B2B growth](b2b-growth.md) for qualification, sales stages, and named-account strategy. Public comments and competitor research reveal language and problems; they are not a customer-upload list.

## Define the audience before choosing filters

Write a short audience specification:

| Field | Decision it supports |
| --- | --- |
| Buyer and situation | Who has the problem now, what triggers action, and whether they can use or buy the offer. |
| Role in the purchase | User, evaluator, approver, or other relevant role; avoid treating every engaged person as a decision-maker. |
| Geography and language | Where the product is available, where the message is understandable, and which markets need separate economics. |
| Observable evidence | Search intent, supplied customer records, actual site/event activity, validated professional attributes, or public research evidence. |
| Offer and next step | The appropriate action for a new prospect, a returning evaluator, an existing customer, or an account already in a sales process. |
| Inclusions and exclusions | Exact business reason for each; distinguish platform-enforced conditions from targeting suggestions. |
| Success and budget | Business outcome, target cost, measurement window, and enough planned exposure to learn. |

Separate customer acquisition, remarketing, expansion, and sales acceleration. Exclude existing customers from acquisition only when that matches the task; retain them for renewal or expansion. Likewise, a recent converter may still need onboarding or sales support. Never use an unconditional exclusion list for every campaign.

Research may suggest an interest or job role, but the platform's actual entity ID must come from discovery. Record unresolved filters explicitly. Do not invent company, audience, location, or title IDs.

Use buyer knowledge in both the message and the platform condition, choosing
each for what it can prove. A customer quote about a painful handoff can inform
the ad opening; it is not a targeting field. A verified company or professional
role may support a platform condition; it does not explain which objection the
creative should answer. For each segment, translate `buyer evidence → message
angle and proof → available targeting condition or none`. Test broader
eligibility with a specific message when strict filters make the audience too
small, but verify that expansion still reaches qualified buyers. No fixed
creative-versus-targeting percentage applies across platforms.

## Choose a testable structure

Start with a small number of meaningful alternatives, such as broader buyer-fit targeting versus a narrower intent cohort. Hold offer and creative constant where possible. If every audience gets a different message and destination, describe the result as a combined treatment rather than proof that targeting alone won.

- Prioritize differences in intent, persona, geography, or company size when they change the offer or economics. Do not split merely to produce more campaign rows.
- A narrow audience can exhaust reach and accumulate frequency before conversion evidence matures. A broad audience can spend on poor fits. Compare qualified outcome cost and actual delivery, not only the estimated size.
- Fund each proposed segment. Use `available test budget / expected cost per meaningful result` to estimate how much evidence the plan can produce, with clear uncertainty. Reduce segment count if the proposed tests cannot receive enough evidence.
- Professional title targeting trades coverage for precision. Compare returned title entities with an alternative function-and-seniority definition when available, then verify the actual combination in the platform. Do not stack mutually incompatible targeting dimensions.
- Do not copy fixed audience-size benchmarks into launch requirements. Reachability, account eligibility, campaign type, geography, and platform minimums require current evidence. Distinguish a suggested operating range from a technical serving minimum.

Deliver at least one rationale for each alternative and the measurement that would change the recommendation. A larger estimate does not automatically mean a better audience.

## Give returning buyers a different reason to act

Plan remarketing from an observed behavior and the next unresolved decision,
not from a generic "visited before" bucket. A product-page visitor may need a
comparison or example; a pricing-page evaluator may need terms and proof; an
open opportunity may need stakeholder or implementation evidence. These are
candidate messages, not claims that the visitor's intent is known.

For each proposed cohort, write `entry event and source | eligible age/window |
exit or exclusion | next offer and proof | destination | success event`. Check
that collection began early enough for the chosen window, consent and identity
rules permit use, the audience is eligible to serve, and the offer still makes
sense at that stage. A converted buyer may exit a new-customer campaign while
remaining eligible for onboarding or expansion; the business goal determines
the exclusion. Choose a window from the actual buying cycle and event coverage,
not a copied 7/30/90-day default.

Compare this cohort's incremental qualified outcome or stage progression with
its spend and overlap. Repeated exposure, a platform-reported conversion, or
an audience estimate alone does not show that remarketing caused the sale. If
the platform cannot express an exclusion, expiry, or placement requirement
through the verified tool schema, leave it in the setup handoff and identify
the authorized UI or export check; do not silently broaden the audience.

## Google: intent and owned customer lists

For Search, begin with the user's search intent and actual search-term evidence in [Google Ads](google-ads.md). Audience membership can inform observation or restrict eligibility, which have different effects. Verify the campaign's current targeting mode and supported settings before proposing a change. Do not imply a list attachment automatically establishes observation mode.

Match-type names are not evidence of actual query quality. Use real search terms to decide exclusions, and do not globally exclude research words such as “reviews” or “comparison” when those can be valuable evaluation intent. For Display or video, separate prospecting intent from remarketing and use current supported entities; do not promise a retired or unsupported similar-audience feature.

`GOOGLEADS_GET_CUSTOMER_LISTS` returns audience lists, not customer accounts. Save `google-audiences.json`:

<!-- tool-input: GOOGLEADS_GET_CUSTOMER_LISTS -->
```json
{
  "customer_id": "1234567890"
}
```

```sh
postplus channels tools show GOOGLEADS_GET_CUSTOMER_LISTS --json
postplus channels tools run GOOGLEADS_GET_CUSTOMER_LISTS --connection "<connection-id>" --target-id 1234567890 --target-path customer_id --input-file google-audiences.json --operation-id "<audience-list-operation-id>" --wait --json > google-audiences-result.json
```

Here and below, `B` is `output.result.data` in the saved first successful response. Read `B.user_lists[].resourceName`, `id`, `name`, and description. Follow `B.next_page_token` using input `page_token`. Record the full resource name; an unqualified numeric list ID is not the `resource_name` required for membership changes. For a manager connection, explicitly select the verified child `customer_id`; do not rely on the connection's default account.

For an authorized new list, prepare `google-create-audience.json`:

<!-- tool-input: GOOGLEADS_CREATE_CUSTOMER_LIST -->
```json
{
  "customer_id": "1234567890",
  "name": "Approved customer cohort - September",
  "description": "User-supplied customer cohort for the agreed campaign purpose."
}
```

```sh
postplus channels tools show GOOGLEADS_CREATE_CUSTOMER_LIST --json
postplus channels tools run GOOGLEADS_CREATE_CUSTOMER_LIST --connection "<connection-id>" --target-id 1234567890 --target-path customer_id --input-file google-create-audience.json --operation-id "<create-list-operation-id>" --wait --json > google-create-audience-result.json
```

Save the returned `B.resource_name`. Creation is a real write; it does not prove the list has members, is eligible to serve, or has been attached to a campaign.

The next example, `google-audience-members.json`, illustrates the membership contract only. Replace both IDs and the example email with the authorized list and legitimate user-supplied records. Use only data the user is authorized to use for this matching purpose; never turn scraped commenters, reviewers, or inferred identities into upload records.

<!-- tool-input: GOOGLEADS_ADD_OR_REMOVE_TO_CUSTOMER_LIST -->
```json
{
  "customer_id": "1234567890",
  "resource_name": "customers/1234567890/userLists/2345678901",
  "operation": "create",
  "emails": ["customer@example.com"]
}
```

```sh
postplus channels tools show GOOGLEADS_ADD_OR_REMOVE_TO_CUSTOMER_LIST --json
postplus channels tools run GOOGLEADS_ADD_OR_REMOVE_TO_CUSTOMER_LIST --connection "<connection-id>" --target-id 1234567890 --target-path customer_id --input-file google-audience-members.json --operation-id "<membership-operation-id>" --wait --json > google-audience-members-result.json
```

This tool accepts normalized email strings: trim, lowercase, deduplicate, and validate the provided addresses without guessing replacements. It does not accept a fabricated hash schema or expose `validate_only`. `operation: create` adds members; `remove` removes them, rather than creating/deleting an ad account. The customer in `resource_name` must match `customer_id`.

Read `B.status`. Acceptance is not a match-rate report or immediate delivery proof. The list-read result does not enumerate membership, so do not claim individual matches have been independently verified. Check available serving/size evidence through the supported account source or an authorized UI review. Keep sensitive membership files local to the task and omit addresses from the user-facing report. Reversing a membership change does not undo any matching or delivery that already occurred.

Attaching or excluding a list is a separate criteria operation, such as `GOOGLEADS_MUTATE_AD_GROUP_CRITERIA` or `GOOGLEADS_MUTATE_CAMPAIGN_CRITERIA`. Inspect the chosen tool and campaign type; use the exact resource returned above. See [Google Ads](google-ads.md) for validation and readback. Do not add criteria merely because a list was successfully created.

## Meta: discover real conditions and existing audiences

Use `METAADS_LIST_TARGETING_SEARCH` to translate an interest, geography, or supported category into platform entities. Save `meta-interest-search.json`:

<!-- tool-input: METAADS_LIST_TARGETING_SEARCH -->
```json
{
  "type": "adinterest",
  "q": "project management",
  "limit": 10
}
```

```sh
postplus channels tools show METAADS_LIST_TARGETING_SEARCH --json
postplus channels tools run METAADS_LIST_TARGETING_SEARCH --connection "<connection-id>" --input-file meta-interest-search.json --operation-id "<interest-operation-id>" --wait --json > meta-interest-search-result.json
```

Read `B.data[]`. Interest/category options use returned `id`; geographies can use `key`. Confirm name, type, hierarchy, country, and any size bounds rather than selecting the first textual match. The search tool has no continuation input; report it as a bounded search result. Employer search, where returned, is not equivalent to verified company-account targeting or a complete buying committee.

For existing custom audiences, save `meta-custom-audiences.json`:

<!-- tool-input: METAADS_LIST_CUSTOM_AUDIENCES -->
```json
{
  "ad_account_id": "act_123456789",
  "fields": ["id", "name", "subtype"],
  "limit": 100
}
```

```sh
postplus channels tools show METAADS_LIST_CUSTOM_AUDIENCES --json
postplus channels tools run METAADS_LIST_CUSTOM_AUDIENCES --connection "<connection-id>" --target-id act_123456789 --target-path ad_account_id --input-file meta-custom-audiences.json --operation-id "<custom-audience-operation-id>" --wait --json > meta-custom-audiences-result.json
```

This tool requires target binding to `ad_account_id`. Its rows are `B.custom_audiences[]`, not the Insights `B.data[]` shape. Follow `B.has_more` and supply `B.next_cursor` as `cursor`, preserving filters. Confirm the audience's actual source, age, eligibility, and intended inclusion/exclusion; a promising name alone is insufficient evidence.

For a new ad-set plan, `METAADS_CREATE_AD_SET` exposes specific location, demographic, interest, behavior, custom-audience, and automation fields. Its current targeting object does not accept audience-exclusion or placement fields. Keep those requirements in the proposed specification and identify the authorized platform setup needed; do not add unsupported SDK fields or silently drop the user's requirement. Inspect the current schema before constructing a request. Read the resulting targeting/automation settings to establish whether an input is a strict constraint or an expansion suggestion. A strict named-account assignment must not silently become broad automated expansion.

Current tools do not provide a verified general workflow to upload custom-audience members or create every lookalike definition. Prepare the requested audience specification and identify the unsupported operation. Do not invent an upload parameter or use public-comment collection as identity enrichment. Existing-audience discovery is useful even when audience creation needs authorized platform work. [Meta Ads](meta-ads.md) owns ad-set prerequisites and the budget-unit limitation.

## LinkedIn: discover facets, resolve entities, estimate size

Use the three supported audience tools in order. They do not provide campaign delivery or advertisement performance.

First, save `{}` as `linkedin-facets.json`:

<!-- tool-input: LINKEDIN_GET_AD_TARGETING_FACETS -->
```json
{}
```

```sh
postplus channels tools show LINKEDIN_GET_AD_TARGETING_FACETS --json
postplus channels tools run LINKEDIN_GET_AD_TARGETING_FACETS --connection "<connection-id>" --input-file linkedin-facets.json --operation-id "<facets-operation-id>" --wait --json > linkedin-facets-result.json
```

Read `B.elements[].adTargetingFacetUrn`, `facetName`, `entityTypes`, and available finders. The input has no paging argument; if output paging suggests more, mark facet discovery incomplete.

Next, search within a returned facet. Save `linkedin-location.json` only after confirming that facet exists:

<!-- tool-input: LINKEDIN_SEARCH_AD_TARGETING_ENTITIES -->
```json
{
  "facet": "urn:li:adTargetingFacet:locations",
  "query": "united states",
  "count": 10,
  "start": 0
}
```

```sh
postplus channels tools show LINKEDIN_SEARCH_AD_TARGETING_ENTITIES --json
postplus channels tools run LINKEDIN_SEARCH_AD_TARGETING_ENTITIES --connection "<connection-id>" --input-file linkedin-location.json --operation-id "<entities-operation-id>" --wait --json > linkedin-location-result.json
```

Read each entity's `B.elements[].urn`, `name`, and `facetUrn`. Use `B.paging.start`/`count` and its next-page indication to request the next `start` with the same facet/query; `count` is 1–100. Do not call the returned external pagination URL. Review similarly named entities before choosing one.

Finally, construct an estimate using those real returned URNs. `targetingCriteria` is a string, not a JSON object. Encode the colons inside URNs as `%3A`; retain parentheses and the `include:`, `and:`, `or:`, and `List(...)` structure. This format example, `linkedin-size.json`, must be populated with the entities actually returned for the task:

<!-- tool-input: LINKEDIN_GET_AUDIENCE_COUNTS -->
```json
{
  "q": "targetingCriteriaV2",
  "targetingCriteria": "(include:(and:List((or:(urn%3Ali%3AadTargetingFacet%3Alocations:List(urn%3Ali%3Ageo%3A103644278))))))"
}
```

```sh
postplus channels tools show LINKEDIN_GET_AUDIENCE_COUNTS --json
postplus channels tools run LINKEDIN_GET_AUDIENCE_COUNTS --connection "<connection-id>" --input-file linkedin-size.json --operation-id "<size-operation-id>" --wait --json > linkedin-size-result.json
```

Read `B.elements[].active` and `total` as estimated matching member counts. They are not actual reach, uploaded company count, qualified leads, or a delivery guarantee. Do not add estimates from overlapping candidate definitions. Save the exact criteria and estimate date so an audience plan is reproducible.

Current LinkedIn tools do not support a complete ad-account/campaign listing, advertising spend report, campaign update, matched-list upload, or ad change history. Organic organization or share statistics cannot fill those gaps. Use an authorized Campaign Manager export or browser evidence for actual reach, cost, lead quality, and serving eligibility.

## Named-account and cross-channel planning

Use named-account advertising when the supplied account list, deal economics, sales cycle, and sales follow-up justify repeated exposure. It can support awareness and buying-committee confidence, not only form submission. A small list can justify a high-touch test; it does not automatically justify the cost of a large-platform program.

1. Validate and deduplicate the legitimate account list with the user. Segment by buying stage or economics when useful; avoid a mixed list whose largest companies absorb most exposure. Never pad duplicates to simulate audience size.
2. Match the offer to the stage. New accounts may need category/problem education; active evaluations need proof, implementation detail, and objection handling. Do not keep offering an already-booked demo to an in-flight opportunity.
3. Define actual coverage evidence. `accounts with observed reach / eligible target accounts` differs from member-count estimates, impression totals, and company match count. Per-company engagement or CRM evidence is needed to detect underserved priority accounts.
4. Build a refresh and sales-follow-up agreement through the user's existing process. Do not send messages or create notifications as an unrequested side effect of audience planning.
5. If testing incremental influence, define a comparable holdout before launch, allow for the sales cycle, and compare opportunities or stage movement. Exposed-versus-unexposed observational differences alone do not prove causation.

Consistent campaign IDs and UTMs can help compare channel journeys and define intended remarketing cohorts. Actual collection, identity matching, event rules, eligible audience size, and audience creation still need verification. Visiting a tagged URL is not proof of buying intent, and reach on one platform does not create an addressable audience on another automatically. Customer-list upload and tracking rules remain separate from public research.

When reviewing saturation, compare actual same-period unique reach, frequency, outcomes, and spend against the relevant audience estimate. Increasing spend with flat reach can suggest saturation, but auction changes or weak assets are competing explanations. Consolidate underfunded segments before expanding the campaign count; widen only the condition whose removal the business can tolerate.

## Deliverable

Return one table per candidate audience: purpose, buyer evidence, inclusion/exclusion logic, real platform entities, list origin where applicable, estimated size and date, unknown eligibility/expansion conditions, offer, test budget, success metric, and next review. Include the exact CLI requests and saved outputs used. Distinguish a prepared specification, a created list, accepted membership updates, attached targeting, and independently verified delivery; none of these states implies the next.
