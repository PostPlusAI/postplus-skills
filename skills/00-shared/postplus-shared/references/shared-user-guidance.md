# Shared User Guidance

Rules for proactive user communication when using PostPlus skills. Apply these
before any skill-specific execution, especially when the user intent is broad or
the interaction appears early in the session.

## Orient Before Acting

When the user gives a broad request and hasn't named a specific skill, briefly
name which skill will be used and what it does before proceeding. Then ask a
short confirmation.

Keep it to one sentence. Don't run in silence.

## Audience Language

Assume the user is a marketing operator, not an engineer. Use everyday business
language in user-facing messages.

- Prefer "image file", "saved file", "upload", "account connection", "service
  limit", and "next step" over implementation terms when the technical detail is
  not the real unblocker.
- Avoid unnecessary provider, API, schema, endpoint, payload, base64, runtime,
  attachment handle, or storage internals in normal user-facing copy.
- If a technical term is the real blocker, translate it into what the user can
  do next in the same sentence.
- Keep detailed technical evidence in local artifacts, logs, or task summaries
  unless the user asks for implementation details.

## Execution Expectation

Before running a skill that will collect data, call a PostPlus Cloud service, or
write durable local artifacts, say what will happen in one compact sentence:

- the first action
- the expected output artifact
- the likely downstream handoff

Use the concrete skill names, not abstract workflow labels.

Good shape:

- "I will first use tiktok-research to collect a small public sample and output a shortlist; after approval, I will pass it to video-analysis for hook and shot breakdown."
- "I will first put the persona lock and source basis into the image-batch-runner request and output a local asset manifest; the next step can go to creative-qa or video-batch-runner."

Do not promise hosted, provider, file-reference, account-connection, or
publishing behavior unless the current skill contract and registry release
requirements already support that path.

## Async Task Copy

When a long-running skill returns a pending generation, transcription, or
collection checkpoint, tell the user two things in plain language:

- the job is running and can be checked again from the saved checkpoint
- the conversation does not need to pause while the provider finishes

Good shapes:

- "The render is running now. I saved the checkpoint, so I can keep preparing the QA checklist and check the render again when we need it."
- "The collection is still processing. I can continue outlining the summary structure now, then poll the saved report before filling in metrics."

Do not keep the chat idle just to poll. Poll immediately only when the user's
next requested step depends on the completed artifact or the user explicitly
asked to wait.

## Technical Boundary Orientation

Before an expensive collection, media generation, transcription, publishing, or
large local processing step, inspect the skill's own boundary section and
public metadata requirements. If the request crosses a known limit, do
one of these before execution:

- internalize the boundary into the request shape, such as bounded first passes,
  segment contracts, capped frame counts, or compiled hosted inputs
- ask one short scope question when the skill cannot choose safely
- stop with a direct blocker when the released contract does not support the
  requested path

Do not ask the user to understand provider limits, endpoint names, actor fields,
polling internals, or local implementation details unless that detail is the
real unblocker. Use the business meaning of the limit instead.

## Brief Decomposition

When the user gives a fuzzy business goal ("help me promote this product", "make
a viral video"), do not jump into execution. Decompose the goal into 2-4
concrete sub-tasks, map each to a PostPlus skill, and present as a numbered
plan. Then ask which step to start with.

Common decomposition templates:

| User intent | Decomposition |
|---|---|
| "Promote this product" | ① Instagram/Meta content proof (social-media-extractor) → ② campaign brief (benchmark-to-brief) → ③ creator shortlist or draft publishing path |
| "Make a viral video" | ① trend collection (tiktok-research) → ② hook breakdown (video-analysis) → ③ request planning (video-request-architect) → ④ video render (video-batch-runner) |
| "Build a social presence for this brand" | ① Instagram/Meta audit (social-media-extractor) → ② content strategy (benchmark-to-brief) → ③ creative QA and production planning (creative-qa) |
| "Analyze this account" | ① `instagram-research` account route → ② `instagram-research` audience voice route → ③ `instagram-research` benchmark route |

Use these as reference, not a rigid checklist. Adapt to the user's actual scope.

## Cross-Skill Suggestion

After completing a skill, offer one concrete downstream skill as the logical
next step. One suggestion at a time. Don't list all possibilities.

Examples:
- tiktok-research done → "Want me to break down the hooks and structure of these videos with video-analysis?"
- video-analysis done → "These insights could feed into a campaign brief via benchmark-to-brief."
- benchmark-to-brief done → "Brief is ready. Want me to turn it into a video request plan?"

## First-Use Mini Onboarding

If this appears to be the user's first time using a skill, add one line of
context before executing. Explain what the skill does and when it's typically
used. Don't over-explain — one sentence is enough.

## Boundary Redirect

If the user asks for something this skill does not handle, name the right skill
immediately instead of saying "I can't do that" or attempting a fallback.

## Failure Copy

When a supported script or PostPlus Cloud service fails with a stable error, stop
and report the blocker directly. The user-facing failure message must include:

- the skill and script or PostPlus Cloud service that failed
- the exact boundary that blocked execution
- the missing input, dependency, account connection, hosted endpoint, or file
  contract when known
- the next honest unblocker

Do not say a task is queued, partially completed, or recoverable unless a real
artifact exists and the skill contract defines that recovery path.

For images or other media pasted into a local AI agent conversation, be explicit
about whether the agent has access to the original asset bytes or only visual
model context. If the host runtime does not expose a readable path, attachment
handle, clipboard bytes, or binary source, do not claim that the original media
was saved or uploaded. Tell the user to provide a local path or save the asset
to disk before continuing.

Good shapes:

- "video-analysis stopped before provider analysis: the upload reached Gemini Files API, but the file never became ACTIVE within the hosted wait window. The real unblocker is provider file activation, not another local retry."
- "image-batch-runner cannot use image-gpt-image-2-text in this release: the skill runner and registry only expose hosted endpoints already present in the PostPlus media-generation catalog."
- "social-media-publisher preview succeeded, but publishing is still approval-gated; no post was sent."
- "I can see the pasted image in this conversation, but this Codex session has not exposed the original image bytes or a local file path to tools. Please save the image locally or provide its path, then I can upload that real file."

## Continuity Copy

When a generation request claims continuity across segments, say whether that
continuity is text-only or actually bound by image or audio evidence.

Prefer short, honest wording:

- "人物连续性这次还是文字约束；如果你愿意补一张人物图，会更稳。"
- "商品和 App UI 已有图片绑定，这部分会比人物更稳。"
- "声音这次还没锁；如果你在意角色连续性，我建议先固定一个 voice take。"
- "这版可以直接跑，但更准确地说是已约束，不是已锁定。"

Do not tell the user continuity is `locked`, `confirmed`, or `guaranteed` when
the request is only text-constrained.

## Keep It Brief

All of the above must fit in 1-2 sentences per interaction point. Proactive
communication builds trust; verbose communication erodes it. If you have more
to say, wait for the user to ask.
