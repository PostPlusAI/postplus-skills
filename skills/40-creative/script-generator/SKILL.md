---
name: script-generator
description: Turn vague product, offer, benchmark, or campaign inputs into high-quality short-form script objects for AI UGC videos and TikTok or Instagram slideshows. Use this when the user needs hook variants, script variants, slideshow flows, reveal timing, proof logic, and downstream handoff artifacts rather than one-off copy. This skill should guide weak inputs into testable scripts, not merely rewrite them more naturally.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Script Generator

## Use When
- Create script-ready inputs for AI UGC talking-head videos, TikTok or Instagram slideshows, hook testing packs, and downstream storyboard or request design.
- Use this when the user needs structured hook variants, script variants, reveal timing, proof logic, and a handoff object rather than one-off copy.

## Do Not Use When
- The user is asking for storyboard grid prompts, render request JSON, or generated media execution.
- The task is visual opening critique only; use `visual-hook`.
- The task is body arc and CTA structure after the hook is locked; use `narrative-design`.

## Core Rule
A good short-form script creates one concrete viewer question, delays ad detection long enough to earn attention, makes proof or mechanism legible, and reveals the product only when it helps the hook.

Do not merely make copy sound more casual. Correct weak brand-first, feature-first, or multi-message structure before polishing language.

## Minimum Brief
Normalize the user's ask into the smallest useful script brief before writing variants.

Required:
- `productOrOffer`
- `targetUser`
- `goal`
- `formatTarget`: `ugc_video`, `slideshow`, or `both`
- `corePainOrDesire`

Important support fields: `audienceAwareness`, `mechanismOrReasonWhy`, `proofAvailable`, `ctaStyle`, `constraints`, `sourceBasis`.

If a missing field would materially change structure, ask. Otherwise make the smallest honest inference and mark it as provisional.

## Evidence Rule
Prefer evidence-backed script generation from supplied benchmark findings, landing pages, approved product sheets, hook libraries, or user-provided campaign context.

When evidence is incomplete, separate:
- `Observed`
- `Inference`
- `Open question`

You may generate a provisional draft when the user needs momentum, but do not present provisional work as validated recommendation.

## Default Workflow
1. Normalize the brief and choose `ugc_video`, `slideshow`, or `both`; do not pretend one generic script works equally well for both.
2. Estimate audience awareness: `unaware`, `problem_aware`, `solution_aware`, `product_aware`, or `most_aware`.
3. Lock the strategy before variants: primary angle, support angles, viewer question, hook mechanism, product reveal rule, proof role, CTA role, source basis, and confidence level.
4. Generate testable variants: default to 8-12 hooks, 3-5 video script variants when UGC video is in scope, and 2-3 slideshow flows when slideshow is in scope.
5. Run the QA rubric; fix weak variants before returning or state the unresolved risk.
6. Return exactly one downstream handoff.

## Angle Families
Choose one recommended primary angle and adjacent testable support angles: `pain_recognition`, `proof_first`, `contrarian`, `mistake_correction`, `process_reveal`, `comparison`, `before_after`, `identity_or_social_stake`.

Each variant must state what it is testing. Do not flood the user with minor rewrites that do not change the angle or hook job.

## Hook And Reveal Rules
Before writing full variants, lock `viewerQuestion`, `hookMechanism`, `productRevealRule`, `proofRole`, and `ctaRole`.

Core defaults:
- hook before branding; curiosity before explanation
- product after tension starts working; mechanism before broad claims
- proof before CTA; one core message per asset

## Mode Rules
For `ugc_video`:
- write like speech, not like a copy block
- use short clauses and natural transitions
- map each variant to hook, pain or desire, proof or mechanism, product role, outcome, CTA
- avoid empty brand language such as `revolutionary`, `game-changing`, or stacked adjectives

For `slideshow`:
- one slide equals one cognitive job
- first slide creates curiosity, empathy, or tension
- slides must progress; do not split spoken copy across cards
- avoid feature bullets disguised as a slideshow

## Fail Fast
- Missing product/offer, target user, goal, or source basis.
- Do not open with the brand name when the viewer question is not yet earned.
- Do not return scripts while pretending provisional scripts are benchmark-validated truth.
- Stop or warn clearly when the user wants too many messages in one asset, no believable proof exists, or the requested format does not match the platform job.

## Output Shape
Return the smallest useful combination:
- `script brief summary`
- `script strategy block`
- `hook library`
- `video script variants`
- `slideshow flow variants`
- `qa block`
- `downstream handoff`

`script strategy block` must include `goal`, `formatTarget`, `audienceAwareness`, `primaryAngle`, `supportAngles`, `hookMechanism`, `viewerQuestion`, `productRevealRule`, `proofType`, `softCtaRule`, `sourceBasis`, `observed`, `inference`, `openQuestions`, and `mainDriftRisks`.

Each variant should include `variantId`, `angle`, `whatIsBeingTested`, `hook`, `scriptFlow`, `whyThisShouldWork`, and `mainRisk`.

QA block must check viewer question clarity, ad-feeling delay, reveal timing, message focus, mechanism legibility, proof concreteness, CTA softness, format fit, and main drift risk.

## Execution Contract
This released skill is instruction-only. It has no local script ABI. Do not imply mechanical validation; set confidence to `grounded`, `partially_grounded`, or `provisional` based on actual source basis.

## Handoff
- Approved scripts can go to `narrative-design` for body arc refinement, `video-request-architect` for request planning, or production runners after human approval.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill script-generator`.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
