# Hosted Image Generation Notes

This file records the first-version hosted image generation assumptions for the public skill surface.

## Intended Use In The Released Shell

Use `text-to-image` for:

- first-pass persona candidates
- first-frame candidates
- lightweight B-roll support stills if needed

Use `edit` for:

- keeping an approved face while changing background or wardrobe
- making a desk setup more benchmark-consistent
- reducing ad-like polish without changing the character identity

## Integration Assumptions

- PostPlus runtime calls should go through the PostPlus Cloud service
- responses are stored locally as raw JSON
- final image files are also stored locally
- the public skill surface keeps a normalized manifest independent of hosted response shape

## Quality Guideline

For persona or realism-sensitive generation, default to the highest documented image quality that is practical.

Reason:

- weak source images amplify fake-looking motion later in talking-head render stages
- realism problems should be debugged from the earliest visual stage, not only at the video stage

Current known top tier for `image-nano-banana-2-text` is `4k`.

If a lower setting is used, record that decision explicitly in the request record as a cost or speed tradeoff.

## Known Request Shapes

### Text To Image

Required:

- `prompt`

Optional fields currently documented:

- `aspect_ratio`
- `resolution`
  - options: `0.5k`, `1k`, `2k`, `4k`
- `enable_web_search`
- `output_format`
- `enable_sync_mode`
- `enable_base64_output`

### Edit

Required:

- `images`
- `prompt`

Optional fields currently documented:

- `aspect_ratio`
- `resolution`
  - options: `0.5k`, `1k`, `2k`, `4k`
- `enable_web_search`
- `output_format`
- `enable_sync_mode`
- `enable_base64_output`

Important limitation:

- `edit` currently documents `images` as an array of image URLs
- this means the first adapter cannot pass a local filesystem path directly
- if the workflow only has local images, it needs a preceding upload step
- the intended first-version path is:
  1. upload local image with the media upload API
  2. capture `data.download_url`
  3. pass that URL into `edit.images`

## Output Shape

The documented response contains:

- `created_at`
- `has_nsfw_contents`
- `id`
- `model`
- `outputs`
- `status`
- `urls`

Interpretation for first-version adapter design:

- `outputs` is the primary result list when `status` becomes `completed`
- `id` should be stored because it identifies the prediction
- `urls` should be preserved raw even if the adapter does not rely on them yet

## Parameters To Capture

Even if the PostPlus Cloud service evolves, the local request record should keep
these normalized camelCase fields when available:

- `prompt`
- `aspectRatio`
- `resolution`
- `outputFormat`
- `enableSyncMode`
- `enableBase64Output`
- `inputUrls` for edit mode
- `id`
- `status`
- `outputs`
- `urls`

The adapter maps local camelCase fields to hosted provider snake_case fields at
execution time.

Do not make the whole workflow depend on one provider-specific response field.
