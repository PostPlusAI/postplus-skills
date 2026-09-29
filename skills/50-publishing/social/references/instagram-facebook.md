# Instagram and Facebook Pages

Read [channel execution](channel-execution.md) first. Instagram media
containers and Facebook Page posts have different execution models. Confirm
the person's intended account, final content, image rights, and visibility
before writing. `channels tools show` supplies the live schema and deployment
gate for every named tool.

## Instagram: image post and reply

Use an `instagram` connection and `INSTAGRAM_GET_USER_INFO` to establish the
actual professional account ID; `ig_user_id` is an Instagram user ID, not a
Facebook Page ID. For a single image with a platform-readable JPEG URL,
prepare:

<!-- tool-input: INSTAGRAM_POST_IG_USER_MEDIA -->
```json
{"ig_user_id":"17841405309211844","image_url":"https://example.com/image.jpg","caption":"<approved caption>"}
```

The example ID and URL only satisfy the input shape; replace them with this
user's verified account and a real accessible image. `INSTAGRAM_POST_IG_USER_MEDIA`
creates a container. When `show` requires an
external target, bind `--target-id <IG user ID> --target-path ig_user_id`.
Capture the returned container ID. For eligible, processed content and the
authorized final post, prepare:

```sh
postplus channels tools show INSTAGRAM_POST_IG_USER_MEDIA --json
postplus channels tools run INSTAGRAM_POST_IG_USER_MEDIA --connection <own-instagram-connection-id> --target-id <actual-ig-user-id> --target-path ig_user_id --input-file ig-container.json --operation-id <container-operation-id> --wait --json > ig-container-result.json
```

<!-- tool-input: INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH -->
```json
{"ig_user_id":"<same IG user ID>","creation_id":"<returned container ID>"}
```

Run `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH` as a separate write. Use
`INSTAGRAM_GET_IG_MEDIA` with `{"ig_media_id":"<returned media ID>"}`
to inspect the published object. Container creation alone is not a published
post. Reel and carousel child processing still require task-specific evidence;
do not automatically publish a just-created multi-item container. For a reply
to an actual comment, run `INSTAGRAM_POST_IG_COMMENT_REPLIES` with
`{"ig_comment_id":"<real comment ID>","message":"<approved reply>"}`,
then `INSTAGRAM_GET_IG_COMMENT_REPLIES` on that original comment or the
returned object as the schema permits. For performance, use
`INSTAGRAM_GET_IG_MEDIA_INSIGHTS` with the correct `ig_media_id` and
`metric` array selected from `show`; no universal metric list suits every
media type.

```sh
postplus channels tools show INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH --json
postplus channels tools run INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH --connection <own-instagram-connection-id> --target-id <actual-ig-user-id> --target-path ig_user_id --input-file ig-publish.json --operation-id <publish-operation-id> --wait --json > ig-publish-result.json
```

## Instagram: Reel or carousel

For an approved Reel, use a direct HTTPS video URL reachable by Instagram.
Choose the verified professional account and create a **Reel container**, not
a finished post:

<!-- tool-input: INSTAGRAM_POST_IG_USER_MEDIA -->
```json
{"ig_user_id":"17841405309211844","media_type":"REELS","video_url":"https://example.com/approved-video.mp4","caption":"<approved caption>"}
```

Replace the example account and URL. If the video is local, `video_file` is a
file-upload slot: stage it with `postplus media-file upload`, then pass a
media map `{"video_file":"<complete output.mediaReference>"}` instead of
`video_url`. Copy the URI unchanged. Check the returned container `id` and
any platform failure. The separate `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH`
call with `creation_id` waits for processing; do not set `max_wait_seconds:0`
for a Reel unless readiness is independently proved. Read the
returned media ID through `INSTAGRAM_GET_IG_MEDIA`; an accepted Reel upload
does not establish public visibility.

For an image carousel, first confirm **2–10** ordered, direct HTTPS JPEG
URLs, each image's rights and aspect ratio. The fixed
`INSTAGRAM_CREATE_CAROUSEL_CONTAINER` tool creates the draft container and
its children from these URLs:

<!-- tool-input: INSTAGRAM_CREATE_CAROUSEL_CONTAINER -->
```json
{"ig_user_id":"17841405309211844","caption":"<approved caption>","child_image_urls":["https://example.com/slide-1.jpg","https://example.com/slide-2.jpg"]}
```

```sh
postplus channels tools show INSTAGRAM_CREATE_CAROUSEL_CONTAINER --json
postplus channels tools run INSTAGRAM_CREATE_CAROUSEL_CONTAINER --connection <own-instagram-connection-id> --target-id <actual-ig-user-id> --target-path ig_user_id --input-file ig-carousel.json --operation-id <carousel-operation-id> --wait --json > ig-carousel-result.json
```

Check the returned container `id` and retain the submitted child order. If
the platform does not expose processing readiness, do not infer it from the
container receipt alone. A
carousel assembled from existing child creation IDs uses `children` instead;
each child must be finished before assembly. Do not mix an unverified order
or exceed the platform item bound. Container IDs expire in under 24 hours;
after readiness and the user's authorization, publish with the same
`INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH` request shape above, using this
container's `id` as `creation_id`, then read the final media object. If a
container is pending or its result is unknown, query the original operation
and platform object rather than creating another carousel.

## Facebook: managed Page post and reply

Use a `facebook` connection. `FACEBOOK_LIST_MANAGED_PAGES` finds Pages the
connected account can manage; choose the exact Page and check required
permissions. A personal profile is not a Page. For a simple text post:

<!-- tool-input: FACEBOOK_CREATE_POST -->
```json
{"page_id":"<managed Page ID>","message":"<approved text>"}
```

Run `FACEBOOK_CREATE_POST`, binding `page_id` when `show` requires a target.
The response's post ID can be checked with `FACEBOOK_GET_POST` using
`{"post_id":"<returned post ID>"}`. For performance use
`FACEBOOK_GET_POST_INSIGHTS` on the same `post_id`, choosing metrics and period
from `show`. To answer a specific comment or post, inspect the actual parent
and use `FACEBOOK_CREATE_COMMENT` with
`{"object_id":"<actual post or comment ID>","message":"<approved reply>"}`;
`FACEBOOK_GET_COMMENT` can check a returned comment ID. `published:false`
and `scheduled_publish_time` are separate scheduling controls, so do not
infer a scheduled Page post from successful immediate publication. Review
schedule semantics and the resulting Page object before claiming that route.

```sh
postplus channels tools show FACEBOOK_CREATE_POST --json
postplus channels tools run FACEBOOK_CREATE_POST --connection <own-facebook-connection-id> --target-id <managed-page-id> --target-path page_id --input-file facebook-post.json --operation-id <post-operation-id> --wait --json > facebook-post-result.json
```

For an approved photo or video post, do not place media fields in
`FACEBOOK_CREATE_POST`. Use the separate Page tools and direct platform-readable
URLs:

<!-- tool-input: FACEBOOK_CREATE_PHOTO_POST -->
```json
{"page_id":"<MANAGED_PAGE_ID>","url":"https://example.com/approved-photo.jpg","message":"<approved caption>"}
```

<!-- tool-input: FACEBOOK_CREATE_VIDEO_POST -->
```json
{"page_id":"<MANAGED_PAGE_ID>","file_url":"https://example.com/approved-video.mp4","title":"<approved title>","description":"<approved caption>"}
```

Inspect `FACEBOOK_CREATE_PHOTO_POST` or `FACEBOOK_CREATE_VIDEO_POST` with
`show`, submit the selected one under the verified Page ID and a new operation
ID, and preserve its first response. A photo result may include `post_id`;
a video result may only give a video `id`. Do not treat a video object ID as a
Page feed post ID. Use `FACEBOOK_GET_POST` when a post ID is returned, or
`FACEBOOK_GET_PAGE_POSTS` for the exact Page to establish whether the item is
actually published. Video processing can remain pending after acceptance.

## Facebook: schedule and verify a Page post

For a timed text/link post, convert the user's local time and timezone to a
future **Unix UTC seconds** integer. Confirm the intended Page and exact
content. `FACEBOOK_CREATE_POST` requires `published:false` with
`scheduled_publish_time` at least 10 minutes ahead; a false `published`
without a time is only an unpublished draft:

<!-- tool-input: FACEBOOK_CREATE_POST -->
```json
{"page_id":"<MANAGED_PAGE_ID>","message":"<approved scheduled text>","published":false,"scheduled_publish_time":1791000000}
```

The timestamp is a synthetic input-shape example, not a suggested posting
time. Use the same `FACEBOOK_CREATE_POST` CLI pattern above with a new
operation ID. Read its composite post ID, then query
`FACEBOOK_GET_SCHEDULED_POSTS` for that `page_id`, following paging cursors
and matching the exact ID and time. An accepted schedule is not a published
post. After its time passes, use `FACEBOOK_GET_POST` to verify
`is_published` and the visible content.

<!-- tool-input: FACEBOOK_GET_SCHEDULED_POSTS -->
```json
{"page_id":"<MANAGED_PAGE_ID>","limit":100}
```

To move an existing scheduled post, confirm its current Page, ID and time,
then submit a **separate** `FACEBOOK_RESCHEDULE_POST` request:

<!-- tool-input: FACEBOOK_RESCHEDULE_POST -->
```json
{"post_id":"<VERIFIED_SCHEDULED_POST_ID>","scheduled_publish_time":1791086400}
```

```sh
postplus channels tools show FACEBOOK_GET_SCHEDULED_POSTS --json
postplus channels tools run FACEBOOK_GET_SCHEDULED_POSTS --connection <own-facebook-connection-id> --input-file facebook-scheduled-list.json --wait --json > facebook-scheduled-result.json
postplus channels tools show FACEBOOK_RESCHEDULE_POST --json
postplus channels tools run FACEBOOK_RESCHEDULE_POST --connection <own-facebook-connection-id> --target-id <verified-scheduled-post-id> --target-path post_id --input-file facebook-reschedule.json --operation-id <reschedule-operation-id> --wait --json > facebook-reschedule-result.json
```

Check `output.result.data.success`, then independently list scheduled posts
again and compare the new time. If the result is unknown, inspect the
original operation ID and exact post rather than creating another schedule.
