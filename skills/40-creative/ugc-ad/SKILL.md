---
name: ugc-ad
description: Design, recommend, or audit creator-led short-form product ads built around direct address, believable product interaction, observable proof, and a natural personal verdict. Use for UGC ads, creator ads, selfie testimonials, product reviews, misconception-led or skeptic-to-believer ads, problem-reframe-proof ads, problem-solution demos, tutorials, unboxings, ASMR unboxings, try-ons, before-and-after ads, social validation, POV concepts, UGC briefs, UGC shot scripts, reviewing existing UGC videos, and approved UGC scripts that should proceed into image or video production.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# UGC Ad

## Purpose

Create or audit creator-led ads that make a product feel personally discovered and visibly useful. Keep the creator, product action, and proof causally connected.

Use one route at a time. Do not flatten every UGC pattern into the same talking-head structure.

## Choose The Task

- If the user wants ideas, recommendations, or a brief, return a `UGC Direction` and a compact beat outline. Stop before a full shot script unless requested.
- If the user wants a script, return a `UGC Direction`, shot table, production locks, and one approval checkpoint.
- If the user provides an existing video for review, use `$video-analysis` first and audit it against the closest route. Do not rewrite or enter production unless asked.

## Workflow

### 1. Ground The Brief

Read the smallest useful context and lock:

- product capability and category
- audience and creator posture
- specific pressure, desire, or viewer question
- available demonstration or proof
- product, persona, location, audio, and reference assets
- claim boundaries
- duration, format, and requested deliverable

Do not invent medical, physiological, comparative, ingredient, price, review-count, performance-duration, or guarantee claims.

### 2. Select One Route

Choose the route from the user's goal, product behavior, and available proof. Then read only its reference file.

| route | read | use when |
| --- | --- | --- |
| creator recommendation | `references/creator-recommendation.md` | personal recommendation, testimonial, direct explanation, product review |
| problem reframe proof | `references/problem-reframe-proof.md` | mistaken belief, hidden consequence, practical mechanism, use proof, skeptic-to-believer verdict |
| problem and solution | `references/problem-solution.md` | routine friction, hidden feature, tutorial, visible output |
| unboxing | `references/unboxing.md` | packaging, arrival, reveal, tactile or ASMR experience |
| try-on and styling | `references/try-on.md` | apparel, footwear, accessories, fit, styling, movement |
| transformation | `references/transformation.md` | matched before/after, cleanup, repair, visible state change |
| social validation | `references/social-validation.md` | shared use, repeat use, another person's reaction |
| POV or spectacle | `references/pov-spectacle.md` | unusual viewpoint, scale contrast, or elevated scene as the hook |

Do not load the other route references unless the user explicitly asks to compare routes.

### 3. Produce The UGC Direction

Return exactly these fields:

- `route`
- `template_reference`
- `core_human_state`
- `viewer_question`
- `hook_event`
- `creator_posture`
- `product_entry`
- `camera_and_framing`
- `product_action`
- `proof_plan`
- `sound_and_speech`
- `continuity_locks`
- `close`

State `Claim Boundaries` immediately afterward.

When the user only wants ideas or a brief, add a four-beat outline and stop.

### 4. Write The Shot Script

When a script is requested, return a table with exactly these columns:

`time | visual | framing/composition | camera motion | action | product/prop relationship | lighting/color | sound | speech/text | purpose`

Keep one dominant action and one communication job per shot. Make every row concrete enough for filming, still generation, or video prompting.

After the table, provide:

- `Continuity Locks`
- `Proof Status`
- `Claim Boundaries`
- `Generator Risks`

### 5. Ask For Approval

Ask one concise question:

`Does this UGC direction feel right? If yes, I will hand it directly to production.`

Stop before production until the user approves.

### 6. Handoff On Approval

Use `$image-batch-runner` first when persona, product, first frame, scene, outfit, packaging, or before/after states need stable still assets. Feed approved stills into `$video-batch-runner`.

Go directly to `$video-batch-runner` when persona, product, scene, audio, proof state, and prompt plan are already stable and approved.

Pass the approved shot script, `UGC Direction`, selected route, product facts, claim boundaries, continuity locks, generator risks, and provided references as locked context. Do not create a second production brief or ask a second generation confirmation.

## Review Mode

After `$video-analysis`, return:

- factual shot structure and product first-appearance time
- closest route and template reference
- `Strong / Partial / Weak / Missing` audit for hook, creator posture, product action, proof, close, and causal closure
- route-specific causal audit using the selected reference file
- confirmed recurring grammar and one-off details
- claim or continuity risks
- precise amendments to this skill or the creative

Do not treat creator excitement alone as proof.

## Quality Bar

- Create a legible hook event within the first 0-2 seconds.
- Make the product visible or establish a clear product question by 0-3 seconds.
- Let hands, body, product, liquid, fabric, or routine create motion before moving the camera.
- Pair spoken claims with visible action or evidence.
- Include at least one observable proof beat before the verdict.
- Preserve matched framing and lighting for transformations.
- End on a readable human state, use behavior, or personal recommendation.
- Keep subtitles, prices, review counts, legal copy, logos, and final package text in post.

## Non-Imitation Boundary

- Do not copy creator identity, exact rooms, brand marks, package designs, exact scenes, signature jokes, or recognizable spectacle devices.
- Translate references into generic camera behavior, framing, action order, sound intent, proof logic, and state change.
- Treat unusual animals, giant replicas, extreme environments, and historical staging as optional mechanisms, not reusable identity details.
