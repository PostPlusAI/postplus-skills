---
name: authority-ad
description: Design or audit evidence-led short-form Authority Ads that use a credible operator, expert, insider, skeptical dialogue, case narrator, or demonstrator to expose a hidden problem mechanism and connect it to approved proof and a product solution. Use for educational ads, expert ads, authority ads, doctor-style or specialist-style ads, podcast ads, interview ads, insider reveals, case-story explainers, problem-mechanism ads, evidence-led VSLs, 专家广告, 权威广告, 科普广告, 采访广告, reviewing an existing authority-led ad, and approved scripts that should proceed to image-batch-runner or video-batch-runner.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Authority Ad

## Purpose

Create or audit speech-led educational ads where authority comes from specific reasoning and visible proof. Treat presenter styling, credentials, studios, interviews, podcasts, and technical graphics as framing devices, not proof by themselves.

## Choose The Mode

### Create Mode

Use when the user supplies a product, service, software, community, offer, proof set, brand brief, or rough concept and wants an authority-led direction or shot script.

Produce an `Authority Grammar Plan`, shot script, authority and proof checks, one
approval checkpoint, and direct production handoff after approval.

### Review Mode

Use when the user supplies an existing ad and asks whether it fits this grammar or how it should improve.

Use `$video-analysis` first to obtain observable shot and audio evidence. Then return:

- factual structure, speaker role, authority basis, and product timing
- a timecoded `Strong / Partial / Weak / Missing` audit and proof map
- claim risks, completion status, meaningful deviations, and precise amendments

Do not rewrite or enter production unless the user asks.

## Create Workflow

### 1. Ground The Brief

Read the smallest useful source context first:

- offer facts, audience, brand voice, approved claims, and available proof
- provided speaker, persona, product, UI, audio, brand, or reference assets
- prior ad analysis when explicitly relevant
- duration, aspect ratio, model, resolution, and output preferences when supplied

Lock:

- `offer_type`: `physical_product | software | service | community | content`
- `offer_capability`
- `specific_pressure`
- `audience`
- `authority_basis`
- `speaker_role`
- `proof_available`
- `claim_boundaries`
- `desired_visible_state`
- `authority_format`
- `duration_and_format`

Do not invent credentials, customer histories, testimonials, study results, mechanisms, medical or financial outcomes, comparisons, prices, guarantees, or product capabilities.

### 2. Design The Authority Grammar

Read `references/authority-grammar.md` and `references/proof-and-claims.md`.

Choose one primary authority basis and one delivery format. Produce an `Authority Grammar Plan` with exactly these fields:

- `core_human_state`
- `specific_pressure`
- `authority_basis`
- `speaker_role`
- `authority_format`
- `opening_claim_or_question`
- `pressure_carrier`
- `causal_argument`
- `proof_stack`
- `camera_and_edit_grammar`
- `product_entry`
- `product_gesture`
- `sound_world`
- `text_behavior`
- `continuity_locks`
- `final_state_and_close`

State `Authority Integrity` and `Claim Boundaries` immediately after the plan. Do not force a lab coat, credential, interview, podcast, direct-to-camera presenter, fixed shot order, product reveal time, or CTA formula.

### 3. Write The Shot Script

Read `references/shot-script-rubric.md`.

Return a shot table with exactly these columns:

`time | visual | framing/composition | camera motion | action | offer/prop relationship | lighting/color | sound | speech/text | purpose`

After the table, provide:

- `Authority Basis`
- `Proof Status`
- `Claim Boundaries`
- `Continuity Locks`
- `Causal Closure Gate`

Keep each shot concrete enough for still generation, video prompting, filming, or editing. Give each shot one dominant action and one argumentative job.

### 4. Ask For Approval

Ask one concise approval question in the user's language. English default:

`Does this authority-ad direction feel right? If yes, I will hand it directly to production.`

Stop before production until the user approves.

### 5. Handoff On Approval

Read `references/workflow-handoff.md` and immediately route the locked script.

Default to `$image-batch-runner` first when recurring speakers, customers, locations, products, props, UI plates, diagrams, or first-frame candidates need continuity assets. Feed approved still assets into `$video-batch-runner`.

Go directly to `$video-batch-runner` when identity, offer, scenes, UI, proof assets, audio, and continuity references are already stable and validated.

Do not output a separate production brief and do not ask a second generation confirmation.

## Quality Bar

- Open on specific pressure and let the spoken argument control claim-matched cuts.
- Build authority through specificity, causal explanation, demonstration, or evidence.
- Establish `symptom -> mechanism -> evidence/use-state` before offer interaction.
- Return to a visible human state with one main claim and action per shot.
- Add exact subtitles, UI, charts, legal, price, review, and package text in post.

## Non-Imitation Boundary

- Do not copy creator identity, voice, credentials, character design, exact set, exact dialogue, brand marks, proprietary UI, signature scenes, or recognizable story devices.
- Do not prompt for a living creator's style or imply a real professional endorsement without approval.
- Translate references into generic production attributes: speaker role, authority basis, framing, lighting, camera behavior, edit rhythm, evidence structure, sound intent, and proof logic.
