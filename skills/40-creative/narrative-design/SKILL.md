---
name: narrative-design
description: Structure the body and close of a short-form video into a reusable Narrative Brief with explicit arc choice, beat sequence, product integration timing, emotional arc, and CTA design. Use after the hook mechanism and viewer question are locked and before storyboard or prompt writing starts.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Narrative Design

## Use When
- Turn a locked hook mechanism and viewer question into a concise Narrative Brief for short-form video body and close design.
- Use before storyboard, prompt writing, or request architecture when product timing, emotional beat sequence, CTA mechanism, and downstream handoff need to be explicit.

## Do Not Use When
- The opening mechanism is still undecided; use `pattern-router` or `hook-design`.
- The first frame or visual opening is the main problem; use `visual-hook`.
- The user needs final render prompts, asset generation, or post-generation QA.

## Core Rule
The hook creates a viewer question. The narrative must answer that question so the product feels like the logical conclusion, not an interruption.

Do not introduce or explain the product before the body has deepened the problem, desire, proof gap, or expectation enough to make the product arrival earned.

## Required Input
Required fields: `viewerQuestion`, `hookMechanism`, whether the product or outcome appears in the opening frame, `segmentType`, product role, proof available, CTA goal, and source basis or user-provided brief.

If the upstream hook context is vague, ask for the opening mechanism and viewer question before designing the arc.

## Default Workflow
1. Confirm the upstream hook context: viewer question, hook mechanism, and product visibility in frame one.
2. Classify the segment type: `conversion`, `trust`, `awareness`, or `engagement`.
3. Select one primary narrative arc; do not blend arcs unless the timing explicitly supports it.
4. Map the beat sequence and product integration rule.
5. Define the emotional arc from hook exit state to CTA state.
6. Design one CTA mechanism and placement.
7. Return the Narrative Brief as the handoff object.

## Hook Context Adjustments
If the hook shows the product or result in frame one, the body no longer earns first appearance; it earns belief in what the viewer already saw. Reframe product timing as first explanation.

If the hook is negative, such as "stop doing this" or "everyone gets this wrong," the body must deliver the correction quickly. Negative hooks work best with `problemAgitatedSolve` or `expertExplainer`; avoid urgency-only structures unless the audience is already warm.

## Arc Selection
Use these arc families:
- `expertExplainer`: knowledge gap, authority, clarity, trust building.
- `problemAgitatedSolve`: familiar pain, consequence, direct solution.
- `transformation`: credible before/after, self-projection, concrete after state.
- `surpriseSatisfaction`: expectation, inversion, satisfying explanation.
- `urgencyClose`: already-warm audience, real scarcity or timing, immediate action.

Shortcuts:
- `conversion`: usually `problemAgitatedSolve`; `urgencyClose` only for warm audiences.
- `trust`: `expertExplainer` or credible `transformation`.
- `awareness`: `surpriseSatisfaction` or `expertExplainer`.
- `engagement`: `surpriseSatisfaction`, `transformation`, or comment-loop `expertExplainer`.

Default to `expertExplainer` only when the hook and product are clear but the emotional precondition is not.

## Beat Sequence
Use this structure unless the requested duration requires compression:
- `0-3s`: hook beats from upstream context; do not redesign here.
- `3-8s`: arc opening move.
- `8-16s`: problem depth, proof setup, or explanation.
- `16-28s`: product integration.
- `28-38s`: arc-specific resolution.
- `38-43s`: CTA.

In beats 1-2, switch visual information every 2-3 seconds unless a hold is intentionally rewarding. Cut repeated beats instead of extending the body.

## Product Integration Rules
Choose one:
- `hold until solve`: product waits for the solution beat.
- `reveal at inversion`: product appears at the expectation subversion.
- `show early, explain late`: product is visible early but explained after belief is earned.
- `assumed known`: identity is already known.

For multi-feature products, order features by perceived impact first, proof second, objections third, and support features last. Do not follow spec-sheet order if it weakens attention.

## CTA Rules
Choose one CTA mechanism:
- `direct purchase`
- `save for later`
- `comment trigger`
- `follow hook`
- `share bait`

One CTA mechanism per video. Place it after the resolution beat, usually in the final 3-5 seconds.

## Fail Fast
- Stop when you cannot determine the arc, product timing, CTA mechanism, or intended viewer state at CTA.
- Do not hand off to storyboard or prompt work with vague arc logic or unresolved product timing.
- Do not solve hook ambiguity inside this skill; send that back to the hook layer.

## Output Shape
Return a `Narrative Brief` with:
- `segmentType`
- `hookContext`
- `narrativeArc`
- `beatSequence`
- `productIntegrationRule`
- `featureSequence`
- `emotionalArc`
- `ctaMechanism`
- `ctaPlacement`
- `toneTarget`
- `perspective`
- `captionRequirement`
- `downstreamHandoff`

Use readable labels in the response: Segment type, Hook context, Narrative arc, Beat sequence, Product integration rule, Emotional arc, CTA mechanism, Caption requirement, Downstream handoff.

`hookContext` must include `viewerQuestionCarriedIn`, `hookMechanism`, and `productRevealRuleFromHook`.

`emotionalArc` must include `hookExitState`, `beat2Target`, `productArrivalState`, and `ctaState`.

## Anti-Patterns
- resetting the viewer question after the hook
- introducing product explanation before tension or proof gap exists
- mixing several arcs into one short video
- using urgency when the viewer still needs understanding
- adding multiple CTAs
- treating CTA as a polished line instead of a behavior mechanism

## Execution Contract
This released skill is instruction-only. It has no local script ABI. The stable output is the Narrative Brief.

## Handoff
- Send approved narrative plans to `script-generator`, `video-request-architect`, or `creative-qa`.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill narrative-design`.
- Hosted media capability: `postplus media capability --request <hosted-capability-request.json> --output <result.json>`.
- Use the capability request shape required by the selected workflow; do not call provider APIs directly.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
