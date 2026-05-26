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

Released hosted collection key:

- `instagram-comments`: comments for a bounded set of shortlisted posts or
  Reels.

Use hosted collection outputs and the workflow below.

The hosted input must be a `schemaVersion: 1` execution envelope whose `input`
field contains the bounded comment collection request.

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

- Check readiness first: `postplus doctor --skill instagram-audience-voice`.
- Input schema: `postplus research schema --json`.
- Hosted collection: `postplus research collect --skill instagram-audience-voice --collection-key instagram-comments --input <hosted-envelope.json> --output <collection-result.json>`.
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <collection-result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
