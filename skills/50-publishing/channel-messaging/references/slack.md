# Slack: preserve channel, thread, and time

Use this reference when the user explicitly asks for a Slack message. Confirm
the workspace, exact conversation, intended audience, and whether the message
belongs in an existing thread. A display name can be duplicated; use the
resolved conversation ID. A thread reply should stay in that thread, without
broadcasting it to the main channel unless the user asks.

## Find the exact conversation and parent

Use the `slack` connection and `slack` toolkit. Inspect the current schema
with `postplus channels tools show <SLUG> --json`. To resolve a channel, call
`SLACK_LIST_ALL_CHANNELS` with a bounded page and the required types:

<!-- tool-input: SLACK_LIST_ALL_CHANNELS -->
```json
{"types":"public_channel,private_channel,im,mpim","exclude_archived":true,"limit":100}
```

Continue with `cursor` from `response_metadata.next_cursor` when the target is
not on the first page. Check the returned conversation ID, name, workspace,
and access; do not use a name as the downstream `channel` argument. If replying
in a thread, fetch it with `SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION`:

<!-- tool-input: SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION -->
```json
{"channel":"<CONFIRMED_CONVERSATION_ID>","ts":"<EXACT_PARENT_TS>","limit":100}
```

Use the *full* parent `ts`, including its decimal part. Inspect the parent and
replies for context. If `has_more` or `response_metadata.next_cursor` indicates
more, page before claiming the entire thread has been read. A missing parent
or lack of membership is a stop.

## Send now or schedule

For a normal message or thread reply, save `slack-send.json`:

<!-- tool-input: SLACK_SEND_MESSAGE -->
```json
{"channel":"<CONFIRMED_CONVERSATION_ID>","thread_ts":"<EXACT_PARENT_TS>","markdown_text":"<APPROVED_TEXT>","reply_broadcast":false}
```

Omit `thread_ts` for a requested top-level message. `SLACK_SEND_MESSAGE`
expects `markdown_text` for normal written content; do not substitute a
generic `text` field. Use `blocks` only when a user actually needs a structured
layout and inspect its schema separately. Run:

```sh
postplus channels tools run SLACK_SEND_MESSAGE \
  --connection <SLACK_CONNECTION_UUID> \
  --input-file slack-send.json \
  --operation-id <NEW_OPERATION_UUID> \
  --wait --json > slack-send-result.json
```

In CLI `output.result.data`, check platform `ok`, `channel`, `ts` or `message_ts`, and the returned
message. Then query the exact parent thread with
`SLACK_FETCH_MESSAGE_THREAD_FROM_A_CONVERSATION` and locate that `ts`. For a
top-level message, use `SLACK_FETCH_CONVERSATION_HISTORY` and its time-range
and paging fields; the history tool does **not** return thread replies. A
successful send response alone does not prove the message is visible on a
later read.

For a future message, first convert the user's local date, time, and time zone
to a future Unix UTC *seconds* value. Save `slack-schedule.json`:

<!-- tool-input: SLACK_SCHEDULE_MESSAGE -->
```json
{"channel":"<CONFIRMED_CONVERSATION_ID>","thread_ts":"<EXACT_PARENT_TS>","markdown_text":"<APPROVED_TEXT>","post_at":"<FUTURE_UNIX_UTC_SECONDS>","reply_broadcast":false}
```

Omit `thread_ts` for a top-level scheduled message. `post_at` is a string
containing integer epoch seconds, not an ISO timestamp or local clock time.
The tool limits scheduling to 120 days ahead. Run
`SLACK_SCHEDULE_MESSAGE` with the same CLI pattern and a new operation ID.
In CLI `output.result.data`, check `ok`, `channel`, `post_at`, and
`scheduled_message_id`. Independently query
`SLACK_LIST_SCHEDULED_MESSAGES` with
`{"channel":"<CONFIRMED_CONVERSATION_ID>","limit":100}` and page by
`response_metadata.next_cursor` to find that ID. This proves a pending
schedule, not delivery; after the scheduled time, verify in the channel or
thread. If any write result is unknown, query its *original* operation ID and
read the intended destination instead of submitting again.

## Upload one file or edit one existing message

For “send this local file,” confirm the exact conversation, optional parent
thread, filename, rights and accompanying comment. Use
`SLACK_UPLOAD_OR_CREATE_A_FILE_IN_SLACK`; its `channels` field holds **one
conversation ID**, not a channel name or comma-separated broadcast list.
Leaving it out can leave the file private to the uploader. Upload the local
file into PostPlus first:

```sh
postplus media-file upload --input-file ./report.pdf --output slack-media-result.json
```

Copy the complete `output.mediaReference` URI into `slack-media-map.json` as
`{"file":"<output.mediaReference>"}`; do not add another
`postplus-media://` prefix. The file slot belongs in the media map, not as an
invented `s3key` in the request. Save `slack-file.json`:

<!-- tool-input: SLACK_UPLOAD_OR_CREATE_A_FILE_IN_SLACK -->
```json
{"channels":"<CONFIRMED_CONVERSATION_ID>","thread_ts":"<EXACT_PARENT_TS>","filename":"report.pdf","initial_comment":"<APPROVED_COMMENT>"}
```

Omit `thread_ts` for a top-level share. `content` is a separate text-file
route; do not provide it together with a mapped `file`.

```sh
postplus channels tools show SLACK_UPLOAD_OR_CREATE_A_FILE_IN_SLACK --json
postplus channels tools run SLACK_UPLOAD_OR_CREATE_A_FILE_IN_SLACK --connection <SLACK_CONNECTION_UUID> --input-file slack-file.json --media-map-file slack-media-map.json --operation-id <FILE_OPERATION_UUID> --wait --json > slack-file-result.json
```

In `output.result.data`, require platform `ok`, inspect the returned `file`
or `files[]` ID and sharing information, then use
`SLACK_RETRIEVE_DETAILED_INFORMATION_ABOUT_A_FILE` with
`{"file":"<RETURNED_FILE_ID>"}`. If channel/thread visibility cannot be
confirmed, report the upload separately from the requested share. A
`upload_too_large` or deprecated-method error is a real failure; do not
silently replace this task with a remote-link post.

For “correct the message I just sent,” identify the *same* conversation and
full message `ts` from a readback. `SLACK_UPDATES_A_SLACK_MESSAGE` uses one
visible content mode. A plain Markdown edit is:

<!-- tool-input: SLACK_UPDATES_A_SLACK_MESSAGE -->
```json
{"channel":"<CONFIRMED_CONVERSATION_ID>","ts":"<EXACT_MESSAGE_TS>","markdown_text":"<APPROVED_REPLACEMENT>"}
```

```sh
postplus channels tools show SLACK_UPDATES_A_SLACK_MESSAGE --json
postplus channels tools run SLACK_UPDATES_A_SLACK_MESSAGE --connection <SLACK_CONNECTION_UUID> --input-file slack-edit.json --operation-id <EDIT_OPERATION_UUID> --wait --json > slack-edit-result.json
```

Check `output.result.data.ok`, `channel`, `ts` and returned `message`, then
independently fetch the exact thread or conversation history to confirm the
new text. Do not edit another author's message, change its target, or treat
an unknown edit as permission to create a replacement post.
