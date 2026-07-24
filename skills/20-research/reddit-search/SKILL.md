---
name: reddit-search
description: Route and run bounded public Reddit post search that turns a keyword into normalized post records — title, post URL, community, score, comment count, and created time — for audience voice, pain-point mining, and topic research.
metadata:
  postplus:
    familyId: reddit
    familyName: Reddit
---

# Reddit Search

Use this skill when the user wants public Reddit post evidence — audience
voice, pain points, product opinions, community discussion links — starting
from a keyword.

Apply `references/shared-contract.md` first, then `references/search.md` for
the keyword discovery workflow.

## Job

Turn one keyword into a bounded set of Reddit posts. Return each result
normalized to
`{ title, post_url, community, score, comments_count, created_at, snippet }`,
deduplicated by post URL. Run the smallest first pass that can answer the
request, then stop and report scope, count, strongest results, and next action.

## Reference Index

| User asks for | Apply |
| --- | --- |
| Any Reddit post search from a keyword | `references/shared-contract.md`, then `references/search.md` |
| Broader pass: more results, another sort, a different time range, or a second keyword | `references/search.md` |
| Comment scrapes, subreddit feeds, profile scrapes, post-URL scrapes | Not supported on the current public surface. Say so and stop |
| Non-Reddit sources | Hand off; run only the Reddit lane here |

## First Question

Ask one question only when the answer changes the route, first-pass scope, or
output shape.

| Missing | Ask |
| --- | --- |
| Keyword | `What keyword should I search Reddit for?` |
| Too broad | `Which one keyword matters most for the first pass?` |
| Recency intent | `Should results cover all time, or only the last year?` |

Do not ask the user for credentials, implementation choice, collection keys,
schema fields, hidden filters, or retry strategy.

## Run Discipline

1. Apply `references/shared-contract.md`.
2. Apply `references/search.md`.
3. Run the narrowest collection that can answer the first pass; start at 20
   posts.
4. Normalize output to
   `{ title, post_url, community, score, comments_count, created_at, snippet }`
   and deduplicate by post URL.
5. Stop after the first pass and report scope, count, strongest results,
   limits, and next action.

The result record shape for the collection key is documented in the
`postplus-shared` reference `dataset-item-schemas.md`; consult it before
writing result-processing code, and probe a single record only to verify.

Do not present a bounded first pass as the full Reddit catalog. Do not add
hosted envelopes, hidden implementation fields, unsupported filters, or
compatibility fallbacks to the request.

## Public Command Boundary

- Build the raw request object
  `{ "searchTerms": ["..."], "searchSort": "relevance", "searchTime": "year", "maxPostsCount": 20 }`
  (`searchSort` is `relevance`, `hot`, `top`, `new`, or `comments`;
  `searchTime` is `all`, `hour`, `day`, `week`, `month`, or `year`) and run the
  collect verb directly.
- Readiness diagnostics: `postplus doctor --skill reddit-search`.
- If the owned CLI command fails, report the exact error and stop. Do not
  bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback services, or unpublished tools.
- Use `postplus research schema --collection-key reddit-search --json` only
  when constructing or repairing an unknown request shape.
- Hosted collection:
  `postplus research collect reddit-search --request <input.json> --output <result.json>`
  where the request file is the raw collection input object, not a hosted
  envelope and not `{ "schemaVersion": 1, "input": ... }`.
- Resume a pending collection:
  `postplus research collect --run-handle <runHandle> --output <result.json>` (waits in-command up to 45s per invocation; rerun while pending).
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run
  `postplus quote confirm --json --challenge-file <challenge.json>` and retry
  with the returned token.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research collect reddit-search --request request.json --output result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->
