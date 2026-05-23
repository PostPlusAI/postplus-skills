# Hosted Generative Video Notes

This reference records the PostPlus Cloud service route for Seedance 2.0 generative video.

In PostPlus runtime runs, provider auth stays server-owned. The PostPlus Cloud service endpoint
handles authentication. These notes describe the request shape and behavior, not
user-facing credential setup.

## Supported Model Paths

- `video-seedance-2-image`
- `video-seedance-2-image-turbo`
- `video-seedance-2-text`
- `video-seedance-2-text-turbo`
- `video-kling-v2-6-pro-motion-control`

## Reference-Motion Boundary

The hosted catalog exposes one reference-motion transfer endpoint:

- `video-kling-v2-6-pro-motion-control`: reference image plus reference motion
  video to generated video.

`promptPlan.camera` and `promptPlan.motion` are planning and prompt-mapping
text only. Hosted requests must fast-fail explicit provider-native structured
motion controls such as `cameraTrajectory`, `objectTrajectory`, `motionBrush`,
or `camera_fixed` because the current hosted endpoint does not expose those
parameters.

The local runner also rejects camera/object trajectory and motion-brush fields
for non-hosted routes. Do not accept these fields unless a provider-native API
schema has been verified and the adapter maps them to real provider parameters.

## Request Mapping

Common fields:

- `prompt` is required.
- `resolution` defaults to `720p`.
- Seedance `duration` must use one of the supported provider buckets: `5`,
  `10`, or `15` seconds.
- `aspect_ratio` can be `16:9`, `9:16`, `4:3`, `3:4`, `1:1`, or `21:9`.
- `enable_web_search` defaults to `false` and should only be enabled intentionally.

PostPlus creative format mapping:

- `short_form_vertical` maps to `9:16`.
- `instagram_meta_ads` maps to `3:4`.
- explicit `ratio`, `aspectRatio`, or `targetAspectRatio` must win over hidden
  prompt assumptions unless it conflicts with the selected creative format.

Image-to-video fields:

- `image` is required.
- `last_image` is optional for first/last-frame continuation.

Kling reference-motion transfer fields:

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
- If you need exact spoken copy in a structured plan, put it inside `promptPlan.storyboardTimeline` on the same timecoded lines as the visible action.
- Use `reference_audios` only when you have actual audio reference files or URLs to condition on.
- Do not rely on local-only fields such as `feedback` for spoken copy; they are not sent to the provider payload.

## Integration Notes

- The model name selects the endpoint and payload shape.
- Keep request records in the normalized video contract, then map to the provider's flat payload in the adapter.
- Use `ratio` or `aspectRatio` locally; the adapter sends provider field `aspect_ratio`.
- Use `creativeFormat: "instagram_meta_ads"` locally when the customer brief
  is Instagram Meta Ads `3:4` production.
- Use `lastImage`, `referenceImages`, `referenceVideos`, and `referenceAudios` locally; snake_case provider aliases are also accepted.
- The PostPlus Cloud service returns prediction-style responses with `id`, `status`, `urls`, and `outputs`.
- Success status is `completed`; outputs should be downloaded into the local `renders/` directory.

## Quality Guideline

Default to `720p` for production tests. For creator talking-head clips, aim for
clean creator UGC: casual and direct, but still clear, bright, stable, and
visually fresh. Use turbo models when iteration speed or lower cost matters; use
non-turbo models when quality is the main goal. Use `1080p` only when the
additional cost is justified.
