---
name: postplus-workspace
description: Initialize and operate a durable local PostPlus creative workspace across product onboarding, research, strategy, test planning, production, launch, and learning. Use when starting or resuming a PostPlus project folder, checking stage readiness, maintaining approved product and campaign context, or routing repeated work through current PostPlus skills and CLI capabilities.
metadata:
  postplus:
    familyId: workspace-publishing
    familyName: Workspace, Publishing, and Meta
---

# PostPlus Workspace

Turn one resolved project folder into the durable context and control surface for
repeated PostPlus work. Use `postplus-shared` first for shared public rules,
source-of-truth guidance, work-folder handling, and local dependency handling.
This skill owns workspace orchestration. Specialist PostPlus skills own domain
judgment. The current PostPlus CLI and server own schemas, validation, cost,
permissions, and provider execution.

## Core Contract

1. Read the workspace before acting.
2. Keep confirmed facts, approved claims, research findings, hypotheses,
   defaults, unknowns, and forbidden content distinct.
3. Never invent product facts, prices, offers, identities, references,
   permissions, approvals, or results.
4. Ask only when missing or conflicting information changes truth, strategy,
   identity, execution, compliance, spend, or publishing.
5. Make reversible low-risk production choices without asking.
6. Discover current PostPlus capabilities by catalog and CLI schema instead of
   maintaining a hard-coded skill inventory.
7. Require explicit approval before changing approved truth, approving a test
   plan, spending credits, launching, publishing, or changing live ads.
8. Return durable results and decisions to the workspace.

## Route

| Request | Route |
| --- | --- |
| Start a PostPlus project folder | Initialize workspace |
| Start a campaign or test cycle | Initialize campaign |
| Continue an existing project | Resume workspace |
| Diagnose missing context | Check the requested stage |
| Research, strategy, testing, or production | Read stage context, then route to the current specialist skill |
| Quote, launch, publish, or change spend | Validate with the current CLI, then obtain explicit approval |
| Analyze performance | Record observations, conclusions, scope, and next hypothesis |

## Initialize Workspace

1. Resolve the exact target folder and inspect existing files.
2. Run `postplus doctor --skill postplus-workspace --json`. Follow
   `postplus-shared` if the Python 3 dependency is missing.
3. Resolve this installed skill directory and run:

```text
<python-3-command> <skill-directory>/scripts/workspace.py init \
  --target <folder> --project "<project name>" \
  [--brand "<brand>"] [--product "<product>"] \
  [--market "<market>"] [--platform "<platform>"] \
  --output <folder>/.postplus/workspace-init.json
```

Pass only user-supplied or reliably sourced values. The entrypoint creates
missing files only and rejects filesystem roots, the user home directory, and
installed skill directories.

Read existing source materials, fill only confirmed information, preserve
`UNKNOWN`, then run the onboarding check.

## Initialize Campaign

Run:

```text
<python-3-command> <skill-directory>/scripts/workspace.py new-campaign \
  --target <workspace> --name "<campaign name>" [--slug <campaign-slug>] \
  --output <workspace>/.postplus/campaign-init.json
```

Fill the objective, market, platform, offer, CTA, KPI, constraints, and approval
state. Set `current_campaign` in `project.yaml` only after confirming the
intended campaign.

## Resume And Execute

1. Find the nearest `project.yaml` at or above the working directory.
2. Read the nearest applicable `AGENTS.md`, then `project.yaml`.
3. Read only the stage context listed in
   [context-schema.md](references/context-schema.md).
4. Run the workspace stage check before high-impact execution.
5. Read the selected specialist skill completely.
6. Read current CLI help or schema immediately before CLI execution.
7. Continue from recorded state instead of recreating prior work.

If no workspace exists, offer initialization. Do not scatter project files into
an unrelated folder.

## Stage Rules

Follow [stage-gates.md](references/stage-gates.md) for onboarding, research,
strategy, test, production, launch, and learning requirements. The bundled
checker validates workspace files only; current quotes, provider validation,
permissions, accounts, and live state remain authoritative at the CLI or server
boundary.

Read [uncertainty-policy.md](references/uncertainty-policy.md) when information
is missing, conflicting, or a repair could change meaning.

## Check Workspace

```text
<python-3-command> <skill-directory>/scripts/workspace.py check \
  --target <workspace> \
  --stage <onboarding|research|strategy|test|production|launch|learn> \
  [--campaign <campaign-slug>] \
  --output <workspace>/.postplus/stage-check.json
```

Treat `BLOCKED` as a stop for the affected stage. A local `READY` result does
not replace current CLI validation, quote confirmation, or launch approval.

## Status

End substantive tasks with:

```text
STAGE: <stage>
STATUS: READY | BLOCKED | NEEDS_APPROVAL | COMPLETED
INPUTS READ: <sources>
BLOCKERS: <none or exact blockers>
OUTPUTS: <created or updated artifacts>
NEXT: <one next action>
```

## Resources

- [context-schema.md](references/context-schema.md): ownership and loading rules
- [stage-gates.md](references/stage-gates.md): stage and approval gates
- [uncertainty-policy.md](references/uncertainty-policy.md): ask, assume, and repair boundaries
- `assets/project-template/`: workspace and campaign templates
- `scripts/workspace.py`: non-destructive initialization and local stage checks
