---
name: benchmark-to-brief
description: Turn validated benchmark research into campaign briefs and concept candidates for short-form video production. Use this when you already have research artifacts such as reports, master tables, pattern tables, or comment analyses and need to produce fact-grounded briefs, concept lists, hook options, or test plans. This skill must stay anchored to real source data and should not invent angles, personas, or claims that are not supported by the available research.
metadata:
  postplus:
    familyId: media-production
    familyName: Media and Creative Production
---

# Benchmark To Brief

## Use When
- Turn validated benchmark research into campaign briefs, concept candidates, hook libraries, lane priorities, or test matrices.
- Use after research already exists; this is the strategy handoff between evidence and execution.

## Do Not Use When
- The task is greenfield brainstorming without source evidence.
- The user needs final scripts; return a script-ready brief and send it to the human script review gate.
- The user needs visual generation; hand off to asset generation workflows after the evidence-backed brief exists.

## Required Input
- Validated evidence such as benchmark reports, master tables, pattern tables, strategy tables, comment analyses, or performance findings.
- For the structured artifact, input JSON with `corePromise`, `hookOptions`, `workflow`, `sourceFacts`, and `sourceBasis`.

## Fact Rule
Everything produced by this skill must be grounded in available evidence.

Do not invent:
- target personas with no source basis
- hooks that contradict benchmark wording
- unsupported product claims
- audience motivations not reflected in data

If evidence is incomplete, separate:
- `Observed from sources`
- `Inference`
- `Open question`

## Default Workflow
1. Use the smallest sufficient evidence set already supplied or explicitly identified by the user.
2. Prefer structured artifacts first: final report, strategy table, pattern table, master table, then comment summaries.
3. Extract facts before proposing: winning lanes, repeated hook shells, repeated structure types, visual format tendencies, user-language patterns, and strong examples.
4. Map facts to brief fields: source artifact, benchmark ids or examples, why the pattern fits the product, and variable being tested.
5. Keep each concept narrow: one problem, one hook family, one format, one test variable.
6. Preserve benchmark language when adapting hooks unless the user asks for variant testing.
7. Return an execution object: brief, concept list, hook set, script input, or approved copy.

## Judgment Flow
For every recommendation, answer:
- what problem is being cut?
- what hook shell is being reused?
- what content lane does it belong to?
- what variable is being tested?
- which source evidence supports it?
- what claim or audience motivation is only inference?

## Stop Conditions
- Stop when required user intent, source evidence, or owned input artifacts are
  missing and guessing would change the result.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.

## Output Shape
Common outputs:
- campaign brief
- concept candidates
- hook library
- lane prioritization
- AB test matrix

Campaign brief fields:
- `objective`
- `priorityLanes`
- `personaConstraints`
- `approvedHookFamilies`
- `prohibitedDirections`
- `variablesToTest`
- `sourceBasis`

Concept candidate fields:
- `conceptId`
- `problemToCut`
- `hookType`
- `hookDraft`
- `targetLane`
- `formatType`
- `whyThisFits`
- `sourceBasis`
- `testVariable`

## Anti-Patterns
- vague ideas like "make a productivity video"
- copying benchmark content without adapting the concrete product variable
- rewriting concrete benchmark language into abstract brand claims
- treating raw research as execution-ready without a brief or concept object
- passing raw research directly into publishing

## Handoff
- Return the structured output or an explicit evidence blocker. Hand off only explicit execution objects to script review, asset generation workflows, or content packaging.

## Public Command Boundary

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
