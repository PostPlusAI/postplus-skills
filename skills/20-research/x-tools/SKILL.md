---
name: x-tools
description: Local execution tools for X/Twitter hosted collection workflows, including actor runs, dataset normalization, tweet ranking, account ranking, audience graph construction, and language clustering.
metadata:
  postplus:
    familyId: x
    familyName: X / Twitter
---

# X Tools

## Use When
- Local execution tools for X/Twitter hosted collection workflows, including actor runs, dataset normalization, tweet ranking, account ranking, audience graph construction, and language clustering.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Required Input
- Hosted envelope with `schemaVersion: 1` and task payload under `input` when a hosted collection is used.
- Released collection keys: `x-posts`, `x-profiles`.
- Hosted capabilities: `hosted-collection`.

## Fail Fast
- Missing required input, unsupported released key, missing local dependency, or unavailable hosted service must fail fast.
- Do not invent fallback execution paths or private provider calls.

## Handoff
- Return the script output, hosted result, poll command, or explicit blocker.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill x-tools`.
- Hosted collection: `postplus research collect --skill x-tools --collection-key x-posts --input <hosted-envelope.json> --output <collection-result.json>`.
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <collection-result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
