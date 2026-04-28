# Hosted Talking-Head Video Notes

This file records the hosted capability direction for image-plus-audio talking avatar video renders on the released shell.

## Use Case

Use the hosted talking-head video capability for:

- image plus audio talking-head renders
- singing avatar experiments
- first-pass persona video renders after image and voice approval

It is a render-layer capability, not a persona-definition tool and not a voice-design tool.

## Input Fields

Required:

- `image`
- `audio`

Optional:

- `mask_image`
- `prompt`
- `resolution`
  - `480p`
  - `720p`
- `seed`

## Output Fields

The response may contain:

- `id`
- `status`
  - `created`
  - `processing`
  - `completed`
  - `failed`
- `outputs`
- `urls`
- `has_nsfw_contents`
- `created_at`

## Integration Notes

- Treat the hosted response as raw evidence, not as the final asset store
- Persist local `request.json`, `response.json`, and `manifest.json`
- Download remote outputs into a local `renders/` folder
- Preserve `id`, `status`, and `urls.get` so async polling can continue later
- Include `resolution` and `seed` in the normalized request and manifest for later analysis
- Use `mask_image` when background complexity or multiple people may confuse the model

## Quality Guideline

For realism-sensitive talking-head work, default to `720p`, not `480p`.

Reason:

- `480p` can intensify perceived fake skin, eyes, and lip areas
- when a client says the person looks fake, you want to rule out low render quality early

Use `480p` only when:

- running a quick draft
- testing workflow plumbing
- cost or queue time is the priority

## Suggested First Adapter Behavior

1. read normalized local request
2. map fields to the hosted capability payload
3. submit the prediction
4. save the raw response
5. if `status` is `completed`, download outputs immediately
6. otherwise keep the prediction metadata and let `poll_prediction` continue later
