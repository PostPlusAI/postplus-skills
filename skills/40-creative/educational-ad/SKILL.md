---
name: educational-ad
description: Design and audit evidence-led educational short-form ads that turn a viewer problem, question, contradiction, or comparison into a clear explanation, clause-matched visual proof, an earned product or offer entry, and a practical changed state. Use for Educational Ads, explainer ads, expert or spokesperson ads, authority-led ads, ranked or tier-list ads, interview demonstrations, product education, mechanism-led direct-response ads, B2B explainers, animated educational ads, reviewing an existing educational ad, and approved educational scripts that should proceed into image or video production.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Educational Ad

## Purpose

Create or audit short-form ads that teach one useful idea while building an evidence-backed case for an offer. Make the argument visible through a stable anchor, clause-matched evidence, readable product behavior, and a clear movement from pressure to understanding and agency.

Treat `educational` as an argument system, not a requirement for a lab coat, podium, lecture, talking head, medical topic, or serious tone.

## Choose The Mode

### Create Mode

Use when the user supplies an offer, brand brief, rough concept, approved facts, or prior analysis and wants an educational ad direction or shot script.

Produce an `Educational Grammar Plan`, evidence ledger, shot script, production
checks, one approval checkpoint, and direct handoff after approval.

### Review Mode

Use when the user supplies an existing ad and asks whether it fits this grammar or how it should improve.

Use `$video-analysis` first to obtain observable shot and audio evidence. Then read `references/review-rubric.md` and return:

- factual structure, offer timing, and education/evidence classification
- a timecoded `Strong / Partial / Weak / Missing` audit and causal-closure gaps
- completion status, meaningful deviations, and precise amendments

Do not rewrite the ad or enter production unless the user asks.

## Create Workflow

### 1. Ground The Brief

Read the smallest useful source context first:

- offer facts, audience, brand voice, claim boundaries, and approved proof
- product, persona, UI, audio, brand, or reference assets
- prior ad analysis when explicitly relevant
- duration, aspect ratio, model, resolution, and output preferences when supplied

Lock:

- `offer_type`: `physical_product | software | service | community | content`
- `offer_capability`
- `specific_pressure`
- `viewer_question`
- `education_goal`
- `desired_visible_state`
- `audience`
- `authority_basis`
- `approved_facts_and_proof`
- `claim_boundaries`
- `visual_medium`
- `duration_and_format`

Do not invent credentials, mechanisms, research, medical or legal outcomes, comparative superiority, ingredients, prices, review counts, performance durations, guarantees, or other substantiation.

### 2. Design The Educational Grammar

Read `references/educational-grammar.md`.

Choose one primary education engine and one evidence system. Produce an `Educational Grammar Plan` with exactly these fields:

- `core_human_state`
- `specific_pressure`
- `viewer_question`
- `education_engine`
- `authority_anchor`
- `pressure_carrier`
- `mechanism_or_reason`
- `evidence_system`
- `camera_and_edit_grammar`
- `speech_and_tone`
- `text_behavior`
- `offer_entry`
- `offer_interaction`
- `proof_plan`
- `continuity_locks`
- `final_state_and_close`

State `Claim Boundaries` and an evidence ledger immediately after the plan. Mark each material statement as `approved`, `needs evidence`, or `prohibited`.

### 3. Write The Shot Script

Read `references/shot-script-rubric.md`.

Return a shot table with exactly these columns:

`time | visual | framing/composition | camera motion | action | offer/prop relationship | lighting/color | sound | speech/text | evidence job | purpose`

After the table, provide:

- `Continuity Locks`
- `Proof Status`
- `Claim Boundaries`
- `Causal Closure Gate`

Give each shot one dominant action, one causal idea, and one evidence job. Keep critical captions, labels, legal copy, numeric claims, prices, reviews, guarantees, and package text for approved post-production treatment.

### 4. Ask For Approval

Ask one concise approval question in the user's language. English default:

`Does this educational-ad direction feel right? If yes, I will hand it directly to production.`

Stop before production until the user approves.

### 5. Handoff On Approval

Read `references/workflow-handoff.md` and immediately route the locked script.

Default to `$image-batch-runner` first when an authority persona, recurring user, product, location, comparison system, proof plate, interface, or animated character needs continuity assets. Feed approved still assets into `$video-batch-runner`.

Go directly to `$video-batch-runner` when identity, product, scenes, proof assets, and audio references are stable and validated.

Do not output a separate production brief or ask a second generation confirmation.

## Quality Bar

- Establish one viewer question and stable anchor within the first three seconds.
- Match evidence to spoken clauses and explain one causal chain before offer entry.
- Show observable offer interaction and approved proof in readable framing.
- End on an embodied state with one narrative job per location and shot.
- Add exact captions, claims, legal copy, numbers, UI, and package text in post.

## Non-Imitation Boundary

- Do not copy reference creators, faces, voices, credentials, wardrobe, exact sets, characters, brand marks, packaging, dialogue, websites, proprietary interfaces, or recognizable scenes.
- Treat benchmark videos as inspiration-only for rhythm, framing, evidence linkage, and argument structure unless the user explicitly supplies separate binding persona, product, or audio references.
- Do not prompt for a named creator, studio, or advertisement style. Translate references into generic production attributes.
