---
name: street-interview-ad
description: Design and audit street-interview advertising concepts and shot scripts built around a public conversation, visible microphone, candid respondent state, question-led persuasion, product interaction, and grounded proof. Use for street interview ads, vox-pop ads, man-on-the-street ads, sidewalk interview ads, public reaction ads, interview-style direct-response ads, converting an offer or approved brief into a street-interview script, reviewing an existing street-interview ad, or handing an approved street-interview concept to image or video production.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Street Interview Ad

## Purpose

Create or audit ads that use a believable public conversation to move from curiosity or skepticism to grounded explanation, proof, and an optional CTA.

Treat the format as a production grammar, not permission to fabricate customers, testimonials, experts, or spontaneous public reactions.

## Choose The Mode

### Create Mode

Use when the user supplies an offer, brand brief, product facts, approved claims, rough concept, or script and wants a street-interview direction.

Produce a `Street Interview Grammar Plan`, shot script, production locks and
checks, one approval checkpoint, and direct handoff after approval.

### Review Mode

Use when the user supplies an existing ad and asks whether it fits this grammar or how it should improve.

Use `$video-analysis` first to obtain observable shot and audio evidence. Then return:

- factual structure, hook, product timing, proof, and ending status
- a timecoded `Strong / Partial / Weak / Missing` audit
- truth-status risks, meaningful deviations, and precise amendments

Do not rewrite the ad or enter production unless the user asks.

## Create Workflow

### 1. Ground The Brief

Read the smallest useful source context:

- offer facts, audience, brand voice, approved claims, and available proof
- product, persona, location, UI, audio, or reference assets
- prior ad analysis when explicitly relevant
- duration, aspect ratio, model, resolution, and output preferences when supplied

Lock:

- `offer_type`: `physical_product | software | service | community | content`
- `offer_capability`
- `audience`
- `specific_pressure`
- `interview_premise`
- `interviewer_role`
- `respondent_role`
- `respondent_truth_status`: `approved_customer | approved_expert | spokesperson | actor | illustrative_persona`
- `proof_available`
- `claim_boundaries`
- `setting_and_format`

Do not write first-person results, expert authority, public consensus, or spontaneous discovery unless the supplied evidence supports that truth status. Actors and illustrative personas must not be presented as real customers or independent passersby.

### 2. Design The Street Grammar

Read `references/street-grammar.md` and `references/continuity-and-proof.md`.

Produce a `Street Interview Grammar Plan` with exactly these fields:

- `core_human_state`
- `specific_pressure`
- `interview_premise`
- `interviewer_role`
- `respondent_role_and_truth_status`
- `question_ladder`
- `camera_language`
- `framing_and_eyeline`
- `movement_and_edit_grammar`
- `microphone_behavior`
- `product_entry`
- `product_gesture`
- `proof_plan`
- `sound_world`
- `text_and_subtitle_behavior`
- `continuity_locks`
- `ending_and_cta`

State `Claim Boundaries` immediately after the plan. Do not force a fixed location, respondent count, product category, music track, hook box, or ending formula.

### 3. Write The Shot Script

Read `references/shot-script-rubric.md`.

Return a shot table with exactly these columns:

`time | visual | framing/composition | camera motion | subject/action | product/prop relationship | lighting/color | edit | sound/music | speech/text | purpose`

After the table, provide:

- `Continuity Locks`
- `Proof Status`
- `Claim Boundaries`
- `Generation Risk Check`

Keep one dominant action and one conversational job per row. Write all spoken lines needed for timing, but keep final subtitles, hook overlays, package text, UI labels, legal copy, and CTA graphics for deterministic post-production.

### 4. Ask For Approval

Ask one concise approval question in the user's language. English default:

`Does this street-interview direction feel right? If yes, I will hand it directly to production.`

Stop before production until the user approves.

### 5. Handoff On Approval

Read `references/workflow-handoff.md` and immediately route the locked plan and script.

Default to `$image-batch-runner` first when two-person continuity, recurring respondents, microphone/hand geometry, product handling, first frames, or street plates need stable assets. Feed approved stills into `$video-batch-runner`.

Go directly to `$video-batch-runner` when persona, product, microphone, scene, voice, and proof references are already stable and validated.

Do not output a separate production brief and do not ask a second generation confirmation.

## Quality Bar

- Open with a concrete question and show a visible listening state.
- Keep microphone, eyeline, hand ownership, and interviewer geometry credible.
- Build a question ladder before one legible product action and proof response.
- Preserve handheld public-place dialogue with restrained edits and music.
- End on a changed human state; add near-verbatim captions in post.

## Non-Imitation And Truth Boundary

- Do not copy source faces, voices, exact locations, wardrobe combinations, brands, domains, signature lines, or distinctive background props.
- Do not claim that an actor is a random passerby, customer, expert, or independent reviewer.
- Do not invent medical, financial, comparative, rapid-result, performance, scarcity, discount, review, or guarantee claims.
- Keep critical text out of generated frames and translate references into generic camera, movement, sound, state, proof, and edit attributes.
