---
name: tiktok-ad-research
description: Research TikTok Creative Center or ad-library style datasets for winning ad patterns, regions, objectives, hook language, and creative signals without mixing paid ads with organic creator discovery.
metadata:
  postplus:
    familyId: tiktok
    familyName: TikTok
---

# TikTok Ad Research

Use this skill for paid TikTok ad intelligence, not organic creator or content
discovery.

Apply shared rulebook and user-guidance rules from `postplus-shared`.

## Task Shapes

Use this skill when the user wants to:

- find paid TikTok ad creatives that are performing well,
- inspect top ads for a category, country, region, language, or objective,
- study competitor paid hooks, selling points, and CTAs,
- turn ad examples into ad briefs or creative implications.

Do not use this skill for creator discovery, community comments research,
organic content lane mapping, or TikTok music workflows.

## Collection Key Routing

Released hosted collection key:

- `tiktok-ads-top`: top paid ad examples and optional ad-level metrics.

The hosted input must be a `schemaVersion: 1` execution envelope whose `input`
field contains the paid-ad collection request.

Primary command:

```bash
postplus research collect \
  --skill tiktok-ad-research \
  --collection-key tiktok-ads-top \
  --input <hosted-envelope.json> \
  --output <raw-output.json>
```

## Default Workflow

1. Classify the request into a paid-ad task shape.
2. Build a narrow first-pass request for the category, region, objective, or
   competitor scope.
3. Wrap the request under `schemaVersion: 1` + `input`.
4. Run the hosted collection and normalize the result into observed ad facts.
5. Separate observed ad facts from inferred creative implications.

Keep raw datasets and intermediate files under `.postplus/tiktok-ads/`; keep
final shortlists, summaries, or briefs where the user can inspect them.

## Good Output

Return top brands or advertisers, dominant objectives, repeated hook and offer
language, CTA patterns, region or language scope, duration distribution, and
which metrics were actually present in the sample.

## Failure Modes

- Stop if the request is organic creator/content research; route to
  `tiktok-research` instead.
- Stop on missing required input, unsupported key, missing auth, unavailable
  hosted service, or stable network failure.
- Do not invent fallback execution paths, private backend calls, or web-search
  replacements for paid ad collection.

## Handoff

- Organic TikTok benchmark comparison -> `tiktok-research`.
- Ad creative review after humans inspect outputs -> `creative-qa`.
- Shot-level or spoken-line breakdown -> `video-analysis`.

## Public Command Boundary

- Check readiness first: `postplus doctor --skill tiktok-ad-research`.
- Input schema: `postplus research schema --collection-key tiktok-ads-top --json`.
- Hosted collection: `postplus research collect --skill tiktok-ad-research --collection-key tiktok-ads-top --input <hosted-envelope.json> --output <collection-result.json>`.
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <collection-result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
