# Execute an advertising task through PostPlus

Use this reference when a task needs connected account data, a supported remote
change, or recovery of an earlier channel operation. Writing advice or analyzing
supplied files does not require account access. Public-content research follows
the separate workflow in [creative research](creative-research.md).

## Connect only when needed

```sh
postplus channels list --json
```

Select the user's active connection for the requested platform. If several
identities are available, resolve the intended one before accessing its data.
If the needed connection is absent, create its authorization link, present that
returned link to the user, and wait for the same connection to become active:

```sh
postplus channels connect google-ads --json
postplus channels wait "$ADS_CONNECTION" --json
```

Opening the link does not prove authorization completed. If authorization fails
or expires, report that state without repeatedly creating connections. Resume
the user's original task when the connection is active. This grants account
access, not additional permission to spend, publish, upload customer lists, or
change an ad.

| Platform | Connection channel | Tool search toolkit |
| --- | --- | --- |
| Google Ads | google-ads | googleads |
| Meta Ads | meta-ads | metaads |
| Google Analytics | ga4 | google_analytics |
| LinkedIn | linkedin | linkedin |
| TikTok Ads | tiktok-ads | tiktok_ads |
| Reddit Ads | reddit-ads | reddit_ads |
| Pinterest Ads | pinterest-ads | pinterest_ads |

`$ADS_CONNECTION` is a PostPlus connection UUID. Customer, advertiser, campaign,
pixel, and property IDs are different values inside the tool input. Never use
one kind of ID in place of another or request a provider key to bypass access.

## Inspect the supported operation

```sh
postplus channels tools list --toolkit googleads --query report --json
postplus channels tools show GOOGLEADS_GET_RMF_REPORT --json
```

List supports `--offset` and `--limit`; continue when the result is incomplete.
Show supplies `tool.inputParameters`, `tool.outputParameters`, `tool.version`,
`tool.deprecated`, and `tool.availability`. Check that the actual operation is
enabled and inspect its required fields and enums. The server selects the tool
version; there is no CLI version override for a channel request. An enabled
tool does not establish the connected account's permissions.

Use the current schema, especially when a recipe and the returned contract
differ. Do not send unknown top-level arguments or silently change the requested
business action to fit another tool. If this CLI lacks channels tools, follow
its reported compatibility/update instructions and preserve the task; do not
use retired channel action commands.

Prepare JSON in a task file. Synthetic IDs in examples must be replaced with
IDs discovered from the intended account. A valid JSON/schema check does not
prove a query's field combination, account eligibility, or advertising claim.

## Submit and keep the first result

For a connection/arguments-target operation:

```sh
postplus channels tools run "$ADS_TOOL" \
  --connection "$ADS_CONNECTION" \
  --input-file request.json \
  --operation-id "$ADS_OPERATION_ID" \
  --wait --json > result.json
```

Use a fresh operation ID for each genuinely new request; the CLI generates one
when omitted. Record the returned ID. Reusing it with different parameters is
invalid. Set task variables from confirmed context; never copy another user's
connection or replay an example against a real account.

Where the tool requires an external target, provide both flags and match the
exact input value at that path. For example, GAQL binds `customer_id`:

```sh
postplus channels tools run GOOGLEADS_SEARCH_STREAM_GAQL \
  --connection "$ADS_CONNECTION" \
  --target-id "$ADS_CUSTOMER_ID" --target-path customer_id \
  --input-file google-query.json --wait --json > google-result.json
```

Meta leads binds `source_object_id`. Follow the actual tool target contract;
account-discovery tools can require a connection target and must not receive an
invented external target. An object/array path identifies a value, not a list of
independently verified resource IDs.

Channel run has no `--output` flag. Redirect JSON stdout when the task needs the
result later; diagnostics use stderr. Only the first successful response carries
the full business data. Status queries and duplicate requests return receipts,
not a second download of the original report.

| Response location | Meaning |
| --- | --- |
| `operationId` / `output.operationId` | Identity to retain for this operation. |
| `output.execution.resultStatus` | pending, unknown, succeeded, or failed. |
| `output.result.data` | Tool business data on the first successful response. |
| `output.output.tool` / `output.output.version` | Executed tool and fixed version. |
| `output.output.dataRetained` | Whether raw business data is kept by the server; currently false. |
| `output.output.externalOutcome` | Separate indication of independent outcome verification. |

Platform references use **B** for `output.result.data`. They must not all be
parsed as a rows/columns table: Google, Meta, GA4, and TikTok differ. Check field
presence and reported limitations before calculating. Missing values are not
zeros. The channel boundary limits input to 64,000 bytes and business output to
1,000,000 bytes; use supported pagination or narrower non-overlapping requests
for large results and disclose incomplete coverage.

## Recover without repeating an uncertain change

```sh
postplus channels tools run --status "$ADS_OPERATION_ID" --json
```

- `succeeded`: interpret the business result and any platform error/partial
  result fields. Confirm actual external state when the task requires it.
- `pending`: the task is unfinished even if the shell returned zero. Use the
  original operation status or the CLI's structured next action.
- `unknown`: submission may have changed the platform. Query the same operation
  and independently inspect the exact resource; never assign a new ID to retry
  the uncertain write.
- `failed`: report the observed reason and whether a platform-side outcome is
  known. Do not infer that every batch item was unchanged.

The CLI uses exit 1 for a business failure and exit 2 for unknown. A transport
loss can return `{operationId, execution, next}` without the outer `output`;
recognize that branch rather than treating missing data as an empty report.
There is no status-based replay of a lost write. A lost read result can only be
obtained by a separately justified new read after resolving its scope and cost,
not by pretending the old receipt retains it.

If a tool returns an upstream export/job ID, `--wait` only covers this tool call.
Use its actual supported follow-up tool; do not invent a downloader or treat a
job-created response as the finished report.

## Keep changes within their real scope

Before a consequential change, identify the account/object, relevant current
values, proposed values, business reason, spend impact, and supported recovery.
Use the user's existing approval when it covers these. A report request alone
does not approve its recommendations. A paused remote draft is still a write.

Where supported, `validate_only` checks the proposed request without applying
it. Validation still uses a provider call and is not a universal tool flag. A
later real write uses a new operation ID because its input differs. After the
write, read the exact object and distinguish configured state, effective state,
review status, and observed delivery.

Most channel receipts do not independently verify external state. Google budget
operations have additional checks/readback; this does not generalize to Meta or
TikTok. Shared-budget restrictions cannot be overridden by approval. Partial
success requires item-level evidence, not an all-success summary.

Channel receipts with `charged=false` describe PostPlus per-operation credit
charging, not free service usage or free advertising. Public research and media
follow their own quote and recovery contracts. Never auto-confirm a new charge
or infer that unknown means uncharged.

For uploaded creative files, use `--media-map-file` only for a field actually
declared file-uploadable and an appropriate user-owned media reference. A local
path is not an `image_url`, image hash, or platform video ID. Follow the selected
tool's input contract instead of assuming every creation tool accepts uploads.
