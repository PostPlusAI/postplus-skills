# Hosted Image Model Notes

This file records the hosted image capability model assumptions for the released shell.

## Supported Endpoint Keys

### `image-nano-banana-2-text`

Text-to-image request shape:

- required:
  - `prompt`
- optional:
  - `aspect_ratio`
  - `resolution`
  - `enable_web_search`
  - `output_format`
  - `enable_sync_mode`
  - `enable_base64_output`

### `image-nano-banana-2-edit`

Edit request shape:

- required:
  - `prompt`
  - `images`
- optional:
  - `aspect_ratio`
  - `resolution`
  - `enable_web_search`
  - `output_format`
  - `enable_sync_mode`
  - `enable_base64_output`

Workspace fit:

- good for single-image generation and single-image edit

### `image-seedream-v5-lite-text`

Text-to-image request shape:

- required:
  - `prompt`
- optional:
  - `size`
  - `output_format`
  - `enable_sync_mode`
  - `enable_base64_output`
- sequential-only optional:
  - `max_images`

### `image-seedream-v5-lite-edit`

Edit request shape:

- required:
  - `images`
  - `prompt`
- optional:
  - `size`
  - `output_format`
  - `enable_sync_mode`
  - `enable_base64_output`

### `image-seedream-v5-lite-sequential`

Same as `image-seedream-v5-lite-text`, with `max_images` support.

### `image-seedream-v5-lite-edit-sequential`

Same as `image-seedream-v5-lite-edit`, with `max_images` support.

Workspace fit:

- use `size` instead of relying on `resolution` tiers
- use sequential variants when one prompt should yield a matched image set
- pricing is materially lower than the current Nano Banana default, so Seedream is a strong option for campaign-scale batch work

## Model Selection In Normalized Requests

The released shell keeps one normalized request shape and maps endpoint-specific fields server-side.

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

Defaulting rule:

- if a Seedream request omits `size`, the adapter infers one from `aspectRatio` when possible
- if a Nano Banana request omits `resolution`, the adapter uses the default release-shell setting

## Blocked Endpoint Candidates

These endpoint families are not part of the current released runner or registry
support claims:

- `image-gpt-image-2-text`
- `image-gpt-image-2-edit`
- Nano Banana Pro endpoint keys split by `1k`, `2k`, and `4k`

Unblock these only after the hosted `media-generation` catalog and billing
metadata expose the exact endpoint keys and `skills/registry.json` lists them
for `image-batch-runner`.

## Upload Requirement

Edit-style jobs still require uploaded image URLs.

Workflow:

1. `upload_media.mjs`
2. capture `uploadedUrl`
3. pass that URL into `inputUrls`
4. run `edit_image.mjs`

This applies to:

- `image-nano-banana-2-edit`
- `image-seedream-v5-lite-edit`
- `image-seedream-v5-lite-edit-sequential`

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
