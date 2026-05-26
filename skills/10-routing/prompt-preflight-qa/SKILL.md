---
name: prompt-preflight-qa
description: Review storyboard prompts and video-request prompts before generation. Use this when a prompt draft already exists and you need to catch weak first frames, drift risk, missing constraints, bad product timing, or generic ad-like language before spending model credits.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Prompt Preflight QA

## Use When
- A storyboard prompt or full video request already exists.
- You need to catch weak first frames, missing constraints, drift risk, bad
  product timing, or generic ad-like language before spending credits.
- The output should be a concise readiness report, not creative approval.

## Do Not Use When
- Do not use this after generation to judge finished creative quality.
- Do not rewrite the whole prompt unless the user asks; identify blockers and
  hand off to the right upstream skill.

## Core Rule
Judge prompt quality by controllability, not by impressive prose.

## Default Workflow
1. Classify the prompt object: storyboard grid prompt, full video request,
   no-reference draft, or reference-led replication draft.
2. Check opening strength, first-three-second hook legibility, viewer question,
   visible evidence, promise delivery, product timing, negative constraints,
   reference contract, explicit reference bindings, UGC realism, output format,
   and long-video segment plan.
3. Create a machine-readable preflight report when it is useful.
4. Return a concise verdict with risks, missing fields, likely drift, fixes, and
   whether the prompt can run now.

## Blame Rule
Point the weakness to the correct upstream stage:

- bad route -> `pattern-router`
- missing or misfit hook mechanism -> `visual-hook`
- weak hook decode -> `reference-decode`
- weak panel, beat, or request logic -> `video-request-architect`
- unclear learn/do-not-copy boundaries -> `reference-contract-builder`

## Output Shape
The artifact contains `verdict`, `canRunNow`, `missingFields`, `majorRisks`,
`likelyDrift`, and `fixNow`.

## Fail Fast
- If a prompt is runnable but risky, mark it `risky` instead of passing it.
- If a Seedance request exceeds 15 seconds without a segment plan, mark it not
  ready and send it back to `video-request-architect`.

## Handoff
- Return `report.json` or the stdout JSON plus the smallest upstream fix.
- After fixes, rerun this preflight before generation.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill prompt-preflight-qa`.
- This public skill is instruction-driven. Produce the artifact described by the workflow directly from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
