---
name: visual-hook
description: Design and critique TikTok/Reels visual hooks for short-form slideshow or video production. Use this when discussing how to make the first image, first frame, opening shot, visual sequence, slideshow cover, or first 1-3 seconds strong enough to stop the scroll, especially for generated image/video workflows and UGC-style ads.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Visual Hook

## Use When
- Design or critique the first image, first frame, opening shot, slideshow cover, or first 1-3 seconds of a short-form creative.
- Use this when the problem is stop-scroll visual strength, not general art direction.

## Do Not Use When
- The main uncertainty is which hook mechanism should be used; route first through hook or pattern selection.
- The body arc, product timing, or CTA is the main issue; use `narrative-design`.
- The user wants final render execution rather than hook design or review.

## Required Input
- For design: product or story context, intended platform, desired first-frame job, and any evidence or constraints.
- For critique or the structured artifact: a concrete first frame, first slide, or opening shot to inspect.

## Core Rule
The first image or first 1-3 seconds must make the viewer ask a concrete question before they decide whether to keep watching.

Strong visual hooks usually have:
- one obvious subject
- one visible conflict or tension
- one action already in progress
- one evidence detail understandable without audio
- one unfinished outcome that invites the next shot

If the frame only works because caption, voiceover, or product claim explains it, the visual hook is weak.

## Default Workflow
1. Identify the hook job: pain evidence, proof, contrast, mechanism curiosity, social stakes, interruption, or aspiration.
2. Check whether the first frame can carry the viewer question without relying on copy.
3. Specify subject, action in progress, visible evidence, framing, realism constraints, and next shot.
4. For slideshows, make the first slide do the job of a video opening frame.
5. For generated media prompts, write the hook job before style notes.
6. For critique, return verdict, what works, what weakens stop-scroll, specific fix, and rerun prompt note.

## Hook Families
Use these families: `pain_evidence`, `contrast_transformation`, `mechanism_curiosity`, `status_loss_social_stakes`, `interrupted_moment`, `proof_close_up`, and `aspirational_leisure`.

Map route decisions carefully:
- `patternInterrupt` -> interrupted moment or mechanism curiosity
- `proofFirst` -> proof close-up or contrast
- `painRecognition` -> pain evidence
- `socialOrIdentityStake` -> status loss or social stakes
- `boldClaim` and `questionGap` only work here when the frame itself carries the question.

## Slideshow Rules
- first slide must create curiosity, empathy, contradiction, or tension
- use large readable forms and one visual job per slide
- second slide should naturally answer the first-slide question
- avoid collage overload and tiny before/after details

## Video Rules
- start with action already underway
- prefer handheld, mirror-native, POV, or lived-in framing when appropriate
- cut from problem to process instead of establishing the room
- avoid product hero openings, empty B-roll, slow packaging shots, and stock-like AI polish

## Generated Prompt Order
When drafting image or video prompts, order details as:
1. visual conflict
2. subject and action
3. evidence detail
4. camera or framing
5. realism constraints
6. style and quality notes

Do not start with "beautiful cinematic shot" unless beauty itself is the tension.

## Critique Questions
- Can the viewer understand the situation without audio or caption?
- What exact question does the first frame create?
- What is the visible conflict?
- What action is already happening?
- What evidence makes it believable?
- Does it feel like a real short-form moment or an ad setup?
- What should the next shot answer?

## Fail Fast
- If the first frame, action, or evidence detail is unknown, ask for that visual input before producing the artifact.
- Do not package a review that cannot identify the viewer question.
- Do not turn a pretty but conflict-free frame into an approved hook.

## Common Failure Modes
- product appears before the problem
- attractive frame with no conflict
- scene is too clean, studio-like, or AI-polished
- key detail is too small for mobile
- hook depends entirely on text
- opening starts before the interesting moment
- transformation is overclaimed or visually impossible

## Output Shape
For creation:
- `hookFamily`, `firstFrameOrSlide`, `actionInProgress`, `evidenceDetail`, `viewerQuestion`, `nextShot`, `avoid`

For critique:
- `verdict`, `whatWorks`, `whatWeakensStopScroll`, `specificFix`, `rerunPromptNote`

## Handoff
- Return the structured review output or an explicit blocker. Approved visual hooks can hand off to `narrative-design`, storyboard/request planning, or prompt QA.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill visual-hook`.
- Request schema: `postplus media schema --json`; add `--endpoint <endpoint-key>` for media-generation examples.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
