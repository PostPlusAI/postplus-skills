# Production Handoff

Use this reference only after the user approves the lifestyle ad script.

## Rule

Once the user approves the script, immediately hand it to the right production runner. Do not output a separate production brief and do not ask a second generation confirmation.

Default to `$video-batch-runner`: it renders the approved shot script into hosted video. This is the standard path when the user simply says to continue.

Use `$image-batch-runner` first when the approved concept needs still assets before video: persona images, product lifestyle stills, first-frame candidates, scene images, or light consistency edits. Those stills then feed the video renders.

## Handoff Payload

Provide the downstream production runner with:

- approved shot table
- Camera Grammar Plan
- product facts and claim boundaries
- brand voice or brand docs used
- duration target
- model, resolution, aspect ratio, and audio preferences if the user provided them
- product appearance requirements
- creator, product, audio, style, or benchmark references if provided

## Asset Validation Boundary

Let the downstream production runner handle:

- missing creator reference
- missing product reference
- missing voice/audio reference
- visible product without image
- Script-Locked Asset Mode
- model, resolution, and duration validation
- media request validation and render manifests
- route selection between still and video batch runs

Do not duplicate batch-runner route, manifest, or provider validation inside this skill.

## Handoff Style

Tell the downstream production runner that the script is locked unless it finds a factual, asset, duration, route, or generation-executability issue.

Keep the creative intent compact:

- desired state
- pressure carrier
- product gesture
- proof style
- identity close
