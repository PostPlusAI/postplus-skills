# Supported Surfaces

## Supported By Default

- `coverUrl` fields from normalized XHS post datasets
- direct image download via HTTP `200 OK`

## Not Supported By Default

- `easyapi/rednote-xiaohongshu-video-downloader`

Observed behavior for tested note URLs:

- request succeeds
- item is returned
- `result.status = 404`
- `message = "Not found data"`

The current media collector should stay image-first.
