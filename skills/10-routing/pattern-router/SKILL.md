---
name: pattern-router
description: Route short-form video prompt work into the right hook or segment pattern before writing storyboards or provider requests. Use when the user has a brief, a segment type such as hook/benefit/cta/creator, duration constraints, and optional references, and you need to choose the strongest narrative structure instead of freehand prompting.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Pattern Router

## Use When
- Start short-form prompt design before storyboard or provider request writing.
- A brief has segment type, duration, product reveal constraints, or references,
  but the narrative structure is not locked.
- You need one dominant pattern instead of freehand adjective prompting.

## Do Not Use When
- Do not write the final storyboard or provider request here.
- Do not let multiple downstream skills independently guess the hook mechanism.
- Do not begin from vague taste words such as "premium", "viral", or "cinematic".

## Core Rule
Begin from structure:

1. segment type
2. viewer question
3. opening mechanism
4. product reveal timing

## Default Workflow
1. Classify the segment as `hook`, `benefit`, `cta`, `creator`, `lifestyle`,
   `testimonial`, or the nearest working type.
2. Pick one primary pattern family and at most one support pattern. Do not mix
   many patterns unless the timing clearly supports it.
3. Create a JSON route artifact when it is useful.
4. Lock the routing summary before prompt writing: segment type, primary
   pattern, support pattern, viewer question, opening mechanism, product reveal
   rule, next skill, and why the route fits.
5. Choose the next skill from the route and user target.

## Routing Rules
- `hook`: optimize for stop-scroll and immediate legibility.
- `benefit`: optimize for one visible proof mechanism.
- `cta`: optimize for payoff plus next action, not a static end card.
- `creator`: optimize for believable human delivery and social-native behavior.
- `lifestyle`: optimize for desirability first and explanation second.
- `testimonial`: optimize for proof plus human specificity.

## Output Shape
The artifact contains `segmentType`, `primaryPattern`, `supportPattern`,
`openingMechanism`, `productRevealRule`, `viewerQuestion`, and `nextSkill`.

## Fail Fast
- Stop if the brief cannot answer what segment is being made, what the viewer
  should ask, whether product can appear early, or whether references exist.
- Ask one short question when the segment type is missing.

## Handoff
- `hook` with unresolved mechanism -> `visual-hook`.
- References needing decode -> `reference-decode`.
- Storyboard grid, beat sheet, or provider-ready request -> `video-request-architect`.
- Prompt already drafted -> `prompt-preflight-qa`.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill pattern-router`.
- This public skill is instruction-driven. Produce the artifact described by the workflow directly from the available evidence.
- Do not call private provider/runtime paths or unpublished local tools.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
