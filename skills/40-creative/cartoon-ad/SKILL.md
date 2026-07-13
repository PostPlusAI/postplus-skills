---
name: cartoon-ad
description: Design and audit visual-argument-led animated ads that turn user pressure, offer interaction, mechanism, and proof into readable characters, props, actions, visual systems, and state changes. Use for Cartoon Ads, animated direct-response ads, stylized 3D or tactile ads, personified problems, category exposes, founder stories, B2B case-character ads, animated software or service ads, product-mechanism visualization, 卡通广告, 动画广告, 3D动画广告, 拟人化广告, B2B动画广告, 把痛点动画化, reviewing an existing animated ad against this grammar, and approved scripts that should proceed into image or video production.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Cartoon Ad

## Purpose

Create or audit animated ads that make the advertising argument visible. Use a coherent visual system to connect specific pressure, offer interaction, mechanism, proof, and a changed human state.

Treat `cartoon` as a storytelling system, not a named studio look or a requirement to be cute, childish, comedic, or metaphorical.

## Choose The Mode

### Create Mode

Use when the user supplies a product, software, service, community, content offer, brand brief, or rough concept and wants an animated ad direction or shot script.

Produce a `Cartoon Grammar Plan`, shot script, production locks and checks, one
approval checkpoint, and direct production handoff after approval.

### Review Mode

Use when the user supplies an existing animated ad and asks whether it fits this grammar or how it should improve.

Use `$video-analysis` first to obtain observable shot and audio evidence. Then return:

- factual structure and offer first-appearance time
- a `Strong / Partial / Weak / Missing` grammar audit with timecodes
- narrative-engine and visual-argument classification
- causal-closure gaps
- likely `complete_ad / excerpt / incomplete` status
- confirmed patterns, meaningful deviations, and precise skill or creative amendments

Do not enter production or rewrite the ad unless the user asks.

## Create Workflow

### 1. Ground The Brief

Read the smallest useful source context first:

- offer facts, audience, brand voice, claim boundaries, and available proof
- provided product, persona, UI, audio, brand, or reference assets
- prior ad analysis when explicitly relevant
- duration, aspect ratio, model, resolution, and output preferences when supplied

Lock:

- `offer_type`: `physical_product | software | service | community | content`
- `offer_capability`
- `specific_pressure`
- `desired_visible_state`
- `audience`
- `offer_interaction`
- `proof_available`
- `claim_boundaries`
- `visual_medium`
- `duration_and_format`

Do not invent medical, physiological, comparative, ingredient, price, review-count, performance-duration, or guarantee claims.

### 2. Design The Cartoon Grammar

Read `references/narrative-grammar.md` and `references/metaphor-and-proof.md`.

Choose one primary narrative engine and one visual-argument mode. Produce a `Cartoon Grammar Plan` with exactly these fields:

- `core_human_state`
- `specific_pressure`
- `narrative_engine`
- `offer_type`
- `pressure_carrier`
- `visual_argument_mode`
- `visual_argument_system`
- `character_system`
- `camera_and_edit_grammar`
- `offer_entry`
- `offer_interaction`
- `mechanism_trace`
- `proof_plan`
- `continuity_locks`
- `final_state_and_close`

State `Claim Boundaries` immediately after the plan. Do not force a metaphor, fixed shot order, character type, material style, joke, product category, or ending formula.

### 3. Write The Shot Script

Read `references/shot-script-rubric.md` and `references/continuity-rules.md`.

Return a shot table with exactly these columns:

`time | visual | framing/composition | camera motion | action | offer/prop relationship | lighting/color | sound | speech/text | purpose`

After the table, provide:

- `Continuity Locks`
- `Proof Status`
- `Claim Boundaries`
- `Causal Closure Gate`

Keep each shot concrete enough for still generation, video prompting, or animation production. Give each shot one dominant action and one causal idea.

### 4. Ask For Approval

Ask one concise approval question in the user's language. English default:

`Does this cartoon-ad direction feel right? If yes, I will hand it directly to production.`

Stop before production until the user approves.

### 5. Handoff On Approval

Read `references/workflow-handoff.md` and immediately route the locked script.

Default to `$image-batch-runner` first when recurring characters, locations, offers, UI, or visual systems need continuity assets. Feed approved still assets into `$video-batch-runner`.

Go directly to `$video-batch-runner` when persona, offer, scene, UI, and effect references are already stable and validated.

Do not output a separate production brief and do not ask a second generation confirmation.

## Quality Bar

- Open on specific pressure and use one coherent `visual_argument_system`.
- Show plausible offer interaction, mechanism trace, and causal result behavior.
- Treat aspirational peers as illustration, not proof; use approved proof layers.
- End on an embodied human state and keep one main idea per shot.
- Add exact packaging, legal, numeric, UI, and subtitle text in post.

## Non-Imitation Boundary

- Do not copy reference characters, creator identity, brand marks, exact scenes, package designs, signature jokes, or recognizable story devices.
- Do not prompt for a named animation studio or living creator's style.
- Translate references into generic production attributes: material, proportions, expression range, lighting, camera behavior, edit rhythm, visual argument, and proof logic.
