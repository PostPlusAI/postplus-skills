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

## Script To Skill Map
- `instagram-account-research`, `instagram-audience-voice`, and
  `instagram-campaign-scout` use collection and normalization support.
- `instagram-content-benchmark` uses post ranking and benchmark support.
- `instagram-creator-discovery` uses creator extraction and ranking support.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Handoff
- Return structured output to the calling Instagram skill.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill instagram-tools`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus research schema --collection-key instagram-comments --json` only when constructing or repairing an unknown request shape.
- Hosted collection: `postplus research collect --skill instagram-tools --collection-key instagram-comments --input <hosted-envelope.json> --output <collection-result.json>`.
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <collection-result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
