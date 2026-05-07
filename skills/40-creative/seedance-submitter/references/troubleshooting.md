# Troubleshooting

## Missing Voiceover

Check final `request.json.prompt`.

- If the exact spoken lines are not in `prompt`, the request is wrong.
- Move exact lines into `promptPlan.dialogue`.
- Keep `promptPlan.audio` for voice style, BGM, SFX, subtitle, and watermark constraints.
- Do not depend on `feedback`; it is local-only.

## Stuck Processing

If a job stays in `processing` for unusually long:

1. Poll once more to confirm.
2. If clearly stuck, create a new rerun directory.
3. Resubmit the same segment without overwriting the old result.
4. Keep the old prediction id in notes but use the completed rerun as the best output.
5. If the PostPlus Cloud service itself is unavailable, stop and report the error — do not attempt direct provider calls.

## Reference Image Problems

- Make sure every local image was uploaded and replaced with a hosted URL.
- Keep original local paths in `sourceBasis`.
- Explain every image in `promptPlan.referenceMap`.
- If the model ignores product details, strengthen `mustKeep` with product shape, color, packaging, and component constraints.

## Segment Continuity Problems

- If a later segment resets character, product state, or scene, add continuity language to `promptPlan.subject`, `promptPlan.action`, and `mustKeep`.
- If an action crosses segments, restate the visible state inside the later segment request.
- Reuse the same reference images across related segments.
- Do not write `continue from the previous segment`, `same as previous`, or similar shorthand. The
  validator rejects request text that depends on previous-segment memory.
- If the request claims `same owner`, `same product`, `same environment`, or
  `same voice`, check whether `continuityReport` is only `text-only`.
- If continuity is `text-only`, do not say it is locked. Add the missing image
  or audio evidence, or tell the user the current request is only constrained by description.

## Wrong Provider Field

If a request has `provider` set to a direct supplier name, change it to `hosted-media` and use one of the released `video-seedance-2-*` model keys. The PostPlus Cloud service handles provider routing server-side.
