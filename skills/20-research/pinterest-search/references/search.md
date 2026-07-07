# Keyword Search Workflow

Use this reference for keyword-to-image requests such as "find Pinterest images
for X" or "build a moodboard source list for X".

## First pass

1. Pick one keyword. If the user gave a phrase, keep it as a single `query`.
2. Set `filter` to `all` for image-address lists, or `videos` only when the user
   explicitly wants motion pins.
3. Keep `limit` at the minimum of 20 for the first pass.
4. Run the request from `references/shared-contract.md`.
5. Normalize and deduplicate the results, then report scope and count.

## When to expand

Only after inspecting the first pass, and only when the user needs more:

- More coverage for the same idea: raise `limit` in a second, still-bounded
  pass.
- A different angle: run a separate request with a new `query`; do not merge
  unrelated keywords into one request.
- Motion versus still comparison: run one `all` pass and one `videos` pass, and
  keep the two result sets separate.

Never expand blindly. Each pass stays bounded, and each result set is reported
with its own scope and count.

## Out of scope

Board scrapes, profile scrapes, pin-URL scrapes, engagement metrics, and
shopping or product fields are not part of the current public surface. If the
user needs them, say so and stop rather than substituting a different source.
