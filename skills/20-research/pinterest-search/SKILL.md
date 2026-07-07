---
name: pinterest-search
description: Route and run bounded public Pinterest image search that turns a keyword into normalized image, pin, and title records for moodboards, visual references, and creative inspiration.
metadata:
  postplus:
    familyId: pinterest
    familyName: Pinterest
---

# Pinterest Search

Use this skill when the user wants public Pinterest image evidence — image
addresses, moodboard source lists, or visual inspiration links — starting from a
keyword.

Apply `references/shared-contract.md` first, then `references/search.md` for the
keyword discovery workflow.

## Job

Turn one keyword into a bounded set of Pinterest images. Return each result
normalized to `{ image_url, pin_url, title }`, deduplicated by image address.
Run the smallest first pass that can answer the request, then stop and report
scope, count, strongest results, and next action.

## Reference Index

| User asks for | Apply |
| --- | --- |
| Any Pinterest image search from a keyword | `references/shared-contract.md`, then `references/search.md` |
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

Do not ask the user for credentials, implementation choice, collection keys,
schema fields, hidden filters, or retry strategy.

## Run Discipline

1. Apply `references/shared-contract.md`.
2. Apply `references/search.md`.
3. Run the narrowest collection that can answer the first pass; start at the
   minimum limit of 20.
4. Normalize output to `{ image_url, pin_url, title }` and deduplicate by image
   address.
5. Stop after the first pass and report scope, count, strongest results, limits,
   and next action.

Do not present a bounded first pass as the full Pinterest catalog. Do not add
hosted envelopes, hidden implementation fields, unsupported filters, or
compatibility fallbacks to the request.

## Public Command Boundary

- Build the raw request object
  `{ "query": "...", "filter": "all", "limit": 20 }` (`filter` is `all` or
  `videos`; `limit` minimum is 20) and run the collect verb directly.
- Readiness diagnostics: `postplus doctor --skill pinterest-search`.
- If the owned CLI command fails, report the exact error and stop. Do not bypass
  the failure with metadata-only answers, readiness probing, local payload
  rewrites, fallback services, or unpublished tools.
- Use `postplus research schema --collection-key pinterest-search --json` only
  when constructing or repairing an unknown request shape.
- Hosted collection:
  `postplus research collect pinterest-search --request <input.json> --output <result.json>`
  where the request file is the raw collection input object, not a hosted
  envelope and not `{ "schemaVersion": 1, "input": ... }`.
- Resume a pending collection:
  `postplus research collect --run-handle <runHandle> --output <result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run
  `postplus quote confirm --json --challenge-file <challenge.json>` and retry
  with the returned token.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research collect pinterest-search --request request.json --output result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->
