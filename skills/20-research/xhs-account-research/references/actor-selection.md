# Actor Selection

## Validated account surface

Use:

- `easyapi/rednote-xiaohongshu-user-posts-scraper`

This actor is the default because it returned:

- real note URLs
- note titles
- note ids
- author metadata
- like counts
- cover metadata

## Rejected as the default profile source

Do not use:

- `easyapi/rednote-xiaohongshu-profile-scraper`

Observed behavior on the released shell:

- request succeeds
- `itemCount = 1`
- `profileData = {}`

That is not enough to support account snapshots.

## Design rule

This skill should describe what can be inferred from recent posts.
It should not pretend to know:

- follower counts
- bio fields
- profile tags
- cadence from publish timestamps

unless a validated actor actually returns them.
