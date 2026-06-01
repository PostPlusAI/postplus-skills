---
name: editing-decision-engine
description: Plan short-form post-edit decisions from A-roll, B-roll, scripts, and reference videos. Use this when the goal is not generic video analysis or rendering, but deciding how to cut a social video beat by beat, including where to stay on face, where to insert proof B-roll, how to use reference patterns, and how to package an actionable edit plan for a human editor or downstream timeline tooling.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Editing Decision Engine

## Use When
- Plan short-form post-edit decisions from A-roll, B-roll, scripts, and reference videos. Use this when the goal is not generic video analysis or rendering, but deciding how to cut a social video beat by beat, including where to stay on face, where to insert proof B-roll, how to use reference patterns, and how to package an actionable edit plan for a human editor or downstream timeline tooling.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Required Input
- Explicit user brief or JSON input matching the artifact contract.

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
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus media schema --json` only when constructing or repairing an unknown request shape.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
