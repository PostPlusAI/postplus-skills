# Build, revise and preview a paused Meta campaign

Use this path for an authorized new website-conversion campaign with ad-set
budgets and image or video ads. Read the current schemas and availability first.
If a deployment reports `meta_build_not_enabled`, name that preparation gap;
do not invent fields on another tool or claim the account lacks permissions.

## Agree the complete configuration

Resolve account, Page, Pixel, website event, destination, currency, schedule,
per-group budget, total planned budget, audience and image for each ad. Keep
primary text, headline, description, CTA and tracking labels separate. Save the
agreed plan before creating objects. Creation authorization is distinct from
authorization to spend on delivery.

This path supports ordinary ad categories, website LEAD / PURCHASE /
COMPLETE_REGISTRATION conversions, CNY / USD / BRL, and ad-set-owned daily or
lifetime budgets with sharing disabled. Discover further support from the
schema. Never select an ordinary category to bypass a regulated requirement.

## Create one step at a time

| Step | Tool | Preserve from the successful result |
| --- | --- | --- |
| Upload the image | `METAADS_UPLOAD_AD_IMAGE` | Image hash in the exact account. Supply an owned PostPlus file reference in the `image` media slot; never manufacture a storage key. |
| Create paused campaign | `POSTPLUS_METAADS_CREATE_PAUSED_CAMPAIGN` | Verified campaign ID, no campaign budget, sharing false. |
| Create each paused ad set | `POSTPLUS_METAADS_CREATE_PAUSED_ADSET` | Verified ID, accepted targeting, schedule and budget. |
| Create each image creative | `POSTPLUS_METAADS_CREATE_IMAGE_CREATIVE` | Verified creative ID and independent copy fields. |
| Create each paused ad | `POSTPLUS_METAADS_CREATE_PAUSED_AD` | Verified ad ID referencing that creative and ad set. |
| Inspect saved object | `POSTPLUS_METAADS_READ_BUILD_OBJECT` | Current account, parent IDs, status and configuration. |
| Preview paused ad | `POSTPLUS_METAADS_PREVIEW_AD` | Preview URLs for the selected format. |

Use the exact `ad_account_id` target for every PostPlus build tool. The shared
service checks ownership and parent state. Creation is fixed to PAUSED; there
is no activation parameter. A new operation is not a retry mechanism.

## Money and audience meaning

Pass `budget: {"currency":"CNY","kind":"lifetime","amount":"250.00"}`
for a total CNY 250 ad-set budget. Do not pass 25000, pre-convert units, derive
daily budget from a lifetime amount, or silently exchange currency. Three such
groups total CNY 750.00. Start and end include a timezone; preserve the agreed
five-day interval. A daily budget is not a hard daily spending ceiling. This
contract does not establish units for older campaign-update tools.

Use real interest IDs and geography keys from discovery, selected by meaning.
Within a `flexible_spec` group detailed conditions are alternatives; separate
groups express narrowing conditions. Preserve the grouping rather than
flattening it into one interest list. Keep geography, locale IDs, ages,
placements and excluded custom audiences separate. Unsupported detailed-interest
exclusions cannot be substituted for custom-audience exclusions.

Explain Meta's expansion and obtain acceptance before setting
`accept_platform_audience_expansion: true`. An `advantage_audience` of 0 does not
establish that interests are hard delivery limits. Report requested conditions,
accepted configuration and platform optimization behavior separately.

## Copy, tracking and delivery

The creative tool accepts `primary_text`, `headline`, `description`,
`call_to_action`, `destination_url`, `image_hash`, `url_tags`. The latter is a
query string containing exactly one nonempty value for each of `utm_source`,
`utm_medium`, `utm_campaign`, `utm_content`, `utm_term`. Keep these labels out of
the destination URL to avoid duplicate values. Reuse the existing campaign
label convention; a Pixel event does not establish registration, subscription
or MCP activation in the product's own business records.

Present each verified ad's copy, destination, budget, targeting, schedule, IDs
and preview. Show preview URLs using the host's supported link or frame UI;
never execute upstream HTML. Keep preview URLs private. A preview is not ad
review approval or delivery.

## Resume without duplicate creation

Keep the first result and original operation ID for every step. A successful
creation receipt retains only `createdResource` identity, not the business
response. If readback fails after creation, inspect that recorded ID with the
read tool. Unknown outcomes without an ID require checking the original
operation and provider evidence; never assign a new ID to repeat an uncertain
write.

Continue from confirmed uploaded hashes and created IDs. Do not recreate prior
successful steps after a later failure. Report configuration differences instead
of silently changing the plan. Finish at paused objects and previews. Future
activation requires a separately supported action and explicit delivery approval.

## Local video, draft revisions and copying

A local finished video can be uploaded; it is not an image-only workflow.
Use `METAADS_CREATE_AD_VIDEO` with its `video` file slot, or its supported
`file_url`. The direct file limit is 100 MiB. For CLI, first use
`postplus media-file upload --input-file ./finished.mp4 --json`, preserve the
returned owned reference, then map `{"video":"<owned reference>"}` through
`--media-map-file` on the channel run. Do not pass a local path as a URL or
manufacture an upload key. For MCP, use the host upload/import path to obtain
an owned PostPlus file reference and pass `mediaReferences.video` when preparing
the channel request; a path on the user's computer is not accessible to MCP.

Preserve the returned video ID. Use `METAADS_GET_OBJECT` with `object_id` set
to that ID and `fields: ["id", "status"]` until `status.video_status` is `ready`.
`METAADS_GET_VIDEO` is deprecated. An upload acknowledgement is not a
ready-to-use ad video. Use `POSTPLUS_METAADS_CREATE_VIDEO_CREATIVE` with that ID,
a thumbnail image hash and the same separate copy/CTA/destination/tracking
fields as image creation. Attach the creative through CREATE_PAUSED_AD and
preview the exact ad. A processing failure is not permission to upload again.

For a complete account inventory, use `POSTPLUS_METAADS_LIST_OBJECTS` with
`object_kind=campaign|adset|ad`, optionally `parent_id` for the exact parent.
Continue with `next_cursor` as `after` until `complete=true`; keep the account,
kind and parent unchanged. Never count the first page as the whole account.

Read the exact draft with `POSTPLUS_METAADS_READ_BUILD_OBJECT` and preserve
`snapshot`. `POSTPLUS_METAADS_UPDATE_PAUSED_DRAFT` uses it as `expected_snapshot`:
- For an ad, change its name or attach a new `creative_id`. To revise copy,
  destination, image or video, create the new creative first and attach its ID.
  Keep the original creative; do not mutate a shared asset used by other ads.
- For an ad set, change name, audience or start/end. Audience replacement uses
  the same discovery IDs and explicit expansion acceptance as creation. Preserve
  budget and unaffected schedule fields. This action cannot activate delivery.

Use `POSTPLUS_METAADS_DUPLICATE_PAUSED_OBJECT` for one authorized native copy
of a paused campaign, ad set or ad, with snapshot and the requested copy name.
Campaign/ad-set copies include children; the result verifies source/copy IDs
and paused hierarchy. This is a new copy, not a retry of an uncertain result.
Native copies explicitly reuse each source ad's creative to preserve its CTA,
copy, destination and tracking when Meta generates a different creative.
Retain `createdResource` from the original receipt when verification is lost,
then read/list that copied hierarchy. No automatic lifetime-once strategy guard
or recurring executor is installed.

Ordinary `POSTPLUS_METAADS_UPDATE_BUDGET` changes an existing amount with
currency/ownership/snapshot checks and independent readback; it adds no fixed
31-second wait. `SET_CAMPAIGN_BUDGET apply=true` is a structural change: validate,
wait about 31 seconds for Meta, recheck configuration, submit once, verify.
`apply=false` is an optional validation-only request, not a required extra step
before an already-authorized apply. A separate recent operation may still hit
Meta's account/object limits; inspect its outcome before any new request.

Preview results retain safe native frame dimensions when Meta supplies them.
Use those dimensions in a host-supported frame. Inspect desktop and mobile
visual output separately: native dimensions alone do not establish readable
layout, and Meta's desktop portrait preview may still squeeze its headline.
If dimensions are absent, do not invent them or mark visual acceptance passed.

Finish by presenting completed steps, exact new/changed object IDs, current
paused state, remaining failures and the next supported continuation. A lost
business response is recovered by reading those objects, not by recreating
successful steps. Keep the original unknown receipt unchanged.
