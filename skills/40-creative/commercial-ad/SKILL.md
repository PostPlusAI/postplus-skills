---
name: commercial-ad
description: Design, recommend, or audit short-form product commercials built around one controlled visual mechanism, clear product behavior, designed sound, observable or explicitly metaphorical proof, and a resolved payoff. Use for product commercials, studio product ads, stress tests, CGI ingredient worlds, mystery reveals, satisfying restocks, mini TV spots, editorial try-ons, surreal product ads, commercial briefs, commercial shot scripts, reviewing existing product ads, and approved commercial scripts that should proceed into image or video production.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Commercial Ad

## Purpose

Create or audit product-led commercials that build one coherent argument toward a designed payoff. Select the mechanism before choosing shots, effects, or locations.

Treat commercial polish as controlled product behavior, framing, motion, edit, and sound rather than generic beauty shots.

## Choose The Task

- If the user wants ideas, recommendations, or a brief, return a `Commercial Direction` and compact beat outline. Stop before a full shot script unless requested.
- If the user wants a script, return a `Commercial Direction`, shot table, production locks, and one approval checkpoint.
- If the user provides an existing video for review, use `$video-analysis` first and audit it against the closest mechanism. Do not rewrite or enter production unless asked.

## Workflow

### 1. Ground The Brief

Read the smallest useful context and lock:

- product capability, category, geometry, and material behavior
- audience and desired payoff
- available literal proof and allowed metaphor
- product, persona, location, audio, effect, and reference assets
- claim boundaries
- duration, format, and requested deliverable

Do not invent durability, health, ingredient, comparative, performance, price, review-count, or guarantee claims.

### 2. Select One Mechanism

Choose one route from the product argument and proof available. Then read only its reference file.

| route | read | use when |
| --- | --- | --- |
| proof test | `references/proof-test.md` | visible stress, resistance, recovery, or uninterrupted physical evidence |
| CGI product world | `references/cgi-product-world.md` | ingredient, texture, liquid, particle, or package-led CGI |
| reveal and suspense | `references/reveal-suspense.md` | concealment, choice, delayed payoff, product function reveal |
| satisfying restock | `references/satisfying-restock.md` | repetition, organization, abundance, storage fit, tactile completion |
| brand-film narrative | `references/brand-film.md` | pressure, product hinge, changed human state, identity close |
| editorial try-on | `references/editorial-try-on.md` | fashion, accessories, body movement, material and fit details |
| surreal escalation | `references/surreal-escalation.md` | ordinary use enters a fictional action or metaphor world |

Do not load the other route references unless the user explicitly asks to compare routes.

### 3. Produce The Commercial Direction

Return exactly these fields:

- `route`
- `template_reference`
- `core_payoff`
- `viewer_question`
- `opening_condition`
- `visual_mechanism`
- `product_role`
- `camera_and_framing`
- `movement_and_edit`
- `proof_standard`
- `sound_design`
- `continuity_locks`
- `final_resolution`

State `Claim Boundaries` immediately afterward. Label proof as `literal demonstration`, `sensory visualization`, `functional reveal`, `lifestyle evidence`, or `fictional metaphor`.

When the user only wants ideas or a brief, add a four-beat outline and stop.

### 4. Write The Shot Script

When a script is requested, return a table with exactly these columns:

`time | visual | framing/composition | camera motion | action | product/prop relationship | lighting/color | sound | speech/text | purpose`

Keep one physical or narrative job per shot. State product condition before and after every mechanism-changing action.

After the table, provide:

- `Continuity Locks`
- `Proof Status`
- `Claim Boundaries`
- `Generator Risks`

### 5. Ask For Approval

Ask one concise question:

`Does this commercial direction feel right? If yes, I will hand it directly to production.`

Stop before production until the user approves.

### 6. Handoff On Approval

Use `$image-batch-runner` first when product geometry, hero frames, material details, personas, locations, mechanism layouts, effect states, or final compositions need stable still assets. Feed approved stills into `$video-batch-runner`.

Go directly to `$video-batch-runner` when product, scene, effect, audio, motion logic, and prompt plan are already stable and approved.

Pass the approved shot script, `Commercial Direction`, selected mechanism, product facts, proof classification, claim boundaries, continuity locks, generator risks, and provided references as locked context. Do not create a second production brief or ask a second generation confirmation.

## Review Mode

After `$video-analysis`, return:

- factual shot structure and product first-appearance time
- closest mechanism and template reference
- `Strong / Partial / Weak / Missing` audit for opening condition, mechanism, product legibility, proof, sound, payoff, and causal closure
- literal versus metaphorical proof classification
- confirmed recurring grammar and one-off details
- claim, continuity, physics, and generator risks
- precise amendments to this skill or the creative

Do not treat fictional spectacle as literal product proof.

## Quality Bar

- Select one mechanism before writing shots.
- Make the product or product question legible in the opening.
- Preserve a clean causal build toward one payoff.
- Keep the product silhouette readable during effects and action.
- Use macro framing only for a material, texture, mechanism, or sensory purpose.
- Synchronize important physical actions with sound and edit timing.
- Hold uninterrupted action when a test depends on credibility.
- End on a stable hero, resolved human state, or post-produced end card.
- Keep final logos, labels, claims, prices, legal copy, subtitles, and typography in post.

## Non-Imitation Boundary

- Do not copy exact scenes, characters, brand marks, package designs, slogans, action devices, or recognizable effect choreography.
- Translate references into generic mechanism, object behavior, camera path, framing, palette logic, edit rhythm, sound structure, proof type, and payoff.
- Do not prompt for a named filmmaker, studio, campaign, or living creator's style.
