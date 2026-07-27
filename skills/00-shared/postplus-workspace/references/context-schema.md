# Context Schema

## Authority Model

Keep each fact in one owning document:

| File | Owns | Lifecycle |
| --- | --- | --- |
| `project.yaml` | Project identity, active campaign, durable approval records | Project |
| `brand.md` | Positioning, voice, visual boundaries, forbidden language | Brand |
| `product.md` | Identity, facts, approved claims, proof, use, warnings | Product or SKU |
| `audience.md` | Segments, demand states, triggers, objections, trusted proof | Product and market |
| `persona.md` | Narrator identity, credibility, delivery, continuity | Reusable persona |
| `assets.md` | References, duties, preservation boundaries, permissions | Product or campaign |
| `hooks.md` | Hook ideas and tested status | Living product memory |
| `campaign.md` | Objective, market, platform, offer, CTA, KPI, constraints | Campaign |
| `creative-strategy.md` | Testable creative hypotheses | Campaign iteration |
| `test-plan.md` | Test cells, controls, metrics, and decisions | Test cycle |
| `production-brief.md` | Script, shots, references, and configuration | Creative unit or batch |
| `results.md` | Observations, conclusions, scope, and next action | Test cycle |

Do not duplicate stable product truth inside campaign files. Reference it and
state only campaign-specific choices.

## Information Classes

- `CONFIRMED`: Supported by the user, official material, or an approved source.
- `APPROVED CLAIM`: Confirmed wording or boundary authorized for advertising.
- `RESEARCH FINDING`: Sourced external evidence that may inform strategy.
- `HYPOTHESIS`: A performance assumption that needs testing.
- `DEFAULT`: A reversible execution choice selected by the agent.
- `UNKNOWN`: Missing information.
- `FORBIDDEN`: Explicitly disallowed content or action.

Never silently change an information class. Customer comments, competitor
claims, research findings, and model inference are not product facts.

## Source Priority

When sources materially conflict, report the conflict instead of merging them.
Otherwise use:

1. Current explicit user correction
2. Approved official product or brand source
3. Current project source-of-truth file
4. Sourced research evidence
5. Agent inference

Approval and compliance boundaries override creative preference.

## Required Reading

| Stage | Read |
| --- | --- |
| Onboarding | `project.yaml`, `brand.md`, `product.md`, `assets.md` |
| Research | Onboarding files plus the current research request and active campaign scope when present |
| Strategy | `brand.md`, `product.md`, `audience.md`, `persona.md`, `hooks.md`, active `campaign.md` |
| Test | Strategy files plus `creative-strategy.md` and `test-plan.md` |
| Production | `brand.md`, approved `product.md`, `assets.md`, `persona.md`, `test-plan.md`, active brief |
| Launch | `project.yaml`, approved test plan, production brief, current validation and quote |
| Learn | `test-plan.md`, creative and run identifiers, normalized performance data, `results.md` |

Read more only when it changes the task. Do not load every historical campaign.

## Mutation Rules

- A campaign may reference product truth but may not redefine it.
- Research may propose a product-truth patch but may not apply it.
- Production may improve expression but may not silently change strategy.
- Results may update hook status and strategy evidence but not product truth.
- Semantic changes to approved content require a proposed patch and explicit
  confirmation.
- Approval records must retain status, approver, approval time, and campaign
  binding when the approval is campaign-specific.
- Live launch authorization is not durable workspace truth. The current CLI
  quote-confirmation boundary remains authoritative.

## Traceability

Every produced creative should retain:

- `creative_id`
- `hypothesis_id`
- audience, angle, ad type, and hook ID when applicable
- changed and controlled variables
- source approval state
- workflow or run identifier when executed

Without this mapping, record performance as an observation only. Do not claim
causal learning.
