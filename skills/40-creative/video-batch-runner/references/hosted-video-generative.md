# Hosted Generative Video Notes

This reference records the hosted capability route for Seedance 2.0 generative video.

In product-shell runs, provider auth stays server-owned. The hosted capability endpoint
handles authentication. These notes describe the request shape and behavior, not
user-facing credential setup.

## Supported Model Paths

- `video-seedance-2-image`
- `video-seedance-2-image-turbo`
- `video-seedance-2-text`
- `video-seedance-2-text-turbo`
- `video-kling-v2-6-pro-motion-control`

## Motion-Control Boundary

The hosted catalog exposes one motion-control endpoint:

- `video-kling-v2-6-pro-motion-control`: reference image plus reference motion
  video to generated video.

`promptPlan.camera` and `promptPlan.motion` are planning and prompt-mapping
text only. Hosted requests must fast-fail explicit provider-native structured
motion controls such as `cameraTrajectory`, `objectTrajectory`, `motionBrush`,
or `camera_fixed` because the current hosted endpoint does not expose those
parameters.

## Request Mapping

Common fields:

- `prompt` is required.
- `resolution` defaults to `720p`.
- `duration` can be any integer from `4` to `15` seconds.
- `aspect_ratio` can be `16:9`, `9:16`, `4:3`, `3:4`, `1:1`, or `21:9`.
- `enable_web_search` defaults to `false` and should only be enabled intentionally.

Image-to-video fields:

- `image` is required.
- `last_image` is optional for first/last-frame continuation.

Kling motion-control fields:

- `image` is required and should be an uploaded subject/reference image URL.
- `motionVideo` or `video` is required and should be an uploaded motion
  reference video URL.
- `characterOrientation` is required and maps to provider
  `character_orientation`; use `image` or `video`.
- `keepOriginalSound` maps to provider `keep_original_sound`.

Text-to-video fields:

- `reference_images` is optional.
- `reference_videos` is optional; total length must not exceed 15 seconds.
- `reference_audios` is optional; total length must not exceed 15 seconds.

Voice and dialogue notes:

- The hosted generative video capability does not expose a separate `voiceover_script` field.
- If you only have spoken copy text, put the exact line-by-line spoken content into `prompt` or local `promptPlan.dialogue` so it is folded into the final `prompt`.
- Use `reference_audios` only when you have actual audio reference files or URLs to condition on.
- Do not rely on local-only fields such as `feedback` for spoken copy; they are not sent to the provider payload.

## Integration Notes

- The model name selects the endpoint and payload shape.
- Keep request records in the normalized video contract, then map to the provider's flat payload in the adapter.
- Use `ratio` or `aspectRatio` locally; the adapter sends provider field `aspect_ratio`.
- Use `lastImage`, `referenceImages`, `referenceVideos`, and `referenceAudios` locally; snake_case provider aliases are also accepted.
- The hosted capability returns prediction-style responses with `id`, `status`, `urls`, and `outputs`.
- Success status is `completed`; outputs should be downloaded into the local `renders/` directory.

## Quality Guideline

Default to `720p` for production tests. Use turbo models when iteration speed or lower cost matters; use non-turbo models when quality is the main goal. Use `1080p` only when the additional cost is justified.
