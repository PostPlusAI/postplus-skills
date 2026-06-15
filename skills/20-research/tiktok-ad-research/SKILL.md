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

Route paid-ad collection to the released hosted collection key for top paid ad
examples and optional ad-level metrics. Discover the exact released collection
key and request shape with `postplus research schema --json`, then pass the
request body to `postplus research collect <collectionKey> --request <input.json>`.

## Default Workflow

1. Classify the request into a paid-ad task shape.
2. Build a narrow first-pass request for the category, region, objective, or
   competitor scope.
3. Write the request to a request file and run
   `postplus research collect <collectionKey> --request <input.json>`.
4. Normalize the result into observed ad facts.
5. Separate observed ad facts from inferred creative implications.

<!-- BEGIN GENERATED EXECUTION EXAMPLE -->
```bash
postplus research collect tiktok-ads-top --request request.json --output result.json
```
<!-- END GENERATED EXECUTION EXAMPLE -->

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

- Choose the smallest matching command or workflow from the user input and run
  it directly.
- Readiness diagnostics: `postplus doctor --skill tiktok-ad-research`.
- If an owned CLI or script command fails, report the exact error and stop. Do
  not bypass the failure with metadata-only answers, readiness probing, local
  payload rewrites, fallback providers, or unpublished tools.
- Use `postplus research schema --collection-key <collectionKey> --json` only when constructing or repairing an unknown request shape.
- Hosted collection: `postplus research collect <collectionKey> --request <input.json> --output <result.json>` (input = the collection parameters).
- Resume a pending collection: `postplus research collect --run-handle <runHandle> --output <result.json>`.
- Keep the first pass bounded; expand only after inspecting the first result.
- If the CLI returns a quote-confirmation challenge, run `postplus quote confirm --json --challenge-file <challenge.json>` and retry with the returned token.
