# Production Handoff

Use this reference only after the user approves the street-interview direction.

## Rule

Immediately hand the locked plan and script to the appropriate production skill. Do not output a separate production brief or ask a second generation confirmation.

## Route Selection

### Image First

Use `$image-batch-runner` before video when the concept needs stable assets for:

- respondent and interviewer identity
- two-person left/right geometry and eyelines
- microphone and hand ownership
- first-frame hook candidates
- recurring street plate or time of day
- product-in-hand, preparation, or UI keyframes
- repeated respondent, wardrobe, product, or proof continuity

After still approval, pass the approved assets and locked script to `$video-batch-runner`.

### Direct Video

Use `$video-batch-runner` directly when respondent, interviewer, microphone, product, scene, voice, UI, and proof references already exist and are validated, or when the concept uses independent simple clips that do not need a still-asset pass.

## Handoff Payload

Pass:

- approved `Street Interview Grammar Plan` and shot table
- respondent role, truth status, and approved spoken copy
- continuity locks and generation risks
- offer facts, product gesture, and claim boundaries
- proof plan, result owner, proof status, and source basis
- persona, interviewer, microphone, product, location, UI, audio, voice, and style references
- duration, aspect ratio, model, resolution, and audio preferences when supplied
- final captions, hook, CTA, package, UI, and legal text reserved for post

Tell the runner that creative direction is locked unless it finds a factual, claim, asset, route, duration, or generation-executability issue.

## Downstream Boundaries

Let the production runner handle uploads, missing reference validation, endpoint selection, duration and resolution constraints, requests, manifests, polling, downloads, and still-to-video bindings.

Do not duplicate runner or workflow execution logic inside `street-interview-ad`.
