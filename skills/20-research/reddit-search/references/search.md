# Keyword Search Workflow

Use this reference for keyword-to-post requests such as "what does Reddit say
about X", "find pain points around X", or "collect Reddit threads about X".

## First pass

1. Pick one keyword. If the user gave a phrase, keep it as a single
   `searchTerms` entry.
2. Set `searchSort` to `relevance` for research questions, or `top` when the
   user wants the most upvoted threads.
3. Set `searchTime` to `year` unless the user explicitly wants all-time or a
   tighter window.
4. Keep `maxPostsCount` at 20 for the first pass.
5. Run the request from `references/shared-contract.md`.
6. Normalize and deduplicate the results, then report scope and count.

## When to expand

Only after inspecting the first pass, and only when the user needs more:

- More coverage for the same idea: raise `maxPostsCount` in a second,
  still-bounded pass.
- A different angle: run a separate request with a new keyword; do not merge
  unrelated keywords into one request.
- Fresh-versus-canonical comparison: run one `year` pass and one `all` pass,
  and keep the two result sets separate.

Never expand blindly. Each pass stays bounded, and each result set is reported
with its own scope and count.

## Out of scope

Comment scrapes, subreddit feed scrapes, profile scrapes, post-URL scrapes,
and media downloads are not part of the current public surface. If the user
needs them, say so and stop rather than substituting a different source.
