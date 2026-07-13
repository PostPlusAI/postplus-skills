# Production Handoff

Use this reference only after the user approves the cartoon-ad direction.

## Rule

Immediately hand the locked script to the appropriate production skill. Do not output a separate production brief or ask a second generation confirmation.

## Route Selection

### Image First

Use `$image-batch-runner` before video when a recurring protagonist, physical offer, UI, pressure/mechanism character, location, first-frame composition, or before/after state needs continuity assets.

For software, services, and communities, prepare stable UI plates and interaction keyframes rather than asking the video model to generate critical screens or meeting details.

After still approval, pass assets and the locked script to `$video-batch-runner`.

### Direct Video

Use `$video-batch-runner` directly when persona, offer, scene, UI, and effect references already exist and are validated, or when shots are independent object animations or a small number of simple scenes.

## Handoff Payload

Pass:

- approved `Cartoon Grammar Plan` and shot table
- continuity locks and causal-closure results
- offer facts, offer type, interaction, and claim boundaries
- proof plan, proof status, result owner, and approved copy
- persona, physical offer, UI, location, audio, and reference assets
- duration, aspect ratio, model, resolution, and audio preferences when provided
- final text elements to add in post

Tell the runner that creative direction is locked unless it finds a factual, claim, asset, route, duration, or generation-executability issue.

## Production Boundary

Let the downstream runner handle missing references, upload and validation, model selection, resolution and duration constraints, requests, manifests, polling, and still-to-video binding.

Do not duplicate those responsibilities inside `cartoon-ad`.

## Compact Creative Intent

Preserve:

- desired human state and specific pressure
- narrative engine and visual-argument system
- offer type, entry, and interaction
- mechanism trace
- proof plan, result owner, and proof status
- continuity locks
- final state and close
