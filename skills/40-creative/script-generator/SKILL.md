---
name: script-generator
description: Turn vague product, offer, benchmark, or campaign inputs into high-quality short-form script objects for AI UGC videos and TikTok or Instagram slideshows. Use this when the user needs hook variants, script variants, slideshow flows, reveal timing, proof logic, and downstream handoff artifacts rather than one-off copy. This skill should guide weak inputs into testable scripts, not merely rewrite them more naturally.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Script Generator

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when the user wants to create script-ready inputs for:

- AI UGC talking-head videos
- TikTok or Instagram slideshow or carousel creatives
- hook testing packs
- script variants that can later feed storyboard or render-request work

This skill sits at the `script object` layer.

It is for:

- turning fuzzy user asks into structured script briefs
- correcting weak brand-first or feature-first inputs
- producing testable hook and script variants
- separating evidence-backed recommendations from provisional drafts
- preparing a clean handoff into storyboard or request design

It is not for:

- creating project or campaign file scaffolds
- writing storyboard grid prompts
- writing provider-ready render JSON
- pretending provisional scripts are benchmark-validated truth

## Core Idea

A good AI UGC script is not "natural speech plus product benefits."

It is a conversion script disguised as casual content.

The target is not:

- "make this sound more human"
- "make it more viral"
- "make it more premium"

The target is:

- create one concrete viewer question
- delay ad detection long enough to earn attention
- make the mechanism or proof legible
- reveal the product only after the opening tension is working
- keep one core message per asset
- output a script object that can be tested and handed downstream

## Shared File System Context

Read [`references/source-context.md`](references/source-context.md).

When campaign- or project-level source files exist, consume them as stable context:

- `brand.md`
- `persona.md`
- `product.md`
- `hooks.md`

These files are shared source-of-truth inputs.

This skill may read and use them.
This skill does not create or manage them.

## Input Priority

Normalize inputs in this order:

1. explicit current task input
2. campaign or project source files
3. benchmark or research artifacts
4. user freeform text

Do not ignore the current ask just because a source file exists.
Do not ignore stable source files when they directly improve script quality or consistency.

## Minimum Script Brief

Before writing variants, normalize the ask into the smallest useful script brief.

Required slots:

- `productOrOffer`
- `targetUser`
- `goal`
- `formatTarget`
- `corePainOrDesire`

Important support slots:

- `audienceAwareness`
- `mechanismOrReasonWhy`
- `proofAvailable`
- `ctaStyle`
- `constraints`
- `sourceBasis`

If required slots are missing, infer the smallest safe version first.
Ask only when the missing field would materially change the script structure.

## Evidence Rule

Prefer evidence-backed script generation.

Useful evidence sources:

- benchmark reports
- pattern tables
- master tables
- landing pages
- approved product sheets
- approved hook libraries
- campaign source-of-truth files

When evidence is incomplete, do not stop by default.

Instead, separate:

- `Observed`
- `Inference`
- `Open question`

Then generate a provisional draft only if the user still needs a script.

Do not present a provisional draft as a validated recommendation.

## First Decision

Decide whether the request is primarily:

- `ugc_video`
- `slideshow`
- `both`

Do not generate one generic script and pretend it works equally well for both.

## Script Quality Rules

Read [`references/script-quality-rules.md`](references/script-quality-rules.md).

Every output should enforce these defaults:

- start with a concrete viewer question, not a brand intro
- show or imply the problem or desire before the ad feeling appears
- reveal the product only when it helps the hook
- keep one core message per asset
- make the mechanism legible, not just the outcome
- write for retention first, persuasion second
- hook before branding
- curiosity before explanation
- product after tension starts working
- mechanism before broad claims
- proof before CTA
- simplicity before cleverness

If the user's draft violates these rules, correct the structure before polishing wording.

## Standard Script Skeleton

Each usable script variant should map to:

- `Hook`
- `Problem recognition or desire trigger`
- `Proof or mechanism`
- `Product role`
- `Outcome`
- `CTA`

Compression is allowed.

Do not output a final variant that completely lacks:

- hook
- mechanism or proof
- product role

## Awareness Rule

Before expanding variants, estimate the audience awareness stage:

- `unaware`
- `problem_aware`
- `solution_aware`
- `product_aware`
- `most_aware`

Then lock:

- what the script may assume
- what should not be explained yet
- whether direct product mention can arrive early

Wrong awareness matching is a script problem, not just a copy problem.

## Angle Rule

Do not write only one angle unless the user explicitly asks for one fixed take.

Choose one recommended primary angle, then generate adjacent testable variants.

Supported angle families:

- `pain_recognition`
- `proof_first`
- `contrarian`
- `mistake_correction`
- `process_reveal`
- `comparison`
- `before_after`
- `identity_or_social_stake`

Each variant should state what it is testing.

Do not flood the user with minor rewrites that do not change the angle or hook job.

## Hook And Reveal Rule

Before writing full variants, lock:

- `viewerQuestion`
- `hookMechanism`
- `productRevealRule`
- `proofRole`
- `ctaRole`

If these are unclear, the skill should not jump straight into polished copy.

## Video Script Mode

Use when:

- human belief transfer matters
- explanation matters
- product handling or mechanism can be shown

Default writing rules:

- write like speech, not like a copy block
- prefer short clauses
- allow light self-correction
- allow natural expressions such as:
  - `I didn't expect this`
  - `the weird part is`
  - `what actually matters is`
- avoid generic brand language such as:
  - `revolutionary`
  - `transforms your routine`
  - `game-changing`
  - `seamless`
  - stacked empty adjectives

Do not hard-code a single fixed duration template.

Instead, use pacing slots:

- `opening hook`
- `specific pain or desire`
- `product use or proof`
- `result or payoff`
- `cta close`

Recommended pacing may be included, but the slots matter more than the seconds.

## Slideshow Mode

Use when:

- the concept is visual
- the proof can be broken into cards
- each frame can create micro-curiosity

Default writing rules:

- one slide = one cognitive job
- keep each slide short and instantly scannable
- first slide must create curiosity, empathy, or tension
- progression must exist across the slide sequence
- do not output feature bullets disguised as slides

This mode should return slide flow, not spoken script lines split by sentence breaks.

## Default Workflow

### 1. Normalize the brief

Lock the smallest sufficient script brief.

If the input is broad, infer first and ask later.

### 2. Inspect source context

Load the smallest useful source context:

- `brand.md` for voice boundaries, forbidden phrases, and positioning
- `persona.md` for narrator credibility and product relationship
- `product.md` for claims, mechanism, objections, and proof
- `hooks.md` for tested shells, anti-repetition, and variation direction

If a file is missing, note the consequence.
Do not treat missing files as a blocker by default.

### 3. Lock strategy before variants

Print or reason through:

```text
Format target:
Audience awareness:
Primary angle:
Support angles:
Viewer question:
Hook mechanism:
Product reveal rule:
Proof role:
CTA role:
Main source basis:
Confidence level:
```

### 4. Generate variants

Default output set:

- 8-12 hooks
- 3-5 video script variants when `ugc_video` is in scope
- 2-3 slideshow flows when `slideshow` is in scope

Each variant should include:

- `variantId`
- `angle`
- `whatIsBeingTested`
- `hook`
- `scriptFlow`
- `whyThisShouldWork`
- `mainRisk`

### 5. Run the script QA rubric

Every final output should include:

- `Viewer question clear?`
- `Ad feeling delayed enough?`
- `Product reveal timing ok?`
- `One core message only?`
- `Mechanism legible?`
- `Proof concrete enough?`
- `CTA soft enough?`
- `Video-native or slideshow-native?`
- `Main drift risk`

If a variant is still weak:

- fix it before returning, or
- explicitly state why it remains weak

Do not pass through a weak draft unchanged just because the user wrote it.

### 6. Return the downstream handoff

Suggest one next skill only.

Typical next steps:

- `storyboard-grid-writer` when scene logic should become panels
- `video-request-architect` when the script is stable enough for request planning
- `prompt-preflight-qa` when a prompt draft already exists and needs diagnosis

## Output Shapes

Return the smallest useful combination for the task.

Common shapes:

- `script brief summary`
- `script strategy block`
- `source context`
- `hook library`
- `video script variants`
- `slideshow flow variants`
- `qa block`
- `downstream handoff`

### Script Strategy Block

Should include:

- `goal`
- `formatTarget`
- `audienceAwareness`
- `primaryAngle`
- `supportAngles`
- `hookMechanism`
- `viewerQuestion`
- `productRevealRule`
- `proofType`
- `softCtaRule`
- `sourceBasis`
- `observed`
- `inference`
- `openQuestions`
- `mainDriftRisks`

### Source Context

Should include:

- `brandContext`
- `personaContext`
- `productContext`
- `hookContext`
- `confidenceLevel`

Use values such as:

- `from brand.md`
- `from persona.md`
- `from product.md`
- `from hooks.md`
- `from benchmark patterns`
- `from landing page`
- `from user input`
- `missing`

Confidence levels:

- `grounded`
- `partially_grounded`
- `provisional`

## Anti-Patterns

Do not:

- open with the brand name when the viewer question is not yet earned
- keep multiple unrelated promises inside one asset
- hide the product role until the viewer cannot tell what is being sold
- replace mechanism with vague outcome claims
- give slideshow output that reads like copy bullets
- give talking-head output that reads like ad brochure copy
- silently treat `hooks.md` as validated performance truth when it is only a raw library

## Failure Mode

Stop or warn clearly when:

- the script is under-specified in a way that changes structure
- the user wants too many messages in one asset
- no believable mechanism or proof exists
- the script still sounds like a brand talking, not creator-native delivery
- the output format does not match the platform job

Then give:

- the closest usable corrected version
- the main unresolved risk
- the next honest unblocker
