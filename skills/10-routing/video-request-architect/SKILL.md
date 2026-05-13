---
name: video-request-architect
description: Turn approved storyboard logic, beat sheets, or prompt plans into provider-ready short-form video requests. Use this when the segment structure is already known and you need a model-agnostic request architecture that can later map cleanly into Seedance or other video generators.
metadata:
  postplus:
    familyId: routing-contracts
    familyName: Routing & Contracts
---

# Video Request Architect

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill after the scene logic already exists.

This skill is for:

- converting storyboard logic into full-video requests
- generating a machine-checkable Seedance segment contract before provider
  mapping
- separating provider-agnostic prompt architecture from provider fields
- making short test iterations easy to diagnose
- preserving reference boundaries without letting the request collapse into
  mechanical constraint-writing

This skill is not for choosing the segment pattern from scratch.

## Core Rule

Prompt architecture comes before provider syntax.

First think like a director, not like a checklist compiler.
Write what the viewer sees happening, in time order, with clear visible payoff.
Then map it into model-specific fields.

Every provider-ready request must be self-contained.

Do not write final prompts as if the model remembers a previous segment, a
prior request, or an earlier contract block that is not repeated in the same
request.

## Method

Read [`references/request-architecture.md`](references/request-architecture.md).

If the task needs an explicit learn/do-not-copy block for references, also use `reference-contract-builder`.

## Writing Posture

The default goal is not to cover every field with defensive language.

The default goal is to help the model imagine one believable short video:

- what the viewer sees first
- what changes on screen
- what the person is physically doing
- what visual moment proves the claim
- how the scene lands by the end

When writing a segment prompt, describe the clip as something unfolding on
camera, not as a list of abstract requirements.

Prefer:

- visible actions over category labels
- timeline-based shot logic over feature-summary prose
- concrete environmental detail over generic style adjectives
- one clear payoff beat over repeated explanation

Use constraints with restraint. Add them when they protect the core outcome, not
as default filler.

## Default Workflow

### 1. Lock the experiment goal

State what is being tested:

- hook replication
- camera realism
- persona continuity
- benefit proof
- CTA readability

Do not write the request as if every generation is a full ad.

### 2. Build the scene before the fields

Before writing structured fields, answer these creative questions:

1. What happens in this clip?
2. What does the viewer see first, next, and last?
3. Which visible action carries each spoken line?
4. What exact shot or moment delivers the payoff?
5. Which details make the world feel real instead of generic?
6. Which reference truly controls identity, product, or continuity?

If the answer still sounds like a product explanation instead of a clip, keep
rewriting until it reads like a camera-ready scene.

### 2.2. Write the provider-agnostic blocks

Once the scene is clear, map it into these blocks:

1. role
2. goal and hook logic
3. reference contract
4. output spec
5. look and tone
6. timecoded beat sheet
7. camera
8. sound intent
9. product policy

These blocks exist to preserve structure after the scene logic is already clear.
Do not let them replace the scene logic.

### 2.5. Plan segments before provider mapping

If the approved script is longer than one model-supported generation window, do not force everything into one request.

For Seedance 2.0 work, any script longer than 15 seconds must be converted into a multi-segment plan before provider mapping.
Use the PostPlus-provided builder to make that boundary explicit:

```bash
node skills/10-routing/video-request-architect/scripts/build_video_request_architecture.mjs \
  --input <brief.json> \
  --output <request-architecture.json>
```

For scripts above 15 seconds, `<brief.json>` must include a timecoded
`beatSheet` with `startSeconds` and `endSeconds` for every beat. The builder
fast-fails if the beat sheet is missing, unordered, overlapping, or contains a
single beat above the 15 second Seedance window. It does not invent timing from
plain prose.

Tell the user:

- "The script is longer than 15 seconds, so I will first split it into independently generatable short segments, then write provider-ready requests for each one. This is more stable than forcing the whole script into one generation."

Each segment must:

- stay within 15 seconds
- work as a standalone usable asset
- preserve stitchable continuity with adjacent segments at the business level
- include only its own beat, dialogue, and action scope
- restate any needed continuity targets inside the segment request itself
- repeat the full binding lines for each persona, product, and audio reference
  used in that segment
- avoid phrases such as `continue from the prior segment` in the final
  provider-ready request
- avoid shorthand such as `same as previous`, `same character`, or `same
  contract above`

Within those boundaries, write each segment as its own small clip with its own
visual beginning, readable middle, and usable end.

The generated `segmentContract` is the handoff truth for final request mapping.
Print this block for every segment before writing the final request set:

```text
Segment id:
Target duration:
Segment role:
Standalone payoff:
Continuity targets to restate inside this request:
Bridge target for editing:
Dialogue scope:
Action scope:
References used:
```

### 3. Print the request skeleton before the final request

```text
Test goal:
Segment type:
Hook logic:
Viewer question:
Reference policy:
Duration:
Camera grammar:
Product policy:
Main risks:
```

This is a required checkpoint for debugging.

### 4. Map to provider

Only after the architecture is approved should you map to:

- model name
- duration field
- aspect ratio field
- reference media fields
- optional resolution and quality fields

## Minimal-Variable Rule

For first-pass testing, prefer the smallest sufficient variable set.

Examples:

- short duration before full ad length
- one reference type before many mixed references
- no product images when testing hook rhythm only

Add more constraints only after you know what the first run missed.

If a draft starts feeling rigid, over-explained, or overly defensive, remove
language before adding more.

## Reference Binding Rule

When reference images or reference videos are used, bind each reference explicitly before provider mapping.

Agent shorthand such as `@storyboard`, `@product-front`, or `@ref-video-1` is acceptable during planning, but the final request must convert that shorthand into explicit bindings.

Do not say only `use the attached references`.

State what each reference controls, such as:

- character or product identity
- product shape, material, or packaging details
- shot order
- camera motion
- continuity targets that must be restated in the same request

For Seedance final requests, prefer explicit bindings such as `[image 1]`, `[image 2]`, and `[video 1]` plus role descriptions.

Unless the user explicitly says a reference is inspiration-only, benchmark-only,
or weak guidance, treat user-provided persona, product, and audio references as
identity-binding references that should stay consistent in the generated result.

Once a reference is clearly bound, do not keep restating the same continuity
claim in multiple styles unless the extra wording changes output.

## Gentle Improvement Prompts

When the script is directionally right but weak in execution, improve it by
surfacing one or two high-value creative observations such as:

- a spoken line has no visible action supporting it
- the payoff arrives too late or too vaguely
- too many beats are packed into one short segment
- the mechanism is being repeated inside a payoff segment
- the environment still feels generic rather than lived-in

Phrase these as creative guidance, not as hard compliance failures, unless the
request is truly under-specified.

## Failure Mode

Stop and say the request is under-specified if:

- the hook logic is unclear
- the reference policy is unclear
- timecoded actions are missing
- product policy is not explicit
- a Seedance script exceeds 15 seconds but no segment plan exists

Do not let the provider request silently invent the strategy.
