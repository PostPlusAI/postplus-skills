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
- binding user-provided identity references explicitly
- preventing identity copying
- deciding which references to exclude from early tests
- making later failure analysis easier

This skill is not for decoding the hook itself.

## Core Rule

Every reference set should answer three questions:

1. what references are binding identity and should stay consistent?
2. what references are inspiration-only and therefore must not be copied?
3. what references are intentionally not being used yet?

Default assumption:

Unless the user explicitly says a reference is loose, inspirational, benchmark
only, or weak guidance, treat provided persona, product, and audio references
as strong bindings for identity consistency.

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

It also decides whether a reference should be treated as:

- `binding`
- `inspiration-only`
- `excluded for now`

### 3. Print the contract before the final prompt

Do not bury the contract inside prose.

Do not force all references into `learn from`.

If a user supplied a character, product, or voice reference for consistency,
print it as a binding, not as a loose style lesson.

## Failure Mode

If the prompt uses references but does not say which ones are binding, which
ones are inspiration-only, and what is intentionally excluded, the contract is
incomplete.

Ask this when the boundary is missing:

- "哪些是必须保留的品牌特征，哪些只是参考灵感？"
