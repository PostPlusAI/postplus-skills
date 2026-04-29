---
name: xiaohongshu-notes
description: Develop Xiaohongshu note ideas and drafts from rough thoughts, lived experience, or existing source material. Use this when the user has a scattered idea, a half-formed opinion, a working draft, or a professional insight and wants help shaping it into a Xiaohongshu note with stronger structure, trust, readability, and platform spread potential. This skill is especially for professional, experience-dense, memo-style notes that should feel like a real operator sharing judgments, not a generic content writer producing polished fluff.
---

# Xiaohongshu Notes

Follow shared release-shell rules in:

- `${CLAUDE_SKILL_DIR}/_postplus_shared/shared-release-shell-rules.md`

Use this skill when the user wants help turning raw material into a Xiaohongshu note.

Typical inputs:

- fragmented thoughts
- "I have an idea but not the structure yet"
- voice-note-like writing
- a rough draft that needs reshaping
- a professional observation that needs a better传播角度
- a request to make something "more像小红书"

This skill is not for generic ad copy.

## Default Goal

Produce notes that feel:

- experienced
- specific
- readable
- trustworthy
- native to Xiaohongshu

The default target is not "best possible writing."

The target is:

- stronger trust
- clearer angle
- better save/share potential
- preserved human judgment

## Core Style

Default toward the memo-style reference in [references/professional-memo-style.md](references/professional-memo-style.md) when the user wants a professional, trust-building post.

That means:

- write like a real practitioner, not a brand team
- lead with judgment or pain, not background explanation
- keep information density high
- prefer specific consequences over abstract theory
- preserve the feeling of "I have actually seen this many times"
- avoid tidy but lifeless model-shaped language

Default expression preferences:

- avoid `不是……而是……` by default
- avoid `也就是说` by default
- prefer direct, affirmative statements
- if a contrast is needed, state the conclusion first, then explain the difference

## First Decision

Decide which mode the task belongs to:

### 1. `layout-only`

Use when the user already has a draft and mainly wants packaging, structure, or page flow.

Do not rewrite the substance unless asked.

### 2. `structure-and-clarify`

Use when the user is clearly "thinking out loud" and needs the idea turned into a coherent note without changing the core opinion.

### 3. `angle-upgrade`

Use when the raw idea is valid but the framing is weak for Xiaohongshu.

Improve:

- hook direction
- reader entry point
- contradiction
- self-check value
- save/share value

### 4. `voice-preserving-rewrite`

Use when the user wants a real rewrite, but the original personal tone or judgment must survive.

## Workflow

### 1. Find the strongest core claim

Before drafting, identify:

- what the user really believes
- what they have seen repeatedly
- what is surprising, costly, or counterintuitive
- who would care

If the note has no clear claim, fix that first.

### 2. Identify the best reader entry point

Common entry points:

- pain
- mistake
- hidden truth
- self-check list
- industry misconception
- before/after realization
- "I used to think X, now I think Y"

Choose one. Do not stack five hooks together.

### 3. Preserve source texture

When the user speaks in fragments, those fragments may contain the best lines.

Prefer preserving:

- blunt judgments
- sharp observations
- emotionally charged short sentences
- concrete examples

Do not over-clean.

### 4. Raise传播性 without flattening the thought

Possible upgrades:

- turn a vague opinion into a sharper contradiction
- turn a complaint into a checklist
- turn a niche lesson into a self-diagnosis post
- turn a conclusion into a "why people keep getting this wrong" post

Do not force listicles if the note works better as a short argument.

### 5. Keep trust above cleverness

Avoid:

- fake certainty
- overpromising claims
- generic inspiration language
- fake intimacy
- "姐妹们/宝子们" voice unless the user explicitly wants that
- empty platform clichés
- habitual `不是……而是……` sentence framing
- filler bridge phrases like `也就是说`

## Professional Note Heuristics

For experience-dense professional notes, prefer this shape:

1. sharp opening judgment or problem
2. short proof of lived experience
3. explanation of what is actually going wrong
4. practical breakdown, checklist, or examples
5. closing judgment or action prompt

Useful signals of trust:

- clear consequences
- repeated-pattern language such as "我见过太多次"
- operational details
- cost of getting it wrong
- specific boundaries around when the advice applies

## Output Modes

Offer the smallest useful output for the ask.

Common shapes:

- note angle options
- hook options
- note outline
- cleaned draft
- memo-style Xiaohongshu note
- page-by-page structure for a 图文备忘录帖

If the user gives only a rough idea, it is often useful to return:

- `核心观点`
- `更适合小红书的切入角度`
- `可写成的内容结构`
- `一版成稿`

## Distinguish Fact From Lift

When the source is weak or purely conversational, do not smuggle invention in as if it came from experience.

Separate:

- what the user explicitly said
- what is a reasonable reframing
- what is a stronger but still faithful传播角度

## Anti-Patterns

Do not:

- rewrite everything into smooth but bland consultant prose
- pad simple ideas with abstract framework language
- remove the user's bite just to sound "professional"
- force symmetry like "3个问题，3个建议" unless it helps
- turn every note into a hard sell or CTA post

## Workspace Preference

A common input shape is raw thoughts in a nonlinear order.

Default behavior:

- help discover what is worth saying
- help find the best Xiaohongshu angle
- improve structure and spread potential
- preserve the user's original judgment and texture

Read [references/professional-memo-style.md](references/professional-memo-style.md) when the user asks for a more professional, trust-building tone.
