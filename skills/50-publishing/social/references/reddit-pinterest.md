# Reddit and Pinterest

Read [channel execution](channel-execution.md). Public discussion research
can precede either platform action, but it never grants posting permission.
Use [listening](listening.md) for the source and question before choosing a
reply.

## Reddit: community post or exact-parent reply

Use a `reddit` connection. Check the target subreddit, its rules, and any
flair requirement; `REDDIT_LIST_SUBREDDIT_POST_FLAIRS` can inspect available
flairs when relevant. For a text post, the fixed schema requires `subreddit`
and `title`; `kind:"self"` and `text` make the intended type explicit:

<!-- tool-input: REDDIT_CREATE_REDDIT_POST -->
```json
{"subreddit":"<real community name without r/>","title":"<approved title>","kind":"self","text":"<approved body>"}
```

Run `REDDIT_CREATE_REDDIT_POST`, binding `subreddit` when the tool's target
policy requires it. Read the returned success, errors, post ID, and URL;
submission success does not guarantee it remains visible after moderation.
Do not insert promotional links where the community rules prohibit them.

For a reply to a selected real discussion, resolve the Reddit fullname:
`t3_<post ID>` for a top-level reply or `t1_<comment ID>` for a reply to a
comment. A share-link token is not a fullname. Prepare:

<!-- tool-input: REDDIT_POST_REDDIT_COMMENT -->
```json
{"thing_id":"t3_<actual post ID>","text":"<approved, context-specific reply>"}
```

Run `REDDIT_POST_REDDIT_COMMENT` with the exact `thing_id` target binding when
required. Check the returned success and comment fullname. Use
`REDDIT_RETRIEVE_SPECIFIC_COMMENT` with
`{"id":"t1_<returned comment ID>"}` for a direct readback. If platform
response or moderation leaves visibility uncertain, report that uncertainty.

```sh
postplus channels tools show REDDIT_POST_REDDIT_COMMENT --json
postplus channels tools run REDDIT_POST_REDDIT_COMMENT --connection <own-reddit-connection-id> --target-id <actual-t3-or-t1-fullname> --target-path thing_id --input-file reddit-reply.json --operation-id <reply-operation-id> --wait --json > reddit-reply-result.json
```

## Pinterest: verified board and image Pin

Use a `pinterest` connection. `PINTEREST_LIST_BOARDS` finds the account's
boards; paginate with `bookmark` if needed. Choose the correct actual
`board_id` and ensure the image is owned/licensed and publicly retrievable.
For a single image URL:

<!-- tool-input: PINTEREST_CREATE_PIN -->
```json
{"board_id":"971159175836868903","title":"<approved title>","description":"<approved description>","media_source":{"source_type":"image_url","url":"https://example.com/image.jpg"}}
```

The example ID and URL are syntactic samples, not actual destinations; replace
both with this user's board and image. Run `PINTEREST_CREATE_PIN` and bind
`board_id` if `show` requires an external
target. Read the returned pin ID using `PINTEREST_GET_PIN` with
`{"pin_id":"<returned ID>"}`. The `media_source` schema uses different
shapes for Base64, a carousel, and a registered video; do not reuse the
single-image object for those requests. Account/application eligibility may
fail at execution despite a listed tool. For the user's own Pin performance,
`PINTEREST_GET_PIN_ANALYTICS` requires `pin_id`, UTC `start_date` and
`end_date`, and a supported `metric_types` array, e.g.
`["IMPRESSION","SAVE","OUTBOUND_CLICK"]`. Compare only the period and
metric actually returned; no click metric proves a purchase.

```sh
postplus channels tools show PINTEREST_CREATE_PIN --json
postplus channels tools run PINTEREST_CREATE_PIN --connection <own-pinterest-connection-id> --target-id <actual-board-id> --target-path board_id --input-file pinterest-pin.json --operation-id <pin-operation-id> --wait --json > pinterest-pin-result.json
```
