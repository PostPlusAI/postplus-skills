# Resolve and repair Meta audience conditions

Start from the buyer task, acquisition/retention objective and actual account.
Use [audience planning](../audience-planning.md) for business assumptions and
entity discovery. Keep geography, locale, age, placements, detailed conditions,
custom audiences and exclusions separate. A public commenter is research
evidence, not an authorized contact-list upload.

Use METAADS_LIST_TARGETING_SEARCH to resolve actual supported entities and
METAADS_LIST_CUSTOM_AUDIENCES for existing audiences. Inspect the current ad set
before recommending a replacement. Incomplete list schemas or a LOOKALIKE enum
do not establish seed upload, matching, availability or all audience creation.
Do not invent targeting IDs or assume a platform estimate is reachable buyers.

## Common corrections

- Wrong location/entity: confirm the intended market and discovered platform ID,
  then replace only that confirmed condition in the reviewed draft plan.
- Unintended exclusions: check whether the objective is acquisition, repeat
  purchase or expansion before removing/adding an exclusion. Preserve unrelated
  eligibility and restricted-category requirements.
- Incorrect Boolean grouping: inspect alternatives within a flexible_spec group
  and narrowing between groups. Rebuild the intended logical condition rather
  than flattening every interest into a list.
- Expansion mismatch: distinguish requested filters, accepted configuration and
  platform expansion. An advantage_audience value alone does not establish a
  hard interest boundary. Use the actual expansion acceptance contract.

For an authorized paused ad-set revision, follow
[build and preview](build-and-preview.md): read the current snapshot, use
POSTPLUS_METAADS_UPDATE_PAUSED_DRAFT with expected_snapshot and the supported
replacement fields, preserve budget/schedule and independently read back.
Live targeting edits are not established by a tool that only changes status or
name. If the selected object state or tool does not support the requested edit,
prepare the exact alternative for the user's scope decision; do not duplicate
or activate a replacement automatically.

Acceptance compares requested and saved conditions, parent/account, expansion,
exclusions and paused state. Retain the original configuration for a supported
reversal. A configuration check does not prove matching quality or lift; use
[experiments](../experiments.md) for a bounded performance test.
