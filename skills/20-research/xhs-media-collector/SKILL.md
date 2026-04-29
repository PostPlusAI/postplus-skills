---
name: xiaohongshu-media-collector
description: Collect validated Xiaohongshu image assets from normalized XHS datasets into local manifests and downloaded files. Use this when you need reproducible local media artifacts from note covers or other already-exposed remote asset URLs.
---

# XHS Media Collector

Follow shared release-shell rules in:

- `postplus-shared` release-shell rules

Legacy alias: `xhs-media-collector`.

Use this skill when the user wants to:

- download Xiaohongshu cover images from validated datasets
- turn normalized XHS research output into a local media manifest
- prepare local image assets for XHS card composition or downstream review

Read these references before implementation:

- `skills/20-research/xhs-media-collector/references/validated-surfaces.md`
- `skills/20-research/xhs-media-collector/references/manifest-schema.md`

## Default posture

Only collect asset URLs that are already exposed by a validated upstream dataset.

Supported by default:

- `coverUrl` from normalized XHS post datasets

Not supported by default:

- direct Xiaohongshu video downloader output

Do not pretend video collection works when the validated downloader returns `404 Not found data`.

## What this skill is for

- building a local manifest from normalized XHS datasets
- downloading cover or image assets from remote URLs
- verifying that downloaded files exist and are non-empty

## What this skill is not for

- discovering note URLs
- extracting post metadata
- downloading videos from note URLs by default

## Failure posture

- fail if the input dataset contains no downloadable remote image URLs
- fail if the requested asset type is `video`
- fail if a download returns a non-2xx response
- keep the manifest as the single source of truth for downloaded assets

## Release-Shell Execution Contract

- keep media manifests, download reports, and intermediate verification files
  under `<work-folder>/.postplus/xiaohongshu-media-collector/`
- keep only final downloaded user-facing assets outside `.postplus/`
- start with a bounded first pass, usually `3-10` cover images before broader
  pulls
- fail fast if a download fails or the requested asset surface is not validated
  instead of pretending collection succeeded

## Main scripts

- `scripts/build_xhs_media_manifest.mjs`
- `scripts/download_xhs_media_assets.mjs`
- `scripts/verify_xhs_media_manifest.mjs`

## Minimal workflow

```bash
node ${CLAUDE_SKILL_DIR}/scripts/build_xhs_media_manifest.mjs \
  --input <work-folder>/.postplus/xhs-normalized.json \
  --limit 3 \
  --output <work-folder>/.postplus/xhs-media-manifest.json

node ${CLAUDE_SKILL_DIR}/scripts/download_xhs_media_assets.mjs \
  --manifest <work-folder>/.postplus/xhs-media-manifest.json \
  --output-dir <work-folder>/.postplus/xhs-media-assets \
  --output <work-folder>/.postplus/xhs-media-download-report.json

node ${CLAUDE_SKILL_DIR}/scripts/verify_xhs_media_manifest.mjs \
  --manifest <work-folder>/.postplus/xhs-media-download-report.json
```

## Good output

Return:

- manifest path
- downloaded file count
- failed asset count
- stable local file paths for downstream use
