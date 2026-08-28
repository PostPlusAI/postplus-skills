# Pinterest Shared Contract

Use one public keyword per run:

```bash
postplus research run pinterest-search --query "minimalist workspace" --kind all --limit 20 --wait --output result.json
```

- `--kind all` includes every pin type; `videos` narrows to video pins.
- The route minimum is 20. Expand only after inspecting the first result.
- Use only the flags shown by the selected route.

Normalize usable results to `{ image_url, pin_url, title }`, prefer the
full-resolution image, deduplicate by image URL, and discard records without an
image. Empty or sparse results are evidence gaps, not permission to silently
change the query or source. Stop on hard errors.
