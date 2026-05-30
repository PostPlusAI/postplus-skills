---
name: reference-contract-builder
description: Build explicit learn/do-not-copy contracts for image and video generation references. Use this when a prompt uses benchmark videos, contact sheets, frames, or product images and you need to state exactly what the model should learn, what identity elements must change, and which references should be excluded from the first test.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Reference Contract Builder

## Use When
- A prompt uses benchmark videos, contact sheets, frames, product images,
  persona images, style boards, or audio references.
- The model needs explicit learn/do-not-copy boundaries before generation.
- Some references should bind identity while others should be inspiration-only
  or excluded from the first test.

## Do Not Use When
- Do not decode the hook or opening mechanism here; use `reference-decode`.
- Do not force every reference into "learn from".
- Do not treat identity references as loose style inspiration unless the user says so.

## Core Rule
Every reference set must answer:

1. Which references bind identity or consistency?
2. Which references are inspiration-only and must not be copied?
3. Which references are intentionally excluded for this test?

Default assumption: persona, product, and audio references are strong bindings
unless the user explicitly marks them loose, benchmark-only, or weak guidance.

## Default Workflow
1. Inventory the reference set: hook clip, hook-first contact sheet, style board,
   product image, persona image, audio reference, or other source.
2. Decide the test purpose: hook rhythm, camera realism, product proof, persona
   continuity, or another narrow target.
3. Classify each reference as `binding`, `inspiration-only`, or
   `excluded for now`.
4. Create a compact machine-readable contract when it is useful.
5. Print or return the contract before final prompt writing.

## Output Shape
The artifact contains `testPurpose`, `mayLearn`, `mustNotCopy`, and
`excludedReferences`. Add user-specific binding notes around that output when
the prompt has real product, persona, or audio references.

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Handoff
- Hand `contract.json` to `video-request-architect` or the prompt writer.
- If the reference's hook logic is still unclear, hand to `reference-decode` first.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- This public skill is instruction-driven. Produce the artifact described by the workflow directly from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
