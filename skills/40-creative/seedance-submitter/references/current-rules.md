# Current Effective Rules

## Route

- Seedance 2.0 jobs run through the PostPlus Cloud service endpoint.
- Do not call the provider API directly.
- If the PostPlus Cloud service is unavailable or returns a stable error, stop immediately.

## Model And Duration

- If the user says `sd2`, interpret it as Seedance 2.0 unless they explicitly name another model.
- Default hosted endpoint group: `video-seedance-2-*`.
- Use `video-seedance-2-text` when reference images are conditioning references, not first-frame image-to-video inputs.
- Use `ratio: "9:16"` unless the user specifies otherwise.
- `duration` is the provider duration bucket. Supported values: `5`, `10`,
  or `15` seconds.
- `targetEditDurationSeconds` is the intended final edit length. It may be
  shorter than `duration`, but never longer.
- If user timing is not exactly supported, keep `duration` on the next viable
  provider bucket and record the creative trim point in
  `targetEditDurationSeconds`.
- When `targetEditDurationSeconds < duration`, include
  `timeline.activePerformanceEndSeconds` and `timeline.tailStrategy` so the
  final provider tail is explicitly designed for trimming.
- If the approved script exceeds 15 seconds, splitting is mandatory before submission.
- Validate request JSON with
  `scripts/validate_seedance_request_contract.mjs` before submission.

## Dialogue And Audio

- Timecoded action and exact spoken copy must live together inside `promptPlan.prompt_storyline`.
- `prompt_summary` is the compact scene intent. It is not the final provider prompt.
- `final_prompt` is the assembled provider-facing prompt derived from
  `prompt_summary`, `promptPlan.prompt_storyline`, compact reference bindings,
  audio direction, and hard negatives.
- Keep most generation detail in `promptPlan.prompt_storyline`, not in
  `prompt_summary`.
- Do not rely on `feedback` for spoken copy; it is local-only and not sent to the provider.
- Do not put exact spoken copy only inside `promptPlan.audio`.
- `promptPlan.audio` is for voice style, BGM, SFX, subtitle rules, watermark rules, and environmental sound constraints.
- Use `referenceAudios` only for real audio files or audio URLs, not text voiceover scripts.
- Unless the user asks for music, do not invent extra BGM.

## References

- Reference images go in `referenceImages`.
- `referenceVideos` triggers the provider's reference-video billing tier;
  `referenceImages` and `referenceAudios` do not.
- Upload local product and storyboard images before submission and replace local paths with uploaded URLs.
- For one object identity, default to one image reference; for one voice identity, default to one audio reference.
- Do not add many near-duplicate references by default; more references can make video generation less stable.
- Use `promptPlan.referenceMap` to bind references compactly:
  - storyboard image: character, shot order, camera, motion flow
  - product images: product shape, color, packaging, texture, component details
- If planning notes use handles such as `@storyboard`, `@product-detail`, or `@ref-video-1`, convert them into explicit bindings before submission.
- Do not say only `use the attached references`.
- In the final prompt, prefer explicit bindings such as `[image 1]`, `[image 2]`, and `[video 1]` plus role descriptions.
- Treat `promptPlan.mustAvoid` as compact hard negatives only. Keep it short:
  default total length is 20 words or fewer.
- Always include `subtitles`, `on-screen text`, and `watermark` in `promptPlan.mustAvoid` unless the user explicitly wants on-screen text.
- If continuity matters, add `continuityPolicy` and verify whether the request is
  really `image-bound`, `audio-bound`, or only `text-only`.
- Do not describe `text-only` continuity as locked or confirmed in user-facing copy.

## PromptPlan Mapping

- compact scene intent -> `prompt_summary`
- storyboard action plus spoken lines -> `promptPlan.prompt_storyline`
- style -> `promptPlan.style`
- scene, environment, lighting -> `promptPlan.scene`
- camera, handheld feel, transition rhythm -> `promptPlan.camera`
- voice/BGM/SFX/subtitle constraints -> `promptPlan.audio`
- must preserve -> avoid unless truly non-negotiable
- forbidden issues -> `promptPlan.mustAvoid`
- image roles -> `promptPlan.referenceMap`

Keep `prompt_summary`, `promptPlan.subject`, `promptPlan.scene`, and
`promptPlan.style` concise, usually 10-20 words each. Treat them as routing
labels, not full prompts. Put the real generation detail in
`promptPlan.prompt_storyline`, with compact negatives in `mustAvoid`.

## Splitting

- Split by voiceover meaning, semantic pauses, shot boundaries, and action continuity.
- Avoid splitting a continuous action unless necessary.
- If an action crosses two segments, the second request must restate the needed
  character, product, scene, and action state inside its own prompt fields.
- Shared references can be reused across segments.
- Each segment must include only its own `promptPlan.prompt_storyline`.
- Each segment must be independently submit-ready.
- Each segment should still be usable as a standalone clip, not just as a middle fragment.
- If a segment targets a 7-8s final edit inside a 10s provider bucket, the
  active action and dialogue must complete by `targetEditDurationSeconds`; the
  extra provider tail must be a declared hold, settle, micro-expression, or
  loopable tail.
- Final request text must not depend on previous-segment memory through
  shorthand such as `continue from the previous segment`, `same as previous`,
  `same character`, `content above`, or `延续上一段`.
- Continuity claims should be evidence-backed:
  - character / product / environment continuity usually needs image evidence
  - voice continuity usually needs audio evidence
  - without those inputs, continuity is only text-constrained

## User Output Preference

- If the user asks to review the submission plan, show natural-language segment content first.
- If the user clearly asks to submit or submit in parallel, create request JSON and submit.
- For completed jobs, report prediction id, status, and local render path.
