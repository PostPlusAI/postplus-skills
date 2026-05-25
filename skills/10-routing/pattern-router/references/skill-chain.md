# Prompt Skill Chain

This document explains how the new prompt skills work together.

## Runtime Order

For most real tasks, use this order:

1. `pattern-router`
2. `reference-decode` when references exist, otherwise no-reference inference
3. `reference-contract-builder` when references need explicit boundaries
4. `video-request-architect` when the output is a beat plan or model request
5. `prompt-preflight-qa` before generation

## Why This Order Works

- routing decides the structure before writing begins
- decode separates logic from identity
- reference contract prevents accidental copying
- request architecture turns strategy into visible events and model-ready instructions
- preflight catches drift before credits are spent

## Build Priority

If this system is being extended later, maintain this priority:

1. `video-request-architect`
2. `reference-decode`
3. `prompt-preflight-qa`
4. `pattern-router`
5. `reference-contract-builder`

Reason:

- request architecture is the cross-model bridge
- decode and QA stabilize quality
- routing and contracts improve consistency at scale
