---
name: instagram-audience-voice
description: Mine Instagram comments to extract audience language, pain points, objections, FAQs, and purchase-intent signals from shortlisted posts or Reels.
metadata:
  postplus:
    familyId: instagram
    familyName: Instagram
---

# Instagram Audience Voice

Use this skill to mine Instagram comments for audience language, pain points,
objections, FAQs, purchase intent, and reusable copy phrases.

Apply shared rulebook and user-guidance rules from `postplus-shared`.

## Entry Requirement

Do not start from a huge blind post set. Prefer one of these first:

- a benchmark shortlist from `instagram-content-benchmark`,
- manually provided post or Reel URLs,
- a small set of competitor top posts.

## Collection Key Routing

Route to the matching hosted collection key by task shape: comments for a
bounded set of shortlisted posts or Reels.

Discover the exact released collection keys and request shapes with
`postplus research schema --json`. Use hosted collection outputs and the
workflow below.

## Default Workflow

1. Confirm the post or Reel shortlist.
2. Collect comments with `instagram-comments`.
3. Normalize comments.
4. Cluster comments by theme and intent.
5. Separate high-signal language from low-signal reactions.
6. Summarize actionable audience voice.

Keep raw comments and clustering caches under `.postplus/`; return reusable
copy notes or summaries where the user can inspect them.

## Suggested Buckets

- praise
- objection
- question
- purchase-intent
- request-for-details
- low-signal / meme

## Good Output

Return top comment themes, repeated questions, objections, skepticism, purchase
or trial intent signals, exact phrases worth reusing in copy, and comments that
suggest unmet needs.

## Failure Modes

- Stop if no shortlist or post URLs are available.
- Stop on unsupported keys, missing auth, unavailable hosted service, or stable
  network failure.
- Do not infer full audience truth from comments without naming that comments
  are a public proxy.

## Handoff

Turn audience language into hooks, offers, captions, or creative briefs through
the relevant campaign, copy, or creative workflow.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill instagram-audience-voice`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus research schema --collection-key <collectionKey> --json` only when constructing or repairing an unknown request shape.
- Hosted collection runs through the shared `research collect` verb (owned by instagram-tools), attributing the run to this skill: `postplus research collect <collectionKey> --skill instagram-audience-voice --request <input.json> --output <result.json>` (input = the collection parameters).
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
