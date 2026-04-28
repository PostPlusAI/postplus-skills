---
name: persona-pack
description: Build fact-grounded short-form video personas and visual consistency packs from validated benchmark research. Use this when you need to define a repeatable creator archetype, image prompt pack, or persona lock for batch video production. This skill must derive personas from real benchmark evidence such as creator types, protagonist descriptions, visual styles, hooks, and audience language. Do not invent personas or visual traits without source support.
---

# Persona Pack

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

Use this skill when a production workflow needs:

- a creator persona recommendation
- persona comparison options
- a locked visual identity for repeated content
- image prompt packs for batch generation

This skill is not for unconstrained character design.

## Fact Rule

Personas must be built from observed benchmark evidence.

Use source-backed fields such as:

- `videoCreatorType`
- `videoProtagonist`
- `videoVisualStyle`
- `videoHook`
- lane distribution
- strong benchmark subsets
- final report conclusions

Do not fabricate:

- demographic precision not present in sources
- audience fit claims without behavioral evidence
- visual traits chosen only because they "look good"

If a detail is inferred rather than directly observed, label it as inference.

## Default Workflow

### 1. Start from strong benchmark subsets

Do not define a persona from the full pool alone if strong benchmark subsets exist.

Prefer:

1. strong benchmark talking-head videos
2. lane-specific strong samples
3. pattern table summaries
4. final report conclusions

## Source Selection Rule

Start from the active project's strongest benchmark artifacts.

If the task clearly belongs to one project or client folder, read from that folder first.

Do not assume one client folder is the default source base for all persona work.


Use the master table and shortlist to extract:

- recurring creator types
- protagonist descriptors
- visual-style descriptors
- strong benchmark handles and URLs

Do not let image-model aesthetics override benchmark-supported appearance patterns.

### 2. Extract persona evidence

Before proposing any persona, collect:

- common creator roles
- common age feel or life-stage feel if directly implied
- recurring wardrobe patterns
- recurring environment patterns
- recurring camera patterns
- recurring speaking style
- recurring authority style

Write these as evidence notes first.

### 3. Recommend the narrowest viable persona

The first persona should maximize:

- fit with strongest lanes
- repeatability across 10+ videos
- visual consistency
- credibility for the product

Avoid personas that are:

- too broad
- too aspirational
- too polished and ad-like
- unsupported by evidence

### 4. Produce a persona lock

Every chosen persona should be converted into a stable pack with:

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

This becomes the upstream source for image generation.

### 5. Separate direct observation from generation guidance

Use two blocks:

- `Observed from benchmarks`
- `Prompt translation`

That prevents prompt language from being mistaken as factual research.

## Output Shapes

Common outputs:

- persona recommendation memo
- 3-way persona comparison
- final chosen persona lock
- image prompt pack
- negative prompt pack

### Persona Recommendation Memo

Include:

- recommended first persona
- rejected alternatives
- evidence basis
- why this persona best fits the first 10 videos

### Persona Lock

Should include:

- identity summary
- repeated visual rules
- what must stay fixed
- what can vary
- what to avoid

## Negative Constraints

Always define what not to generate.

Common examples:

- too much studio polish
- luxury lifestyle look
- founder keynote energy
- generic influencer glam
- overproduced ad lighting

Negative constraints are important because many image models drift toward polished ad aesthetics.



## Source Basis Requirement

Every persona recommendation must cite concrete support, such as:

- strong talking-head lane distribution
- creator-type counts
- representative benchmark ids
- visual-style descriptions
- report conclusions

If the user asks for a persona that is not supported, state that clearly and provide:

- closest evidence-backed version
- what would need to be researched to support the requested persona
