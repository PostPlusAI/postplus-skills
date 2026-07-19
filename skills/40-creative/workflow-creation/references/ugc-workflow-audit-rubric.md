# Workflow Pre-run Audit Rubric

Use this rubric to judge whether a workflow definition on the PostPlus workflow platform is ready to launch. This is a pre-launch audit: it checks execution readiness, prompt quality, user-intent compliance, fact consistency, reference use, and evidence coverage before generation. It does not certify the final rendered video unless rendered output is explicitly provided and separately reviewed.

## Verdicts

- `pass`: structurally valid, fact-consistent, scope-compliant, and ready for pre-run execution.
- `revise`: fixable issues exist; the parent agent should edit source clips, prompts, workflow fields, references, or post-production artifacts and re-audit.
- `blocked`: required facts, assets, permissions, user intent, or product claims are missing and guessing would change the result.

`canRunNow` is true only for `pass`.

Set `preflightOnly: true` unless generated video/audio output was also inspected.

Separate these judgments:

- `canRunTechnically`: the definition passes platform validation and the launch gate would accept it.
- `worthRunning`: the workflow is likely worth spending a generation run on, given current intent, prompt controllability, product clarity, and creative readiness.

A workflow can be technically runnable and still need revision before it is worth running.

## Severity

- `critical`: likely launch-gate rejection, unsupported product claim, user-scope violation, missing blocking fact, or config contradiction likely to change output.
- `major`: weak hook, unclear product model, bad reference binding, post-production text inside generation prompt, overcoupled reference transfer, or significant prompt controllability issue.
- `minor`: polish, small density issue, non-blocking wording risk, or residual uncertainty that can be reported.

## Meta Principles

- **User Correction Priority**: the latest output-changing user correction beats older templates, sibling workflows, and the auditor's creative preference.
- **Layer Separation**: generation prompts, post-production instructions, audit rationale, reference image duties, and final reporting should not be mixed unless the user explicitly asks for that layer in-frame.
- **Change Minimality**: recommend the smallest truth-preserving fix. Delete, simplify, or separate before adding new constraints.
- **Run Worthiness**: do not pass a workflow only because it validates. Judge whether it is likely to make the intended viewer understand the product/action/payoff.

Start with the Three-Judge Frame:

1. **Advertiser Judge**: would the advertiser accept the product accuracy, claims, usage, reference handling, and brand safety?
2. **Viewer Judge**: would a real viewer keep watching, understand the hook/payoff, and feel the CTA as natural?
3. **Generator Judge**: can the downstream image, video, and audio models execute the prompt literally from concrete details and clear reference duties?

Then answer:

1. What is the user trying to preserve?
2. What is the workflow trying to make the viewer believe, feel, or do?
3. What could make it technically runnable but creatively wrong?

## 1. Input Coverage

Check whether the parent supplied enough task-local context:

- latest user request and explicit constraints
- latest output-changing user correction
- workflow id and the full definition read through `workflow_read` get
- brand/product/feature docs
- script, VO, or copy docs
- reference assets or descriptions
- benchmark/research notes when the workflow depends on a reference
- post-production brief/copy review if text hooks, overlays, captions, or end cards are expected

Revise or block if the workflow cannot be judged without guessing.

## 2. Intent Scope Lock

Audit against the user's latest authorized scope:

- exact VO preservation
- duration-only edits
- no new entities, claims, scenes, features, or characters
- analysis-only vs edit/regenerate request
- requested output filename, campaign location, model, format, or style
- required references or identity/product consistency

Mark a critical issue if the workflow violates explicit user intent even when the prompt is otherwise strong.

Do not convert a temporary preference into a permanent project rule. Treat it as the current task's intent lock.

## 3. Fact Lock

This is the Advertiser Judge's core section. Read provided brand/product/feature docs before judging claims.

Check:

- Product capabilities match task-local sources.
- Physical interaction mechanics are accurate.
- The viewer can understand what the product is, what the user does, and what happens next.
- Claims do not invent medical, legal, privacy, compliance, therapeutic, diagnostic, financial, guaranteed-result, or platform-specific capabilities.
- Missing facts are blocked instead of guessed.

Do not import facts from previous projects or examples into the audit. If a rule is project-specific, it must be present in the current task context.

## 4. Workflow Field Consistency

Check the current definition:

- The definition validation verdict is clean and the graph has generation video nodes.
- Each generation node uses an intended generation capability.
- Each clip duration sits inside the capability's supported range (typically `4-15s`).
- Aspect ratio, resolution, and audio generation knobs match intent.
- With an assembly node, every generation video node connects into an ordered assembly input slot; without one, independent clips are the stated intent.
- Workflow-name duration, total duration, and clip durations agree when the name includes seconds.
- Prompt cut ranges do not exceed the node's configured duration.
- Prompt aspect-ratio hints do not contradict node config.
- Labeled asset bindings and `<<<label>>>` references are internally consistent.

Fail if the launch gate would reject the workflow, or if config contradictions would likely produce the wrong format or content.

## 5. Prompt Hygiene

This is the Generator Judge's core section. Prompt quality is judged by controllability and layer separation, not impressive prose.

Check:

- Each prompt is self-contained enough for its clip.
- A still-image/reference prompt describes one stable frame, not a full video cut list or downstream edit plan.
- Generation prompts do not contain post-production plans, text hooks, subtitles, captions, end cards, overlay timing, optional disclaimers, or internal rationale unless explicitly requested in-frame.
- Negative constraints do not unnecessarily place banned or unwanted objects in model attention.
- Prefer positive visual descriptions over `do not/no/never/avoid` phrasing when possible. Do not build exhaustive banned-term walls.
- User negative constraints have been converted into concrete scene carriers when possible: action, expression, prop, light, camera angle, spoken line, or visible result.
- If a banned element carried story clarity or product proof, the prompt provides another specific way for the viewer to understand the same thing.
- Lines are placed inside the cuts they belong to, especially when switching between on-camera speech and VO.
- Watch for floating audio lines, a prompt controllability risk: the prompt has timestamped cuts and a separate script-like audio line, but the cuts do not bind the line to on-camera speech or VO.
- Watch for mixed speech posture: a cut may ask a visible person to address the lens while the same cut is labeled voiceover.
- Spoken density is realistic for the requested style. For English UGC, about `2.4-2.8 words/second` is typical; yapping-style talking-head briefs can use `3.0-3.8`; sensitive or premium categories often need `2.2-2.6`.
- For yapping-style briefs, beat density is high enough: every `1-2s` introduces a new claim, contrast, example, emotional beat, visual action, or punchline. Speed without new information is still low density.
- A new visual event or shot appears about every `1-3s`; `2-3s` should rarely pass without new action/detail.
- Micro-actions are concrete: glances, hand pauses, fidgets, breath, tiny nods, phone bobble, posture shifts, product interaction.
- Camera language is plausible for the intended ad type.

Revise generic acting notes, vague style adjectives, post-production leakage, mixed image/video duties, or long static talking-head sections unless intentionally required.

## 6. Creative Readiness

This is the Viewer Judge's core section. Check the ad as a viewer would understand it:

- First `0-5s`: concrete visual hook and viewer question.
- Pain point starts from a real human moment, not product features.
- Product enters as a natural replacement behavior or proof step.
- Product model is clear without overexplaining.
- Mechanism is one or two concrete proof steps, not a feature pile.
- Payoff is specific and modest, not magical or guaranteed.
- CTA is clear, suitable to tone, and not abrupt.
- Dialogue sounds like the intended creator/person, not a brand manifesto.
- The intended ad type is consistent: talking-head, scene-driven, product demo, testimonial, street interview, comparison, etc.
- The workflow has enough concrete behavior to support the lines; it does not rely on the person explaining everything to camera.

Revise if it feels like rough ad copy, feature dumping, or a brand storyboard disguised as UGC.

## 7. Reference Use And Transfer

This belongs to both Advertiser Judge and Generator Judge. References should guide structure and consistency, not cause copying.

Check:

- Identity/product/audio references are treated as binding when needed.
- Each attached reference has a clear job, scope, and boundary in the prompt; generic `use the reference` language is not enough.
- Reference image/audio/video duties are separated: identity, product accuracy, scene style, camera rhythm, voice, pacing, and room tone should not be accidentally blended.
- Pre-product clips do not accidentally bind or mention product references when the product should not appear yet.
- Backgrounds, outfits, UI, readable text, objects, or claims from a reference do not transfer unless explicitly intended.
- Benchmark ads are used for hook logic, visual rhythm, line-to-shot relationship, and product-entry structure.
- The workflow does not copy a benchmark's exact person, wardrobe, setting, object sequence, joke, CTA, or visual composition unless explicitly licensed/requested.
- Similar workflows in a batch do not all reuse the same formula in a way that creates template fatigue.

Revise overcoupled prompts by changing scene-specific actions, bridge language, CTA, visual rhythm, or proof moment while preserving the underlying ad logic.

## 8. Evidence Readiness

Report what the audit actually verified:

- definition fields read through `workflow_read`
- post-production briefs when supplied
- brand/product facts from docs
- reference descriptions or accessible assets
- benchmark analysis
- transcript or VO word count
- generated output evidence, if any

If no rendered output is supplied, do not claim final video quality. Mark `preflightOnly: true` and list render risks.

## Required Audit Output

Return concise structured Markdown or JSON:

```json
{
  "verdict": "pass | revise | blocked",
  "canRunNow": false,
  "canRunTechnically": false,
  "worthRunning": false,
  "preflightOnly": true,
  "preflightQuestions": {
    "userTryingToPreserve": "",
    "viewerBeliefFeelingAction": "",
    "technicallyRunnableButCreativelyWrongRisk": ""
  },
  "latestCorrectionApplied": "yes | no | none-provided",
  "runWorthiness": "Why this is or is not worth a generation run now",
  "evidenceCoverage": {
    "workflowDefinition": "verified",
    "productFacts": "verified | missing | inferred",
    "postProductionBrief": "present | missing | not-needed",
    "renderedOutput": "not-reviewed"
  },
  "intentScopeIssues": [
    {
      "severity": "critical | major | minor",
      "evidence": "Specific user-intent mismatch",
      "fix": "Minimal parent-agent fix"
    }
  ],
  "factConsistencyIssues": [],
  "workflowFieldIssues": [],
  "promptHygieneIssues": [],
  "creativeIssues": [],
  "referenceIssues": [],
  "postProductionBriefStatus": "present | missing | not-needed",
  "parentFixInstructions": [
    "Exact edits the parent should make, or blocker reason"
  ],
  "residualRisks": [
    "Risks that remain after pre-run audit"
  ]
}
```

Keep the report practical and concise. Lead with why it can or cannot run now; avoid exhaustive lists when one root issue explains the failure.
