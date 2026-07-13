# Downstream Handoff

Use the approved `Before-After Grammar Plan`, shot script, and `Production Locks`
as the creative source of truth. Do not reinterpret the concept downstream.

## Shared Handoff Payload

Pass:

- approved shot rows and duration
- product facts and approved product references
- approved claims and prohibited claims
- persona and concern-map locks
- scene and before/after match locks
- sound and text modes
- source basis and reference duties
- generator risks
- post-only elements

## To `image-batch-runner`

Use first when still assets are missing.

Request only the assets the script needs:

- persona lock image
- problem close-up or baseline body view
- product-in-hand reveal
- operational-use close-up
- routine context still
- matched result view
- split-screen-ready pair
- texture/dosage detail
- first-frame candidate

Mark fixed versus variable constraints for every asset. Keep the same identity,
concern map, product, primary scene, camera side, and evidence light across
matched assets. Require an `assetPurpose` and `sourceBasis`. Leave text and
comparison graphics for post-production.

## To `video-batch-runner`

Use when the approved script and required hosted assets exist.

Pass each shot as a compact prompt segment with:

- subject and one action
- scene and evidence lighting
- framing and camera stability
- product role
- sound intent
- continuity constraints
- explicit media bindings

Require transformation through edits between stable states, never an in-shot
morph. Use `promptPlan.prompt_storyline`; do not invent provider-native motion
controls. Let the runner select and validate the released route, create the
manifest, submit, and return a pollable handle.

## Approval Behavior

After the user approves the script, proceed directly to the selected downstream
skill. Do not produce a redundant production brief and do not ask a second
permission question. Stop only when missing product, reference, claim, or route
facts would materially change the output.
