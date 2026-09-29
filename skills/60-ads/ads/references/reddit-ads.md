# Reddit Ads: discover, measure, then change the exact campaign

Use this reference for a Reddit **paid** advertising account. Public Reddit
posts and comments are separate research evidence; organic posting uses the
Reddit social connection, not `reddit-ads`. Read [channel execution](channel-execution.md)
for authorization, operation recovery, and `B = output.result.data`. Inspect
each tool with `postplus channels tools show <slug> --json` before using it;
the examples below use synthetic IDs and dates, not a live-account assertion.

## Select the business, account, and campaign

Use an active `reddit-ads` connection from `postplus channels list --json`.
If absent, use `postplus channels connect reddit-ads --json` and wait for the
returned connection ID. The connection, business ID, ad account ID, and
campaign ID are four different identities.

Start with businesses accessible to this connection:

<!-- tool-input: REDDIT_ADS_LIST_MY_BUSINESSES -->
```json
{"page_size":50}
```

```sh
postplus channels tools show REDDIT_ADS_LIST_MY_BUSINESSES --json
postplus channels tools run REDDIT_ADS_LIST_MY_BUSINESSES --connection "$ADS_REDDIT_CONNECTION" --input-file reddit-businesses.json --wait --json > reddit-businesses-result.json
```

Read `B.data[]`. For each relevant business ID, list
its accounts; use `B.pagination.next_url` to extract the returned
`page_token` when another page exists. Never treat the first page as complete.

<!-- tool-input: REDDIT_ADS_LIST_AD_ACCOUNTS_BY_BUSINESS -->
```json
{"business_id":"t2_business123","page_size":50}
```

```sh
postplus channels tools run REDDIT_ADS_LIST_AD_ACCOUNTS_BY_BUSINESS --connection "$ADS_REDDIT_CONNECTION" --target-id "$ADS_BUSINESS_ID" --target-path business_id --input-file reddit-accounts.json --wait --json > reddit-accounts-result.json
```

Choose an account using `B.data[].id`, `business_id`, name, currency,
and `time_zone_id`. If the user's intended account is ambiguous, resolve it
before running a report or changing anything. List campaigns under exactly
that account:

<!-- tool-input: REDDIT_ADS_LIST_CAMPAIGNS -->
```json
{"ad_account_id":"a2_account123","page_size":100}
```

```sh
postplus channels tools run REDDIT_ADS_LIST_CAMPAIGNS --connection "$ADS_REDDIT_CONNECTION" --target-id "$ADS_ACCOUNT_ID" --target-path ad_account_id --input-file reddit-campaigns.json --wait --json > reddit-campaigns-result.json
```

Read `B.data[]` and the `B.pagination.next_url` token. Retain the exact
campaign ID, `ad_account_id`, name, objective, `configured_status`,
`effective_status`, and `delivery_status`. Configured active does not mean
delivering. An empty account means there is no performance verdict to make.

## Get a dated report before making a diagnosis

Choose a complete, explicit UTC window; reconcile it with the account's
timezone before comparing a local business day. The pinned report tool needs
top-level `ad_account_id` and `data`, with `starts_at`, `ends_at`, and
`fields` inside `data`. Its pagination keys are literally `page.size` and
`page.token` at the top level, not nested objects.

<!-- tool-input: REDDIT_ADS_GET_A_REPORT -->
```json
{
  "ad_account_id":"a2_account123",
  "data":{
    "starts_at":"2026-09-14T00:00:00Z",
    "ends_at":"2026-09-20T23:59:59Z",
    "fields":["IMPRESSIONS","CLICKS","SPEND"],
    "breakdowns":["DATE","CAMPAIGN"],
    "time_zone_id":"UTC"
  },
  "page.size":100
}
```

```sh
postplus channels tools show REDDIT_ADS_GET_A_REPORT --json
postplus channels tools run REDDIT_ADS_GET_A_REPORT --connection "$ADS_REDDIT_CONNECTION" --target-id "$ADS_ACCOUNT_ID" --target-path ad_account_id --input-file reddit-report.json --wait --json > reddit-report-result.json
```

Read `B.data.metrics[]`, `B.data.metrics_updated_at`, and
`B.pagination.next_url`. Follow every page with the same range, fields,
and breakdowns, adding the returned `page.token`; stop if the token is
missing or repeats. Verify each returned `CAMPAIGN` is in the selected account
and each `DATE` is in the intended window. The raw `SPEND` unit must be
confirmed from the returned data/tool schema before converting it; do not
silently call it dollars. Missing metric values are not zero. A click or
conversion diagnosis also needs the campaign objective, destination and
event-quality evidence, not just the cheapest click.

For creative or community fit, use the applicable public Reddit research
route after the paid report: discover current posts, then inspect the real
comments of selected threads. Keep public discussion separate from the
account's paid delivery and never infer a targetable community ID from a
comment alone.

## Pause or resume one confirmed campaign

First re-read the exact campaign, using the campaign ID filter on the selected
account and checking that exactly one row has the expected ID, account, name,
and `configured_status`:

<!-- tool-input: REDDIT_ADS_LIST_CAMPAIGNS -->
```json
{"ad_account_id":"a2_account123","id":["2451508441785140582"],"page_size":100}
```

`REDDIT_ADS_UPDATE_CAMPAIGN` accepts many unrelated fields, including budget
and lifecycle changes. For a status request, send **only**
`data.configured_status` as `PAUSED` or `ACTIVE`; never send `ARCHIVED` or
`DELETED` to approximate a pause. `ACTIVE` may resume spending under the
existing budget. Confirm that the user's authorization covers this exact
campaign and consequence.

<!-- tool-input: REDDIT_ADS_UPDATE_CAMPAIGN -->
```json
{"campaign_id":"2451508441785140582","data":{"configured_status":"PAUSED"}}
```

```sh
postplus channels tools show REDDIT_ADS_UPDATE_CAMPAIGN --json
postplus channels tools run REDDIT_ADS_UPDATE_CAMPAIGN --connection "$ADS_REDDIT_CONNECTION" --target-id "$ADS_CAMPAIGN_ID" --target-path campaign_id --input-file reddit-pause.json --operation-id "$ADS_UPDATE_OPERATION_ID" --wait --json > reddit-pause-result.json
```

Check `B.data`: its ID, `ad_account_id`, and
`configured_status` must match. Then make a **new read**, not a duplicate
write, with `REDDIT_ADS_LIST_CAMPAIGNS` filtered by the same account and
campaign ID; compare its configured and effective/delivery statuses. The
write receipt alone is not independent verification. For an `unknown` result,
query `postplus channels tools run --status "$ADS_UPDATE_OPERATION_ID" --json`
and inspect the same campaign; do not submit a new write ID. The tool has no
compare-and-swap field: a matching pre-read cannot prevent a concurrent edit.
If the readback differs from the requested state, report the conflict rather
than applying another write automatically.
