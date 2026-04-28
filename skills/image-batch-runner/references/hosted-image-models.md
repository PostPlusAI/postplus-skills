# Hosted Image Model Notes

This file records the hosted image capability model assumptions for the released shell.

## Supported Models

### `google/nano-banana-2`

Documented request shape:

- required:
  - `prompt`
- edit also requires:
  - `images`
- optional:
  - `aspect_ratio`
  - `resolution`
  - `enable_web_search`
  - `output_format`
  - `enable_sync_mode`
  - `enable_base64_output`

Workspace fit:

- good default for legacy requests already using `aspectRatio` + `resolution`
- good for single-image generation and single-image edit

### `bytedance/seedream-v5.0-lite`

Documented request shape:

- text-to-image required:
  - `prompt`
- edit required:
  - `images`
  - `prompt`
- optional:
  - `size`
  - `output_format`
  - `enable_sync_mode`
  - `enable_base64_output`
- sequential-only optional:
  - `max_images`

Workspace fit:

- use `size` instead of relying on `resolution` tiers
- use sequential variants when one prompt should yield a matched image set
- pricing is materially lower than the current Nano Banana default, so Seedream is a strong option for campaign-scale batch work

## Model Selection In Normalized Requests

The released shell keeps one normalized request shape and maps provider fields per model.

Shared fields:

- `model`
- `prompt`
- `outputFormat`
- `enableSyncMode`
- `enableBase64Output`

Nano Banana oriented fields:

- `aspectRatio`
- `resolution`
- `enableWebSearch`

Seedream oriented fields:

- `size`
- `maxImages`

Compatibility rule:

- if a Seedream request omits `size`, the adapter infers one from `aspectRatio` when possible
- if a Nano Banana request omits `resolution`, the adapter uses the default release-shell setting

## Upload Requirement

Edit-style jobs still require uploaded image URLs.

Workflow:

1. `upload_media.mjs`
2. capture `uploadedUrl`
3. pass that URL into `inputUrls`
4. run `edit_image.mjs`

This applies to:

- `google/nano-banana-2` edit
- `bytedance/seedream-v5.0-lite/edit`
- `bytedance/seedream-v5.0-lite/edit-sequential`

## Output Shape

Supported hosted image models all expose the same result pattern:

- `id`
- `model`
- `status`
- `outputs`
- `urls`
- `created_at`
- `has_nsfw_contents`

The released shell persists raw hosted responses and normalizes downloaded files into local manifests.
