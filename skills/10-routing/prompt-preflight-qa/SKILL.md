---
name: prompt-preflight-qa
description: Review storyboard prompts and video-request prompts before generation. Use this when a prompt draft already exists and you need to catch weak first frames, drift risk, missing constraints, bad product timing, or generic ad-like language before spending model credits.
---

# Prompt Preflight QA

Follow shared release-shell rules in:

- `postplus-shared` release-shell rules

Use this skill immediately before image or video generation.

This skill is for:

- checking whether a prompt draft is structurally strong enough to run
- finding missing constraints before credits are spent
- pointing drift risk back to the right upstream stage
- producing concise rerun notes

This skill is not for human creative approval after outputs exist.

## Core Rule

Judge prompt quality by controllability, not by how impressive the prose sounds.

## Method

Read [`references/checklist.md`](references/checklist.md).

## Default Workflow

### 1. Classify the prompt object

Choose one:

- storyboard grid prompt
- full video request
- no-reference draft
- reference-led replication draft

### 2. Run checklist review

Check:

- opening strength
- chosen hook mechanism is legible in the first 3 seconds
- viewer question clarity
- visible evidence
- promise-delivery match by the next few beats
- product timing
- ad-detection risk from premature product exposure
- negative constraints
- reference contract
- explicit reference bindings when references are used
- realism and UGC control
- output-format correctness
- segment plan correctness when the target Seedance request exceeds 15 seconds

### 3. Print a preflight report

Use this shape:

```text
Verdict:
Major risks:
- ...
Missing fields:
- ...
Likely drift:
- ...
Fix now:
- ...
Can run now:
```

## Blame Rule

When a prompt is weak, point the problem to the right stage:

- bad routing -> `pattern-router`
- missing or misfit hook mechanism -> `hook-design`
- weak hook decode -> `reference-decode`
- weak panel logic -> `storyboard-grid-writer`
- bad request mapping -> `video-request-architect`
- bad learn/do-not-copy rules -> `reference-contract-builder`

## Failure Mode

If the prompt could still run but is risky, do not silently pass it.
Mark it as risky and say what is most likely to fail first.

If a Seedance request exceeds 15 seconds and no segment plan exists, mark it `not_ready`.
