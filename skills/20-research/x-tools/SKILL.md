---
name: x-tools
description: Hosted collection support guidance for X/Twitter workflows, including dataset normalization, tweet ranking, account ranking, audience graph construction, and language clustering.
metadata:
  postplus:
    familyId: x
    familyName: X / Twitter
---

# X Tools

## Use When
- Hosted collection support guidance for X/Twitter workflows, including dataset normalization, tweet ranking, account ranking, audience graph construction, and language clustering.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Required Input
- Hosted envelope with `schemaVersion: 1` and task payload under `input` when a hosted collection is used.
- Released collection keys: `x-posts`, `x-profiles`.
- Hosted capabilities: `hosted-collection`.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Handoff
- Return the structured output, hosted result, poll command, or explicit blocker.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill x-tools`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus research schema --collection-key x-posts --json` only when constructing or repairing an unknown request shape.
- Hosted collection: `postplus research collect --skill x-tools --collection-key x-posts --input <hosted-envelope.json> --output <collection-result.json>`.
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <collection-result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
