---
name: workflow-creation
description: Create, revise, validate, or audit reusable video-production workflows on the PostPlus workflow platform - the node canvas that turns scripts, reference assets, and per-clip prompts into approved, quoted, human-launched video runs. Use for workflow creation requests, 创建工作流, 搭建工作流, multi-clip UGC workflow design, converting a product idea, hook, script, or reference analysis into generation-node workflows, revising an existing workflow, and pre-launch workflow audits.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Workflow Creation

## Purpose

Design one reliable video-production workflow on the PostPlus workflow platform for UGC-style multi-clip video generation. The user-facing deliverable is a named workflow on the user's account with a saved definition version, ready to quote and launch. Do not produce standalone definition files, exported JSON graphs, audit packets, or post-production notes unless the user explicitly asks.

Quality checks are internal; do not ask the user whether to run QA. Ask only when missing brand, product, reference, workflow-goal, naming, or claim-boundary facts would change the workflow.

## Platform Tool Surface

Workflow authoring is ONE server-validated capability with two front doors. Use whichever the current session exposes — never mix them, and never bypass server validation:

- **Workspace assistant typed tools**: `workflow_read` (resolve by name via `action=list`, inspect nodes/slots/versions via `get`, read runs via `runs_get`), `workflow_author` (`create` a blank or template-seeded workflow; `propose_edit` structural edits - `add_node` / `update_node` / `remove_node` / `connect_nodes` - returning an honest validation verdict without persisting), `apply_workflow_edit_to_canvas` (same operations when the user's live canvas is attached), `save_workflow_version` (persist a proposal; always human-approved), then `quote_workflow_run` and `launch_workflow_run`.
- **CLI agent `postplus workflow` commands** - the same verbs, results as JSON, requiring a logged-in session (`postplus auth login`): `postplus workflow list` / `show` and `runs` / `run-show` (read), `create`, `propose` (= `propose_edit`: preview + validate, persists nothing), `save` (= `save_workflow_version`: persist a new immutable version), `quote`, and `launch`. Structural edits go in a `--operations` JSON array of the same `add_node` / `update_node` / `remove_node` / `connect_nodes` ops. Run `postplus workflow help` for exact flags.

The two surfaces map one-to-one onto the same hosted verbs and the same validation; `propose` mirrors `propose_edit`, `save` mirrors `save_workflow_version`, `quote` mirrors `quote_workflow_run`, `launch` mirrors `launch_workflow_run`.

Boundaries:

- Resolve ids, never guess them; ambiguous name matches go back to the user as candidates.
- Never hand-write a full definition document. Build structure through create plus edit operations and let the server validate; if `validation.ok=false`, fix the listed errors and re-propose. The server never silently repairs.
- Persist only on human approval (`save_workflow_version` / `postplus workflow save`), and never launch without explicit user approval - quote first, report the reserved credits, and on the CLI pass the quoted `reservedMillicredits` as `--max-reserved-millicredits` together with `--confirm` (launch refuses to run without both).
- If NEITHER surface is available in the current session (no workspace assistant tools and no logged-in CLI), do not fabricate a definition or any substitute file format. Say workflow authoring needs the PostPlus workspace assistant or a logged-in `postplus` CLI, and route one-off render requests to `video-batch-runner`.

## Workflow Shape Defaults

- A workflow is a node canvas: generation video nodes (one clip each, each holding its own model-facing prompt plus duration / aspect ratio / resolution / audio knobs in node config) and an optional single assembly node with ordered clip input slots.
- With an assembly node, every generation video node must connect into an assembly slot; slot order is cut order. Without one, each node delivers an independent clip.
- Passive reference material (creator image, product image, voice sample) is bound as labeled workflow assets referenced from prompts by `<<<label>>>`; script text can enter as an asset node. Assets do not execute.
- Knob values come from the node's selected generation capability; canvas validation and the launch gate are authoritative. Typical UGC defaults: `9:16`, `720p`, `4-15` seconds per clip, audio generation on.
- Multi-version output = launching several instances, not duplicating nodes. Name workflows `{case-or-brand}-{script-feature}-{duration}s-v{version}` unless the user names one.

## Decision Router

Apply the first matching route:

| If | Then |
| --- | --- |
| User asks to review, audit, QA, validate, approve, or inspect a workflow | Run L2 |
| Sensitive claims, exact preservation, conflicting facts, rendered-output failures, or batch work | Run L2 |
| User asks to review logic/cut design first, or a complex narrative ad has unlocked hook, pain beat, product entrance, proof/value beat, CTA, or post-production boundary | Return a short cut plan for approval before building |
| User provides or asks for scripts, 人物图, product 图, reference assets, or per-clip references | Use Script-Locked Asset Mode |
| Visible product has no product image | Ask by default; generate product imagery only when explicitly permitted |
| Missing facts would change claims, references, workflow behavior, or naming | Ask the smallest necessary question |
| Otherwise | Normal mode: read `references/prompt-quality.md`, write clip prompts, build with `workflow_author`, run L0/L1 |

## Three-Judge Frame

Judge every workflow with three lenses; the rules below only serve these judgments.

- **Advertiser Judge**: product appearance, claims, usage, references, and compliance boundaries match the task-local facts an advertiser would trust.
- **Viewer Judge**: the clip starts from a believable human moment, holds attention, and lands a natural CTA - not a feature announcement.
- **Generator Judge**: downstream models can execute the prompt literally from concrete visible details, clear reference duties, isolated clip scope, and positive scene construction.

## Sidecar Guardrail Principle

Guardrail diagnoses, prompt compiles. Business-experience guardrails are sidecar audit checks, not model-facing prompt language. Use them to spot risks (static pacing, audio voids, spatial drift, entity leakage), then translate the smallest truth-preserving repair into positive scene carriers: action, sound source, movement path, prop handling, camera behavior, or a spoken line. Never paste guardrail categories, audit rationale, or banned-term walls into generation prompts.

## Workflow-First Contract

1. **Lock** only the needed context: user intent, product facts, claim limits, references, duration, exact hook/VO to preserve, and stated exclusions. If narrative logic is the gap, lock a compact cut plan first (hook, pain beat, product entrance, proof/value beat, CTA, post-production boundary).
2. **Prompt** after reading `references/prompt-quality.md`. Resolve `do not/no/avoid/不要` into positive scene carriers; bind every reference to a job, scope, and boundary. Duration, aspect ratio, resolution, and audio generation belong in node config, never restated as prompt text.
3. **Build** through `workflow_author` (or `postplus workflow create` / `propose`): create (blank or template), then propose the node/edge/config structure with edit operations.
4. **Validate** with the returned verdict plus the internal quality gate. Fix truth-preserving issues directly; block only for missing facts that would change claims or behavior.
5. **Persist and launch** on human approval only: `save_workflow_version` (or `postplus workflow save`), then `quote_workflow_run` (or `postplus workflow quote`), report the reserved cost in credits (millicredits ÷ 1000), and `launch_workflow_run` (or `postplus workflow launch ... --confirm`) after explicit approval - pass the quote's `reservedMillicredits` as `maxTotalReservedMillicredits` / `--max-reserved-millicredits` and the exact workflow name as `workflowTitle` / `--title`.
6. **Handoff** workflow name and id, saved version, validation status, quote/launch status, and meaningful blockers or residual risks. Runs are asynchronous with human review gates - report state and the workflow page link; do not poll a run to completion.

## Script-Locked Asset Mode

Trigger when the user plans a script first, mentions 人物图 / product 图 / reference images, provides product images without a creator image, or wants per-clip references. Lock the script (hook, lines, CTA, total duration, product actions, claim limits) before graph construction; lock `creator_identity`, `product_reference`, `voice_reference`, and `style_reference` as labeled assets; plan clips with duration, beat, product presence, and scene-reference needs. Prefer the graph `creator identity image -> per-clip scene image -> per-clip generation video -> assembly`. Read `references/asset-locked-workflow.md` only when this mode triggers, and follow its build order.

## Prompt Contract

Write only model-facing generation instructions; keep internal constraints, scene carriers, and the final model prompt as separate layers. Every generation node prompt needs: reference bindings with job/scope/boundary, real handheld UGC style and setting, one speech posture (`on-camera spoken` / `voiceover` / `silent`), timestamped cuts with concrete actions and cut-bound spoken text, audio rules, and visual constraints with positive replacements for unwanted UI/text/logos. Keep claims inside task-local facts; keep clip references isolated; use spoken density (typical `2.4-2.8` words/second; yapping `3.0-3.8` only on request; trust-sensitive `2.2-2.6`) as the duration rule, and require a new beat every `1-2s` for high-density briefs. Every cut must be physically executable by one plausible camera operator. Full doctrine, examples, and camera grammar live in `references/prompt-quality.md`.

If the user wants external music, later sound design, or a silent workflow, turn the node's audio generation off and remove spoken dialogue and voice references from prompts.

## Internal Quality Gate

**L0 hard check** (always, from the propose result and `workflow_read` get): validation verdict clean; with an assembly node every generation node feeds an ordered slot; every generation node has intended prompt + duration / aspect / resolution / audio config and reference bindings; name-embedded duration matches total clip duration; prompts carry no post-production leakage, negative-composition phrasing, or unsupported medical/legal/guarantee claims. Treat scan hits as signals; fix only what affects launchability, factuality, or generation quality.

**L1 self review** (default before handoff): Truth - latest intent and constraints preserved, no invented entities, features, claims, or UI. Watchability - first `0-5s` creates a viewer question; product entry is believable; payoff and CTA read naturally. Executability - prompts stay model-facing; references isolated with explicit duties; negatives compiled into positive carriers; cuts physically plausible. Apply small truth-preserving fixes and re-run L0.

**L2 deep review** (auto-trigger; never ask): sensitive claims; exact-preservation requirements; edits made outside the propose/validate loop; L0 contradiction signals; conflicting facts or references; batch work; 30s+ multi-clip continuity of person/product/setting/story; multi-area scene topology; reported rendered-output issues; or an explicit review request. Read the full definition via `workflow_read` get, then `references/ugc-workflow-audit-rubric.md`; add `references/ugc-sidecar-guardrails.md` for rhythm/audio/spatial/leakage triggers, treating sidecar findings as diagnostics unless they expose factual, product, compliance, or reference-binding issues. For assembled videos, review cross-clip continuity of identity, props, locations, dialogue flow, and post-production leakage. Use a fresh review context per workflow when independent review helps; reviewers only review, the parent owns edits via propose/apply operations. Stop after pass, blocker, or 3 review-revision cycles; block and ask the smallest question only when missing facts would change claims.

## Cost And Launch Discipline

Launching spends real credits: always quote first, report the reserved credits, and never launch without explicit user approval. On the CLI, `postplus workflow launch` refuses to run without `--confirm` and an acknowledged `--max-reserved-millicredits` ceiling; the server re-quotes and aborts if the fresh reservation exceeds it, so the confirmed cost bound stays binding. Runs pause at human review gates (per-clip approval, final review) - report run state and the workflow page link instead of sitting in a polling loop.

## Handoff

Report the workflow name and id, saved version number, validation status, quote or launch status with reserved credits, and blocked facts or meaningful residual risks. Do not expose internal QA steps, review cycles, or audit rationale unless the user asks.
