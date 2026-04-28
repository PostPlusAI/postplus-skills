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
5. If the hosted capability itself is unavailable, stop and report the error — do not attempt direct provider calls.

## Reference Image Problems

- Make sure every local image was uploaded and replaced with a hosted URL.
- Keep original local paths in `sourceBasis`.
- Explain every image in `promptPlan.referenceMap`.
- If the model ignores product details, strengthen `mustKeep` with product shape, color, packaging, and component constraints.

## Segment Continuity Problems

- If a later segment resets character, product state, or scene, add continuity language to `promptPlan.subject`, `promptPlan.action`, and `mustKeep`.
- If a grid crosses segments, write `延续上一段...` at the start of the later segment.
- Reuse the same reference images across related segments.

## Wrong Provider Field

If a request has `provider` set to a direct supplier name, change it to `hosted` and use `hosted/video/generative` as the model path. The hosted capability handles provider routing server-side.
