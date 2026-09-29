# WhatsApp Business: qualify the recipient before sending

Use this reference for a named customer's WhatsApp Business conversation.
First distinguish a free-form reply inside a customer-initiated conversation
window from a template message that may start or reopen a conversation. A
connected business account and a phone number alone do not prove permission to
send either one. Confirm the recipient, contact basis, language, exact text,
and the sending business number; do not turn an individual request into a
bulk campaign.

## Resolve the sending number and recipient

Use the `whatsapp` connection and `whatsapp` toolkit. Inspect current schemas
with `postplus channels tools show <SLUG> --json`. Run
`WHATSAPP_GET_PHONE_NUMBERS` with `{}` or a justified `limit` to find the
business `phone_number_id`, display number, and status. The pinned tool accepts
`limit` but does not expose a paging cursor input; if the desired sender is
not in the available result, do not guess its ID. `phone_number_id` is the
account-assigned ID, not the displayed
telephone number. Normalize the customer's actual WhatsApp number to
international digits with country code and **without** `+`; verify it against
the user's intended contact rather than guessing from a name.

## Reply in an evidenced conversation window

The current `WHATSAPP_GET_MESSAGE_HISTORY` tool is primarily a sending and
delivery history; it does **not** alone establish that the customer initiated
a conversation within the current 24-hour window. Obtain reliable inbound
conversation evidence from the user's supplied record or an available
account-side view. If that evidence is missing or stale, do not send free-form
text. Ask for the needed conversation evidence or use the approved-template
route if the user's request and contact basis allow it.

For an eligible free-form reply, save `whatsapp-reply.json`:

<!-- tool-input: WHATSAPP_SEND_MESSAGE -->
```json
{"phone_number_id":"<CONFIRMED_SENDING_ID>","to_number":"<COUNTRY_CODE_AND_NUMBER_WITHOUT_PLUS>","text":"<APPROVED_TEXT>"}
```

If the user explicitly wants to quote a particular existing message, add
`"message_id":"<VERIFIED_WAMID>"`; otherwise omit it. The text limit is
4,096 characters. Run:

```sh
postplus channels tools run WHATSAPP_SEND_MESSAGE \
  --connection <WHATSAPP_CONNECTION_UUID> \
  --input-file whatsapp-reply.json \
  --operation-id <NEW_OPERATION_UUID> \
  --wait --json > whatsapp-reply-result.json
```

## Use a qualified approved template when needed

For contact outside the evidenced conversation window, inspect approved
templates rather than placing free text in a template call:

<!-- tool-input: WHATSAPP_GET_MESSAGE_TEMPLATES -->
```json
{"status":"APPROVED","language":"<RECIPIENT_LANGUAGE_CODE>","fields":"name,status,category,language,components","limit":25}
```

Run `WHATSAPP_GET_MESSAGE_TEMPLATES`, page with `after` if needed, and check
the exact template name, approved status, category, language, body, and
variables. Verify the requested purpose and recipient's contact eligibility.
A template in the list does not prove this recipient may be contacted. If the
template or recipient qualification is unknown, stop.

For an approved template without variables, save `whatsapp-template.json`:

<!-- tool-input: WHATSAPP_SEND_TEMPLATE_MESSAGE -->
```json
{"phone_number_id":"<CONFIRMED_SENDING_ID>","to_number":"<COUNTRY_CODE_AND_NUMBER_WITHOUT_PLUS>","template_name":"<EXACT_APPROVED_NAME>","language_code":"en_US"}
```

`en_US` is only a schema-valid example; replace it with the selected template's
actual approved language code before sending.

For a template with one positional body variable, add the actual parameter
specified by that template:

```json
{"components":[{"type":"body","parameters":[{"type":"text","text":"<VERIFIED_VALUE>"}]}]}
```

Named variables require the schema's `parameter_name`, and button, header,
image, or other variable types need the matching verified component. Do not
send the one-variable example for a different template. Run
`WHATSAPP_SEND_TEMPLATE_MESSAGE` with the same CLI pattern and a fresh
operation ID.

## Verify the outcome

The send response's `messages` entry supplies a WhatsApp message ID; it is an
acceptance receipt, not proof of delivery. Query
`WHATSAPP_GET_MESSAGE_HISTORY` with
`{"phone_number_id":"<SAME_SENDING_ID>","message_id":"<RETURNED_WAMID>"}`
and inspect the timestamped delivery events. A missing or pending event is
unresolved, not delivered. Readback may be delayed or unavailable for this
account. Preserve the original operation ID. On an unknown result, query
`postplus channels tools run --status <SAME_OPERATION_UUID> --json` and the
specific message history; do not send a second message with a new ID.
