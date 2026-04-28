---
name: prompt-preflight-qa
description: Review storyboard prompts and video-request prompts before generation. Use this when a prompt draft already exists and you need to catch weak first frames, drift risk, missing constraints, bad product timing, or generic ad-like language before spending model credits.
---

# Prompt Preflight QA

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

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
- viewer question clarity
- visible evidence
- product timing
- negative constraints
- reference contract
- realism and UGC control
- output-format correctness

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
- weak hook decode -> `reference-decode`
- weak panel logic -> `storyboard-grid-writer`
- bad request mapping -> `video-request-architect`
- bad learn/do-not-copy rules -> `reference-contract-builder`

## Failure Mode

If the prompt could still run but is risky, do not silently pass it.
Mark it as risky and say what is most likely to fail first.
