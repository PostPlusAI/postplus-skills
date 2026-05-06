---
name: video-request-architect
description: Turn approved storyboard logic, beat sheets, or prompt plans into provider-ready short-form video requests. Use this when the segment structure is already known and you need a model-agnostic request architecture that can later map cleanly into Seedance or other video generators.
---

# Video Request Architect

Follow shared release-shell rules in:

- `postplus-shared` release-shell rules

Use this skill after the scene logic already exists.

This skill is for:

- converting storyboard logic into full-video requests
- generating a machine-checkable Seedance segment contract before provider
  mapping
- separating provider-agnostic prompt architecture from provider fields
- making short test iterations easy to diagnose
- preserving reference boundaries and negative constraints

This skill is not for choosing the segment pattern from scratch.

## Core Rule

Prompt architecture comes before provider syntax.

First write the request as a director's brief.
Then map it into model-specific fields.

Every provider-ready request must be self-contained.

Do not write final prompts as if the model remembers a previous segment, a
prior request, or an earlier contract block that is not repeated in the same
request.

## Method

Read [`references/request-architecture.md`](references/request-architecture.md).

If the task needs an explicit learn/do-not-copy block for references, also use `reference-contract-builder`.

## Default Workflow

### 1. Lock the experiment goal

State what is being tested:

- hook replication
- camera realism
- persona continuity
- benefit proof
- CTA readability

Do not write the request as if every generation is a full ad.

### 2. Write the provider-agnostic blocks

Use these blocks in order:

1. role
2. goal and hook logic
3. reference contract
4. output spec
5. look and tone
6. timecoded beat sheet
7. camera
8. sound intent
9. product policy

### 2.5. Plan segments before provider mapping

If the approved script is longer than one model-supported generation window, do not force everything into one request.

For Seedance 2.0 work, any script longer than 15 seconds must be converted into a multi-segment plan before provider mapping.
Use the repo-owned builder to make that boundary explicit:

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

- "脚本超过 15 秒了，我会先自动切成可独立生成的短 segment，再分别写 provider-ready request，这样比把整段塞进一次生成更稳定。"

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

For Seedance final requests, prefer explicit bindings such as `[图1]`, `[图2]`, and `[视频1]` plus role descriptions.

Unless the user explicitly says a reference is inspiration-only, benchmark-only,
or weak guidance, treat user-provided persona, product, and audio references as
identity-binding references that should stay consistent in the generated result.

## Failure Mode

Stop and say the request is under-specified if:

- the hook logic is unclear
- the reference policy is unclear
- timecoded actions are missing
- product policy is not explicit
- a Seedance script exceeds 15 seconds but no segment plan exists

Do not let the provider request silently invent the strategy.
