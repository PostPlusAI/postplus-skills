---
name: persona-pack
description: Build fact-grounded short-form video personas and visual consistency packs from validated benchmark research. Use this when you need to define a repeatable creator archetype, image prompt pack, or persona lock for batch video production. This skill must derive personas from real benchmark evidence such as creator types, protagonist descriptions, visual styles, hooks, and audience language. Do not invent personas or visual traits without source support.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Persona Pack

## Use When
- Build fact-grounded short-form video personas, creator archetypes, visual identity locks, and image prompt packs from validated benchmark evidence.
- Use when production needs a repeatable persona system for 10+ videos, not a one-off character idea.

## Do Not Use When
- The user wants unconstrained character design or aesthetic exploration without evidence.
- The user needs campaign concept strategy; use `benchmark-to-brief`.
- The user needs script variants; use `script-generator`.

## Required Input
- Benchmark-supported persona evidence such as creator type, protagonist descriptions, visual style, hook patterns, lane distribution, strong sample subsets, or report conclusions.
- For the local script, one persona object or `personas` array with `name`, `keyPain`, `proofNeed`, and non-empty `sourceBasis`.

## Fact Rule
Personas must be built from observed benchmark evidence. Do not fabricate demographic precision, audience fit claims, or visual traits chosen only because they look good.

Separate:
- `Observed from benchmarks`
- `Inference`
- `Prompt translation`

This prevents generation guidance from being mistaken for research fact.

## Default Workflow
1. Start from the strongest benchmark subsets, not the full pool alone.
2. Extract persona evidence: creator roles, life-stage feel when directly implied, wardrobe, environment, camera pattern, speaking style, and authority style.
3. Recommend the narrowest viable persona that fits strongest lanes, repeats across many videos, stays visually consistent, and is credible for the product.
4. Reject personas that are too broad, too aspirational, too polished, too ad-like, or unsupported.
5. Convert the chosen persona into a stable persona lock.
6. Define negative constraints so generation does not drift into generic ad polish.

## Persona Judgment
Before recommending a persona, answer:
- Which strong benchmarks support this archetype?
- Which lane does it serve first?
- What proof need does this persona make believable?
- Which details are observed and which are inferred?
- What must stay fixed across a batch?
- What can vary without breaking continuity?
- What visual or behavioral drift must be avoided?

## Fail Fast
- Stop if `sourceBasis` cannot be supplied.
- Stop if the requested persona is not supported by benchmark evidence.
- Return the closest evidence-backed persona and what research would be needed to support the requested one.

## Output Shape
Common outputs:
- persona recommendation memo
- 3-way persona comparison
- final chosen persona lock
- image prompt pack
- negative prompt pack

Persona recommendation memo:
- `recommendedFirstPersona`
- `rejectedAlternatives`
- `evidenceBasis`
- `whyThisFitsFirstTenVideos`

Persona lock:
- `personaId`
- `archetype`
- `sourceBasis`
- `appearanceSystem`
- `outfitSystem`
- `environmentSystem`
- `cameraSystem`
- `voiceStyle`
- `behavioralConstraints`
- `negativeConstraints`

Prompt pack:
- `identityPrompt`
- `environmentPrompt`
- `cameraPrompt`
- `variationRules`
- `negativePrompt`

## Anti-Patterns
- demographic precision not present in evidence
- luxury, studio, or influencer-glam drift when benchmarks are native
- persona based on model aesthetics rather than performance evidence
- over-broad archetypes that cannot guide image generation
- no negative constraints

## Handoff
- Return the script output or an explicit evidence blocker. Persona locks can feed image generation, `script-generator`, `visual-hook`, or batch production planning.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill persona-pack`.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
