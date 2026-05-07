---
name: pattern-router
description: Route short-form video prompt work into the right hook or segment pattern before writing storyboards or provider requests. Use when the user has a brief, a segment type such as hook/benefit/cta/creator, duration constraints, and optional references, and you need to choose the strongest narrative structure instead of freehand prompting.
---

# Pattern Router

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill at the start of prompt design.

This skill is for:

- choosing the right segment pattern before writing prompts
- mapping a brief into a concrete opening mechanism
- reducing prompt drift when reference quality is uneven or absent
- making later storyboard and video-request work more consistent

This skill is not for writing the final storyboard or provider request.

When the segment is `hook`, this skill should route the segment and opening job, then hand off mechanism selection to `hook-design`.

## Core Rule

Do not begin from adjective stacks like "premium", "viral", or "cinematic".

Begin from:

1. segment type
2. viewer question
3. opening mechanism
4. product reveal timing

## Default Workflow

### 1. Identify the segment type

Classify the request as one of:

- `hook`
- `benefit`
- `cta`
- `creator`
- `lifestyle`
- `testimonial`

If the user gives a custom segment, map it to the nearest working type and state the mapping.

### 2. Pick the dominant pattern family

Read [`references/pattern-families.md`](references/pattern-families.md).

Select one primary family, then optionally one support family.

Do not mix many families unless the timing clearly supports it.

### 3. Lock the routing summary before writing prompts

Print a short routing block first:

```text
Segment type:
Primary pattern:
Support pattern:
Viewer question:
Opening mechanism:
Product reveal rule:
Need explicit hook mechanism:
Why this route fits:
```

This block is the handoff to `hook-design`, `reference-decode`, `storyboard-grid-writer`, or `video-request-architect`.

### 4. Choose the next skill

- If the segment is `hook` and the stop-scroll mechanism still needs to be chosen, hand off to `hook-design`
- If references exist and need decoding, hand off to `reference-decode`
- If the target is a storyboard grid or beat sheet, hand off to `storyboard-grid-writer`
- If the target is a provider-ready request, hand off to `video-request-architect`

## Routing Rules

- `hook`: optimize for stop-scroll and immediate legibility
- `benefit`: optimize for one visible proof mechanism
- `cta`: optimize for payoff plus next action, not a static end card
- `creator`: optimize for believable human delivery and social-native behavior
- `lifestyle`: optimize for desirability first, explanation second
- `testimonial`: optimize for proof plus human specificity

For `hook` segments:

- this skill decides segment route and opening job
- `hook-design` decides the dominant hook mechanism and downstream handoff
- do not let multiple downstream skills guess the hook mechanism independently

## Failure Mode

Stop and say the routing is under-specified if the brief does not provide enough to answer at least:

- what segment is being made
- what question the viewer should ask
- whether the product can appear in the opening
- whether references exist

Ask this when the missing piece is the segment type:

- "Is this segment a hook, benefit, or CTA?"

Do not let later skills guess the structure from vague taste words alone.
