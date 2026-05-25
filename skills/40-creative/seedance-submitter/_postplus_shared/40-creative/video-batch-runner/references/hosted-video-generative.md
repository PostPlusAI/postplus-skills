# Hosted Generative Video Notes

This reference records the PostPlus Cloud service route for hosted generative video.

In PostPlus runtime runs, provider auth stays server-owned. The PostPlus Cloud service endpoint
handles authentication. These notes describe the request shape and behavior, not
user-facing credential setup.

## Supported Model Paths

- `video-kling-v3-0-std-text`
- `video-kling-v3-0-std-image`
- `video-kling-v3-0-pro-text`
- `video-kling-v3-0-pro-image`
- `video-seedance-2-image`
- `video-seedance-2-image-turbo`
- `video-seedance-2-text`
- `video-seedance-2-text-turbo`
- `video-kling-v2-6-pro-motion-control`

## Reference-Motion Boundary

The hosted catalog exposes one reference-motion transfer endpoint:

- `video-kling-v2-6-pro-motion-control`: reference image plus reference motion
  video to generated video.

Kling 3.0 is exposed for production text-to-video and image-to-video generation
alongside Seedance 2.0. It is not the default replacement for Seedance: use
Seedance when the existing Seedance route is already validated for the brief,
and choose Kling 3.0 when production needs Kling-specific motion/visual output
or wants to compare against the Seedance result.

Kling O3 is not part of the released skill surface yet. Add it only after the
O3 request schema, billing dimensions, file-reference behavior, and hosted smoke
evidence are separately proven.

`promptPlan.camera` and `promptPlan.motion` are planning and prompt-mapping text
only. Hosted requests must fast-fail explicit provider-native structured motion
controls such as `cameraTrajectory`, `objectTrajectory`, `motionBrush`, or
`camera_fixed` because the current hosted endpoint does not expose those
parameters.

The local runner also rejects camera/object trajectory and motion-brush fields
for non-hosted routes. Do not accept these fields unless a provider-native API
schema has been verified and the adapter maps them to real provider parameters.

## Request Mapping

Common fields:

- Hosted provider payloads ultimately send a `prompt`. Kling 3.0 requests
  require `request.prompt`; Seedance requests require `request.prompt_summary` plus
  `promptPlan.prompt_storyline`, unless `request.final_prompt` intentionally
  supplies the full provider prompt.
- The adapter sends the assembled prompt to the hosted provider as `prompt`.
- `enable_web_search` defaults to `false` and should only be enabled intentionally.

Seedance 2.0 fields:

- `resolution` defaults to `720p`.
- `duration` must use one of the supported provider buckets: `5`, `10`, or
  `15` seconds.
- `aspect_ratio` can be `16:9`, `9:16`, `4:3`, `3:4`, `1:1`, or `21:9`.

PostPlus creative format mapping:

- `short_form_vertical` maps to `9:16`.
- `instagram_meta_ads` maps to `3:4`.
- explicit `ratio`, `aspectRatio`, or `targetAspectRatio` must win over hidden
  prompt assumptions unless it conflicts with the selected creative format.

Seedance image-to-video fields:

- `image` is required.
- `last_image` is optional for first/last-frame continuation.

Kling 3.0 text-to-video fields:

- `duration` is optional and must be an integer from `3` through `15`; default
  provider duration is `5` seconds.
- `aspect_ratio` is optional and must be `16:9`, `9:16`, or `1:1`.
- `sound` is optional and defaults to off; billing derives `audioMode` from
  this boolean.
- `negative_prompt`, `cfg_scale`, and `shot_type` map directly to provider
  fields.
- `image`, `end_image`, `reference_images`, `reference_videos`,
  `reference_audios`, `video`, and `audio` are unsupported and must fail before
  hosted submission.

Kling 3.0 image-to-video fields:

- `image` and `prompt` are required.
- `end_image` is optional.
- `duration` is optional and must be an integer from `3` through `15`; default
  provider duration is `5` seconds.
- `sound` is optional and defaults to off; billing derives `audioMode` from
  this boolean.
- `negative_prompt`, `cfg_scale`, and `shot_type` map directly to provider
  fields.
- `aspect_ratio`, `resolution`, reference arrays, `video`, `audio`, and
  `keep_original_sound` are unsupported and must fail before hosted submission.

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
- If you need exact spoken copy in a structured plan, put it inside `promptPlan.prompt_storyline` on the same timecoded lines as the visible action.
- Use `reference_audios` only when you have actual audio reference files or URLs to condition on.
- Do not rely on local-only fields such as `feedback` for spoken copy; they are not sent to the provider payload.

## Integration Notes

- The model name selects the endpoint and payload shape.
- Keep request records in the normalized video contract, then map to the provider's flat payload in the adapter.
- Use `ratio` or `aspectRatio` locally; the adapter sends provider field `aspect_ratio`.
- For Kling 3.0 image-to-video, do not set `ratio` or `aspectRatio`; the output
  ratio follows the input frame.
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
