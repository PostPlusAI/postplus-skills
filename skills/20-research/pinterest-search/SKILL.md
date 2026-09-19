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
- If the CLI returns a quote-confirmation challenge, obtain user approval for its scope and cost before running
  `postplus quote confirm --json --challenge-file <challenge.json>` and retry
  with the returned token.

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
Wait for explicit user approval when requested; an action does not authorize spending, publishing, or overwriting.
Resume the same operation through its returned checkpoint or action; never resubmit uncertain work, repeat exhausted recovery, or switch providers to bypass failure.
<!-- END GENERATED EXECUTION EXAMPLE -->
