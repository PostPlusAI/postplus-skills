# Shared Contract

Apply this before every Pinterest search run.

## Request shape

The `pinterest-search` collection request is a single raw input object:

```json
{
  "query": "minimalist workspace",
  "filter": "all",
  "limit": 20
}
```

- `query`: the search keyword. One keyword per request.
- `filter`: `all` for every pin type, or `videos` for video pins only. Use
  `all` for image-address lists.
- `limit`: how many results to return. The minimum is 20; keep the first pass at
  20 and expand only after inspecting the results.

Send the raw object. Never wrap it in a hosted envelope or a
`{ "schemaVersion": 1, "input": ... }` shape, and never add fields the request
does not define.

## Output normalization

Each returned item carries an image address, a pin identifier, and a title.
Normalize every item to:

```json
{
  "image_url": "https://...",
  "pin_url": null,
  "title": "..."
}
```

- `image_url`: the direct image address; prefer the full-resolution field over
  any thumbnail.
- `pin_url`: the pin page URL when the result includes one, otherwise null.
- `title`: the pin title.

Deduplicate by `image_url` and drop items that carry no image address.

## First-pass discipline

- Run one bounded pass first, at the minimum limit.
- Treat empty, unavailable, private, or sparse results as an evidence gap, not a
  reason to silently retry with a different request shape.
- Stop on hard errors and report the exact command error. Do not fabricate
  results and do not substitute an unsupported source.
