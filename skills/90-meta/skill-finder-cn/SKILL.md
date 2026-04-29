---
name: skill-finder-cn
description: 帮中文用户从当前已发布的 PostPlus skill surface 里找到合适技能，并给出公开安装命令。适合“有什么技能可以做 X”“我该装哪个技能”“帮我解释当前已发布技能范围”的场景。
---

# Skill Finder CN

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

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

Use the released surface exposed by the public PostPlus skills repository:

- `npx -y skills add PostPlusAI/postplus-skills --list`
- `npx -y skills add PostPlusAI/postplus-skills --skill '*' --agent claude-code codex cursor --yes`
- `postplus list`

If the current released surface does not contain a suitable skill, say that directly.

## Default Workflow

1. understand the real task, not just the literal wording
2. map it to the smallest released skill or skill chain
3. explain why that route fits
4. confirm the released skill ids with `postplus list` when needed
5. hand the user the official install path:
   - `npm install -g @postplus/cli`
   - `postplus auth login`
   - `npx -y skills add PostPlusAI/postplus-skills --skill '*' --agent claude-code codex cursor --yes`

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

- “有什么 skill 可以帮我做 TikTok 爆款研究？”

Good response shape:

1. recommend `tiktok-research`
2. if the user only wants installation guidance, point to:
   - `npm install -g @postplus/cli`
   - `postplus auth login`
   - `npx -y skills add PostPlusAI/postplus-skills --skill '*' --agent claude-code codex cursor --yes`

If the user asks:

- “我想先找达人，再做外联”

Good response shape:

1. recommend `creator-discovery-router`
2. then the routed platform research skill
3. then `creator-outreach`

## Fail-Fast Rule

If no released skill fits the request, stop and say:

- the released surface does not currently cover that capability
- whether the nearest released alternative exists
- whether the request appears to depend on a capability that is not currently available
