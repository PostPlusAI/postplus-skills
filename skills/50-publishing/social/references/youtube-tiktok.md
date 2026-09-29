# YouTube and TikTok

Read [channel execution](channel-execution.md). Before uploading, confirm the
actual creator/channel, final title or caption, file rights, visibility,
category when needed, and whether the user asked for a draft or a live post.
These platforms may process video after a tool returns.

## YouTube local video

Use a `youtube` connection. `YOUTUBE_LIST_CHANNELS` finds channels available
to the connected account; select the intended one. Its own-channel input is:

<!-- tool-input: YOUTUBE_LIST_CHANNELS -->
```json
{"mine":true}
```

For a region-specific category, `YOUTUBE_LIST_VIDEO_CATEGORIES` accepts
`{"regionCode":"<actual two-letter country>"}`. Prepare the upload request
without an inline `videoFile` object:

```json
{"title":"<approved title>","description":"<approved description>","categoryId":"<valid category ID>","privacyStatus":"private"}
```

Upload the local file and use the returned media reference, not an invented
storage key:

```sh
postplus media-file upload --input-file ./video.mp4 --output media-result.json
postplus channels tools show YOUTUBE_MULTIPART_UPLOAD_VIDEO --json
postplus channels tools run YOUTUBE_MULTIPART_UPLOAD_VIDEO --connection <own-connection-id> --input-file youtube-upload.json --media-map-file youtube-map.json --operation-id <stable-operation-id> --wait --json > youtube-result.json
```

`youtube-map.json` has shape
`{"videoFile":"<output.mediaReference from media-result.json>"}`. Copy the
complete returned URI without adding another `postplus-media://` prefix. Set
`privacyStatus` to the user's authorized visibility, not automatically
`public`. Read the returned video ID with `YOUTUBE_GET_VIDEO_DETAILS_BATCH`
using `{"id":["<returned video ID>"],"parts":["snippet","status","processingDetails"]}`
only if these parts remain accepted by `show`. Confirm processing and privacy;
an upload response is not proof that the video is viewable.

## YouTube: reply, update a thumbnail, or organize a playlist

A reply needs the **actual parent comment ID**, not a video ID or displayed
author name. Read the selected parent with `YOUTUBE_LIST_COMMENTS` using its
`id` and `part:"snippet"`; confirm the video, text and account context. Then:

<!-- tool-input: YOUTUBE_CREATE_COMMENT_REPLY -->
```json
{"parentId":"<VERIFIED_PARENT_COMMENT_ID>","textOriginal":"<APPROVED_REPLY>"}
```

```sh
postplus channels tools show YOUTUBE_CREATE_COMMENT_REPLY --json
postplus channels tools run YOUTUBE_CREATE_COMMENT_REPLY --connection <own-youtube-connection-id> --input-file youtube-reply.json --operation-id <reply-operation-id> --wait --json > youtube-reply-result.json
```

Check `output.result.data.id` and `snippet.parentId`; fetch the returned ID
with `YOUTUBE_LIST_COMMENTS` to confirm the reply. Platform moderation or a
disabled-comment video can still prevent visibility; do not post a new
top-level comment after a reply failure without separate authorization.

For a custom thumbnail, verify that this connected channel owns the exact
video, is eligible for custom thumbnails, and that the approved image is a
platform-readable HTTPS URL meeting the tool's format and size limits. A
`postplus-media://` reference is not a public `thumbnailUrl`:

<!-- tool-input: YOUTUBE_UPDATE_THUMBNAIL -->
```json
{"videoId":"<OWNED_VIDEO_ID>","thumbnailUrl":"https://example.com/approved-thumbnail.jpg"}
```

```sh
postplus channels tools show YOUTUBE_UPDATE_THUMBNAIL --json
postplus channels tools run YOUTUBE_UPDATE_THUMBNAIL --connection <own-youtube-connection-id> --input-file youtube-thumbnail.json --operation-id <thumbnail-operation-id> --wait --json > youtube-thumbnail-result.json
```

Read the returned `items[]` and then `YOUTUBE_GET_VIDEO_DETAILS_BATCH` for
that video with `parts:["snippet"]`; compare the actual thumbnail variants
after processing. If the platform returns only an accepted update, report
that narrower state.

For a new playlist, confirm title, description and the user's chosen
visibility. Its enum is lower-case `private`, `unlisted`, or `public`—unlike
video `privacyStatus` values in the upload example:

<!-- tool-input: YOUTUBE_CREATE_PLAYLIST -->
```json
{"title":"<APPROVED_TITLE>","description":"<APPROVED_DESCRIPTION>","privacyStatus":"private"}
```

```sh
postplus channels tools show YOUTUBE_CREATE_PLAYLIST --json
postplus channels tools run YOUTUBE_CREATE_PLAYLIST --connection <own-youtube-connection-id> --input-file youtube-playlist.json --operation-id <playlist-operation-id> --wait --json > youtube-playlist-result.json
```

Check the returned playlist `id`, `snippet` and `status`, then locate that ID
with `YOUTUBE_LIST_USER_PLAYLISTS` while paging as needed. Creation does not
add videos. If the user also asks to add one, verify the exact playlist and
video, then inspect `YOUTUBE_ADD_VIDEO_TO_PLAYLIST` as a separate write.

## TikTok URL or file

Use a `tiktok` connection. `TIKTOK_QUERY_CREATOR_INFO` checks the creator and
its permitted visibility options. A platform-readable video URL follows
`TIKTOK_PUBLISH_VIDEO` with required `video_url` and `privacy_level`, plus
the approved `caption` if supplied:

<!-- tool-input: TIKTOK_PUBLISH_VIDEO -->
```json
{"video_url":"<accessible video URL>","privacy_level":"SELF_ONLY","caption":"<approved caption>"}
```

Choose the actual privacy value returned for the creator and authorized by
the user; `SELF_ONLY` above is an example, not an override. A local file uses
`TIKTOK_UPLOAD_VIDEO` instead. First `postplus media-file upload --input-file
./video.mp4 --output media-result.json`; put
`{"file_to_upload":"<output.mediaReference from media-result.json>"}` in the media-map
file and pass `--media-map-file`. Keep `file_to_upload` out of the request JSON;
put the user's caption, visibility and `publish` choice there as allowed by
`show`. Do not call URL publishing after file upload as though it were a
two-step protocol. Save the `publish_id`, then call
`TIKTOK_FETCH_PUBLISH_STATUS` with
`{"publish_id":"<returned publish ID>"}`. Distinguish submission,
processing, success, and actual visibility; current account eligibility may
block a route even when the catalog lists it.

For an upload-only request, save `tiktok-file.json` as
`{"publish":false,"privacy_level":"SELF_ONLY"}`. For an authorized direct
post, set `publish:true`, add the approved `caption`, and use a privacy value
permitted by `TIKTOK_QUERY_CREATOR_INFO`; no second publish command follows.
`file_to_upload` is a required input supplied by the media map at execution
time, not by this JSON. Inspect its current schema:

```sh
postplus channels tools show TIKTOK_UPLOAD_VIDEO --json
postplus channels tools run TIKTOK_UPLOAD_VIDEO --connection <own-tiktok-connection-id> --input-file tiktok-file.json --media-map-file tiktok-file-map.json --operation-id <upload-operation-id> --wait --json > tiktok-file-result.json
```

In the first response inspect `output.result.data.upload_completed`,
`publish_id` and `published`. Follow the returned `publish_id` with
`TIKTOK_FETCH_PUBLISH_STATUS`; an upload-only result is not a live post.

```sh
postplus channels tools show TIKTOK_PUBLISH_VIDEO --json
postplus channels tools run TIKTOK_PUBLISH_VIDEO --connection <own-tiktok-connection-id> --input-file tiktok-url.json --operation-id <publish-operation-id> --wait --json > tiktok-submit-result.json
postplus channels tools show TIKTOK_FETCH_PUBLISH_STATUS --json
postplus channels tools run TIKTOK_FETCH_PUBLISH_STATUS --connection <own-tiktok-connection-id> --input-file tiktok-status.json --wait --json > tiktok-status-result.json
```
