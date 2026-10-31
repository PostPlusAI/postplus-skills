# Repair a confirmed break from customer action to recorded outcome

Start from the actual accepted action: successful form submission, confirmed
booking, account creation or paid order. A button click, request attempt,
successful schema validation, received event and attributed conversion are
different observations. Establish destination, event name, identity, value,
currency and timing before inspecting a suspected break.

Use the actual page/source, available browser diagnostics, supported platform
reports and supplied order/CRM evidence. Static code shows an intended path;
it cannot prove that deployed code ran or that the destination received it.
Use Ads for conversion-action/goal configuration, platform event submission or
offline outcome import. Keep site trigger repair here and campaign changes there.

## Common repair procedures

| Confirmed failure | Repair | Acceptance and rollback |
| --- | --- | --- |
| Tracking uses button click instead of accepted success | Bind the existing event to the application's documented success state or verified integration callback | Failed/abandoned submissions do not emit success; one accepted test emits the intended event. Preserve the prior hook in the patch. |
| Navigation/remount creates duplicate listeners or sends | Correct listener lifecycle or the repeated sender in the owning component/integration | Exercise initial load, navigation and repeat submission. Distinct legitimate outcomes remain counted. Do not globally suppress all events after the first visit. |
| Browser/server report the same outcome twice | Align the platform-defined deduplication identity for that same business event and inspect returned counts | Verify shared identity and platform diagnostics; distinct orders use distinct identities. Do not fabricate event IDs or assume adding both paths gives a deduplicated total. |
| Event value/currency comes from the wrong field | Map confirmed order/payment data through the current integration, preserving numeric and currency meaning | Test discounts/refunds and supported currencies as relevant; one known outcome agrees with its source. A default value is not observed revenue. |
| Redirect or third-party booking loses source context | Trace the actual parameter, approved metadata and success callback path; repair only the evidenced break | Inspect the real redirect/booking chain and destination event. Keep personal data and secrets out of URLs. A fabricated click ID proves transport only, not ad attribution. |
| Published container or consent behavior differs from the local setup | Identify the deployed version/consent state and prepare the precise correction | Test intended allowed/denied states and version. Do not disable consent, publish a container or emit a real event solely to make an audit pass. |

A user-requested local fix includes editing the owning implementation and
running relevant tests when the authorized host offers an editor. In cloud-only
MCP without site access, deliver the concrete patch and identify the missing
site-edit/publish operation; do not run a shell or pretend the patch was applied.
Use secure configured inputs for credentials. Never ask for a secret in chat.

## Verify each claim separately

Record configuration inspected, trigger observed, request observed, receipt
confirmed, attribution confirmed and real business outcome reconciled. Inspect
actual available diagnostics; do not invent a DebugView or Test Events API.
An empty validator error list is only payload validation. A platform event-send
tool is a real write even with a test code. Use an identifiable authorized test
and preserve cleanup/recovery requirements; never place an order or send a lead
without that scope.

Close with the exact fix, tests, observed/deferred stages and next named check.
Follow up on the same event/object rather than resend an uncertain event. Match
report windows, counting rules and lag through
[source reconciliation](source-reconciliation.md). Wrong ad goals or selected
optimization events transfer to Ads with the evidence and intended configuration.
