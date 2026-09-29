# LinkedIn

Read [channel execution](channel-execution.md). Use the `linkedin` connection
and `LINKEDIN_GET_MY_INFO` to identify the connected person. A company post
needs the exact `urn:li:organization:<ID>` and confirmed permission to act
for it; personal identity or `LINKEDIN_GET_COMPANY_INFO` alone does not prove
that permission.

## Publish a text post

An article-to-post request can be drafted without connection. When the user
asks to publish from the verified person or organization, select the author
URN and final commentary. For a company post:

<!-- tool-input: LINKEDIN_CREATE_LINKED_IN_POST -->
```json
{"author":"urn:li:organization:987654321","commentary":"<approved post>"}
```

The example URN is illustrative; substitute the verified author. For a
personal post use `urn:li:person:<actual person ID>`. The fixed tool
`LINKEDIN_CREATE_LINKED_IN_POST` requires `author` and `commentary`; other
content, distribution, and visibility fields must follow this operation's
`show` schema and the user's actual request. If the target policy is
`external_id`, bind `--target-id <exact author URN> --target-path author`.
Record the returned post URN and call `LINKEDIN_GET_POST_CONTENT` with
`{"post_id":"<returned post URN>"}`. An organization and personal post
cannot be swapped as a fallback after a permission error.

```sh
postplus channels tools show LINKEDIN_CREATE_LINKED_IN_POST --json
postplus channels tools run LINKEDIN_CREATE_LINKED_IN_POST --connection <own-linkedin-connection-id> --target-id <verified-author-urn> --target-path author --input-file linkedin-post.json --operation-id <post-operation-id> --wait --json > linkedin-post-result.json
```

## Comment and interpret performance

`LINKEDIN_CREATE_COMMENT_ON_POST` is a single-post comment path, not a
general comment inbox. Resolve the exact post/comment target and actor first.
Its required input is `target_urn`, `actor`, `object`, and
`message:{"text":"<approved reply>"}`. The meanings of the two target
URN fields must be checked against `show` and the selected post; do not
invent them from a visible URL. For organization performance,
`LINKEDIN_GET_SHARE_STATS` requires `organizational_entity` and can support
an organization-level review. It does not become a personal post's metric or
proof of sales. If an own-post metric is unavailable, report the available
scope rather than silently broadening the question.
