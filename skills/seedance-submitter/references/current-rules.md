# Current Effective Rules

## Route

- Seedance 2.0 jobs run through the hosted capability endpoint.
- Do not call the provider API directly.
- If the hosted capability is unavailable or returns a stable error, stop immediately.

## Model And Duration

- Default model family: `bytedance/seedance-2.0/*`.
- Use `bytedance/seedance-2.0/text-to-video` when reference images are conditioning references, not first-frame image-to-video inputs.
- Use `ratio: "9:16"` unless the user specifies otherwise.
- Supported duration values: `5`, `10`, or `15` seconds.
- If user timing is not exactly supported, map to the nearest viable segment structure without breaking action continuity.

## Dialogue And Audio

- Exact spoken copy must go in `promptPlan.dialogue`.
- Do not rely on `feedback` for spoken copy; it is local-only and not sent to the provider.
- Do not put exact spoken copy only inside `promptPlan.audio`.
- `promptPlan.audio` is for voice style, BGM, SFX, subtitle rules, watermark rules, and environmental sound constraints.
- Use `referenceAudios` only for real audio files or audio URLs, not text voiceover scripts.
- Unless the user asks for music, do not invent extra BGM.

## References

- Reference images go in `referenceImages`.
- Upload local product and storyboard images before submission and replace local paths with uploaded URLs.
- Use `promptPlan.referenceMap` to explain each image:
  - storyboard image: character, shot order, camera, motion flow
  - product images: product shape, color, packaging, texture, component details
- Always include `字幕`, `屏幕文字`, and `水印` in `promptPlan.mustAvoid` unless the user explicitly wants on-screen text.

## PromptPlan Mapping

- `主角` -> `promptPlan.subject`
- `动作流程` -> `promptPlan.action`
- `风格` -> `promptPlan.style`
- scene, environment, lighting -> `promptPlan.scene`
- camera, handheld feel, transition rhythm -> `promptPlan.camera`
- exact voiceover -> `promptPlan.dialogue`
- voice/BGM/SFX/subtitle constraints -> `promptPlan.audio`
- must preserve -> `promptPlan.mustKeep`
- forbidden issues -> `promptPlan.mustAvoid`
- image roles -> `promptPlan.referenceMap`

## Splitting

- Split by voiceover meaning, semantic pauses, shot boundaries, and action continuity.
- Avoid splitting a continuous action unless necessary.
- If a grid or action crosses two segments, the second request must explicitly say it continues the prior segment.
- Shared references can be reused across segments.
- Each segment must include only its own `promptPlan.action` and dialogue.
- Each segment must be independently submit-ready.

## User Output Preference

- If the user asks to review the submission plan, show natural-language segment content first.
- If the user says `提交`, `并行提交`, or clearly asks to send it out, create request JSON and submit.
- For completed jobs, report prediction id, status, and local render path.
