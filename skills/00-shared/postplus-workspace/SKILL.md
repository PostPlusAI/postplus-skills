---
name: postplus-workspace
description: Establish reusable brand facts from an official website, use the shared PostPlus brand and file library, and maintain optional local project context. Keep saved brand facts and research separate.
metadata:
  postplus:
    familyId: workspace-publishing
    familyName: Workspace, Publishing, and Meta
---

# PostPlus Workspace

Start with an official website, supplied brand materials, an existing PostPlus brand, saved files, or an explicitly
requested project folder. Reuse confirmed facts across Web, CLI and MCP. A local folder is optional and never required
for independent production. The agent owns context selection; the current CLI/server own schemas, revisions,
permissions, costing, execution and recovery. Specialist skills own domain judgment.

## Core Contract

1. Read the selected cloud brand/version or relevant local context before acting.
2. Separate confirmed facts, approved claims, research, hypotheses and unknowns.
3. Never invent product facts, prices, offers, identities, files or approvals.
4. Ask when missing/conflicting information changes truth, intent or execution.
5. Make reversible low-risk choices within the user's scope without extra gates.
6. Discover current capabilities through the catalog and command help.
7. Reuse task/standing spending authorization; confirm changes to approved truth,
   publication, live advertising budgets and other unapproved external actions.
8. Preserve original request identity on retries; retain actual results and cost.

## Route

| Request | Route |
| --- | --- |
| Build or improve a Brand Kit from a website, pasted text or documents | Analyze and save a shared Brand Kit |
| Use a brand or saved files | Read the shared personal library |
| Create a project folder | Initialize local workspace |
| Start a campaign or continue a project | Read stage context, then route |
| Research, strategy, testing or production | Read relevant facts and specialist skill |
| Analyze performance | Record observations, conclusions and next hypothesis |

## Analyze And Save A Shared Brand Kit

Read [brand-analysis.md](references/brand-analysis.md) for both website and material inputs. It owns the analysis method
and mapping to Brand Kit content. The current conversational AI performs the synthesis; website extraction and the guide
do not start an additional model or spend generation credits. Cloud brand work requires neither a local folder nor a
Python setup check.

1. Resolve the intended brand. Reuse its ID from the conversation, or search
   `postplus library brands --json` when it is unknown. For updates, read
   `postplus library brand <id> --json` and retain its complete content/revision.
2. Read the supplied source:
   - Official website: run
     `postplus library brand-website --url <official-https-url> --json`.
     Use `preview.content`, `preview.website_context` and
     `preview.analysis_guide` together.
     Extraction may save verified website images; it does not save brand facts.
     Retain actual page/image failures and coverage limits.
   - Pasted text or documents: read the material with the current host's supported
     tools, then run `postplus library brand-guide --json` for the same
     `analysis_guide.instructions` and current
     `analysis_guide.content_schema`. This command supplies guidance;
     it does not open, upload or parse a file. If a supplied file is unreadable,
     name the exact unread portion and continue with the sources you can read.
3. Apply the analysis method to the evidence. Go beyond copying the homepage:
   connect product mechanism and use to benefits, audience situations, objections,
   proof and voice. Preserve meaningful detail without filling unsupported facts.
4. For a requested creation/update, save the in-scope result with
   `postplus library brand-save-current <id> --revision <n> --file <content.json>`.
   The request authorizes ordinary organization and grounded analysis: do not add
   a separate review prompt or ask users to approve each field. A request only to
   inspect, compare or preview ends before saving. Ask narrowly for a material
   identity/evidence conflict or an unrequested change to approved meaning;
   unrelated useful work continues.
5. Read the saved result with `postplus library brand <id> --json`. Save makes it
   usable immediately across Web, CLI and MCP. In MCP, call `library_brand` for
   that same ID to display the editable card. Never claim a save from a prepared
   payload, a timeout or a preview alone.

MCP uses `library_preview_brand_website` for the URL route and `library_brand_guide` for material analysis, then
`library_save_current_brand` and `library_brand`. These are the same shared library boundary as CLI/Web. The returned
`analysis_guide.content_schema` is authoritative for structure; never invent fields because a template contains a useful
concept.

For updates, merge only requested changes into the latest complete content; retain unrelated manual writing, custom
chapters, media and stable IDs/order. Initial creation uses one new brand UUID and revision 0. Retry the exact same ID,
revision and content after an uncertain outcome. On a revision conflict, reread and replay only edits whose original
passages have not changed. If both writers changed a passage, retain both and resolve only that passage with the user.
Normal saves need no separate adoption step. Old `brand-save` / `brand-adopt` are only for an explicitly requested
separate draft journey.

Use `postplus library brand-use <id> --sections facts,voice,visual --json` (or `library_resolve_brand`) to select
context for later work. Retain the returned brand/version identity with the brief. Choose actual file inputs and roles
separately; organizing a Brand Kit does not generate assets or launch ads.

## Read The Shared Personal Library

Search files with `library assets`; reuse the original permanent `postplus-media://` reference instead of reuploading.
Signed preview URLs expire. Archive/restore changes organization only. Permanent deletion needs explicit intent;
unfinished deletion stays discoverable in archived assets and resumes that same deletion. Never delete originals as
routine cleanup or rerun a paid operation because catalogue registration failed. Recover completed Web tasks with
`postplus library recover-task <original-task-id>`; hosted generation recovery continues its original operation ID
through the media command.

Local `brand.md` / `product.md` / `audience.md` can be read as supplied materials for the analysis route above, or
exported from a chosen snapshot. No implicit bidirectional overwrites. Campaign plans, full research reports and
hypotheses remain project context, not adopted facts.

## Initialize An Explicitly Requested Local Workspace

1. Resolve the target and inspect existing files. Do not scatter files elsewhere.
2. Run `postplus doctor --skill postplus-workspace --json`. If Python is missing,
   follow its concrete action; stop that local initialization if none is given.
3. Resolve this installed skill root and run:

```text
<python-3-command> <skill-directory>/scripts/workspace.py init \
  --target <folder> --project "<project name>" \
  --output <folder>/.postplus/workspace-init.json
```

Optional `--brand`, `--product`, `--market`, `--platform` use only sourced/user values. The entrypoint creates missing
files and rejects unsafe targets. Fill confirmed facts, preserve `UNKNOWN`, then run the onboarding check.

## Continue A Local Project Or Campaign

Read the nearest `project.yaml`, applicable `AGENTS.md` and only stage-relevant files from
[context-schema.md](references/context-schema.md). Route to the specialist skill and resume recorded work rather than
recreating it. To initialize a requested campaign, use the same entrypoint's `new-campaign` with `--target`, `--name`,
optional `--slug` and an explicit `--output` report. Fill objective, market, platform, offer, CTA, KPI, constraints and
approval state; set `current_campaign` only for the intended campaign.

## Stage Checks And Durable Results

Follow [stage-gates.md](references/stage-gates.md). Run the workspace entrypoint's `check --target <folder> --stage
<stage> --output <report.json>` before high-impact local execution. Stages: onboarding, research, strategy, test,
production, launch, learn. `BLOCKED` stops the affected stage; local `READY` never replaces current prices, balance,
provider validation, authorization or live state. For campaign stages, pass `--campaign <intended-campaign-slug>` and
confirm the returned campaign matches the intended one before using its readiness result. Use
[uncertainty-policy.md](references/uncertainty-policy.md) for material gaps. Save confirmed results, actual cost, chosen
brand/version and next actions in the relevant cloud record or requested workspace. Explain blockers and the next useful
action concisely. Local templates are in `assets/project-template/`.