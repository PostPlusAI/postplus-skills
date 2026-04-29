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
- separating provider-agnostic prompt architecture from provider fields
- making short test iterations easy to diagnose
- preserving reference boundaries and negative constraints

This skill is not for choosing the segment pattern from scratch.

## Core Rule

Prompt architecture comes before provider syntax.

First write the request as a director's brief.
Then map it into model-specific fields.

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

## Failure Mode

Stop and say the request is under-specified if:

- the hook logic is unclear
- the reference policy is unclear
- timecoded actions are missing
- product policy is not explicit

Do not let the provider request silently invent the strategy.
