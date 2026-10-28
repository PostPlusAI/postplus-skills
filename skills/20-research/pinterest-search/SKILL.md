---
name: pinterest-search
description: Find public Pinterest images from a keyword for moodboards and visual inspiration. Return usable image links, source pins, and titles.
metadata:
  postplus:
    familyId: pinterest
    familyName: Pinterest
---

# Pinterest Search

Use this skill when the user wants public Pinterest image evidence — image
addresses, moodboard source lists, or visual inspiration links — starting from a
keyword.

Read `references/search.md` only when the keyword workflow needs clarification.

## Job

Turn one keyword into a bounded set of Pinterest images. Return each result
normalized to `{ image_url, pin_url, title }`, deduplicated by image address.
Run the smallest first pass that can answer the request, then stop and report
scope, count, strongest results, and next action.

## Reference Index

| User asks for | Apply |
| --- | --- |
| Any Pinterest image search from a keyword | `references/search.md` only if needed |
| Broader pass: more results, filter variation, or a second keyword | `references/search.md` |
| Board scrape, profile scrape, pin-URL scrape, shopping/product fields, engagement metrics | Not supported on the current public surface. Say so and stop |
| Non-Pinterest image sources | Hand off; run only the Pinterest lane here |

## First Question

Ask one question only when the answer changes the route, first-pass scope, or
output shape.

| Missing | Ask |
| --- | --- |
| Keyword | `What keyword should I search Pinterest for?` |
| Too broad | `Which one keyword matters most for the first pass?` |
| Filter intent | `Should I include all pins, or only video pins?` |

Do not ask the user for credentials, implementation choice, schema fields,
hidden filters, or retry strategy.

## Run Discipline

1. Use the command below; read `references/search.md` only if needed.
2. Run the narrowest collection that can answer the first pass; start at the
   minimum limit of 20.
3. Normalize output to `{ image_url, pin_url, title }` and deduplicate by image
   address.
4. Stop after the first pass and report scope, count, strongest results, limits,
   and next action.


Do not present a bounded first pass as the full Pinterest catalog. Use only the
public filters shown by the route.

## Public Command Boundary

- Run `postplus research run pinterest-search --query <keyword> --kind
  <all|videos> --limit <n> --wait --output <result.json>`; the minimum limit is
  20.
- Readiness diagnostics: `postplus doctor --skill pinterest-search`.

- Inspect flags with `postplus research run pinterest-search --help` only when
  needed.
- Keep the first pass bounded; expand only after inspecting the first result.
- Requested tasks use existing PostPlus credits after the current price and balance are checked.
  Estimate-only requests do not execute. Stop on insufficient credits; do not
  recharge, buy a subscription, or repeat an uncertain paid operation.

Only if platform scope or evidence interpretation remains unclear, consult
[platform contract](references/shared-contract.md); it is not a preflight.

## Evidence Quality

1. Keep usable image records and source pin URLs; discard records without an image and deduplicate by image URL.
2. If a completed pass is sparse or off-topic, try one focused keyword or supported kind change within scope.
3. Allow at most two changed follow-up passes after successful but insufficient results, within approved scope and budget; do not repeat an identical request or hide a failed/pending operation.
4. Stop when sufficient, at the bound, or when another pass would not help. Report useful evidence and uncertainty; preserve raw results and source links.

image_url is the asset, pin_url is its source page; missing titles stay missing and visual inspiration is not engagement evidence.
Full machine fields belong to `postplus research schema --route <route> --json`;
consult it only when required for processing, not before every request.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research run pinterest-search \
  --query "example topic" \
  --wait \
  --output ./result.json
```

Follow the CLI's structured result and reported next action; do not infer recovery from free-text messages.
Use existing PostPlus credits for requested work within existing authorization; estimate-only requests do not execute. Do not recharge, buy subscriptions, publish or change external advertising spend without applicable authorization. An initial reservation is not a final price or a hard cost cap. If a required hard final-cost limit cannot be enforced, do not execute; explain that limit.
Correct definite pre-submission field or format errors without changing the requested intent, mode or output constraints. After submission or an unknown outcome, resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
Keep raw results, operation identifiers and recovery commands in execution records. In ordinary chat, give the result, meaningful limitations, known cost and any necessary user decision; do not narrate uploads, polling, internal identifiers or JSON. When asked how media was made, provide the actual model, submitted prompt in the user language and references actually submitted with their roles.
<!-- END GENERATED EXECUTION EXAMPLE -->
