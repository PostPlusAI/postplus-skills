---
name: edit-enhancement-packager
description: Package beat-level edit enhancement instructions from a B-roll plan, subtitle chunks, and optional style context. Use this when the goal is to turn B-roll matching into editor-ready guidance for keyword emphasis, micro-animation hints, A-roll stay-on-face logic, B-roll coverage style, and subtitle interaction.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Edit Enhancement Packager

## Use When
- Package beat-level edit enhancement instructions from a B-roll plan, subtitle chunks, and optional style context. Use this when the goal is to turn B-roll matching into editor-ready guidance for keyword emphasis, micro-animation hints, A-roll stay-on-face logic, B-roll coverage style, and subtitle interaction.

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

- Check readiness first: `postplus doctor --skill edit-enhancement-packager`.
- Request schema: `postplus media schema --json`; add `--endpoint <endpoint-key>` for media-generation examples.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
