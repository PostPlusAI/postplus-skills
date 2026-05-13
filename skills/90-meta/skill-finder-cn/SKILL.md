---
name: skill-finder-cn
description: Help users find suitable tools from the currently released PostPlus skill surface and provide public installation commands. Use this when the user asks which skill can do a task, which skill to install, or what the released skill surface covers.
metadata:
  postplus:
    familyId: workspace-publishing
    familyName: Workspace, Publishing, and Meta
---

# Skill Finder CN

Follow shared public skill rules in:

- `postplus-shared` public skill rules

Use this skill when the user wants to:

- ask which released PostPlus skill can solve a task
- map a Chinese request into the smallest released skill or skill chain
- understand whether a capability is currently available through PostPlus
- install the released PostPlus skills from the public repository

This skill is for the current released PostPlus surface only.

Do not:

- route the user to skills that are not on the released public surface
- explain third-party installer internals, agent directories, or copy/symlink
  behavior
- bypass the public repository with manual directory copying or ad hoc install
  glue

## Source Of Truth

Use the released surface exposed by the public PostPlus skills repository and
the local PostPlus CLI catalog:

- `postplus list`
- `npx -y skills add PostPlusAI/postplus-skills --global --list`
- `npx -y skills add PostPlusAI/postplus-skills --global --full-depth --skill '*' --agent claude-code codex cursor github-copilot windsurf trae trae-cn openclaw hermes-agent --yes`

If the current released surface does not contain a suitable skill, say that directly.
Do not route from private `candidate` or `shelved` authoring skills.

## Default Workflow

1. understand the real task, not just the literal wording
2. map it to the smallest released skill or skill chain
3. explain why that route fits
4. confirm the released skill ids with `postplus list` when needed
5. hand the user the official install path:
   - `npm install -g @postplus/cli@latest`
   - `postplus auth login`
   - `npx -y skills add PostPlusAI/postplus-skills --global --full-depth --skill '*' --agent claude-code codex cursor github-copilot windsurf trae trae-cn openclaw hermes-agent --yes`

## Recommendation Rules

- prefer one narrow released skill over a broad stack when the task is already specific
- use router skills only when the request is still ambiguous
- if the downstream skill is not released, do not pretend it is installable
- when multiple released skills are needed, order them by workflow stage:
  research -> synthesis -> production -> publishing

## Good Output

Return:

- the recommended released skill id or skill chain
- one-sentence reason for each recommendation
- the exact official install command
- any important release-surface limitation

## Example

If the user asks:

- “What skill can help me research viral TikTok content?”

Good response shape:

1. recommend `tiktok-research`
2. if the user only wants installation guidance, point to:
   - `npm install -g @postplus/cli@latest`
   - `postplus auth login`
   - `npx -y skills add PostPlusAI/postplus-skills --global --full-depth --skill '*' --agent claude-code codex cursor github-copilot windsurf trae trae-cn openclaw hermes-agent --yes`

If the user asks:

- “I want to find creators first, then do outreach”

Good response shape:

1. recommend `creator-discovery-router`
2. then the routed platform research skill
3. then `creator-outreach`

## Fail-Fast Rule

If no released skill fits the request, stop and say:

- the released surface does not currently cover that capability
- whether the nearest released alternative exists
- whether the request appears to depend on a capability that is not currently available
