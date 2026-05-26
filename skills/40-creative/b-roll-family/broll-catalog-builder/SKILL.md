---
name: broll-catalog-builder
description: Build a semantic inventory of local B-roll assets for edit planning. Use this when the goal is not yet to decide the final cut, but to understand what B-roll exists, what each asset proves, which ranges are usable, and how the asset library should be packaged for downstream matching.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Broll Catalog Builder

## Use When
- Build a semantic inventory of local B-roll assets for edit planning. Use this when the goal is not yet to decide the final cut, but to understand what B-roll exists, what each asset proves, which ranges are usable, and how the asset library should be packaged for downstream matching.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Required Input
- Local dependencies: `ffprobe`.

## Fail Fast
- Missing required input, unsupported released key, missing local dependency, or unavailable hosted service must fail fast.
- Do not invent fallback execution paths or private provider calls.

## Handoff
- Return the structured output, hosted result, poll command, or explicit blocker.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill broll-catalog-builder`.
- Request schema: `postplus media schema --json`; add `--endpoint <endpoint-key>` for media-generation examples.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
