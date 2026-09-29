---
name: channel-messaging
description: Draft or act in a specified Discord, Slack, or WhatsApp Business conversation, including supported sends, Slack file shares or edits, and follow-up verification.
metadata:
  postplus:
    familyId: channel-messaging
    familyName: Channel Messaging
---

# Channel Messaging

Use this skill when the user wants a message in a specific conversation, not
when they want social content planning, public-content research, or an ad
report. A request for a draft stops at the draft: it does not require a
connection. Never send an internal report to Slack, Discord, or WhatsApp merely
because a destination is available.

## Choose the task and destination

| User's task | Read |
| --- | --- |
| Find a bot-accessible Discord server/channel, notify, or create and use a thread | [Discord](references/discord.md) |
| Send, reply in a thread, schedule, share a file, edit, or check a Slack message | [Slack](references/slack.md) |
| Reply in an eligible customer conversation or send an approved template | [WhatsApp Business](references/whatsapp-business.md) |

Resolve five facts before any send: **who** receives it, **what** will be
sent, **when**, **why this account may contact them**, and **what evidence will
prove the requested outcome**. Preserve the user's exact channel, parent
message, phone number, language, and local time. Names, screenshots, and
previous examples are clues, not confirmed external IDs. If the user asks to
contact many recipients, resolve the audience source, each recipient's
eligibility, count, and failure handling before preparing individual sends;
there is no generic cross-channel broadcast command.

For advice or a draft, write the requested text and stop. For a live read or
send, first reuse an active connection for the requested channel:

```sh
postplus channels list --json
```

Connection channel IDs are `discord`, `slack`, and `whatsapp`; the tool search
toolkits are `discordbot`, `slack`, and `whatsapp`. If the required connection
is missing, run `postplus channels connect <channel> --json`, give the returned
authorization link to the user, then run
`postplus channels wait <connection-id> --json` for that same connection. A
connection grants platform access, not permission to send to every reachable
person or channel. Do not substitute a different destination after an access
error.

## Inspect and execute the exact operation

The platform references give concrete request shapes. Inspect the selected
tool's current schema, availability, and required fields before use:

```sh
postplus channels tools list --toolkit slack --query message --json
postplus channels tools show SLACK_SEND_MESSAGE --json
```

Use the actual platform toolkit and tool slug from the chosen reference. Tool
availability does not prove account membership or permission. Write the
arguments as a JSON object in a task file; replace every placeholder with a
verified value. These messaging tools bind their exact channel, thread, or
recipient through JSON arguments. Do not add `--target-id` and `--target-path`
unless the current `show` contract specifically requires an external target.

```sh
postplus channels tools run <TOOL_SLUG> \
  --connection <CONNECTION_UUID> \
  --input-file request.json \
  --operation-id <NEW_OPERATION_UUID> \
  --wait --json > result.json
```

Use a new operation ID for each genuinely new request, record it with the
first full response, and inspect `output.execution.resultStatus` and
`output.result.data`. A receipt or accepted schedule is not proof that a
person received the message. If the CLI returns `pending`, `unknown`, or exit
2, query the *same* ID:

```sh
postplus channels tools run --status <SAME_OPERATION_UUID> --json
```

Do not submit a possibly sent message again with a new ID. A status receipt
does not replay the first business result; preserve `result.json` and use the
platform's readback tool for the exact destination. Check partial failures and
platform `ok`/`successful` fields, not only the shell exit code. If current
schema, connection permission, recipient eligibility, or intended target is
unclear, stop before sending and report the missing fact.

## Return the observed result

For a draft, return the text. For an operation, name the sending identity,
target, content scope, requested time, operation ID, platform message or
schedule ID when supplied, and the strongest independently observed status.
Distinguish submitted, scheduled, visible in the conversation, and delivered
to the recipient. If evidence is unavailable, say so without claiming
completion or retrying an uncertain write.
