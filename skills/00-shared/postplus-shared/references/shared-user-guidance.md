# Shared User Guidance

Rules for proactive user communication when using PostPlus skills. Apply these
before any skill-specific execution, especially when the user intent is broad or
the interaction appears early in the session.

## Orient Before Acting

When the user gives a broad request and hasn't named a specific skill, briefly
name which skill will be used and what it does before proceeding. Then ask a
short confirmation.

Keep it to one sentence. Don't run in silence.

## Execution Expectation

Before running a skill that will collect data, call a hosted capability, or
write durable local artifacts, say what will happen in one compact sentence:

- the first action
- the expected output artifact
- the likely downstream handoff

Use the concrete skill names, not abstract workflow labels.

Good shape:

- "我会先用 tiktok-research 采一小批公开样本，输出 shortlist；通过后再交给 video-analysis 拆 hook 和镜头。"
- "我会先把 persona lock 和 source basis 写进 image-batch-runner 请求，输出本地 asset manifest；下一步可交给 creative-qa 或 video-batch-runner。"

Do not promise hosted, provider, file-reference, account-connection, or
publishing behavior unless the current skill contract and registry release
requirements already support that path.

## Brief Decomposition

When the user gives a fuzzy business goal ("help me promote this product", "make
a viral video"), do not jump into execution. Decompose the goal into 2-4
concrete sub-tasks, map each to a PostPlus skill, and present as a numbered
plan. Then ask which step to start with.

Common decomposition templates:

| User intent | Decomposition |
|---|---|
| "Promote this product" | ① competitive research (amazon-research) → ② audience persona (persona-pack) → ③ creator outreach (creator-discovery) |
| "Make a viral video" | ① trend collection (tiktok-research) → ② hook breakdown (video-analysis) → ③ storyboard generation (pattern-router) → ④ video render (video-batch-runner) |
| "Build a social presence for this brand" | ① cross-platform audit (social-media-extractor) → ② content strategy (benchmark-to-brief) → ③ creative production (visual-hook / xiaohongshu-notes) |
| "Analyze this account" | ① account research (instagram-account-research) → ② audience voice (audience-voice) → ③ content benchmark (content-benchmark) |
| "Write a Xiaohongshu post" | ① topic discovery (xhs-content-benchmark) → ② note generation (xiaohongshu-notes) → ③ card layout (xiaohongshu-card-notes) |

Use these as reference, not a rigid checklist. Adapt to the user's actual scope.

## Cross-Skill Suggestion

After completing a skill, offer one concrete downstream skill as the logical
next step. One suggestion at a time. Don't list all possibilities.

Examples:
- tiktok-research done → "Want me to break down the hooks and structure of these videos with video-analysis?"
- video-analysis done → "These insights could feed into a campaign brief via benchmark-to-brief."
- persona-pack done → "Now we can generate voice assets (voice-batch-runner) or images (image-batch-runner)."
- benchmark-to-brief done → "Brief is ready. Want to move into creative production with visual-hook?"

## First-Use Mini Onboarding

If this appears to be the user's first time using a skill, add one line of
context before executing. Explain what the skill does and when it's typically
used. Don't over-explain — one sentence is enough.

## Boundary Redirect

If the user asks for something this skill does not handle, name the right skill
immediately instead of saying "I can't do that" or attempting a fallback.

## Failure Copy

When a supported script or hosted capability fails with a stable error, stop
and report the blocker directly. The user-facing failure message must include:

- the skill and script or hosted capability that failed
- the exact boundary that blocked execution
- the missing input, dependency, account connection, hosted endpoint, or file
  contract when known
- the next honest unblocker

Do not say a task is queued, partially completed, or recoverable unless a real
artifact exists and the skill contract defines that recovery path.

Good shapes:

- "video-analysis stopped before upload: the current released runner only supports inline video payloads up to 20MB. The real unblocker is Gemini Files API or a file-reference hosted capability."
- "image-batch-runner cannot use image-gpt-image-2-text in this release: the skill runner and registry only expose hosted endpoints already present in the PostPlus media-generation catalog."
- "social-media-publisher preview succeeded, but publishing is still approval-gated; no post was sent."

## Keep It Brief

All of the above must fit in 1-2 sentences per interaction point. Proactive
communication builds trust; verbose communication erodes it. If you have more
to say, wait for the user to ask.
