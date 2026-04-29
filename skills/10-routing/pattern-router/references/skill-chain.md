# Prompt Skill Chain

This document explains how the new prompt skills work together.

## Runtime Order

For most real tasks, use this order:

1. `pattern-router`
2. `reference-decode` when references exist, otherwise no-reference inference
3. `reference-contract-builder` when references need explicit boundaries
4. `storyboard-grid-writer` when the output is a grid or beat-panel plan
5. `video-request-architect` when the output is a model request
6. `prompt-preflight-qa` before generation

## Why This Order Works

- routing decides the structure before writing begins
- decode separates logic from identity
- reference contract prevents accidental copying
- storyboard turns strategy into visible events
- request architecture turns visible events into model-ready instructions
- preflight catches drift before credits are spent

## Build Priority

If this system is being extended later, maintain this priority:

1. `storyboard-grid-writer`
2. `video-request-architect`
3. `reference-decode`
4. `prompt-preflight-qa`
5. `pattern-router`
6. `reference-contract-builder`

Reason:

- storyboard writing is the highest-leverage reusable layer
- request architecture is the cross-model bridge
- decode and QA stabilize quality
- routing and contracts improve consistency at scale
