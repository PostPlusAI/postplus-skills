---
name: social-media-extractor
description: High-level entry point for cross-platform public social data extraction when the user has not named a platform-specific workflow yet.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Social Media Extractor

## Use When
- High-level entry point for cross-platform public social data extraction when the user has not named a platform-specific workflow yet.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Required Input
- Explicit user brief or JSON input matching the artifact contract.

## Fail Fast
- Missing required input, unsupported released key, missing local dependency, or unavailable hosted service must fail fast.
- Do not invent fallback execution paths or private provider calls.

## Handoff
- Return the structured output, hosted result, poll command, or explicit blocker.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill social-media-extractor`.
- This public skill is instruction-driven. Produce the artifact described by the workflow directly from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
