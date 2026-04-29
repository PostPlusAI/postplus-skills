# Volcengine Seedance 2.0 Notes

This reference records the current Ark route for Seedance video generation on the released shell.

## Endpoints

- Submit task:
  - `POST https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks`
- Get task:
  - `GET https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/{id}`
- List tasks:
  - `GET https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks`
- Delete or cancel task:
  - `DELETE https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/{id}`

Authentication is API key based at the raw provider edge.

In product-shell runs, provider auth should stay server-owned. Treat any raw
Ark credential only as provider-reference context, not as a user-facing local
setup step.

## Supported Request Patterns

Seedance 2.0 / 2.0 fast supports:

- text-to-video
- first-frame image-to-video
- first+last-frame image-to-video
- multimodal reference video generation
  - reference images
  - reference videos
  - reference audios
  - optional text prompt

The adapter should treat these as one model group, not separate hard-coded scripts.

## Prompting Direction

The request layer should prefer concise but structured prompts:

1. subject and action
2. scene and environment
3. camera / framing / motion
4. style and realism target
5. audio intent when generating sound
6. must-keep constraints
7. must-avoid artifacts

For multiple reference images, prefer explicit binding syntax:

- `[图1]...，[图2]...，[图3]...`

This improves instruction following when multiple images play different roles.

## Important Constraints

- Seedance 2.0 series does not support direct upload of real-human face reference image/video in the default path unless using the platform's supported portrait workflow.
- Multimodal reference mode is mutually exclusive with strict `first_frame` / `last_frame` mode.
- Audio cannot be sent alone. It must accompany at least one image or video.
- `return_last_frame: true` is useful for chained continuation workflows.
- `service_tier: flex` is not supported by Seedance 2.0 / 2.0 fast.

## Response Handling

Submit returns a task `id`.

Polling should expect:

- `queued`
- `running`
- `succeeded`
- `failed`
- `expired`

On success, outputs live in:

- `content.video_url`
- `content.last_frame_url` when requested

These URLs are short-lived and should be downloaded into the local render folder.
