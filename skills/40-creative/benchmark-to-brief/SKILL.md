---
name: benchmark-to-brief
description: Turn validated benchmark research into campaign briefs and concept candidates for short-form video production. Use this when you already have research artifacts such as reports, master tables, pattern tables, or comment analyses and need to produce fact-grounded briefs, concept lists, hook options, or test plans. This skill must stay anchored to real source data and should not invent angles, personas, or claims that are not supported by the available research.
---

# Benchmark To Brief

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

Use this skill after research already exists.

This skill is the strategy and creative handoff layer between research and execution.
It should consume validated findings and turn them into usable planning inputs before copywriting, production, outreach, or publishing moves forward.

This skill is for converting structured evidence into:

- campaign briefs
- concept candidates
- hook families
- test matrices
- variable-control plans

It is not for greenfield brainstorming.

## Fact Rule

Everything produced by this skill must be grounded in available evidence.

Allowed evidence sources include:

- benchmark reports
- master tables
- pattern tables
- strategy tables
- comment analyses
- validated performance data

Do not invent:

- target personas with no source basis
- hooks that contradict benchmark wording
- unsupported product claims
- audience motivations not reflected in data

If the evidence is incomplete, say so explicitly and separate:

- `Observed from sources`
- `Inference`
- `Open question`

## Default Workflow

### 1. Load the smallest sufficient evidence set

Prefer the most structured sources first:

1. final report
2. strategy table
3. pattern table
4. video master table
5. comment summaries

Do not read everything by default if the answer is already supported.

## Source Selection Rule

Prefer the smallest sufficient evidence set already present in the active project.
If the current task clearly belongs to one client or project folder, start there.
Do not assume one client folder is the global default for all future work.



When the master table contains shot-level fields, treat them as a stronger source than your own rewrite instincts:

- `videoOpeningLineExact`
- `videoClosingLineApprox`
- `videoShotTimeline`
- `videoSpokenAudioFlow`

Those fields should guide the opening shell, information order, pacing, and closing style of any derived concept or script brief.

### 2. Extract facts before proposing

Always extract:

- winning lanes
- repeated hook shells
- repeated structure types
- visual format tendencies
- repeated user-language patterns
- strong benchmark examples

Before writing concepts, write down what is actually true.

### 3. Map facts to brief fields

For each concept or brief recommendation, tie it back to:

- source artifact
- relevant benchmark ids or examples
- reason this pattern fits the product

Each concept should answer:

- what problem is being cut
- what hook shell is being reused
- what content lane it belongs to
- what variable is being tested
- which research evidence supports it

### 4. Keep concept scope narrow

Do not generate vague ideas like:

- "make a productivity video"
- "do a relatable AI ad"

Prefer:

- one problem
- one hook family
- one format
- one test variable

### 5. Preserve benchmark language

When adapting hooks, preserve the source shell whenever possible.

Do not "improve" benchmark phrasing unless the user asks for a variant test.

Good adaptation:

- benchmark: `Here is a Gmail trick I guarantee you didn't know.`
- adapted: `Here is a Gmail reply shortcut I guarantee you didn't know.`

Bad adaptation:

- rewriting into abstract brand language
- replacing concrete pain with generic value claims

## Output Shapes

Common outputs for this skill:

- campaign brief
- 10 concept candidates
- hook library
- lane prioritization
- AB test matrix

These outputs should be treated as execution inputs, not end-user proof that the underlying research happened.
If the upstream research is still fuzzy, thin, or contradictory, stop and surface that gap before turning it into a brief.

### Campaign Brief

Include:

- objective
- priority lanes
- persona constraints if supported by data
- approved hook families
- prohibited directions
- variables to test
- source basis

### Concept Candidate

Each concept should include:

- `conceptId`
- `problemToCut`
- `hookType`
- `hookDraft`
- `targetLane`
- `formatType`
- `whyThisFits`
- `sourceBasis`
- `testVariable`

## Source Basis Requirement

Every concept list should include a `sourceBasis` section.

Example:

- final report says `workflow` is the top-priority lane
- final report says high-value language includes `Stop switching tabs`
- pattern table shows `gmail_fix_or_hidden_setting` is high fit
- master table contains strong Gmail pain/tutorial examples

If you cannot cite source basis, do not present the idea as recommended.

## Downstream Handoff Rule

This skill should usually hand off to one of these next layers:

- script, concept, or production planning
- asset generation workflows
- content packaging workflows
- outreach or publishing only when the content has already been turned into approved execution-ready material

Do not hand raw research directly into publishing from this skill.
First make the execution object explicit: brief, concept list, hook set, script, or approved copy.

## Project-Specific Guidance（if user specificly state a project preference when using this skills, wirting down and memory it）


## Failure Mode

Stop and state the gap if:

- the available data is too thin
- strong benchmarks do not exist for the requested direction
- the user asks for a claim the evidence does not support

Then offer:

- the closest evidence-backed option
- what additional research would be needed
