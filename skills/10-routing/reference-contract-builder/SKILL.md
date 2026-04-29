---
name: reference-contract-builder
description: Build explicit learn/do-not-copy contracts for image and video generation references. Use this when a prompt uses benchmark videos, contact sheets, frames, or product images and you need to state exactly what the model should learn, what identity elements must change, and which references should be excluded from the first test.
---

# Reference Contract Builder

Follow shared release-shell rules in:

- `postplus-shared` release-shell rules

Use this skill when references exist and the boundary between inspiration and copying must be explicit.

This skill is for:

- writing clean reference policies
- preventing identity copying
- deciding which references to exclude from early tests
- making later failure analysis easier

This skill is not for decoding the hook itself.

## Core Rule

Every reference set should answer three questions:

1. what may the model learn?
2. what must not be copied?
3. what references are intentionally not being used yet?

## Method

Read [`references/contract-template.md`](references/contract-template.md).

## Default Workflow

### 1. Inventory the reference set

Classify each input as:

- hook clip
- hook-first contact sheet
- style board
- product image
- persona image
- audio reference

### 2. Decide the test purpose

Examples:

- hook rhythm only
- camera realism
- product proof
- persona continuity

The purpose decides what references should stay out.

### 3. Print the contract before the final prompt

Do not bury the contract inside prose.

## Failure Mode

If the prompt uses references but does not say what is intentionally excluded, the contract is incomplete.
