# UGC Sidecar Guardrails

Use this reference only as a sidecar audit layer. Guardrails diagnose generation risks; they do not become Seedance prompt text.

## Core Principle

Guardrail diagnoses, prompt compiles.

The sidecar layer should identify likely UGC failure modes and return the smallest repair intent. The parent workflow author then converts that intent into positive scene carriers: visible action, concrete sound source, spatial anchor, camera behavior, prop handling, or a spoken line. Do not paste guardrail language, audit categories, banned-term lists, or rationale into model-facing prompts.

## When To Use

Read this reference during L2 review when any of these apply:

- multi-clip UGC has meaningful continuity of person, product, setting, or story
- total UGC duration is 30 seconds or longer
- the scene depends on multiple areas such as home entryway/kitchen/dining room, office/meeting room, clinic/waiting room, restaurant/counter/table, or car/house transition
- user feedback reports long silence, static visuals, background drift, wrong exits, continuity breaks, or obvious scene leakage

Do not treat this as a hard fail layer by default. It is a sidecar risk scan unless it exposes factual, product, compliance, or reference-binding errors.

## Four Sidecar Checks

### Rhythm Stagnation

Risk signals:

- long clip with too few timestamped cuts
- long cut carried by stillness, listening, holding, waiting, staring, or vague emotional processing
- no clear visual event for several seconds in a UGC ad beat

Repair intent:

- add a concrete event rather than a rule: phone dip, step, bag shift, door click, handoff, product touch, glance to a visible target, chair scrape, plate movement, or hard cut
- shorten or split the beat when the pause is not essential

### Audio Void

Risk signals:

- the node's audio generation is on but audio is described only as room tone, ambience, soft background noise, or chatter
- exact spoken lines are tightly restricted while no non-dialogue sound events are provided
- spoken lines are in an audio block instead of the timestamped cuts where they should be heard

Repair intent:

- add concrete in-scene sound sources: footsteps, keys, door latch, plate clink, chair scrape, bag rustle, overlapping family chatter, phone tap, sink hum, street noise
- keep the line restrictions if needed, but give the model natural sound events to fill non-dialogue time

### Spatial Topology Drift

Risk signals:

- several adjacent spaces are named repeatedly without a clear origin, destination, visible boundary, or off-screen sound source
- the prompt uses a location as both visible destination and background audio source
- final action says the actor leaves or enters, but the target space is ambiguous

Repair intent:

- lock the movement path with positive anchors: starts at the entry mat, crosses the hallway, stops at the dining table, kitchen remains an off-screen sound source
- name the visible destination only when it should appear
- keep off-screen sound sources off-screen instead of repeatedly making them a visible setting

### Entity And Negative Leakage

Risk signals:

- repeated negative instructions make unwanted objects or settings salient
- reference-boundary language is copied into the model prompt as a visible instruction wall
- a scene term appears so often that the model may over-materialize it

Repair intent:

- delete audit language and replace it with the scene that naturally avoids the risk
- use one clear positive carrier instead of many bans
- keep reference job, scope, and boundary concise and relevant to the clip

## Repair Loop

1. Read the full current definition (`workflow_read` get).
2. Identify sidecar warnings by clip.
3. Decide whether the issue is factual/blocking or just generation risk.
4. For generation risk, write a small repair intent.
5. Convert the repair intent into positive model-facing scene details.
6. Re-run L0 and the proportional L1/L2 review.

The finished prompt should read like a clean scene, not a checklist.
