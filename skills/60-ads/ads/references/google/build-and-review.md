# Build and verify a paused Google Search campaign

Read [channel execution](../channel-execution.md) and resolve the account with [search planning](search-planning.md). Examples use synthetic IDs; replace them with confirmed account values.

For an authorized new Search build, use `GOOGLEADS_BATCH_MUTATE` with the
selected advertising `customer_id`, `partial_failure:false`, and reviewed
budget, campaign, ad group, keyword/negative, ad and asset operation families.
Use unique negative temporary resource IDs and put parents before children.
Set every delivery object to PAUSED; campaign and ad-group/ad tools have their
own status enum casing. Explicitly create independent budgets with
`explicitly_shared:false` and the matching `period`; do not derive a daily
budget from a lifetime budget. Budget amounts are positive integer strings in
micros of the verified account currency, with no exchange or silent rounding.
Existing budget amount changes must run alone, including through the batch
tool; do not combine an amount edit with sharing, period or campaign attachment
changes. Do not use alternate field spelling to bypass an amount check.

A validation request uses `validate_only:true`; it creates no objects. A later
real submission uses a new operation ID because its inputs differ. Atomic batch
execution means all operations must be valid, not that a lost-response request
can safely be submitted twice. After submission, read the exact returned
resources with GAQL and compare status, parent IDs, budget, keywords/match
rules, copy, destination, geography, language and goal against the approved
plan. Show differences; do not silently rewrite the plan or enable delivery.


## Recover created Google resources without submitting again

The original operation receipt retains minimal `createdResources` identities
for Google resource mutate/batch creates, callouts, experiments/arms and created
customer clients when their provider response includes valid resource names.
Read them from the receipt output, or its error when later schema, partial
failure, bookkeeping or receipt persistence failed. They contain resource name,
kind, customer and operation index, not ad copy or the complete response. A
created client also records its parent customer. Validation-only requests do
not retain created identities. Other audience/Data Manager creation shapes do
not have this same resource-name recovery guarantee; preserve their first
result's actual list identity.

Keep the original operation ID and inspect each recorded resource with the
matching account. Verify its configured state and continue confirmed steps.
Unknown means unfinished; an atomic write with an entirely lost response may
still have created the complete hierarchy. Never retry that write under a new
ID. No returned identity means inspect the original operation/provider evidence
before deciding what exists. A retained ID is not proof of policy approval,
delivery, or verified settings; readback and the user's delivery authorization
remain distinct.


### A paused RSA

Prepare the approved copy with [ad-copy.md](../ad-copy.md). This minimal structural
example is not a complete creative recommendation. Save as
`google-rsa-validation.json`:

<!-- tool-input: GOOGLEADS_MUTATE_AD_GROUP_ADS -->
```json
{
  "customer_id": "1234567890",
  "operations": [{"create": {
    "ad_group": "customers/1234567890/adGroups/2345678901",
    "status": "PAUSED",
    "ad": {
      "final_urls": ["https://example.com/demo"],
      "responsive_search_ad": {
        "headlines": [{"text": "Explore Our Product"}, {"text": "Compare Available Plans"}, {"text": "Book a Product Demo"}],
        "descriptions": [{"text": "Explore the product and review the available plans."}, {"text": "Book a demo to discuss your requirements with our team."}],
        "path1": "product",
        "path2": "demo"
      }
    }
  }}],
  "partial_failure": false,
  "validate_only": true,
  "response_content_type": "RESOURCE_NAME_ONLY"
}
```

```sh
postplus channels tools show GOOGLEADS_MUTATE_AD_GROUP_ADS --json
postplus channels tools run GOOGLEADS_MUTATE_AD_GROUP_ADS --connection "$ADS_GOOGLE_CONNECTION" --target-id 1234567890 --target-path customer_id --input-file google-rsa-validation.json --operation-id "$ADS_RSA_VALIDATION_OPERATION_ID" --wait --json > google-rsa-validation-result.json
```

Creating a paused ad is still a remote write. Validate destination, product
claims, supported asset counts and existing ad-group capacity before submission.
After creation, read the exact `ad_group_ad` resource, text, URL, status and
policy summary. An accepted creation is neither approval nor proof of delivery.
Enabling requires the relevant authorization and a separate request.


## Finish with a verified result

Read the exact created resources, compare the approved parent relationships, copy, destination and paused state, and report unresolved fields. Keep original operation and resource identities; a draft does not establish approval or delivery. Use [conversion feedback](conversion-feedback.md) for goals and event imports.
