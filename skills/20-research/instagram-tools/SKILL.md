---
name: instagram-tools
description: Hosted collection support guidance for Instagram workflows, including dataset normalization, ranking, comment clustering, and watchlist construction.
metadata:
  postplus:
    familyId: instagram
    familyName: Instagram
---

# Instagram Tools

## Use When
- Support skill for Instagram collection, normalization, extraction, and ranking guidance.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Required Input
- Hosted envelope or local normalized Instagram dataset depending on workflow.

## Fail Fast
- Do not call provider/private routes directly.

## Handoff
- Return structured output to the calling Instagram skill.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill instagram-tools`.
- Input schema: `postplus research schema --collection-key instagram-comments --json`.
- Hosted collection: `postplus research collect --skill instagram-tools --collection-key instagram-comments --input <hosted-envelope.json> --output <collection-result.json>`.
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <collection-result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
