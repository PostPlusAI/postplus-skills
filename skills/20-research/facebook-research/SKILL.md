---
name: facebook-research
description: Research public Facebook page, group, and post content using PostPlus Cloud collection service. Use this when the user wants Facebook public post research, public content metrics, or source-grounded summaries.
metadata:
  postplus:
    familyId: platform-research
    familyName: LinkedIn, Facebook, and YouTube
---

# Facebook Research

Use this skill for public Facebook page, group, or post research through the
PostPlus hosted public-content collection surface.

Apply shared rulebook and user-guidance rules from `postplus-shared`.

## Before Collection Boundary

Confirm the task can be answered from public Facebook page, group, or post content.
If the goal requires follower, following, private audience, login-only,
or exhaustive audience data, stop and ask for a different source of truth.

## Collection Route

Default public Facebook targets:

- public page/profile URL -> recent public posts,
- public group URL -> recent public posts,
- direct public post URL -> one post,
- broad query -> small discovered public post set, then public content
  collection.

Use the installed entrypoints:

The entrypoint maps public Facebook URLs onto released source keys:

- `facebook-profile-posts`
- `facebook-group-posts`
- `facebook-post-by-url`

## Default Workflow

1. Confirm Facebook public source scope.
2. Compile a small page, group, post, or discovery brief.
4. If the result is pending, preserve the emitted `collection-report.json`.
   until `pending` is `0`.
6. Normalize or summarize public post facts without treating them as private
   audience exports.

While collection is pending, tell the user the public collection is running
from a saved checkpoint and continue independent brief or source-review work.

## Output

Return source-grounded summaries, public post metrics when present, stable URLs
or ids, and clear notes about what the public collection cannot prove.

## Failure Modes

- Stop if the request includes non-Facebook platforms.
- Stop if no Facebook public URL or query can be used.
- Stop on hosted capability, auth, DNS, proxy, network, or malformed-output
  hard errors.
- Do not request private user data, login-only surfaces, or hidden audience
  exports.

## Handoff

Facebook summaries can feed `benchmark-to-brief`, campaign research, or broader
cross-platform synthesis. Publishing belongs in `social-media-publisher`.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill facebook-research`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus research schema --json` only when constructing or repairing an unknown request shape.
- Public content collection: `postplus research capability --request <hosted-capability-request.json> --output <collection-result.json>`.
- Use `public-content-collection` with `sourceKey` `facebook-profile-posts`, `facebook-group-posts`, or `facebook-post-by-url`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
