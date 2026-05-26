---
name: broll-match-engine
description: Match spoken edit beats to candidate B-roll assets using a normalized transcript, subtitle chunking, optional A-roll analysis, and a reusable B-roll catalog. Use this when the goal is to decide what B-roll should support each beat, not just to list assets or describe the video.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Broll Match Engine

## Use When
- Match spoken edit beats to candidate B-roll assets using a normalized transcript, subtitle chunking, optional A-roll analysis, and a reusable B-roll catalog. Use this when the goal is to decide what B-roll should support each beat, not just to list assets or describe the video.

## Do Not Use When
- The task belongs to ideation, QA, or another released skill listed in the handoff section.
- Required inputs are missing and guessing would change the result.

## Required Input
- Explicit user brief or JSON input matching the script contract.

## Fail Fast
- Missing required input, unsupported released key, missing local dependency, or unavailable hosted service must fail fast.
- Do not invent fallback execution paths or private provider calls.

## Handoff
- Return the script output, hosted result, poll command, or explicit blocker.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill broll-match-engine`.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
